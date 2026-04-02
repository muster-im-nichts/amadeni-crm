import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { DEFAULT_CURRENCY } from "./shared";

type SeedContact = {
  name: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  statusName: string;
  notes: string;
  tags: string[];
  timeline: Array<{
    type:
      | "note"
      | "call"
      | "email"
      | "meeting"
      | "offer"
      | "voice_note"
      | "status_change";
    title: string;
    content?: string;
    metadata?: Record<string, unknown>;
    offsetHours: number;
  }>;
  offers?: Array<{
    title: string;
    amount: number;
    currency?: string;
    status: "draft" | "sent" | "accepted" | "rejected";
    offsetHours: number;
  }>;
};

const STATUS_SEEDS = [
  { name: "Neu", color: "#3b82f6", order: 0 },
  { name: "Kontaktiert", color: "#8b5cf6", order: 1 },
  { name: "Angebot gesendet", color: "#f59e0b", order: 2 },
  { name: "Verhandlung", color: "#f97316", order: 3 },
  { name: "Gewonnen", color: "#22c55e", order: 4 },
  { name: "Verloren", color: "#ef4444", order: 5 },
] as const;

const TAG_SEEDS = [
  { name: "IT", color: "#3b82f6" },
  { name: "Bau", color: "#f97316" },
  { name: "Handwerk", color: "#8b5cf6" },
  { name: "Beratung", color: "#22c55e" },
  { name: "Gesundheit", color: "#ec4899" },
] as const;

const CONTACT_SEEDS: SeedContact[] = [
  {
    name: "Anna Schneider",
    company: "Schneider IT-Systeme GmbH",
    position: "Geschäftsführerin",
    email: "anna.schneider@schneider-it.de",
    phone: "+49 30 5481 2200",
    statusName: "Verhandlung",
    notes: "Plant die Einführung eines neuen CRM für Vertrieb und Kundenservice.",
    tags: ["IT", "Beratung"],
    timeline: [
      {
        type: "call",
        title: "Erstgespräch geführt",
        content: "Bedarf für zentrale Kundenakte und Angebotsverfolgung bestätigt.",
        offsetHours: -160,
      },
      {
        type: "meeting",
        title: "Demo präsentiert",
        content: "Team war besonders an Pipeline-Ansichten und Timeline interessiert.",
        offsetHours: -120,
      },
      {
        type: "email",
        title: "Anforderungsliste erhalten",
        content: "Import aus Excel und Rollenmodell wurden als Muss genannt.",
        offsetHours: -72,
      },
    ],
    offers: [
      {
        title: "CRM Einführungspaket",
        amount: 7200,
        status: "sent",
        offsetHours: -48,
      },
      {
        title: "Onboarding und Schulung",
        amount: 1800,
        status: "draft",
        offsetHours: -24,
      },
    ],
  },
  {
    name: "Lukas Weber",
    company: "Weber Bauplanung AG",
    position: "Leiter Vertrieb",
    email: "lukas.weber@weber-bauplanung.de",
    phone: "+49 211 8834 109",
    statusName: "Angebot gesendet",
    notes: "Mehrere Niederlassungen, möchte gemeinsame Kontakt- und Angebotsdaten.",
    tags: ["Bau"],
    timeline: [
      {
        type: "note",
        title: "Lead von Messe übernommen",
        content: "Kontakt kam über die DigitalBau in Köln.",
        offsetHours: -140,
      },
      {
        type: "call",
        title: "Follow-up Telefonat",
        content: "Interesse an Angebotsvorlagen und Statusautomationen.",
        offsetHours: -110,
      },
      {
        type: "offer",
        title: "Angebot angekündigt",
        content: "Versand des Angebots bis Ende der Woche zugesagt.",
        offsetHours: -88,
      },
    ],
    offers: [
      {
        title: "Team-Lizenz 25 Nutzer",
        amount: 6400,
        status: "sent",
        offsetHours: -60,
      },
    ],
  },
  {
    name: "Miriam Hoffmann",
    company: "Hoffmann Sanitär & Service",
    position: "Inhaberin",
    email: "m.hoffmann@hoffmann-sanitaer.de",
    phone: "+49 40 2298 775",
    statusName: "Kontaktiert",
    notes: "Sucht einfache mobile Pflege von Kundennotizen für Außendienst.",
    tags: ["Handwerk"],
    timeline: [
      {
        type: "call",
        title: "Erstkontakt hergestellt",
        content: "Termin für Produktdemo telefonisch abgestimmt.",
        offsetHours: -96,
      },
      {
        type: "voice_note",
        title: "Sprachnotiz intern",
        content: "Wichtig: Offline-Anforderungen beim Technikerteam prüfen.",
        offsetHours: -70,
      },
    ],
  },
  {
    name: "David Krüger",
    company: "Krüger Consulting Partners",
    position: "Partner",
    email: "d.krueger@kc-partners.de",
    phone: "+49 69 3344 8812",
    statusName: "Gewonnen",
    notes: "Braucht saubere Dokumentation pro Kunde und einfache Aktivitätschronik.",
    tags: ["Beratung"],
    timeline: [
      {
        type: "meeting",
        title: "Workshop durchgeführt",
        content: "Anforderungen priorisiert und Datenmodell abgestimmt.",
        offsetHours: -220,
      },
      {
        type: "status_change",
        title: "Status auf Gewonnen gesetzt",
        metadata: { statusName: "Gewonnen" },
        offsetHours: -36,
      },
      {
        type: "note",
        title: "Kickoff vorbereitet",
        content: "Projektstart für kommende Woche bestätigt.",
        offsetHours: -12,
      },
    ],
    offers: [
      {
        title: "Beraterpaket Professional",
        amount: 9800,
        status: "accepted",
        offsetHours: -40,
      },
    ],
  },
  {
    name: "Sophie Neumann",
    company: "Neumann MedCare",
    position: "Praxismanagerin",
    email: "s.neumann@medcare-neumann.de",
    phone: "+49 89 5512 600",
    statusName: "Neu",
    notes: "Will eingehende Patientenanfragen und Rückrufe strukturiert nachhalten.",
    tags: ["Gesundheit"],
    timeline: [
      {
        type: "note",
        title: "Webformular Lead",
        content: "Über Landingpage für Praxisteams eingegangen.",
        offsetHours: -20,
      },
      {
        type: "email",
        title: "Begrüßungsmail gesendet",
        content: "Kurzvorstellung und Terminlink verschickt.",
        offsetHours: -18,
      },
    ],
  },
  {
    name: "Felix Braun",
    company: "Braun Elektrotechnik GmbH",
    position: "Vertriebsleiter",
    email: "felix.braun@braun-elektrotechnik.de",
    phone: "+49 721 9911 305",
    statusName: "Verloren",
    notes: "Hat sich zunächst für eine bestehende Branchenlösung entschieden.",
    tags: ["Handwerk", "IT"],
    timeline: [
      {
        type: "call",
        title: "Preisgespräch",
        content: "Budget war enger als ursprünglich kommuniziert.",
        offsetHours: -150,
      },
      {
        type: "status_change",
        title: "Status auf Verloren gesetzt",
        metadata: { statusName: "Verloren" },
        offsetHours: -80,
      },
    ],
    offers: [
      {
        title: "Starterpaket Vertrieb",
        amount: 4100,
        status: "rejected",
        offsetHours: -100,
      },
    ],
  },
  {
    name: "Katharina Vogel",
    company: "Vogel Architektur Studio",
    position: "Office Managerin",
    email: "k.vogel@vogel-architektur.de",
    phone: "+49 351 4482 910",
    statusName: "Kontaktiert",
    notes: "Benötigt mehr Transparenz über Rückrufe, Meetings und offene Angebote.",
    tags: ["Bau", "Beratung"],
    timeline: [
      {
        type: "email",
        title: "Projektunterlagen angefragt",
        content: "Wünscht kurze Übersicht mit Referenzen für ähnliche Büros.",
        offsetHours: -62,
      },
      {
        type: "meeting",
        title: "Online-Demo terminiert",
        content: "Termin steht für kommenden Dienstag.",
        offsetHours: -10,
      },
    ],
  },
  {
    name: "Tobias Richter",
    company: "Richter Pflegehilfen GmbH",
    position: "Geschäftsführer",
    email: "t.richter@richter-pflegehilfen.de",
    phone: "+49 231 7744 560",
    statusName: "Neu",
    notes: "Möchte zuerst nur ein kleines Team onboarden und später skalieren.",
    tags: ["Gesundheit", "Beratung"],
    timeline: [
      {
        type: "note",
        title: "Empfehlung erhalten",
        content: "Wurde durch Bestandskunde aus dem Beratungsumfeld empfohlen.",
        offsetHours: -30,
      },
      {
        type: "call",
        title: "Terminvereinbarung offen",
        content: "Assistentin meldet sich nächste Woche mit zwei Vorschlägen.",
        offsetHours: -6,
      },
    ],
  },
];

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const statusIds = new Map<string, Id<"statuses">>();
    for (const status of STATUS_SEEDS) {
      const id = await ctx.db.insert("statuses", status);
      statusIds.set(status.name, id);
    }

    const tagIds = new Map<string, Id<"tags">>();
    for (const tag of TAG_SEEDS) {
      const id = await ctx.db.insert("tags", tag);
      tagIds.set(tag.name, id);
    }

    const contactIds: Id<"contacts">[] = [];

    for (const [index, contact] of CONTACT_SEEDS.entries()) {
      const statusId = statusIds.get(contact.statusName);
      if (!statusId) {
        throw new Error(`Missing status for seed contact: ${contact.statusName}`);
      }

      const createdAt = now - (CONTACT_SEEDS.length - index) * 86_400_000;
      const lastTimelineOffset = Math.max(
        ...contact.timeline.map((entry) => entry.offsetHours),
        ...(contact.offers?.map((offer) => offer.offsetHours) ?? []),
        0,
      );

      const contactId = await ctx.db.insert("contacts", {
        name: contact.name,
        company: contact.company,
        position: contact.position,
        email: contact.email,
        phone: contact.phone,
        statusId,
        notes: contact.notes,
        tags: contact.tags,
        createdAt,
        updatedAt: now + lastTimelineOffset * 3_600_000,
      });
      contactIds.push(contactId);

      for (const entry of contact.timeline) {
        await ctx.db.insert("timeline_entries", {
          contactId,
          type: entry.type,
          title: entry.title,
          content: entry.content,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined,
          createdAt: now + entry.offsetHours * 3_600_000,
        });
      }

      for (const offer of contact.offers ?? []) {
        const createdOfferAt = now + offer.offsetHours * 3_600_000;
        await ctx.db.insert("offers", {
          contactId,
          title: offer.title,
          amount: offer.amount,
          currency: offer.currency ?? DEFAULT_CURRENCY,
          status: offer.status,
          createdAt: createdOfferAt,
          updatedAt: createdOfferAt,
        });
      }
    }

    return {
      statusesCreated: STATUS_SEEDS.length,
      tagsCreated: tagIds.size,
      contactsCreated: contactIds.length,
    };
  },
});
