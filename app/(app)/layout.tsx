import { cookies } from "next/headers";
import { requireUser } from "@mimird/auth/auth";
import { AppShell, SIDEBAR_COOKIE } from "@/components/app-shell";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const collapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <AppShell user={user} defaultCollapsed={collapsed}>
      {children}
    </AppShell>
  );
}
