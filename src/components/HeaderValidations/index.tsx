'use client'

import React from 'react'
import { useRouter, usePathname } from "next/navigation"
import * as S from "./styles"
import Image from "next/image"
import Logo from "../../../public/logo.png"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client" // Importe createClient

const supabase = createClient(); // Crie a instância do cliente Supabase aqui

export default function HeaderValidations() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
        await supabase.auth.signOut()

    document.cookie = "sb-access-token=; Max-Age=0; path=/;";
document.cookie = "sb-refresh-token=; Max-Age=0; path=/;";
    router.push("/") // redireciona para home ou login
  }

  const isAuthPage = pathname === "/" || pathname === "/signup"

  return (
    <S.HeaderContainer>
      <S.HeaderContent>
        <Image src={Logo} alt="Logo da Farm Rio" />
        {!isAuthPage && (
          <S.Logout onClick={handleLogout}>
            <LogOut /> Logout
          </S.Logout>
        )}
      </S.HeaderContent>
    </S.HeaderContainer>
  )
}