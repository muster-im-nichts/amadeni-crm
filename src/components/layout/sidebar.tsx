"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Übersicht", icon: LayoutDashboard },
  { href: "/contacts", label: "Kontakte", icon: Users },
  { href: "/kanban", label: "Kanban", icon: Kanban },
  { href: "/settings", label: "Einstellungen", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay sidebar via sheet - simplified for now as a top bar on mobile */}
      <div
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-in-out",
          collapsed ? "w-[68px]" : "w-[250px]"
        )}
      >
        {/* Logo area */}
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            A
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">
                Amadeni
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                CRM
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("text-muted-foreground", collapsed ? "mx-auto" : "ml-auto")}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeft className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "size-[18px] shrink-0 transition-colors",
                    isActive
                      ? "text-sidebar-primary"
                      : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger render={<div />}>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <p className="text-[11px] text-muted-foreground">
              Amadeni Consulting GmbH
            </p>
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
