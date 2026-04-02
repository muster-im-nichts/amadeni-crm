export const TIMELINE_TYPES = [
  "note",
  "call",
  "email",
  "meeting",
  "offer",
  "voice_note",
  "status_change",
] as const;

export const OFFER_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
] as const;

export const DEFAULT_CURRENCY = "EUR" as const;

export type TimelineType = (typeof TIMELINE_TYPES)[number];
export type OfferStatus = (typeof OFFER_STATUSES)[number];
