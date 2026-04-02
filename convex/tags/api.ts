import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tags").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tags", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("Tag not found.");
    }

    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: {
    id: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.id);
    if (!tag) {
      return null;
    }

    const contacts = await ctx.db.query("contacts").collect();
    for (const contact of contacts) {
      if (!contact.tags.includes(tag.name)) {
        continue;
      }

      await ctx.db.patch(contact._id, {
        tags: contact.tags.filter((value) => value !== tag.name),
        updatedAt: Date.now(),
      });
    }

    await ctx.db.delete(args.id);
    return tag;
  },
});
