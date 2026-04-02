"use client";

import {
  Phone,
  CalendarDays,
  StickyNote,
  Mail,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  string,
  { icon: typeof Phone; label: string; color: string; bg: string }
> = {
  call: {
    icon: Phone,
    label: "Anruf",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  email: {
    icon: Mail,
    label: "E-Mail",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  meeting: {
    icon: CalendarDays,
    label: "Meeting",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  note: {
    icon: StickyNote,
    label: "Notiz",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  offer: {
    icon: FileText,
    label: "Angebot",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
};

const defaultConfig = {
  icon: MessageSquare,
  label: "Eintrag",
  color: "text-muted-foreground",
  bg: "bg-muted",
};

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

interface TimelineEntryProps {
  entry: {
    _id: string;
    type: string;
    title: string;
    content?: string;
    _creationTime: number;
  };
  isLast?: boolean;
}

export function TimelineEntry({ entry, isLast }: TimelineEntryProps) {
  const config = typeConfig[entry.type] ?? defaultConfig;
  const Icon = config.icon;

  return (
    <div className="flex gap-3 relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[15px] top-9 bottom-0 w-px bg-border" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg z-10",
          config.bg,
        )}
      >
        <Icon className={cn("size-3.5", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug">{entry.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {config.label} &middot; {formatDate(entry._creationTime)}
            </p>
          </div>
        </div>
        {entry.content && (
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {entry.content}
          </p>
        )}
      </div>
    </div>
  );
}
