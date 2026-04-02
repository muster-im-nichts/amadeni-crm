# Companies Feature — Frontend Task (Claude Code)

## Context
The data model is changing: contacts no longer have a simple `company` string field.
Instead there's a many-to-many relationship via `contact_companies` junction table.
A person can belong to multiple companies, each with a role.

## Backend API (being built in parallel)
- `api.companies.api.list`, `.get`, `.create`, `.update`, `.remove`, `.search`
- `api.contact_companies.api.listByContact`, `.listByCompany`, `.assign`, `.updateRole`, `.unassign`, `.setPrimary`

## Changes

### 1. New page: `src/app/companies/page.tsx`
- Companies list with table: Name, Branche, Website, Anzahl Kontakte, Aktionen
- Search bar
- "Neues Unternehmen" button → dialog
- Click row → company detail page

### 2. New page: `src/app/companies/[id]/page.tsx`
- Company header: name, industry, website, address, contact info
- Edit button
- List of associated contacts with their roles
- "Kontakt zuordnen" button → searchable select to pick existing contact + role input

### 3. New component: `src/components/companies/company-dialog.tsx`
- Create/edit dialog for companies (name, industry, website, address, phone, email, notes)
- react-hook-form + zod validation

### 4. Update sidebar (`src/components/layout/sidebar.tsx`)
- Add "Unternehmen" nav item with Building2 icon from lucide, between Kontakte and Kanban

### 5. Update contact detail (`src/app/contacts/[id]/page.tsx`)
- Replace the old static company display
- Show "Unternehmen" section listing all companies with roles
- Each entry: Company name (linked), Role badge, Primary star, Remove button
- "Unternehmen zuordnen" button → dialog with:
  - Searchable company select (combobox from existing companies, or type new name)
  - Role input (text field with common suggestions: CEO, Geschäftsführer, Berater, Entwickler, Vertrieb, etc.)
  - isPrimary checkbox
- If company doesn't exist yet → create it on the fly

### 6. Update contact dialog (`src/components/contacts/contact-dialog.tsx`)
- Remove the old `company` text field
- After creating a contact, optionally assign to a company (can be done later from detail page)
- OR: add a simple "Unternehmen" combobox that creates/selects a company and makes the assignment

### 7. Update contact table (`src/components/contacts/contact-table.tsx`)
- The "Unternehmen" column should now show the primary company from `contact_companies` 
- Use `api.contact_companies.api.listByContact` or include company data in the contacts list query
- Show role in parentheses: "Firma GmbH (CEO)"

### 8. Update Kanban cards (`src/components/kanban/kanban-card.tsx`)
- Show primary company name on the card (from contact_companies, not the old field)

### 9. Update business card scanner (`src/components/contacts/business-card-scanner.tsx`)
- When a card is scanned and company name is extracted:
  - Search existing companies for a match
  - If found → suggest assigning to existing company
  - If not found → create new company automatically
  - Set scanned position as role

## German Labels
- "Unternehmen" (Companies)
- "Neues Unternehmen" (New company)
- "Branche" (Industry)
- "Kontakte zuordnen" (Assign contacts)
- "Rolle" (Role)
- "Hauptunternehmen" (Primary company)
- "Unternehmen zuordnen" (Assign company)

Do NOT touch convex/ directory.

When completely finished, run: openclaw system event --text "Done: Claude Code finished companies feature frontend." --mode now
