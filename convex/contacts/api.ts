import type { IndexRangeBuilder } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";

const createArgs = {
  name: v.string(),
  position: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  address: v.optional(v.string()),
  statusId: v.optional(v.id("statuses")),
  notes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
};

const updateArgs = {
  id: v.id("contacts"),
  name: v.optional(v.string()),
  position: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  address: v.optional(v.string()),
  statusId: v.optional(v.id("statuses")),
  notes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
};

async function getPrimaryCompanyForContact(ctx: QueryCtx, contactId: Id<"contacts">) {
  const assignments = await ctx.db
    .query("contact_companies")
    .withIndex(
      "by_contact",
      (q: IndexRangeBuilder<Doc<"contact_companies">, ["contactId", "_creationTime"]>) =>
        q.eq("contactId", contactId),
    )
    .collect();

  const primaryAssignment =
    assignments.find((assignment) => assignment.isPrimary) ?? assignments[0];
  if (!primaryAssignment) {
    return null;
  }

  const company = await ctx.db.get(primaryAssignment.companyId);
  if (!company) {
    return null;
  }

  return {
    ...company,
    role: primaryAssignment.role,
    isPrimary: primaryAssignment.isPrimary,
    assignmentId: primaryAssignment._id,
  };
}

async function enrichContact(ctx: QueryCtx, contact: Doc<"contacts">) {
  const primaryCompany = await getPrimaryCompanyForContact(ctx, contact._id);
  return {
    ...contact,
    primaryCompany,
    company: primaryCompany?.name,
  };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const contacts = await ctx.db.query("contacts").collect();
    const enrichedContacts = await Promise.all(
      contacts.map((contact) => enrichContact(ctx, contact)),
    );
    return enrichedContacts.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const listByStatus = query({
  args: {
    statusId: v.id("statuses"),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_status", (q) => q.eq("statusId", args.statusId))
      .collect();
    const enrichedContacts = await Promise.all(
      contacts.map((contact) => enrichContact(ctx, contact)),
    );
    return enrichedContacts.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const get = query({
  args: {
    id: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) {
      return null;
    }

    return await enrichContact(ctx, contact);
  },
});

export const create = mutation({
  args: createArgs,
  handler: async (ctx, args) => {
    const now = Date.now();
    const contactId = await ctx.db.insert("contacts", {
      ...args,
      tags: args.tags ?? [],
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("timeline_entries", {
      contactId,
      type: "note",
      title: "Contact created",
      createdAt: now,
    });

    return contactId;
  },
});

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("Contact not found.");
    }

    await ctx.db.patch(id, {
      ...patch,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("contacts"),
    statusId: v.id("statuses"),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) {
      throw new Error("Contact not found.");
    }

    const status = await ctx.db.get(args.statusId);
    if (!status) {
      throw new Error("Status not found.");
    }

    const now = Date.now();

    await ctx.db.patch(args.id, {
      statusId: args.statusId,
      updatedAt: now,
    });

    await ctx.db.insert("timeline_entries", {
      contactId: args.id,
      type: "status_change",
      title: `Status changed to ${status.name}`,
      metadata: JSON.stringify({
        statusId: args.statusId,
        statusName: status.name,
      }),
      createdAt: now,
    });

    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: {
    id: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) {
      return null;
    }

    const timelineEntries = await ctx.db
      .query("timeline_entries")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();
    const offers = await ctx.db
      .query("offers")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();
    const companyAssignments = await ctx.db
      .query("contact_companies")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();

    for (const entry of timelineEntries) {
      await ctx.db.delete(entry._id);
    }

    for (const offer of offers) {
      await ctx.db.delete(offer._id);
    }

    for (const assignment of companyAssignments) {
      await ctx.db.delete(assignment._id);
    }

    await ctx.db.delete(args.id);

    return contact;
  },
});

export const search = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.trim().toLocaleLowerCase("de-DE");
    const contacts = await ctx.db.query("contacts").collect();

    if (!searchTerm) {
      const enrichedContacts = await Promise.all(
        contacts.map((contact) => enrichContact(ctx, contact)),
      );
      return enrichedContacts.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    const matches = await Promise.all(
      contacts.map(async (contact) => {
        const name = contact.name.toLocaleLowerCase("de-DE");
        if (name.includes(searchTerm)) {
          return true;
        }

        const assignments = await ctx.db
          .query("contact_companies")
          .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
          .collect();

        for (const assignment of assignments) {
          const company = await ctx.db.get(assignment.companyId);
          if (company?.name.toLocaleLowerCase("de-DE").includes(searchTerm)) {
            return true;
          }
        }

        return false;
      }),
    );

    const filteredContacts = contacts.filter((_, index) => matches[index]);
    const enrichedContacts = await Promise.all(
      filteredContacts.map((contact) => enrichContact(ctx, contact)),
    );
    return enrichedContacts.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
