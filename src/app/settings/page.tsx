"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, GripVertical, Palette } from "lucide-react";
import { toast } from "sonner";

const presetColors = [
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#64748b",
];

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const [customColor, setCustomColor] = useState(value);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            className="size-7 rounded-md border-2 transition-all hover:scale-110"
            style={{
              backgroundColor: color,
              borderColor:
                value === color ? "var(--foreground)" : "transparent",
            }}
            onClick={() => {
              onChange(color);
              setCustomColor(color);
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Palette className="size-3.5 text-muted-foreground" />
        <Input
          type="text"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          placeholder="#3b82f6"
          className="h-7 w-24 text-xs font-mono"
        />
        <div
          className="size-7 rounded-md border"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: { _id: string; name: string; color: string } | null;
  type: "status" | "tag";
  onSave: (data: { name: string; color: string; id?: string }) => Promise<void>;
}

function ItemDialog({
  open,
  onOpenChange,
  item,
  type,
  onSave,
}: ItemDialogProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [color, setColor] = useState(item?.color ?? presetColors[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useState(() => {
    if (open) {
      setName(item?.name ?? "");
      setColor(item?.color ?? presetColors[0]);
    }
  });

  async function handleSave() {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        color,
        id: item?._id,
      });
      onOpenChange(false);
      setName("");
      setColor(presetColors[0]);
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSubmitting(false);
    }
  }

  const label = type === "status" ? "Status" : "Tag";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {item ? `${label} bearbeiten` : `Neuer ${label}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${label} Name`}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Farbe</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusTab() {
  const statuses = useQuery(api.statuses.api.list);
  const createStatus = useMutation(api.statuses.api.create);
  const updateStatus = useMutation(api.statuses.api.update);
  const removeStatus = useMutation(api.statuses.api.remove);
  const reorderStatuses = useMutation(api.statuses.api.reorder);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  async function handleSave(data: {
    name: string;
    color: string;
    id?: string;
  }) {
    if (data.id) {
      await updateStatus({
        id: data.id as any,
        name: data.name,
        color: data.color,
      } as any);
      toast.success("Status aktualisiert");
    } else {
      await createStatus({ name: data.name, color: data.color } as any);
      toast.success("Status erstellt");
    }
  }

  async function handleDelete(id: string, name: string) {
    try {
      await removeStatus({ id: id as any });
      toast.success(`"${name}" gelöscht`);
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  async function handleDragEnd() {
    if (
      dragIndex === null ||
      overIndex === null ||
      dragIndex === overIndex ||
      !statuses
    )
      return;

    const ids = statuses.map((s: any) => s._id);
    const [moved] = ids.splice(dragIndex, 1);
    ids.splice(overIndex, 0, moved);

    try {
      await reorderStatuses({ ids: ids as any });
      toast.success("Reihenfolge aktualisiert");
    } catch {
      toast.error("Fehler beim Sortieren");
    } finally {
      setDragIndex(null);
      setOverIndex(null);
    }
  }

  if (statuses === undefined) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {statuses.length} Status definiert. Reihenfolge per Drag & Drop
          ändern.
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditingItem(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-3.5" />
          Neuer Status
        </Button>
      </div>

      <div className="space-y-1">
        {statuses.map((status: any, idx: number) => (
          <div
            key={status._id}
            draggable
            onDragStart={() => setDragIndex(idx)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(idx);
            }}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 bg-card transition-colors ${
              overIndex === idx && dragIndex !== null && dragIndex !== idx
                ? "ring-2 ring-primary/30"
                : ""
            }`}
          >
            <GripVertical className="size-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
            <span
              className="size-3 rounded-full shrink-0"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-sm font-medium flex-1">{status.name}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setEditingItem(status);
                setDialogOpen(true);
              }}
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-destructive"
              onClick={() => handleDelete(status._id, status.name)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
      </div>

      <ItemDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        type="status"
        onSave={handleSave}
      />
    </div>
  );
}

function TagsTab() {
  const tags = useQuery(api.tags.api.list);
  const createTag = useMutation(api.tags.api.create);
  const updateTag = useMutation(api.tags.api.update);
  const removeTag = useMutation(api.tags.api.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  async function handleSave(data: {
    name: string;
    color: string;
    id?: string;
  }) {
    if (data.id) {
      await updateTag({
        id: data.id as any,
        name: data.name,
        color: data.color,
      } as any);
      toast.success("Tag aktualisiert");
    } else {
      await createTag({ name: data.name, color: data.color } as any);
      toast.success("Tag erstellt");
    }
  }

  async function handleDelete(id: string, name: string) {
    try {
      await removeTag({ id: id as any });
      toast.success(`"${name}" gelöscht`);
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  if (tags === undefined) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {tags.length} Tags definiert.
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditingItem(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-3.5" />
          Neuer Tag
        </Button>
      </div>

      <div className="space-y-1">
        {tags.map((tag: any) => (
          <div
            key={tag._id}
            className="flex items-center gap-3 rounded-lg border px-3 py-2.5 bg-card"
          >
            <span
              className="size-3 rounded-full shrink-0"
              style={{ backgroundColor: tag.color }}
            />
            <span className="text-sm font-medium flex-1">{tag.name}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setEditingItem(tag);
                setDialogOpen(true);
              }}
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-destructive"
              onClick={() => handleDelete(tag._id, tag.name)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
        {tags.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Noch keine Tags erstellt.
            </p>
          </div>
        )}
      </div>

      <ItemDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        type="tag"
        onSave={handleSave}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground text-sm">
          Verwalte Status und Tags für dein CRM.
        </p>
      </div>

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        <TabsContent value="status" className="mt-4">
          <StatusTab />
        </TabsContent>
        <TabsContent value="tags" className="mt-4">
          <TagsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
