"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  FileText,
  DollarSign,
  Plus,
  StickyNote,
  Phone,
  CalendarDays,
  Mail,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { BusinessCardScanner } from "@/components/contacts/business-card-scanner";
import { ContactDialog, type ContactDefaultValues } from "@/components/contacts/contact-dialog";
import { useState, useCallback } from "react";

const kpiConfig = [
  {
    key: "contacts",
    label: "Kontakte gesamt",
    icon: Users,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    key: "leads",
    label: "Aktive Leads",
    icon: TrendingUp,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    key: "offers",
    label: "Offene Angebote",
    icon: FileText,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    key: "value",
    label: "Angebotswert gesamt",
    icon: DollarSign,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
] as const;

const timelineIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: CalendarDays,
  note: StickyNote,
  offer: FileText,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function formatRelativeDate(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  if (hours < 24) return `vor ${hours} Std.`;
  if (days < 7) return `vor ${days} Tag${days > 1 ? "en" : ""}`;
  return formatDate(timestamp);
}

export default function DashboardPage() {
  const contacts = useQuery(api.contacts.api.list);
  const offerStats = useQuery(api.offers.api.stats);
  const recentActivity = useQuery(api.timeline.api.listRecent);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactDefaults, setContactDefaults] = useState<ContactDefaultValues | undefined>();

  const handleScanResult = useCallback((data: ContactDefaultValues) => {
    setContactDefaults(data);
    setContactDialogOpen(true);
  }, []);

  function handleContactDialogClose(open: boolean) {
    setContactDialogOpen(open);
    if (!open) {
      setContactDefaults(undefined);
    }
  }

  const contactCount = contacts?.length ?? 0;
  const activeLeads =
    contacts?.filter(
      (c: any) =>
        c.status?.name?.toLowerCase() !== "verloren" &&
        c.status?.name?.toLowerCase() !== "kunde",
    )?.length ?? 0;

  const kpiValues: Record<string, number> = {
    contacts: contactCount,
    leads: activeLeads,
    offers: offerStats?.openCount ?? 0,
    value: offerStats?.totalValue ?? 0,
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Übersicht</h1>
        <p className="text-muted-foreground text-sm">
          Willkommen zurück. Hier ist der aktuelle Stand.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiConfig.map((kpi) => {
          const Icon = kpi.icon;
          const value = kpiValues[kpi.key];
          const isLoading = contacts === undefined || offerStats === undefined;

          return (
            <Card key={kpi.key}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-medium uppercase tracking-wider">
                    {kpi.label}
                  </CardDescription>
                  <div
                    className={`flex size-9 items-center justify-center rounded-lg ${kpi.bgColor}`}
                  >
                    <Icon className={`size-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight">
                    {kpi.key === "value" ? formatCurrency(value) : value}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Letzte Aktivitäten</CardTitle>
                <CardDescription className="mt-1">
                  Die letzten Interaktionen im Überblick
                </CardDescription>
              </div>
              <Link href="/contacts">
                <Button variant="ghost" size="sm">
                  Alle anzeigen
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity === undefined ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="size-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                  <MessageSquare className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Noch keine Aktivitäten</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Erstelle deinen ersten Kontakt, um loszulegen.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {recentActivity.slice(0, 10).map((entry: any) => {
                  const Icon = timelineIcons[entry.type] ?? MessageSquare;
                  return (
                    <div
                      key={entry._id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {entry.contactName && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-4"
                            >
                              {entry.contactName}
                            </Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            {formatRelativeDate(entry._creationTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schnellaktionen</CardTitle>
              <CardDescription>Häufig verwendete Aktionen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <BusinessCardScanner
                onContactCreate={handleScanResult}
                className="w-full justify-start gap-2"
              />
              <Link href="/contacts?new=true" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Plus className="size-4" />
                  Neuer Kontakt
                </Button>
              </Link>
              <Link href="/contacts?note=true" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <StickyNote className="size-4" />
                  Neue Notiz
                </Button>
              </Link>
              <Link href="/kanban" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <TrendingUp className="size-4" />
                  Kanban Board
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status-Verteilung</CardTitle>
              <CardDescription>Kontakte nach Status</CardDescription>
            </CardHeader>
            <CardContent>
              {contacts === undefined ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="size-2.5 rounded-full" />
                      <Skeleton className="h-3 flex-1" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  ))}
                </div>
              ) : (
                <StatusDistribution contacts={contacts} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={handleContactDialogClose}
        defaultValues={contactDefaults}
      />
    </div>
  );
}

function StatusDistribution({ contacts }: { contacts: any[] }) {
  const statusCounts: Record<
    string,
    { count: number; color: string; name: string }
  > = {};
  for (const c of contacts) {
    const name = c.status?.name ?? "Unbekannt";
    const color = c.status?.color ?? "#94a3b8";
    if (!statusCounts[name]) {
      statusCounts[name] = { count: 0, color, name };
    }
    statusCounts[name].count++;
  }

  const entries = Object.values(statusCounts).sort((a, b) => b.count - a.count);
  const total = contacts.length || 1;

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Keine Kontakte vorhanden
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.name}</span>
            </div>
            <span className="text-muted-foreground tabular-nums">
              {entry.count}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(entry.count / total) * 100}%`,
                backgroundColor: entry.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
