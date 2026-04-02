"use client";

import { KanbanBoard } from "@/components/kanban/kanban-board";

export default function KanbanPage() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Kanban Board</h1>
        <p className="text-muted-foreground text-sm">
          Kontakte per Drag & Drop zwischen Status verschieben.
        </p>
      </div>

      <KanbanBoard />
    </div>
  );
}
