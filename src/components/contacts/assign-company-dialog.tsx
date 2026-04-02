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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const roleSuggestions = [
  "CEO",
  "Geschaeftsfuehrer",
  "Berater",
  "Entwickler",
  "Vertrieb",
  "Projektleiter",
  "Designer",
];

interface AssignCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
}

export function AssignCompanyDialog({
  open,
  onOpenChange,
  contactId,
}: AssignCompanyDialogProps) {
  const companies = useQuery(api.companies.api.list);
  const assign = useMutation(api.contact_companies.api.assign);
  const createCompany = useMutation(api.companies.api.create);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [role, setRole] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setSelectedCompanyId("");
      setRole("");
      setIsPrimary(false);
      setSearchTerm("");
    }
  }

  const selectedCompany = companies?.find(
    (c: any) => c._id === selectedCompanyId,
  );

  const noExactMatch =
    searchTerm.trim() &&
    !companies?.some(
      (c: any) => c.name.toLowerCase() === searchTerm.trim().toLowerCase(),
    );

  async function handleCreateAndSelect() {
    try {
      const newId = await createCompany({ name: searchTerm.trim() } as any);
      setSelectedCompanyId(newId as any);
      setSearchTerm("");
      toast.success(`"${searchTerm.trim()}" erstellt`);
    } catch {
      toast.error("Fehler beim Erstellen des Unternehmens");
    }
  }

  async function handleAssign() {
    if (!selectedCompanyId) {
      toast.error("Bitte waehle ein Unternehmen aus");
      return;
    }
    setSubmitting(true);
    try {
      await assign({
        contactId: contactId as any,
        companyId: selectedCompanyId as any,
        role: role || undefined,
        isPrimary: isPrimary || undefined,
      } as any);
      toast.success("Unternehmen zugeordnet");
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
          <DialogTitle>Unternehmen zuordnen</DialogTitle>
          <DialogDescription>
            Waehle ein bestehendes Unternehmen oder erstelle ein neues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Unternehmen</Label>
            {selectedCompany ? (
              <div className="flex items-center justify-between rounded-lg border p-2">
                <span className="text-sm font-medium">
                  {(selectedCompany as any).name}
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setSelectedCompanyId("")}
                >
                  Aendern
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Command>
                  <CommandInput
                    placeholder="Unternehmen suchen..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {noExactMatch && searchTerm.trim() ? (
                        <button
                          type="button"
                          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-muted rounded-md"
                          onClick={handleCreateAndSelect}
                        >
                          <Plus className="size-3.5" />
                          &quot;{searchTerm.trim()}&quot; erstellen
                        </button>
                      ) : (
                        "Kein Unternehmen gefunden"
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {companies
                        ?.filter((c: any) => {
                          if (!searchTerm) return true;
                          return c.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase());
                        })
                        .slice(0, 10)
                        .map((c: any) => (
                          <CommandItem
                            key={c._id}
                            value={c.name}
                            onSelect={() => {
                              setSelectedCompanyId(c._id);
                              setSearchTerm("");
                            }}
                          >
                            {c.name}
                            {c.industry && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {c.industry}
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
            <Label htmlFor="companyRole">Rolle</Label>
            <Input
              id="companyRole"
              placeholder="z.B. CEO, Entwickler, Berater..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <div className="flex flex-wrap gap-1 mt-1">
              {roleSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setRole(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isPrimary"
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(checked === true)}
            />
            <Label htmlFor="isPrimary" className="text-sm font-normal">
              Hauptunternehmen
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedCompanyId || submitting}
          >
            {submitting ? "Zuordnen..." : "Zuordnen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
