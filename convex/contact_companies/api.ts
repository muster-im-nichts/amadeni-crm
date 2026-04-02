import type { IndexRangeBuilder } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";

async function touchContact(ctx: MutationCtx, contactId: Id<"contacts">) {
  const contact = await ctx.db.get(contactId);
  if (!contact) {
    throw new Error("Contact not found.");
  }

  await ctx.db.patch(contactId, {
    updatedAt: Date.now(),
  });
}

export const listByContact = query({
  args: {
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("contact_companies")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();

    const joined = await Promise.all(
      assignments.map(async (assignment) => {
        const company = await ctx.db.get(assignment.companyId);
        if (!company) {
          return null;
        }

        return {
          ...assignment,
          company,
        };
      }),
    );

    return joined
      .filter((assignment): assignment is NonNullable<typeof assignment> => assignment !== null)
      .sort((a, b) => {
        if (a.isPrimary === b.isPrimary) {
          return a.createdAt - b.createdAt;
        }
        return a.isPrimary ? -1 : 1;
      });
  },
});

export const listByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("contact_companies")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const joined = await Promise.all(
      assignments.map(async (assignment) => {
        const contact = await ctx.db.get(assignment.contactId);
        if (!contact) {
          return null;
        }

        return {
          ...assignment,
          contact,
        };
      }),
    );

    return joined
      .filter((assignment): assignment is NonNullable<typeof assignment> => assignment !== null)
      .sort((a, b) => a.contact.name.localeCompare(b.contact.name, "de-DE"));
  },
});

export const assign = mutation({
  args: {
    contactId: v.id("contacts"),
    companyId: v.id("companies"),
    role: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact not found.");
    }

    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found.");
    }

    const existingAssignment = await ctx.db
      .query("contact_companies")
      .withIndex(
        "by_contact_company",
        (
          q: IndexRangeBuilder<
            Doc<"contact_companies">,
            ["contactId", "companyId", "_creationTime"]
          >,
        ) =>
          q.eq("contactId", args.contactId).eq("companyId", args.companyId),
      )
      .unique();
    if (existingAssignment) {
      throw new Error("Contact is already assigned to this company.");
    }

    const existingAssignments = await ctx.db
      .query("contact_companies")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();

    const isPrimary =
      args.isPrimary ?? existingAssignments.length === 0;

    if (isPrimary) {
      for (const assignment of existingAssignments) {
        if (assignment.isPrimary) {
          await ctx.db.patch(assignment._id, { isPrimary: false });
        }
      }
    }

    const assignmentId = await ctx.db.insert("contact_companies", {
      contactId: args.contactId,
      companyId: args.companyId,
      role: args.role,
      isPrimary,
      createdAt: Date.now(),
    });

    await touchContact(ctx, args.contactId);
    return assignmentId;
  },
});

export const updateRole = mutation({
  args: {
    id: v.id("contact_companies"),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.id);
    if (!assignment) {
      throw new Error("Assignment not found.");
    }

    await ctx.db.patch(args.id, {
      role: args.role,
    });
    await touchContact(ctx, assignment.contactId);

    return await ctx.db.get(args.id);
  },
});

export const unassign = mutation({
  args: {
    id: v.id("contact_companies"),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.id);
    if (!assignment) {
      return null;
    }

    await ctx.db.delete(args.id);

    const remainingAssignments = await ctx.db
      .query("contact_companies")
      .withIndex("by_contact", (q) => q.eq("contactId", assignment.contactId))
      .collect();

    if (assignment.isPrimary && remainingAssignments.length > 0) {
      const nextPrimary = remainingAssignments.sort(
        (a, b) => a.createdAt - b.createdAt,
      )[0];
      await ctx.db.patch(nextPrimary._id, { isPrimary: true });
    }

    await touchContact(ctx, assignment.contactId);
    return assignment;
  },
});

export const setPrimary = mutation({
  args: {
    id: v.id("contact_companies"),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.id);
    if (!assignment) {
      throw new Error("Assignment not found.");
    }

    const assignments = await ctx.db
      .query("contact_companies")
      .withIndex("by_contact", (q) => q.eq("contactId", assignment.contactId))
      .collect();

    for (const existingAssignment of assignments) {
      await ctx.db.patch(existingAssignment._id, {
        isPrimary: existingAssignment._id === args.id,
      });
    }

    await touchContact(ctx, assignment.contactId);
    return await ctx.db.get(args.id);
  },
});
