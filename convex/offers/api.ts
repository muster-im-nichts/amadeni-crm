import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { DEFAULT_CURRENCY } from "../shared";

const offerStatusValidator = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("accepted"),
  v.literal("rejected"),
);

export const listByContact = query({
  args: {
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query("offers")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();
    return offers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    contactId: v.id("contacts"),
    title: v.string(),
    amount: v.float64(),
    currency: v.optional(v.string()),
    status: v.optional(offerStatusValidator),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("offers", {
      contactId: args.contactId,
      title: args.title,
      amount: args.amount,
      currency: args.currency ?? DEFAULT_CURRENCY,
      status: args.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("offers"),
    title: v.optional(v.string()),
    amount: v.optional(v.float64()),
    currency: v.optional(v.string()),
    status: v.optional(offerStatusValidator),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("Offer not found.");
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
    id: v.id("offers"),
  },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.id);
    if (!offer) {
      return null;
    }

    await ctx.db.delete(args.id);
    return offer;
  },
});

export const totalByContact = query({
  args: {
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query("offers")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();

    return offers.reduce((sum, offer) => sum + offer.amount, 0);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const offers = await ctx.db.query("offers").collect();
    const openOffers = offers.filter(
      (offer) => offer.status === "draft" || offer.status === "sent",
    );

    return {
      totalOffers: offers.length,
      totalValue: offers.reduce((sum, offer) => sum + offer.amount, 0),
      openOffers: openOffers.length,
      openValue: openOffers.reduce((sum, offer) => sum + offer.amount, 0),
    };
  },
});
