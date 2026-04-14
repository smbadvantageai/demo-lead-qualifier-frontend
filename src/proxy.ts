import { NextRequest, NextResponse } from "next/server";
import { createProxyClient } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Refresh the session on every request so tokens stay current.
  // createProxyClient writes updated tokens back into response.cookies.
  const supabase = createProxyClient(request, response);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from the main app
  if (pathname === "/" && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from the login page
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
