"use client";

import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(timestamp));
}

interface KanbanCardProps {
  contact: any;
  isDragging?: boolean;
}

export function KanbanCard({ contact, isDragging }: KanbanCardProps) {
  const router = useRouter();

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("contactId", contact._id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => router.push(`/contacts/${contact._id}`)}
      className={cn(
        "rounded-lg border bg-card p-3 cursor-pointer transition-all hover:ring-1 hover:ring-ring/20 hover:shadow-sm",
        isDragging && "opacity-50 rotate-2 shadow-lg",
      )}
    >
      {/* Name */}
      <p className="text-sm font-medium leading-snug">
        {contact.firstName} {contact.lastName}
      </p>

      {/* Company */}
      {(contact.primaryCompany?.companyName || contact.company) && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <Building2 className="size-3 shrink-0" />
          <span className="truncate">
            {contact.primaryCompany?.companyName || contact.company}
          </span>
        </p>
      )}

      {/* Tags */}
      {contact.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {contact.tags.slice(0, 3).map((tag: any) => (
            <Badge
              key={tag._id ?? tag.name}
              variant="secondary"
              className="text-[9px] h-3.5 px-1 leading-none"
              style={{
                backgroundColor: tag.color ? `${tag.color}15` : undefined,
                color: tag.color || undefined,
              }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer: offer sum + last contact */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed">
        {contact.offerSum !== undefined && contact.offerSum > 0 ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold tabular-nums text-muted-foreground">
            <DollarSign className="size-2.5" />
            {formatCurrency(contact.offerSum)}
          </span>
        ) : (
          <span />
        )}
        {contact.lastContactDate && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <CalendarDays className="size-2.5" />
            {formatDate(contact.lastContactDate)}
          </span>
        )}
      </div>
    </div>
  );
}
