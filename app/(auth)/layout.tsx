import { AuthShell } from "@mimird/auth/pages/layout";

export default function Layout({ children }: LayoutProps<"/">) {
  return <AuthShell brand="Muninn">{children}</AuthShell>;
}
