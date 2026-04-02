"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

interface ContactTableProps {
  contacts: any[] | undefined;
  onEdit: (contact: any) => void;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function ContactTable({ contacts, onEdit }: ContactTableProps) {
  const router = useRouter();
  const removeContact = useMutation(api.contacts.api.remove);

  async function handleDelete(id: string, name: string) {
    try {
      await removeContact({ id: id as any });
      toast.success(`"${name}" wurde gelöscht`);
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  if (contacts === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-sm font-medium">Keine Kontakte gefunden</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Erstelle deinen ersten Kontakt, um dein CRM zu starten.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden sm:table-cell">Unternehmen</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden lg:table-cell">Tags</TableHead>
          <TableHead className="hidden md:table-cell">Letzter Kontakt</TableHead>
          <TableHead className="w-10">
            <span className="sr-only">Aktionen</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact: any) => (
          <TableRow
            key={contact._id}
            className="cursor-pointer"
            onClick={() => router.push(`/contacts/${contact._id}`)}
          >
            <TableCell>
              <div>
                <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                {contact.position && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {contact.position}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">
              {contact.company || "—"}
            </TableCell>
            <TableCell>
              {contact.status ? (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium"
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: contact.status.color || "#94a3b8" }}
                  />
                  {contact.status.name}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <div className="flex flex-wrap gap-1">
                {contact.tags?.slice(0, 3).map((tag: any) => (
                  <Badge
                    key={tag._id ?? tag.name}
                    variant="secondary"
                    className="text-[10px] h-4 px-1.5"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}15` : undefined,
                      color: tag.color || undefined,
                      borderColor: tag.color ? `${tag.color}30` : undefined,
                    }}
                  >
                    {tag.name}
                  </Badge>
                )) ?? <span className="text-xs text-muted-foreground">—</span>}
                {contact.tags?.length > 3 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    +{contact.tags.length - 3}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
              {contact.lastContactDate
                ? formatDate(contact.lastContactDate)
                : "—"}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                >
                  <MoreHorizontal className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(contact);
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(contact._id, `${contact.firstName} ${contact.lastName}`);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
