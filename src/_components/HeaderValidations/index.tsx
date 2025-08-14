'use client'

import React from 'react'
import { useRouter, usePathname } from "next/navigation"
import * as S from "./styles"
import Image from "next/image"
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

  let logoutText = "Logout"
  if (pathname.startsWith("/validations/wholesale")) logoutText = "Wholesale Logout"
  else if (pathname.startsWith("/validations/csc")) logoutText = "CSC Logout"
  else if (pathname.startsWith("/validations/tax")) logoutText = "Tax Logout"
  else if (pathname.startsWith("/validations/credit")) logoutText = "Credit Logout"

  return (
    <S.HeaderContainer>
      <S.HeaderContent>
               <S.LogoImage
          src={Logo}
          alt="Logo da Farm Rio"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/")} // Redireciona ao clicar
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
