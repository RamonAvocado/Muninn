import { authRedirect } from "@mimird/auth/proxy";
import { getSession } from "@mimird/auth/session";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Pages: optimistic redirects from the session cookie alone; app/(app)/layout.tsx
 * does the real check. The data API has no layout, so its session is verified
 * here and a signed-out call gets a 401.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    return (await getSession()) ? NextResponse.next() : NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return authRedirect(request, ["/", "/projects", "/calendar", "/ideas", "/done"]) ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand|.*\\.svg$).*)"],
};
