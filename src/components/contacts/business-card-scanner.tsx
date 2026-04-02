"use client";

import { useState, useRef, useCallback } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ScanLine, Upload, Check, Minus, Loader2, UserPlus, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ScannedData = {
  name: string | null;
  company: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  error?: string | null;
};

interface BusinessCardScannerProps {
  onContactCreate: (data: {
    firstName: string;
    lastName: string;
    companyName: string;
    position: string;
    email: string;
    phone: string;
    website: string;
    address: string;
  }) => void;
  className?: string;
}

const fieldLabels: Record<string, string> = {
  name: "Name",
  company: "Unternehmen",
  position: "Position",
  email: "E-Mail",
  phone: "Telefon",
  website: "Webseite",
  address: "Adresse",
};

export function BusinessCardScanner({ onContactCreate, className }: BusinessCardScannerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanBusinessCard = useAction(api.contacts.scan.scanBusinessCard);
  const companies = useQuery(api.companies.api.list);

  // Find matching company for scanned data
  const matchedCompany =
    scannedData?.company && companies
      ? companies.find(
          (c: any) =>
            c.name.toLowerCase() === scannedData.company!.toLowerCase(),
        )
      : null;

  const resetState = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    setScanning(false);
    setScannedData(null);
  }, []);

  function handleOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      resetState();
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Bitte wähle eine Bilddatei aus.");
      return;
    }

    setImageFile(file);
    setScannedData(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleScan() {
    if (!imageFile) return;

    setScanning(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const result = await scanBusinessCard({
        imageBase64: base64,
        mimeType: imageFile.type,
      });

      if (result.error) {
        toast.error(`Scan fehlgeschlagen: ${result.error}`);
        setScannedData(null);
      } else {
        setScannedData(result);
      }
    } catch {
      toast.error("Scan fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setScanning(false);
    }
  }

  function handleCreateContact() {
    if (!scannedData) return;

    const nameParts = (scannedData.name ?? "").trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || "";

    onContactCreate({
      firstName,
      lastName,
      companyName: scannedData.company ?? "",
      position: scannedData.position ?? "",
      email: scannedData.email ?? "",
      phone: scannedData.phone ?? "",
      website: scannedData.website ?? "",
      address: scannedData.address ?? "",
    });

    setDialogOpen(false);
    resetState();
  }

  const displayFields = ["name", "company", "position", "email", "phone", "website", "address"] as const;

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className={`bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 hover:from-violet-700 hover:to-indigo-700 ${className ?? ""}`}
      >
        <ScanLine className="size-4" />
        Visitenkarte scannen
      </Button>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visitenkarte scannen</DialogTitle>
            <DialogDescription>
              Fotografiere oder lade eine Visitenkarte hoch, um die Kontaktdaten automatisch zu erkennen.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Image upload/preview */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={imagePreview}
                    alt="Visitenkarte"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/40 transition-colors cursor-pointer"
                >
                  <Upload className="size-8 text-muted-foreground/50 mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Foto aufnehmen oder hochladen
                  </span>
                  <span className="text-xs text-muted-foreground/60 mt-1">
                    JPG, PNG oder HEIC
                  </span>
                </button>
              )}

              {imagePreview && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Anderes Bild
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleScan}
                    disabled={scanning}
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Wird gescannt...
                      </>
                    ) : (
                      "Scannen"
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Extracted data */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Erkannte Daten
              </p>

              {scanning ? (
                <div className="space-y-3">
                  {displayFields.map((field) => (
                    <div key={field} className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              ) : scannedData ? (
                <div className="space-y-2.5">
                  {displayFields.map((field) => {
                    const value = scannedData[field];
                    const hasValue = value !== null && value !== "";
                    return (
                      <div key={field}>
                        <div className="flex items-start gap-2">
                          {hasValue ? (
                            <Check className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          ) : (
                            <Minus className="size-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-muted-foreground leading-none mb-0.5">
                              {fieldLabels[field]}
                            </p>
                            <p className={`text-sm truncate ${hasValue ? "font-medium" : "text-muted-foreground/40 italic"}`}>
                              {hasValue ? value : "\u2014"}
                            </p>
                          </div>
                        </div>
                        {field === "company" && hasValue && (
                          <div className="ml-5.5 mt-1">
                            {matchedCompany ? (
                              <Badge variant="secondary" className="text-[10px] gap-1">
                                <Building2 className="size-2.5" />
                                Bestehendes Unternehmen gefunden
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                                <Building2 className="size-2.5" />
                                Wird neu erstellt
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <ScanLine className="size-8 text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-muted-foreground/50">
                    Lade ein Bild hoch und klicke auf &quot;Scannen&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          {scannedData && !scannedData.error && (
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateContact}>
                <UserPlus className="size-4" />
                Kontakt erstellen
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
