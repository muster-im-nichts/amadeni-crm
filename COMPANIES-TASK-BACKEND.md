# Companies Feature — Backend Task (Codex)

## Context
Currently contacts have a simple `company: string` field. We need a proper many-to-many relationship:
- A person can belong to multiple companies
- A company can have multiple people  
- Each assignment has a role (e.g. "CEO", "Berater", "Ansprechpartner")

## Changes

### 1. New table in `convex/schema.ts`: `companies`
```typescript
companies: defineTable({
  name: v.string(),
  industry: v.optional(v.string()),
  website: v.optional(v.string()),
  address: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  notes: v.optional(v.string()),
  createdAt: v.float64(),
  updatedAt: v.float64(),
})
```

### 2. New junction table in `convex/schema.ts`: `contact_companies`
```typescript
contact_companies: defineTable({
  contactId: v.id("contacts"),
  companyId: v.id("companies"),
  role: v.optional(v.string()), // "CEO", "Berater", "Entwickler", etc.
  isPrimary: v.boolean(), // primary company shown in lists
  createdAt: v.float64(),
}).index("by_contact", ["contactId"])
  .index("by_company", ["companyId"])
  .index("by_contact_company", ["contactId", "companyId"])
```

### 3. Remove `company` field from contacts table
Remove the `company: v.optional(v.string())` field from the contacts table definition.
Also remove it from `convex/contacts/api.ts` create and update mutations args.

### 4. New API: `convex/companies/api.ts`
- `list` — all companies, ordered by name
- `get(id)` — single company
- `create(name, industry?, website?, address?, phone?, email?, notes?)` — create company
- `update(id, ...)` — update company fields + updatedAt
- `remove(id)` — delete company + all contact_companies entries for it
- `search(searchTerm)` — filter by name

### 5. New API: `convex/contact_companies/api.ts`
- `listByContact(contactId)` — returns all companies for a contact (with company data joined)
- `listByCompany(companyId)` — returns all contacts for a company (with contact data joined)
- `assign(contactId, companyId, role?, isPrimary?)` — create assignment
- `updateRole(id, role)` — update role on assignment
- `unassign(id)` — remove assignment
- `setPrimary(id)` — set this as primary (unset others for same contact)

For the "join" queries: first query contact_companies, then load the related entity via `ctx.db.get()`.

### 6. Update seed data (`convex/seed.ts`)
- Create 5-6 companies (e.g. "Müller Bau GmbH", "TechVision AG", "Gesundheit Plus", etc.)
- Assign existing sample contacts to companies with roles
- Some contacts should be assigned to multiple companies

### 7. Update `convex/contacts/scan.ts`
The business card scanner should also extract company info. After creating a contact from a scanned card, the frontend will handle creating/finding a company and making the assignment. No changes needed to the scan action itself — just make sure the returned `company` field is still there.

## Technical Notes
- For listByContact and listByCompany: query the junction table first, then use `Promise.all` with `ctx.db.get()` to load related entities
- Make sure to handle the case where a contact has no companies (return empty array)
- The `isPrimary` flag is used in list views to show the "main" company for a contact

When completely finished, run: openclaw system event --text "Done: Codex finished companies feature backend." --mode now
