"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
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
import { toast } from "sonner";
import { useEffect } from "react";

const companySchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  industry: z.string(),
  website: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email("Ungueltige E-Mail").or(z.literal("")),
  notes: z.string(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: any;
}

const emptyValues: CompanyFormValues = {
  name: "",
  industry: "",
  website: "",
  address: "",
  phone: "",
  email: "",
  notes: "",
};

export function CompanyDialog({
  open,
  onOpenChange,
  company,
}: CompanyDialogProps) {
  const createCompany = useMutation(api.companies.api.create);
  const updateCompany = useMutation(api.companies.api.update);

  const isEditing = !!company;

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name ?? "",
        industry: company.industry ?? "",
        website: company.website ?? "",
        address: company.address ?? "",
        phone: company.phone ?? "",
        email: company.email ?? "",
        notes: company.notes ?? "",
      });
    } else {
      form.reset(emptyValues);
    }
  }, [company, open, form]);

  async function onSubmit(data: CompanyFormValues) {
    try {
      if (isEditing) {
        await updateCompany({
          id: company._id,
          ...data,
        } as any);
        toast.success("Unternehmen aktualisiert");
      } else {
        await createCompany(data as any);
        toast.success("Unternehmen erstellt");
      }
      onOpenChange(false);
      form.reset();
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
            {isEditing ? "Unternehmen bearbeiten" : "Neues Unternehmen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Aendere die Unternehmensdaten."
              : "Erstelle ein neues Unternehmen."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Firma GmbH"
              {...form.register("name")}
              aria-invalid={!!form.formState.errors.name}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="industry">Branche</Label>
              <Input
                id="industry"
                placeholder="IT, Beratung, ..."
                {...form.register("industry")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Webseite</Label>
              <Input
                id="website"
                placeholder="https://www.beispiel.de"
                {...form.register("website")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="companyEmail">E-Mail</Label>
              <Input
                id="companyEmail"
                type="email"
                placeholder="info@firma.de"
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyPhone">Telefon</Label>
              <Input
                id="companyPhone"
                type="tel"
                placeholder="+49 123 456789"
                {...form.register("phone")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              placeholder="Musterstrasse 1, 10115 Berlin"
              {...form.register("address")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="companyNotes">Notizen</Label>
            <Textarea
              id="companyNotes"
              placeholder="Optionale Notizen zum Unternehmen..."
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
