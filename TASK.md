# Amadeni CRM — Prototype Build Task

## Overview
Build a CRM (Customer Relations Management) prototype using Next.js 15 + Convex + shadcn/ui + TypeScript.
This is a greenfield project — scaffold everything from scratch.

## Step 1: Scaffold the App

```bash
# In the current directory (amadeni-crm), initialize the project:
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-git --import-alias "@/*"
npm install convex
npm install react-hook-form @hookform/resolvers zod
npm install class-variance-authority clsx tailwind-merge lucide-react
npx shadcn@latest init --defaults
npx shadcn@latest add button card dialog dropdown-menu form input label select separator sheet skeleton table tabs textarea badge command popover scroll-area sonner toggle tooltip avatar checkbox
```

Do NOT run `npx convex dev` — there is no Convex project configured yet. Just install the package and create the schema files. We'll configure the Convex project later.

## Step 2: Data Model

Create Convex schema files (they won't be deployed yet, but the code should be correct):

### Tables needed:

**contacts** — Core entity
- name: string (required)
- company: string (optional)
- position: string (optional)  
- email: string (optional)
- phone: string (optional)
- status: string (reference to a status ID or slug)
- notes: string (optional, rich text)
- tags: array of strings
- createdAt: float64
- updatedAt: float64

**statuses** — User-defined statuses for the Kanban pipeline
- name: string (e.g. "Neu", "Kontaktiert", "Angebot gesendet", "Gewonnen", "Verloren")
- order: float64 (for sorting/kanban column order)
- color: string (hex color)

**tags** — User-defined tags/categories
- name: string
- color: string (hex color)

**timeline_entries** — Contact history / touchpoints per contact
- contactId: id("contacts")
- type: string ("note", "call", "email", "meeting", "offer", "voice_note", "status_change")
- title: string
- content: string (optional)
- metadata: string (optional, JSON string for extra data like offer amount)
- createdAt: float64

**offers** — Offers/proposals linked to contacts
- contactId: id("contacts")
- title: string
- amount: float64
- currency: string (default "EUR")
- status: string ("draft", "sent", "accepted", "rejected")
- createdAt: float64
- updatedAt: float64

### Schema file: `convex/schema.ts`

Use Convex v patterns:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
```

### API files per entity: `convex/[entity]/api.ts`
- CRUD operations for each table
- NO auth checks for the prototype (skip getUserIdentity for now — we'll add auth later)
- List, get, create, update, delete for contacts
- List, create, update, delete, reorder for statuses  
- List, create, delete for tags
- List by contact, create for timeline entries
- List by contact, create, update, delete for offers

## Step 3: Frontend Pages

### Layout (`src/app/layout.tsx`)
- Sidebar navigation with icons (use lucide-react)
- Links: Dashboard, Contacts, Kanban Board, Settings
- Use a clean, modern layout with shadcn components
- Wrap in a ConvexProvider (import from convex/react, use NEXT_PUBLIC_CONVEX_URL env var)

### Dashboard (`src/app/page.tsx`)
- KPI cards at top: Total Contacts, Active Leads, Open Offers, Total Offer Value
- Recent activity list (last 10 timeline entries across all contacts)
- Quick action buttons: New Contact, New Note

### Contacts List (`src/app/contacts/page.tsx`)
- Table view with columns: Name, Company, Status (badge), Tags (badges), Last Contact, Actions
- Search bar (filter by name/company)
- Filter by status and tags
- Click row → navigate to contact detail
- "New Contact" button → dialog

### Contact Detail (`src/app/contacts/[id]/page.tsx`)
- Two-column layout
- **Left column:**
  - Header with name, company, position (inline editable or edit button)
  - Contact info (email, phone)
  - Status selector (dropdown)
  - Tags (multi-select with ability to add/remove)
  - Timeline (chronological list of all touchpoints)
  - "Add Note" button, "Log Call" button, "Log Meeting" button
- **Right column:**
  - Summary panel (placeholder for AI summary — just show last 3 notes concatenated for now)
  - Offers list with status badges and amounts
  - "New Offer" button → dialog

### Kanban Board (`src/app/kanban/page.tsx`)
- Columns based on statuses table (user-defined)
- Cards show: Name, Company, Tags, Offer amount (if any), last contact date
- Drag and drop between columns (use HTML5 drag and drop or a simple implementation)
- Click card → navigate to contact detail
- Seed with default statuses: "Neu", "Kontaktiert", "Angebot gesendet", "Verhandlung", "Gewonnen", "Verloren"

### Settings (`src/app/settings/page.tsx`)
- Manage Statuses: list, reorder, add, edit color/name, delete
- Manage Tags: list, add, edit color/name, delete

## Step 4: Seed Data

Create a `convex/seed.ts` that can be called to populate:
- 5 default statuses with colors
- 5 default tags (e.g. "IT", "Bau", "Handwerk", "Beratung", "Gesundheit")
- 5-10 sample contacts with varying statuses and tags
- Some timeline entries and offers for the contacts

## Style Guidelines
- Use shadcn/ui components everywhere — no custom CSS unless absolutely necessary
- Use Tailwind utility classes
- German UI labels (this is a German CRM)
- Clean, minimal, professional look
- Use lucide-react icons consistently

## Technical Notes
- This is a PROTOTYPE — prioritize working code over perfection
- No authentication for now (skip auth checks)
- No file uploads or audio recording yet (just the data model placeholder)
- Convex schema should be correct but won't be deployed in this step
- Use `useQuery` and `useMutation` from "convex/react" for data fetching
- Since Convex isn't configured, the app won't fully work yet — but all the UI and data layer code should be correct and complete

## File Structure
```
amadeni-crm/
├── convex/
│   ├── schema.ts
│   ├── seed.ts
│   ├── contacts/api.ts
│   ├── statuses/api.ts
│   ├── tags/api.ts
│   ├── timeline/api.ts
│   └── offers/api.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (dashboard)
│   │   ├── contacts/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── kanban/page.tsx
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   ├── layout/sidebar.tsx
│   │   ├── contacts/contact-dialog.tsx
│   │   ├── contacts/contact-table.tsx
│   │   ├── kanban/kanban-board.tsx
│   │   ├── kanban/kanban-card.tsx
│   │   ├── kanban/kanban-column.tsx
│   │   ├── timeline/timeline-list.tsx
│   │   ├── timeline/timeline-entry.tsx
│   │   └── offers/offer-dialog.tsx
│   └── lib/
│       └── utils.ts
├── TASK.md
└── package.json
```

When completely finished, run: openclaw system event --text "Done: Amadeni CRM prototype scaffolded with Next.js + Convex + shadcn/ui. All pages, components, and Convex schema created." --mode now
