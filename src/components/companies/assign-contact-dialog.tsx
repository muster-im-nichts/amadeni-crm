"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";

interface AssignContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function AssignContactDialog({
  open,
  onOpenChange,
  companyId,
}: AssignContactDialogProps) {
  const contacts = useQuery(api.contacts.api.list);
  const assign = useMutation(api.contact_companies.api.assign);

  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [role, setRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setSelectedContactId("");
      setRole("");
      setSearchTerm("");
    }
  }

  const selectedContact = contacts?.find(
    (c: any) => c._id === selectedContactId,
  );

  async function handleAssign() {
    if (!selectedContactId) {
      toast.error("Bitte waehle einen Kontakt aus");
      return;
    }
    setSubmitting(true);
    try {
      await assign({
        contactId: selectedContactId as any,
        companyId: companyId as any,
        role: role || undefined,
      } as any);
      toast.success("Kontakt zugeordnet");
      handleOpenChange(false);
    } catch {
      toast.error("Fehler beim Zuordnen");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kontakt zuordnen</DialogTitle>
          <DialogDescription>
            Waehle einen bestehenden Kontakt aus und weise eine Rolle zu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Kontakt</Label>
            {selectedContact ? (
              <div className="flex items-center justify-between rounded-lg border p-2">
                <span className="text-sm font-medium">
                  {(selectedContact as any).firstName}{" "}
                  {(selectedContact as any).lastName}
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setSelectedContactId("")}
                >
                  Aendern
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Command>
                  <CommandInput
                    placeholder="Kontakt suchen..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>Kein Kontakt gefunden</CommandEmpty>
                    <CommandGroup>
                      {contacts
                        ?.filter((c: any) => {
                          if (!searchTerm) return true;
                          const q = searchTerm.toLowerCase();
                          return `${c.firstName} ${c.lastName}`
                            .toLowerCase()
                            .includes(q);
                        })
                        .slice(0, 10)
                        .map((c: any) => (
                          <CommandItem
                            key={c._id}
                            value={`${c.firstName} ${c.lastName}`}
                            onSelect={() => setSelectedContactId(c._id)}
                          >
                            {c.firstName} {c.lastName}
                            {c.email && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {c.email}
                              </span>
                            )}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assignRole">Rolle</Label>
            <Input
              id="assignRole"
              placeholder="z.B. CEO, Entwickler, Berater..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleAssign} disabled={!selectedContactId || submitting}>
            {submitting ? "Zuordnen..." : "Zuordnen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
