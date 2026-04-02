"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { KanbanColumn } from "./kanban-column";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useMemo } from "react";

export function KanbanBoard() {
  const statuses = useQuery(api.statuses.api.list);
  const contacts = useQuery(api.contacts.api.list);
  const updateStatus = useMutation(api.contacts.api.updateStatus);

  const contactsByStatus = useMemo(() => {
    if (!contacts || !statuses) return {};

    const map: Record<string, any[]> = {};
    for (const status of statuses) {
      map[status._id] = [];
    }
    // Add an "unassigned" bucket
    map["_none"] = [];

    for (const contact of contacts) {
      const statusId = contact.statusId ?? contact.status?._id;
      if (statusId && map[statusId]) {
        map[statusId].push(contact);
      } else {
        map["_none"].push(contact);
      }
    }
    return map;
  }, [contacts, statuses]);

  async function handleDrop(contactId: string, statusId: string) {
    try {
      await updateStatus({
        id: contactId as any,
        statusId: statusId as any,
      });
      toast.success("Status aktualisiert");
    } catch {
      toast.error("Fehler beim Verschieben");
    }
  }

  if (statuses === undefined || contacts === undefined) {
    return (
      <div className="flex gap-4 overflow-x-auto p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[280px] w-[280px] shrink-0 space-y-3"
          >
            <Skeleton className="h-10 rounded-xl" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-24 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium">Keine Status definiert</p>
        <p className="text-xs text-muted-foreground mt-1">
          Erstelle Status in den Einstellungen, um das Kanban Board zu nutzen.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
      {statuses.map((status: any) => (
        <KanbanColumn
          key={status._id}
          status={status}
          contacts={contactsByStatus[status._id] ?? []}
          onDrop={handleDrop}
        />
      ))}
      {/* Show unassigned contacts if any */}
      {contactsByStatus["_none"]?.length > 0 && (
        <KanbanColumn
          status={{
            _id: "_none",
            name: "Ohne Status",
            color: "#94a3b8",
          }}
          contacts={contactsByStatus["_none"]}
          onDrop={handleDrop}
        />
      )}
    </div>
  );
}
