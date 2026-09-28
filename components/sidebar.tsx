"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  Bird,
  LayoutDashboard,
  FolderKanban,
  Lightbulb,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/done", label: "Done", icon: CheckCircle2 },
];

const STORAGE_KEY = "muninn-sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      localStorage.setItem(STORAGE_KEY, prev ? "0" : "1");
      return !prev;
    });
  }

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-16 items-center px-4">
        {collapsed ? (
          <button
            onClick={toggle}
            title="Expand sidebar"
            className="group relative flex size-6 shrink-0 items-center justify-center"
          >
            <Bird className="absolute size-6 transition-opacity group-hover:opacity-0" />
            <PanelLeftOpen className="size-5 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ) : (
          <div className="flex flex-1 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bird className="size-6 shrink-0" />
              <span className="font-heading text-base font-semibold">Muninn</span>
            </div>
            <button
              onClick={toggle}
              title="Collapse sidebar"
              className="flex size-6 shrink-0 items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <ThemeToggle collapsed={collapsed} />
    </aside>
  );
}
