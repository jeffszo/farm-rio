import { createClient } from "@supabase/supabase-js";
import { AuthAPI, User } from "../types/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseAPI implements AuthAPI {
  async signUp(
    name: string,
    email: string,
    password: string,
    userType: User["userType"]
  ): Promise<User> {
    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "",
        data: {
          name,
          userType,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("User not created");

    // Inserir dados na tabela `users`
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: data.user.id, // Usa o ID gerado pelo Supabase Auth
        name,
        email,
        role: userType,
      },
    ]);

    if (insertError) throw insertError;

    return {
      id: data.user.id,
      name,
      email: data.user.email!,
      userType,
    };
  }

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("User not found");

    return {
      id: data.user.id,
      name: data.user.user_metadata.name,
      email: data.user.email!,
      userType: data.user.user_metadata.userType,
    };
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      id: user.id,
      name: user.user_metadata.name,
      email: user.email!,
      userType: user.user_metadata.userType,
    };
  }

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado");
  
    // Busca o tipo de usuário na tabela `users`
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();
  
    if (userError) throw new Error("Erro ao buscar tipo de usuário");
  
    return {
      id: data.user.id,
      name: data.user.user_metadata.name,
      email: data.user.email!,
      userType: userData.role, // Retorna o tipo de usuário
    };
  }
}

export const api = new SupabaseAPI();
