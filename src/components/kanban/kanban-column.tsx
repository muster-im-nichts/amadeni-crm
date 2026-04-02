"use client";

import { useState } from "react";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
  status: {
    _id: string;
    name: string;
    color: string;
  };
  contacts: any[];
  onDrop: (contactId: string, statusId: string) => void;
}

export function KanbanColumn({ status, contacts, onDrop }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border bg-muted/30 min-w-[280px] w-[280px] shrink-0 transition-colors",
        isOver && "ring-2 ring-primary/30 bg-primary/5"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const contactId = e.dataTransfer.getData("contactId");
        if (contactId) {
          onDrop(contactId, status._id);
        }
      }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b">
        <span
          className="size-2.5 rounded-full shrink-0"
          style={{ backgroundColor: status.color }}
        />
        <span className="text-sm font-semibold truncate">{status.name}</span>
        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium tabular-nums text-muted-foreground">
          {contacts.length}
        </span>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-220px)]">
        <div className="p-2 space-y-2">
          {contacts.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              Keine Kontakte
            </div>
          ) : (
            contacts.map((contact: any) => (
              <KanbanCard key={contact._id} contact={contact} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
