// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Cookies compatíveis com CookieMethodsServer
  const cookies = {
    get: (name: string) => {
      const value = req.cookies.get(name)?.value
      if (!value) return null
      // Usa Buffer para evitar serialização pesada
      return Buffer.from(value, "utf-8").toString()
    },
  }

  // Cria cliente Supabase no server
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )

  // Verifica sessão
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redireciona para login se não tiver sessão
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

// Define rotas protegidas
export const config = {
  matcher: [
    "/validations/credit/:path*",
    "/validations/wholesale/:path*",
    "/validations/tax/:path*",
    "/customer/form/:path*",
    "/edit-form/:path*",
  ],
}
