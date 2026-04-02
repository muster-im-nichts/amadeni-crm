import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

const createArgs = {
  name: v.string(),
  company: v.optional(v.string()),
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
  company: v.optional(v.string()),
  position: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  address: v.optional(v.string()),
  statusId: v.optional(v.id("statuses")),
  notes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const contacts = await ctx.db.query("contacts").collect();
    return contacts.sort((a, b) => b.updatedAt - a.updatedAt);
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
    return contacts.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const get = query({
  args: {
    id: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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

    for (const entry of timelineEntries) {
      await ctx.db.delete(entry._id);
    }

    for (const offer of offers) {
      await ctx.db.delete(offer._id);
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
    if (!searchTerm) {
      const contacts = await ctx.db.query("contacts").collect();
      return contacts.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    const contacts = await ctx.db.query("contacts").collect();
    return contacts
      .filter((contact) => {
        const name = contact.name.toLocaleLowerCase("de-DE");
        const company = contact.company?.toLocaleLowerCase("de-DE") ?? "";
        return name.includes(searchTerm) || company.includes(searchTerm);
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
