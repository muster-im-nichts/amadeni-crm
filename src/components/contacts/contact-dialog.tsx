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
import { useEffect } from "react";

const contactSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  email: z.string().email("Ungültige E-Mail").or(z.literal("")),
  phone: z.string(),
  company: z.string(),
  position: z.string(),
  notes: z.string(),
  statusId: z.string(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: any;
}

export function ContactDialog({
  open,
  onOpenChange,
  contact,
}: ContactDialogProps) {
  const createContact = useMutation(api.contacts.api.create);
  const updateContact = useMutation(api.contacts.api.update);
  const statuses = useQuery(api.statuses.api.list);

  const isEditing = !!contact;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      notes: "",
      statusId: "",
    },
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        firstName: contact.firstName ?? "",
        lastName: contact.lastName ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        company: contact.company ?? "",
        position: contact.position ?? "",
        notes: contact.notes ?? "",
        statusId: contact.statusId ?? contact.status?._id ?? "",
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        notes: "",
        statusId: statuses?.[0]?._id ?? "",
      });
    }
  }, [contact, open, statuses, form]);

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
        await createContact({
          ...data,
          statusId: data.statusId || undefined,
        } as any);
        toast.success("Kontakt erstellt");
      }
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error(
        isEditing
          ? "Fehler beim Aktualisieren"
          : "Fehler beim Erstellen"
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
              <Label htmlFor="company">Unternehmen</Label>
              <Input
                id="company"
                placeholder="Firma GmbH"
                {...form.register("company")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                placeholder="Geschäftsführer"
                {...form.register("position")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="statusId">Status</Label>
            <Select
              value={form.watch("statusId")}
              onValueChange={(val) => form.setValue("statusId", val)}
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
