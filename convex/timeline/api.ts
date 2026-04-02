import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

const timelineTypeValidator = v.union(
  v.literal("note"),
  v.literal("call"),
  v.literal("email"),
  v.literal("meeting"),
  v.literal("offer"),
  v.literal("voice_note"),
  v.literal("status_change"),
);

export const listByContact = query({
  args: {
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("timeline_entries")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();
    return entries.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listRecent = query({
  args: {
    limit: v.float64(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("timeline_entries")
      .withIndex("by_created")
      .order("desc")
      .take(Math.max(0, Math.floor(args.limit)));
  },
});

export const create = mutation({
  args: {
    contactId: v.id("contacts"),
    type: timelineTypeValidator,
    title: v.string(),
    content: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("timeline_entries", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
