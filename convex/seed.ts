import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { DEFAULT_CURRENCY } from "./shared";

type SeedContact = {
  name: string;
  position: string;
  email: string;
  phone: string;
  statusName: string;
  notes: string;
  tags: string[];
  companyAssignments: Array<{
    companyName: string;
    role?: string;
    isPrimary?: boolean;
  }>;
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

const COMPANY_SEEDS = [
  {
    name: "Schneider IT-Systeme GmbH",
    industry: "IT & Digitalisierung",
    website: "https://www.schneider-it.de",
    address: "Friedrichstraße 88, 10117 Berlin",
    phone: "+49 30 5481 2200",
    email: "info@schneider-it.de",
    notes: "Managed-IT und CRM-Einführungen für mittelständische Kunden.",
  },
  {
    name: "TechVision AG",
    industry: "Software & Innovation",
    website: "https://www.techvision.ag",
    address: "Kaistraße 14, 40221 Düsseldorf",
    phone: "+49 211 4450 990",
    email: "kontakt@techvision.ag",
    notes: "Betreibt mehrere Digitalisierungsinitiativen mit Partnernetzwerk.",
  },
  {
    name: "Müller Bau GmbH",
    industry: "Bau & Projektentwicklung",
    website: "https://www.mueller-bau.de",
    address: "Industriestraße 27, 50667 Köln",
    phone: "+49 221 7712 440",
    email: "vertrieb@mueller-bau.de",
    notes: "Baut gewerbliche Projekte und arbeitet mit externen Planungsbüros.",
  },
  {
    name: "Gesundheit Plus GmbH",
    industry: "Gesundheit & Pflege",
    website: "https://www.gesundheit-plus.de",
    address: "Leopoldstraße 41, 80802 München",
    phone: "+49 89 5512 600",
    email: "service@gesundheit-plus.de",
    notes: "Koordiniert mehrere medizinische Einrichtungen und Pflegedienste.",
  },
  {
    name: "Krüger Consulting Partners",
    industry: "Unternehmensberatung",
    website: "https://www.kc-partners.de",
    address: "Taunusanlage 10, 60325 Frankfurt am Main",
    phone: "+49 69 3344 8812",
    email: "kontakt@kc-partners.de",
    notes: "Beratungshaus mit Fokus auf Prozesse, Vertrieb und CRM-Rollout.",
  },
  {
    name: "Braun Elektrotechnik GmbH",
    industry: "Elektrotechnik",
    website: "https://www.braun-elektrotechnik.de",
    address: "Siemensallee 9, 76187 Karlsruhe",
    phone: "+49 721 9911 305",
    email: "sales@braun-elektrotechnik.de",
    notes: "Technikbetrieb mit Angebots- und Serviceprozessen im Außendienst.",
  },
] as const;

const CONTACT_SEEDS: SeedContact[] = [
  {
    name: "Anna Schneider",
    position: "Geschäftsführerin",
    email: "anna.schneider@schneider-it.de",
    phone: "+49 30 5481 2200",
    statusName: "Verhandlung",
    notes: "Plant die Einführung eines neuen CRM für Vertrieb und Kundenservice.",
    tags: ["IT", "Beratung"],
    companyAssignments: [
      {
        companyName: "Schneider IT-Systeme GmbH",
        role: "Geschäftsführerin",
        isPrimary: true,
      },
      {
        companyName: "TechVision AG",
        role: "Beirätin",
      },
    ],
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
    position: "Leiter Vertrieb",
    email: "lukas.weber@weber-bauplanung.de",
    phone: "+49 211 8834 109",
    statusName: "Angebot gesendet",
    notes: "Mehrere Niederlassungen, möchte gemeinsame Kontakt- und Angebotsdaten.",
    tags: ["Bau"],
    companyAssignments: [
      {
        companyName: "Müller Bau GmbH",
        role: "Leiter Vertrieb",
        isPrimary: true,
      },
      {
        companyName: "TechVision AG",
        role: "Projektpartner",
      },
    ],
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
    position: "Inhaberin",
    email: "m.hoffmann@hoffmann-sanitaer.de",
    phone: "+49 40 2298 775",
    statusName: "Kontaktiert",
    notes: "Sucht einfache mobile Pflege von Kundennotizen für Außendienst.",
    tags: ["Handwerk"],
    companyAssignments: [
      {
        companyName: "Müller Bau GmbH",
        role: "Leitung Servicekoordination",
        isPrimary: true,
      },
    ],
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
    position: "Partner",
    email: "d.krueger@kc-partners.de",
    phone: "+49 69 3344 8812",
    statusName: "Gewonnen",
    notes: "Braucht saubere Dokumentation pro Kunde und einfache Aktivitätschronik.",
    tags: ["Beratung"],
    companyAssignments: [
      {
        companyName: "Krüger Consulting Partners",
        role: "Partner",
        isPrimary: true,
      },
      {
        companyName: "TechVision AG",
        role: "Senior Berater",
      },
    ],
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
    position: "Praxismanagerin",
    email: "s.neumann@medcare-neumann.de",
    phone: "+49 89 5512 600",
    statusName: "Neu",
    notes: "Will eingehende Patientenanfragen und Rückrufe strukturiert nachhalten.",
    tags: ["Gesundheit"],
    companyAssignments: [
      {
        companyName: "Gesundheit Plus GmbH",
        role: "Praxismanagerin",
        isPrimary: true,
      },
    ],
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
    position: "Vertriebsleiter",
    email: "felix.braun@braun-elektrotechnik.de",
    phone: "+49 721 9911 305",
    statusName: "Verloren",
    notes: "Hat sich zunächst für eine bestehende Branchenlösung entschieden.",
    tags: ["Handwerk", "IT"],
    companyAssignments: [
      {
        companyName: "Braun Elektrotechnik GmbH",
        role: "Vertriebsleiter",
        isPrimary: true,
      },
    ],
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
    position: "Office Managerin",
    email: "k.vogel@vogel-architektur.de",
    phone: "+49 351 4482 910",
    statusName: "Kontaktiert",
    notes: "Benötigt mehr Transparenz über Rückrufe, Meetings und offene Angebote.",
    tags: ["Bau", "Beratung"],
    companyAssignments: [
      {
        companyName: "Müller Bau GmbH",
        role: "Projektkoordination",
        isPrimary: true,
      },
      {
        companyName: "Krüger Consulting Partners",
        role: "Externe Office Managerin",
      },
    ],
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
    position: "Geschäftsführer",
    email: "t.richter@richter-pflegehilfen.de",
    phone: "+49 231 7744 560",
    statusName: "Neu",
    notes: "Möchte zuerst nur ein kleines Team onboarden und später skalieren.",
    tags: ["Gesundheit", "Beratung"],
    companyAssignments: [
      {
        companyName: "Gesundheit Plus GmbH",
        role: "Geschäftsführer",
        isPrimary: true,
      },
      {
        companyName: "Krüger Consulting Partners",
        role: "Netzwerkpartner",
      },
    ],
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

    const companyIds = new Map<string, Id<"companies">>();
    for (const company of COMPANY_SEEDS) {
      const id = await ctx.db.insert("companies", {
        ...company,
        createdAt: now,
        updatedAt: now,
      });
      companyIds.set(company.name, id);
    }

    const contactIds: Id<"contacts">[] = [];
    let assignmentCount = 0;

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

      for (const assignment of contact.companyAssignments) {
        const companyId = companyIds.get(assignment.companyName);
        if (!companyId) {
          throw new Error(`Missing company for seed assignment: ${assignment.companyName}`);
        }

        await ctx.db.insert("contact_companies", {
          contactId,
          companyId,
          role: assignment.role,
          isPrimary: assignment.isPrimary ?? false,
          createdAt,
        });
        assignmentCount += 1;
      }

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
      companiesCreated: companyIds.size,
      contactsCreated: contactIds.length,
      assignmentsCreated: assignmentCount,
    };
  },
});
