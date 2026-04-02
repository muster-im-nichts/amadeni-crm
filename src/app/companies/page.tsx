"use client";

import { Suspense, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CompanyDialog } from "@/components/companies/company-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CompaniesPage() {
  return (
    <Suspense>
      <CompaniesPageInner />
    </Suspense>
  );
}

function CompaniesPageInner() {
  const companies = useQuery(api.companies.api.list);
  const removeCompany = useMutation(api.companies.api.remove);
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [search, setSearch] = useState("");

  const filteredCompanies = useMemo(() => {
    if (!companies) return undefined;
    if (!search) return companies;

    const q = search.toLowerCase();
    return companies.filter((c: any) => {
      const nameMatch = c.name?.toLowerCase().includes(q);
      const industryMatch = c.industry?.toLowerCase().includes(q);
      return nameMatch || industryMatch;
    });
  }, [companies, search]);

  function handleEdit(company: any) {
    setEditingCompany(company);
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setEditingCompany(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    try {
      await removeCompany({ id: id as any });
      toast.success(`"${name}" wurde geloescht`);
    } catch {
      toast.error("Fehler beim Loeschen");
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unternehmen</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {companies === undefined
              ? "Lade..."
              : `${companies.length} Unternehmen insgesamt`}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Neues Unternehmen
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Name oder Branche suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        {filteredCompanies === undefined ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-4">
              <Building2 className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">
              Keine Unternehmen gefunden
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Erstelle dein erstes Unternehmen, um Kontakte zuzuordnen.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Branche
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Webseite
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Anzahl Kontakte
                </TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Aktionen</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company: any) => (
                <TableRow
                  key={company._id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/companies/${company._id}`)}
                >
                  <TableCell>
                    <span className="font-medium">{company.name}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {company.industry || "\u2014"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {company.website ? (
                      <span
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {company.website}
                      </span>
                    ) : (
                      "\u2014"
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {company.contactCount ?? 0}
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
                            handleEdit(company);
                          }}
                        >
                          <Pencil className="size-3.5" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(company._id, company.name);
                          }}
                        >
                          <Trash2 className="size-3.5" />
                          Loeschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog */}
      <CompanyDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        company={editingCompany}
      />
    </div>
  );
}
