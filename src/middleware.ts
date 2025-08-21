// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Cliente Supabase no middleware (novo método recomendado)
  const supabase = createMiddlewareSupabaseClient({ req, res });

  // Verifica a sessão do usuário
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// Rotas protegidas pelo middleware (sem CSC)
export const config = {
  matcher: [
    "/validations/credit/:path*",
    "/validations/governance/:path*",
    "/validations/wholesale/:path*",
    "/validations/tax/:path*",
    "/customer/form/:path*",
    "/edit-form/:path*",
  ],
};
