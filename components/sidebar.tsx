"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@mimird/ui/lib/utils";
import {
  LayoutDashboard,
  Boxes,
  Lightbulb,
  CheckCircle2,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Boxes },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/done", label: "Done", icon: CheckCircle2 },
];

const STORAGE_KEY = "muninn-sidebar-collapsed";
const BUTTON =
  "flex size-7 shrink-0 items-center justify-center rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

// The black-ring mark sits on light surfaces, the white-ring one on dark.
function Logo({ className }: { className?: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static svg */}
      <img src="/brand/mimird-icon-black.svg" alt="" className={cn("size-6 dark:hidden", className)} />
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static svg */}
      <img src="/brand/mimird-icon-white.svg" alt="" className={cn("hidden size-6 dark:block", className)} />
    </>
  );
}

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
      data-collapsed={collapsed}
      className="group/sidebar sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out motion-reduce:transition-none data-[collapsed=true]:w-14"
    >
      <div className="flex h-16 shrink-0 items-center px-4 group-data-[collapsed=true]/sidebar:justify-center">
        {collapsed ? (
          // the logo is the expand button: hovering or focusing it swaps in the panel icon
          <button
            onClick={toggle}
            aria-expanded={false}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className={`group/logo relative ${BUTTON}`}
          >
            <span className="absolute transition-opacity group-hover/logo:opacity-0 group-focus-visible/logo:opacity-0">
              <Logo />
            </span>
            <PanelLeftOpen className="size-4 opacity-0 transition-opacity group-hover/logo:opacity-100 group-focus-visible/logo:opacity-100" aria-hidden />
          </button>
        ) : (
          <div className="flex flex-1 items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
              <Logo />
              <span className="text-[15px] font-semibold tracking-tight" translate="no">
                Muninn
              </span>
            </Link>
            <button
              onClick={toggle}
              aria-expanded
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className={`text-muted-foreground transition-colors hover:text-foreground ${BUTTON}`}
            >
              <PanelLeftClose className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 pb-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:px-0 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&_svg]:size-4 [&_svg]:shrink-0",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground [&_svg]:text-brand"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon aria-hidden />
              <span className="truncate group-data-[collapsed=true]/sidebar:hidden">{label}</span>
            </Link>
          );
        })}
      </nav>

      <ThemeToggle collapsed={collapsed} />
    </aside>
  );
}
