"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  Copy,
  Building2,
  Briefcase,
  Plus,
  FileText,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { TimelineList } from "@/components/timeline/timeline-list";
import { OfferDialog } from "@/components/offers/offer-dialog";
import { ContactDialog } from "@/components/contacts/contact-dialog";

const offerStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", label: "Entwurf" },
  sent: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-600 dark:text-blue-400", label: "Versendet" },
  accepted: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-400", label: "Angenommen" },
  rejected: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-600 dark:text-red-400", label: "Abgelehnt" },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Kopiert!");
  } catch {
    toast.error("Kopieren fehlgeschlagen");
  }
}

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contact = useQuery(api.contacts.api.get, { id: id as any });
  const statuses = useQuery(api.statuses.api.list);
  const offers = useQuery(api.offers.api.listByContact, {
    contactId: id as any,
  });
  const tags = useQuery(api.tags.api.list);

  const updateStatus = useMutation(api.contacts.api.updateStatus);
  const removeOffer = useMutation(api.offers.api.remove);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);

  if (contact === undefined) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (contact === null) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-lg font-medium">Kontakt nicht gefunden</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Dieser Kontakt existiert nicht oder wurde gelöscht.
        </p>
        <Link href="/contacts" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="size-4" />
            Zurück zur Liste
          </Button>
        </Link>
      </div>
    );
  }

  async function handleStatusChange(statusId: string) {
    try {
      await updateStatus({ id: id as any, statusId: statusId as any });
      toast.success("Status aktualisiert");
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  }

  async function handleDeleteOffer(offerId: string) {
    try {
      await removeOffer({ id: offerId as any });
      toast.success("Angebot gelöscht");
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Zurück zu Kontakte
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact header card */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h1 className="text-xl font-bold tracking-tight">
                    {contact.firstName} {contact.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {contact.company && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        {contact.company}
                      </span>
                    )}
                    {contact.position && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="size-3.5" />
                        {contact.position}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                >
                  Bearbeiten
                </Button>
              </div>

              {/* Contact info */}
              <div className="mt-4 flex flex-wrap gap-3">
                {contact.email && (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>{contact.email}</span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => copyToClipboard(contact.email)}
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>{contact.phone}</span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => copyToClipboard(contact.phone)}
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Status & Tags row */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </span>
                  <Select
                    value={contact.statusId ?? contact.status?._id ?? ""}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-[160px]" size="sm">
                      <SelectValue placeholder="Status wählen" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tags
                  </span>
                  {contact.tags?.length > 0 ? (
                    contact.tags.map((tag: any) => (
                      <Badge
                        key={tag._id ?? tag.name}
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: tag.color
                            ? `${tag.color}15`
                            : undefined,
                          color: tag.color || undefined,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Keine Tags
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent className="pt-4">
              <TimelineList contactId={id} />
            </CardContent>
          </Card>
        </div>

        {/* Right column - sidebar */}
        <div className="space-y-6">
          {/* AI Summary placeholder */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <CardTitle className="text-sm">Zusammenfassung</CardTitle>
              </div>
              <CardDescription>
                KI-generierte Zusammenfassung (Platzhalter)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contact.notes ? (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                  {contact.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Keine Notizen vorhanden. Füge Notizen hinzu, um hier eine
                  Zusammenfassung zu sehen.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Offers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Angebote</CardTitle>
                  <CardDescription>
                    {offers === undefined
                      ? "Lade..."
                      : `${offers.length} Angebot${offers.length !== 1 ? "e" : ""}`}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setEditingOffer(null);
                    setOfferDialogOpen(true);
                  }}
                >
                  <Plus className="size-3" />
                  Neu
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {offers === undefined ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Noch keine Angebote erstellt.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {offers.map((offer: any) => {
                    const statusStyle =
                      offerStatusColors[offer.status] ??
                      offerStatusColors.draft;
                    return (
                      <div
                        key={offer._id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {offer.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-semibold tabular-nums">
                              {formatCurrency(offer.amount)}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusStyle.bg} ${statusStyle.text}`}
                            >
                              {statusStyle.label}
                            </span>
                          </div>
                          {offer._creationTime && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatDate(offer._creationTime)}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={() => handleDeleteOffer(offer._id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ContactDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        contact={contact}
      />
      <OfferDialog
        open={offerDialogOpen}
        onOpenChange={(open) => {
          setOfferDialogOpen(open);
          if (!open) setEditingOffer(null);
        }}
        contactId={id}
        offer={editingOffer}
      />
    </div>
  );
}
