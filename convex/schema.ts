import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
    name: v.string(),
    company: v.optional(v.string()),
    position: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    statusId: v.optional(v.id("statuses")),
    notes: v.optional(v.string()),
    tags: v.array(v.string()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  }).index("by_status", ["statusId"]),

  statuses: defineTable({
    name: v.string(),
    order: v.float64(),
    color: v.string(),
  }).index("by_order", ["order"]),

  tags: defineTable({
    name: v.string(),
    color: v.string(),
  }),

  timeline_entries: defineTable({
    contactId: v.id("contacts"),
    type: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    metadata: v.optional(v.string()),
    createdAt: v.float64(),
  })
    .index("by_contact", ["contactId"])
    .index("by_created", ["createdAt"]),

  offers: defineTable({
    contactId: v.id("contacts"),
    title: v.string(),
    amount: v.float64(),
    currency: v.string(),
    status: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  }).index("by_contact", ["contactId"]),
});
