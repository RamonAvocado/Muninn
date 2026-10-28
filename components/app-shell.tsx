"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BoxesIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  LayoutDashboardIcon,
  LightbulbIcon,
  PaletteIcon,
  PanelLeftIcon,
  SettingsIcon,
  UserRoundIcon,
} from "lucide-react";
import type { User } from "@mimird/auth/types";
import { AppearanceSection } from "@mimird/auth/account/appearance-section";
import { ProfileSection } from "@mimird/auth/account/profile-section";
import { SettingsDialog, type SettingsSection } from "@mimird/auth/account/settings-dialog";
import { setHash } from "@mimird/auth/account/use-hash";
import { UserMenu } from "@mimird/auth/account/user-menu";
import { Button } from "@mimird/ui/components/button";
import { DropdownMenuItem } from "@mimird/ui/components/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@mimird/ui/components/sheet";
import { Sidebar, SidebarItem } from "@mimird/ui/components/sidebar";
import { cn } from "@mimird/ui/lib/utils";

export const SIDEBAR_COOKIE = "muninn_sidebar";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/projects", label: "Projects", icon: BoxesIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarDaysIcon },
  { href: "/ideas", label: "Ideas", icon: LightbulbIcon },
  { href: "/done", label: "Done", icon: CheckCircle2Icon },
];

// The black-ring mark sits on light surfaces, the white-ring one on dark.
function Mark({ className }: { className?: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static svg */}
      <img src="/brand/mimird-icon-black.svg" alt="" className={cn("size-7 dark:hidden", className)} />
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static svg */}
      <img src="/brand/mimird-icon-white.svg" alt="" className={cn("hidden size-7 dark:block", className)} />
    </>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
      <Mark />
      <span className="text-[15px] font-semibold tracking-tight" translate="no">
        Muninn
      </span>
    </Link>
  );
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // a section stays lit on its sub-pages
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  return NAV_ITEMS.map(({ href, label, icon }) => (
    <SidebarItem key={href} render={<Link href={href} onClick={onNavigate} />} icon={icon} label={label} active={active(href)} />
  ));
}

function Account({ user, collapsed }: { user: User; collapsed?: boolean }) {
  return (
    <UserMenu user={user} collapsed={collapsed}>
      <DropdownMenuItem onClick={() => setHash("settings/profile")}>
        <UserRoundIcon aria-hidden />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setHash("settings/appearance")}>
        <SettingsIcon aria-hidden />
        Settings
      </DropdownMenuItem>
    </UserMenu>
  );
}

export function AppShell({
  user,
  defaultCollapsed = false,
  children,
}: {
  user: User;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function toggleCollapsed(next: boolean) {
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"};path=/;max-age=31536000;samesite=lax`;
  }

  const sections: SettingsSection[] = [
    { value: "settings/profile", label: "Profile", icon: UserRoundIcon, content: <ProfileSection user={user} /> },
    { value: "settings/appearance", label: "Appearance", icon: PaletteIcon, content: <AppearanceSection /> },
  ];

  return (
    <div className="flex min-h-svh flex-1">
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={toggleCollapsed}
        title={<Logo />}
        mark={<Mark />}
        label="Main"
        footer={<Account user={user} collapsed={collapsed} />}
      >
        <Nav />
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile only: desktop navigates from the sidebar. */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Open navigation" />}>
              <PanelLeftIcon aria-hidden />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col gap-4 p-3">
                <div className="flex h-10 items-center">
                  <Logo />
                </div>
                <nav aria-label="Main" className="flex min-h-0 flex-col gap-1 overflow-y-auto">
                  <Nav onNavigate={() => setMobileOpen(false)} />
                </nav>
                <div className="mt-auto border-t border-border/70 pt-3">
                  <Account user={user} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Logo />
        </header>

        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* a page that needs the full width (the calendar) marks its root `data-wide` */}
          <div className="mx-auto w-full max-w-3xl has-[[data-wide]]:max-w-none">{children}</div>
        </main>
      </div>

      <SettingsDialog sections={sections} title="Account" />
    </div>
  );
}
