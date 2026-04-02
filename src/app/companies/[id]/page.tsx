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
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  UserPlus,
  Trash2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { CompanyDialog } from "@/components/companies/company-dialog";
import { AssignContactDialog } from "@/components/companies/assign-contact-dialog";

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const company = useQuery(api.companies.api.get, { id: id as any });
  const contacts = useQuery(api.contact_companies.api.listByCompany, {
    companyId: id as any,
  });

  const unassign = useMutation(api.contact_companies.api.unassign);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  if (company === undefined) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (company === null) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-lg font-medium">Unternehmen nicht gefunden</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Dieses Unternehmen existiert nicht oder wurde geloescht.
        </p>
        <Link href="/companies" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="size-4" />
            Zurueck zur Liste
          </Button>
        </Link>
      </div>
    );
  }

  async function handleUnassign(contactCompanyId: string) {
    try {
      await unassign({ id: contactCompanyId as any });
      toast.success("Zuordnung entfernt");
    } catch {
      toast.error("Fehler beim Entfernen");
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Zurueck zu Unternehmen
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company header card */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-5 text-muted-foreground" />
                    <h1 className="text-xl font-bold tracking-tight">
                      {company.name}
                    </h1>
                  </div>
                  {company.industry && (
                    <p className="text-sm text-muted-foreground">
                      {company.industry}
                    </p>
                  )}
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
                {company.website && (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
                    <Globe className="size-3.5 text-muted-foreground" />
                    <span>{company.website}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <span>{company.address}</span>
                  </div>
                )}
              </div>

              {company.notes && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {company.notes}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Associated contacts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Zugeordnete Kontakte</CardTitle>
                  <CardDescription>
                    {contacts === undefined
                      ? "Lade..."
                      : `${contacts.length} Kontakt${contacts.length !== 1 ? "e" : ""}`}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setAssignDialogOpen(true)}
                >
                  <UserPlus className="size-3" />
                  Kontakt zuordnen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contacts === undefined ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-6">
                  <UserPlus className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Noch keine Kontakte zugeordnet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((entry: any) => (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/contacts/${entry.contactId}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {entry.contactName ?? "Kontakt"}
                          </Link>
                          {entry.isPrimary && (
                            <Star className="size-3 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        {entry.role && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] mt-1"
                          >
                            {entry.role}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => handleUnassign(entry._id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  Branche
                </p>
                <p className="text-sm">{company.industry || "\u2014"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  Webseite
                </p>
                <p className="text-sm">{company.website || "\u2014"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  Adresse
                </p>
                <p className="text-sm">{company.address || "\u2014"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  E-Mail
                </p>
                <p className="text-sm">{company.email || "\u2014"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  Telefon
                </p>
                <p className="text-sm">{company.phone || "\u2014"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CompanyDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        company={company}
      />
      <AssignContactDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        companyId={id}
      />
    </div>
  );
}
