"use client";

import { Suspense, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ContactTable } from "@/components/contacts/contact-table";
import { ContactDialog } from "@/components/contacts/contact-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ContactsPage() {
  return (
    <Suspense>
      <ContactsPageInner />
    </Suspense>
  );
}

function ContactsPageInner() {
  const contacts = useQuery(api.contacts.api.list);
  const statuses = useQuery(api.statuses.api.list);
  const tags = useQuery(api.tags.api.list);
  const searchParams = useSearchParams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Auto-open dialog if ?new=true is in URL
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setDialogOpen(true);
    }
  }, [searchParams]);

  const filteredContacts = useMemo(() => {
    if (!contacts) return undefined;

    return contacts.filter((c: any) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = `${c.firstName} ${c.lastName}`
          .toLowerCase()
          .includes(q);
        const companyMatch = c.company?.toLowerCase().includes(q);
        if (!nameMatch && !companyMatch) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (c.status?._id !== statusFilter && c.statusId !== statusFilter)
          return false;
      }

      // Tag filter
      if (tagFilter !== "all") {
        const hasTag = c.tags?.some(
          (t: any) => t._id === tagFilter || t.name === tagFilter,
        );
        if (!hasTag) return false;
      }

      return true;
    });
  }, [contacts, search, statusFilter, tagFilter]);

  const hasFilters =
    search !== "" || statusFilter !== "all" || tagFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setTagFilter("all");
  }

  function handleEdit(contact: any) {
    setEditingContact(contact);
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setEditingContact(null);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kontakte</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {contacts === undefined
              ? "Lade..."
              : `${contacts.length} Kontakt${contacts.length !== 1 ? "e" : ""} insgesamt`}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Neuer Kontakt
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Name oder Unternehmen suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {statuses?.map((s: any) => (
              <SelectItem key={s._id} value={s._id}>
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={tagFilter}
          onValueChange={(v) => setTagFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Tags</SelectItem>
            {tags?.map((t: any) => (
              <SelectItem key={t._id} value={t._id}>
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                  {t.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-3.5" />
            Filter zurücksetzen
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <ContactTable contacts={filteredContacts} onEdit={handleEdit} />
      </div>

      {/* Dialog */}
      <ContactDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        contact={editingContact}
      />
    </div>
  );
}
