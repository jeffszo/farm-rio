'use client'

import React from 'react'
import { useRouter, usePathname } from "next/navigation"
import * as S from "./styles"
import Logo from "../../../public/logo.png"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient();

export default function HeaderValidations() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()

    document.cookie = "sb-access-token=; Max-Age=0; path=/;";
    document.cookie = "sb-refresh-token=; Max-Age=0; path=/;";
    router.push("/")
  }

  const isAuthPage = pathname === "/" || pathname === "/signup"

  // Detecta rota base do time
  const getTeamBasePath = () => {
    if (pathname.startsWith("/validations/wholesale")) return "/validations/wholesale"
    if (pathname.startsWith("/validations/csc")) return "/validations/csc"
    if (pathname.startsWith("/validations/tax")) return "/validations/tax"
    if (pathname.startsWith("/validations/credit")) return "/validations/credit"
    return "/" // fallback para home
  }

  let logoutText = "Logout"
  if (pathname.startsWith("/validations/wholesale")) logoutText = "Wholesale Logout"
  else if (pathname.startsWith("/validations/governance")) logoutText = "Governance Logout"
  else if (pathname.startsWith("/validations/tax")) logoutText = "Tax Logout"
  else if (pathname.startsWith("/validations/credit")) logoutText = "Credit Logout"

  return (
    <S.HeaderContainer>
      <S.HeaderContent>
        <S.LogoImage
          src={Logo}
          alt="Logo da Farm Rio"
          onClick={() => router.push(getTeamBasePath())}
        />
        {!isAuthPage && (
          <S.Logout onClick={handleLogout}>
            <LogOut /> {logoutText}
          </S.Logout>
        )}
      </S.HeaderContent>
    </S.HeaderContainer>
  )
}
