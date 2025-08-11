'use server'

import { supabaseServerClient } from "./client"
import type { User } from "../../types/api"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";



export async function signUp(name: string, email: string, password: string): Promise<User> {
  const { data, error } = await supabaseServerClient.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) throw new Error(`${error.message}`)
  if (!data.user) throw new Error("Erro inesperado: Usuário não retornado.")

  // ✅ Insere o usuário na tabela correta (`users` e não `profiles`)
  const { error: profileError } = await supabaseServerClient
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
  const { data, error } = await supabaseServerClient.auth.signInWithPassword({ email, password })

  if (error) throw new Error(`Erro ao fazer login: ${error.message}`)
  if (!data.user) throw new Error("Usuário não encontrado.")

  const { data: userData, error: userError } = await supabaseServerClient
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
  const { error } = await supabaseServerClient.auth.signOut()
  if (error) throw new Error(`Erro ao sair: ${error.message}`)
}

// No arquivo: ../../../lib/supabaseServerClient/index.ts (ou onde a função está)

export async function getCurrentUser(userId: string): Promise<User | null> {
  console.log("Iniciando getCurrentUser() para Time de Validação com ID:", userId); // Log 1

  try {
    // 1. Verificação básica do ID
    if (!userId) {
      console.log("ID de usuário não fornecido para getCurrentUser.");
      return null;
    }

    // 2. Buscar o usuário diretamente na tabela 'users'
    const { data: userData, error: userError } = await supabaseServerClient
      .from("users")
      .select("id, name, email, role") // Seleciona todas as colunas necessárias para o tipo User
      .eq("id", userId)
      .single();

    if (userError) {
      console.error(`Erro ao buscar usuário ${userId} na tabela 'users':`, userError); // Log 4
      return null;
    }

    if (!userData) {
      console.log(`Nenhum usuário encontrado na tabela 'users' com o ID: ${userId}`);
      return null;
    }

    console.log("Dados do usuário da tabela 'users':", userData); // Log 5

    // 3. Validar se o usuário encontrado é de fato um 'validador' ou 'admin'
    // Esta é uma camada adicional de segurança/filtro.
    const allowedRoles = ['validador', 'admin']; // Defina quais roles são considerados "Times de Validação"
    if (!allowedRoles.includes(userData.role)) {
      console.log(`Usuário ${userId} encontrado, mas seu tipo ('${userData.role}') não é um tipo de validador/admin permitido.`);
      return null; // Não retorne se não for o tipo de usuário esperado para este fluxo
    }

    // 4. Retornar o objeto User formatado
    return {
      id: userData.id,
      name: userData.name || "Validador", // Assumindo 'name' está na sua tabela 'users'
      email: userData.email || "email@example.com", // Assumindo 'email' está na sua tabela 'users'
      userType: userData.role, // Agora 'userType' será diretamente o 'role' da tabela
    };
  } catch (outerError) {
    console.error("Erro inesperado em getCurrentUser():", outerError); // Log para erros gerais
    return null;
  }
}



export async function getCurrentUserServer(): Promise<User | null> {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  if (!user) return null

  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Erro ao buscar tipo de usuário:", error)
    return null
  }

  return {
    id: user.id,
    name: user.user_metadata?.name || "Usuário",
    email: user.email!,
    userType: userData?.role || "cliente",
  }
}

