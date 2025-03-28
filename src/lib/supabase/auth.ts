import { supabase } from "./client"
import type { User } from "../../types/api"

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) throw new Error(`Erro ao cadastrar usuário: ${error.message}`)
  if (!data.user) throw new Error("Erro inesperado: Usuário não retornado.")

  // ✅ Insere o usuário na tabela correta (`users` e não `profiles`)
  const { data: userData, error: profileError } = await supabase
    .from("users")
    .insert([
      {
        id: data.user.id,
        name,
        email,
        role: "cliente",
      },
    ])
    .select()
    .single()

  if (profileError) throw new Error(`Erro ao criar perfil: ${profileError.message}`)

  return {
    id: data.user.id,
    name,
    email,
    userType: "cliente",
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw new Error(`Erro ao fazer login: ${error.message}`)
  if (!data.user) throw new Error("Usuário não encontrado.")

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single()

  if (userError) throw new Error(`Erro ao buscar tipo de usuário: ${userError.message}`)

  return {
    id: data.user.id,
    name: data.user.user_metadata?.name || "",
    email: data.user.email!,
    userType: userData?.role || "cliente",
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(`Erro ao sair: ${error.message}`)
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) return null

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null

  const { data: userData } = await supabase.from("users").select("role").eq("id", data.user.id).single()

  return {
    id: data.user.id,
    name: data.user.user_metadata?.name || "Usuário",
    email: data.user.email!,
    userType: userData?.role || "cliente",
  }
}

