"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TimelineEntry } from "./timeline-entry";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StickyNote, Phone, CalendarDays } from "lucide-react";
import { toast } from "sonner";

interface TimelineListProps {
  contactId: string;
}

export function TimelineList({ contactId }: TimelineListProps) {
  const entries = useQuery(api.timeline.api.listByContact, {
    contactId: contactId as any,
  });
  const createEntry = useMutation(api.timeline.api.create);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [entryType, setEntryType] = useState<string>("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await createEntry({
        contactId: contactId as any,
        type: entryType,
        title: title.trim(),
        content: content.trim() || undefined,
      } as any);
      toast.success("Eintrag hinzugefügt");
      setTitle("");
      setContent("");
      setDialogOpen(false);
    } catch {
      toast.error("Fehler beim Erstellen");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openDialog(type: string) {
    setEntryType(type);
    setTitle(
      type === "call"
        ? "Anruf"
        : type === "meeting"
          ? "Meeting"
          : ""
    );
    setContent("");
    setDialogOpen(true);
  }

  const typeLabels: Record<string, string> = {
    note: "Notiz hinzufügen",
    call: "Anruf loggen",
    meeting: "Meeting loggen",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Aktivitäten</h3>
        <div className="flex gap-1.5">
          <Button variant="outline" size="xs" onClick={() => openDialog("note")}>
            <StickyNote className="size-3" />
            <span className="hidden sm:inline">Notiz</span>
          </Button>
          <Button variant="outline" size="xs" onClick={() => openDialog("call")}>
            <Phone className="size-3" />
            <span className="hidden sm:inline">Anruf</span>
          </Button>
          <Button variant="outline" size="xs" onClick={() => openDialog("meeting")}>
            <CalendarDays className="size-3" />
            <span className="hidden sm:inline">Meeting</span>
          </Button>
        </div>
      </div>

      {entries === undefined ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Noch keine Aktivitäten vorhanden.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Füge eine Notiz, einen Anruf oder ein Meeting hinzu.
          </p>
        </div>
      ) : (
        <div>
          {entries.map((entry: any, i: number) => (
            <TimelineEntry
              key={entry._id}
              entry={entry}
              isLast={i === entries.length - 1}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{typeLabels[entryType] ?? "Eintrag"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Titel</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Kurze Beschreibung..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Details (optional)</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Weitere Details..."
                className="min-h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
