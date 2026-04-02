import { mutation, query, type MutationCtx } from "../_generated/server";
import { type Id } from "../_generated/dataModel";
import { v } from "convex/values";

async function clearStatusFromContacts(
  ctx: MutationCtx,
  statusId: Id<"statuses">,
) {
  const contacts = await ctx.db
    .query("contacts")
    .withIndex("by_status", (q) => q.eq("statusId", statusId))
    .collect();

  for (const contact of contacts) {
    const { _id, _creationTime, statusId: _removedStatusId, ...rest } = contact;
    await ctx.db.replace(_id, rest);
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("statuses").withIndex("by_order").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    order: v.float64(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("statuses", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("statuses"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("Status not found.");
    }

    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: {
    id: v.id("statuses"),
  },
  handler: async (ctx, args) => {
    const status = await ctx.db.get(args.id);
    if (!status) {
      return null;
    }

    await clearStatusFromContacts(ctx, args.id);
    await ctx.db.delete(args.id);

    return status;
  },
});

export const reorder = mutation({
  args: {
    orderedIds: v.array(v.id("statuses")),
  },
  handler: async (ctx, args) => {
    for (const [index, id] of args.orderedIds.entries()) {
      await ctx.db.patch(id, { order: index });
    }

    return await ctx.db.query("statuses").withIndex("by_order").collect();
  },
});
