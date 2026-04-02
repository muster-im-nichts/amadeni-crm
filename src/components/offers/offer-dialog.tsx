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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect } from "react";

const offerSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  amount: z.coerce.number().min(0, "Betrag muss positiv sein"),
  status: z.string().min(1, "Status ist erforderlich"),
  description: z.string(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

const offerStatuses = [
  { value: "draft", label: "Entwurf", color: "#94a3b8" },
  { value: "sent", label: "Versendet", color: "#3b82f6" },
  { value: "accepted", label: "Angenommen", color: "#22c55e" },
  { value: "rejected", label: "Abgelehnt", color: "#ef4444" },
];

interface OfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  offer?: any;
}

export function OfferDialog({
  open,
  onOpenChange,
  contactId,
  offer,
}: OfferDialogProps) {
  const createOffer = useMutation(api.offers.api.create);
  const updateOffer = useMutation(api.offers.api.update);

  const isEditing = !!offer;

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      amount: 0,
      status: "draft",
      description: "",
    },
  });

  useEffect(() => {
    if (offer) {
      form.reset({
        title: offer.title ?? "",
        amount: offer.amount ?? 0,
        status: offer.status ?? "draft",
        description: offer.description ?? "",
      });
    } else {
      form.reset({
        title: "",
        amount: 0,
        status: "draft",
        description: "",
      });
    }
  }, [offer, open, form]);

  async function onSubmit(data: OfferFormValues) {
    try {
      if (isEditing) {
        await updateOffer({
          id: offer._id,
          ...data,
        } as any);
        toast.success("Angebot aktualisiert");
      } else {
        await createOffer({
          contactId: contactId as any,
          ...data,
        } as any);
        toast.success("Angebot erstellt");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Angebot bearbeiten" : "Neues Angebot"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Ändere die Angebotsdaten."
              : "Erstelle ein neues Angebot für diesen Kontakt."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              placeholder="z.B. Beratungspaket Q2"
              {...form.register("title")}
              aria-invalid={!!form.formState.errors.title}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Betrag (EUR) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...form.register("amount")}
                aria-invalid={!!form.formState.errors.amount}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offerStatus">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(val) => form.setValue("status", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {offerStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              placeholder="Optionale Beschreibung..."
              {...form.register("description")}
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
