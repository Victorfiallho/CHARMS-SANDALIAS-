import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createSupabaseMiddlewareClient(request, response);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
