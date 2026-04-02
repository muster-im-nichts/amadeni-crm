"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const contactSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  email: z.string().email("Ungueltige E-Mail").or(z.literal("")),
  phone: z.string(),
  position: z.string(),
  notes: z.string(),
  statusId: z.string(),
  website: z.string(),
  address: z.string(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export interface ContactDefaultValues {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  position?: string;
  notes?: string;
  website?: string;
  address?: string;
}

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: any;
  defaultValues?: ContactDefaultValues;
}

const emptyValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  notes: "",
  statusId: "",
  website: "",
  address: "",
};

export function ContactDialog({
  open,
  onOpenChange,
  contact,
  defaultValues,
}: ContactDialogProps) {
  const createContact = useMutation(api.contacts.api.create);
  const updateContact = useMutation(api.contacts.api.update);
  const statuses = useQuery(api.statuses.api.list);
  const companies = useQuery(api.companies.api.list);
  const createCompany = useMutation(api.companies.api.create);
  const assignCompany = useMutation(api.contact_companies.api.assign);

  const isEditing = !!contact;

  const hasExtraDefaults = !!(defaultValues?.website || defaultValues?.address);
  const [extraOpen, setExtraOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [companySearch, setCompanySearch] = useState("");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        firstName: contact.firstName ?? "",
        lastName: contact.lastName ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        position: contact.position ?? "",
        notes: contact.notes ?? "",
        statusId: contact.statusId ?? contact.status?._id ?? "",
        website: contact.website ?? "",
        address: contact.address ?? "",
      });
      setSelectedCompanyId("");
      setCompanySearch("");
    } else {
      const { companyName, ...restDefaults } = defaultValues ?? {};
      form.reset({
        ...emptyValues,
        ...restDefaults,
        statusId: statuses?.[0]?._id ?? "",
      });
      setSelectedCompanyId("");
      setCompanySearch("");
      if (companyName && companies) {
        const match = companies.find(
          (c: any) => c.name.toLowerCase() === companyName.toLowerCase(),
        );
        if (match) {
          setSelectedCompanyId((match as any)._id);
        } else {
          setCompanySearch(companyName);
        }
      }
      if (hasExtraDefaults) {
        setExtraOpen(true);
      }
    }
  }, [contact, open, statuses, form, defaultValues, hasExtraDefaults, companies]);

  async function onSubmit(data: ContactFormValues) {
    try {
      if (isEditing) {
        await updateContact({
          id: contact._id,
          ...data,
          statusId: data.statusId || undefined,
        } as any);
        toast.success("Kontakt aktualisiert");
      } else {
        const contactId = await createContact({
          ...data,
          statusId: data.statusId || undefined,
        } as any);

        // Assign company if selected or typed
        let companyId = selectedCompanyId;
        if (!companyId && companySearch.trim()) {
          companyId = (await createCompany({
            name: companySearch.trim(),
          } as any)) as any;
        }
        if (companyId && contactId) {
          try {
            await assignCompany({
              contactId: contactId as any,
              companyId: companyId as any,
              role: data.position || undefined,
              isPrimary: true,
            } as any);
          } catch {
            // Non-blocking: contact was created but company assignment failed
          }
        }

        toast.success("Kontakt erstellt");
      }
      onOpenChange(false);
      form.reset();
      setSelectedCompanyId("");
      setCompanySearch("");
    } catch {
      toast.error(
        isEditing ? "Fehler beim Aktualisieren" : "Fehler beim Erstellen",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Kontakt bearbeiten" : "Neuer Kontakt"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Ändere die Kontaktdaten."
              : "Füge einen neuen Kontakt hinzu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                id="firstName"
                placeholder="Max"
                {...form.register("firstName")}
                aria-invalid={!!form.formState.errors.firstName}
              />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nachname *</Label>
              <Input
                id="lastName"
                placeholder="Mustermann"
                {...form.register("lastName")}
                aria-invalid={!!form.formState.errors.lastName}
              />
              {form.formState.errors.lastName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="max@firma.de"
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+49 123 456789"
                {...form.register("phone")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Unternehmen</Label>
              {!isEditing && (
                selectedCompanyId ? (
                  <div className="flex items-center justify-between rounded-lg border px-3 py-1.5">
                    <span className="text-sm">
                      {companies?.find((c: any) => c._id === selectedCompanyId)
                        ?.name ?? "..."}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setSelectedCompanyId("");
                        setCompanySearch("");
                      }}
                    >
                      Aendern
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border">
                    <Command>
                      <CommandInput
                        placeholder="Unternehmen suchen..."
                        value={companySearch}
                        onValueChange={setCompanySearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {companySearch.trim()
                            ? `"${companySearch.trim()}" wird erstellt`
                            : "Kein Unternehmen gefunden"}
                        </CommandEmpty>
                        <CommandGroup>
                          {companies
                            ?.filter((c: any) => {
                              if (!companySearch) return true;
                              return c.name
                                .toLowerCase()
                                .includes(companySearch.toLowerCase());
                            })
                            .slice(0, 6)
                            .map((c: any) => (
                              <CommandItem
                                key={c._id}
                                value={c.name}
                                onSelect={() => {
                                  setSelectedCompanyId(c._id);
                                  setCompanySearch("");
                                }}
                              >
                                <Building2 className="size-3.5 text-muted-foreground" />
                                {c.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )
              )}
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Unternehmen werden ueber die Detailseite verwaltet.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                placeholder="Geschaeftsfuehrer"
                {...form.register("position")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="statusId">Status</Label>
            <Select
              value={form.watch("statusId")}
              onValueChange={(val) => form.setValue("statusId", val ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status wählen" />
              </SelectTrigger>
              <SelectContent>
                {statuses?.map((status: any) => (
                  <SelectItem key={status._id} value={status._id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      {status.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              placeholder="Optionale Notizen zum Kontakt..."
              {...form.register("notes")}
              className="min-h-20"
            />
          </div>

          {/* Collapsible: Weitere Informationen */}
          <div className="rounded-lg border">
            <button
              type="button"
              onClick={() => setExtraOpen(!extraOpen)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors rounded-lg"
            >
              Weitere Informationen
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform ${extraOpen ? "rotate-180" : ""}`}
              />
            </button>
            {extraOpen && (
              <div className="px-3 pb-3 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="website">Webseite</Label>
                  <Input
                    id="website"
                    placeholder="https://www.beispiel.de"
                    {...form.register("website")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="Musterstraße 1, 10115 Berlin"
                    {...form.register("address")}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Speichern..."
                : isEditing
                  ? "Aktualisieren"
                  : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
