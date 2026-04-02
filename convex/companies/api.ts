import type { IndexRangeBuilder } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";

const companyFields = {
  name: v.string(),
  industry: v.optional(v.string()),
  website: v.optional(v.string()),
  address: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  notes: v.optional(v.string()),
};

function sortCompaniesByName<T extends { name: string }>(companies: T[]) {
  return companies.sort((a, b) => a.name.localeCompare(b.name, "de-DE"));
}

async function ensurePrimaryAssignment(
  ctx: MutationCtx,
  contactId: Id<"contacts">,
) {
  const assignments = await ctx.db
    .query("contact_companies")
    .withIndex(
      "by_contact",
      (q: IndexRangeBuilder<Doc<"contact_companies">, ["contactId", "_creationTime"]>) =>
        q.eq("contactId", contactId),
    )
    .collect();

  if (assignments.length === 0) {
    return;
  }

  const hasPrimary = assignments.some((assignment) => assignment.isPrimary);
  if (!hasPrimary) {
    const nextPrimary = assignments.sort((a, b) => a.createdAt - b.createdAt)[0];
    await ctx.db.patch(nextPrimary._id, { isPrimary: true });
  }

  await ctx.db.patch(contactId, {
    updatedAt: Date.now(),
  });
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    return sortCompaniesByName(companies);
  },
});

export const get = query({
  args: {
    id: v.id("companies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: companyFields,
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("companies", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const company = await ctx.db.get(id);
    if (!company) {
      throw new Error("Company not found.");
    }

    await ctx.db.patch(id, {
      ...patch,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: {
    id: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    if (!company) {
      return null;
    }

    const assignments = await ctx.db
      .query("contact_companies")
      .withIndex("by_company", (q) => q.eq("companyId", args.id))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    const affectedContactIds = [...new Set(assignments.map((assignment) => assignment.contactId))];
    for (const contactId of affectedContactIds) {
      await ensurePrimaryAssignment(ctx, contactId);
    }

    await ctx.db.delete(args.id);
    return company;
  },
});

export const search = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const companies = await ctx.db.query("companies").collect();
    const searchTerm = args.searchTerm.trim().toLocaleLowerCase("de-DE");

    if (!searchTerm) {
      return sortCompaniesByName(companies);
    }

    return sortCompaniesByName(
      companies.filter((company) =>
        company.name.toLocaleLowerCase("de-DE").includes(searchTerm),
      ),
    );
  },
});
