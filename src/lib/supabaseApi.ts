import { createClient } from "@supabase/supabase-js";
import type { AuthAPI, User } from "../types/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseAPI implements AuthAPI {
  async signUp(name: string, email: string, password: string, userType: User["userType"]): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { name, userType },
      },
    });
  
    if (error) throw new Error(`Erro ao criar usuário: ${error.message}`);
    if (!data.user) throw new Error("Usuário não foi criado.");
  
    // ✅ Corrigido: Removido `.returning("minimal")` e adicionado `.select()`
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        name,
        email,
        role: userType,
      },
    ]).select(); // ✅ Garante compatibilidade com Supabase
  
    if (insertError) throw new Error(`Erro ao inserir usuário na tabela: ${insertError.message}`);
  
    return {
      id: data.user.id,
      name,
      email: data.user.email!,
      userType,
    };
  }
  

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw new Error(`Erro ao fazer login: ${error.message}`);
    if (!data.user) throw new Error("Usuário não encontrado.");

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (userError) throw new Error("Erro ao buscar tipo de usuário.");

    return {
      id: data.user.id,
      name: data.user.user_metadata?.name || "",
      email: data.user.email!,
      userType: userData.role,
    };
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Erro ao sair: ${error.message}`);
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
    if (sessionError || !sessionData.session) {
      console.warn("Nenhuma sessão ativa encontrada.");
      return null;
    }
  
    const { data, error } = await supabase.auth.getUser();
  
    if (error) {
      console.error("Erro ao obter usuário autenticado:", error.message);
      return null;
    }
  
    if (!data.user) {
      console.warn("Nenhum usuário autenticado encontrado.");
      return null;
    }

    // Buscar userType na tabela users
    const { data: userData, error: userTypeError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (userTypeError) {
      console.warn("Erro ao buscar tipo de usuário na tabela 'users'.");
    }
  
    return {
      id: data.user.id,
      name: data.user.user_metadata?.name || "Usuário",
      email: data.user.email!,
      userType: userData?.role || "",
    };
  }
  async submitForm(formData: {
    customerInfo: { legalName: string; taxId: string; resaleCertNumber: string };
    billingAddress: object;
    shippingAddress: object;
    apContact: { firstName: string; lastName: string; email: string };
    buyerInfo: { firstName: string; lastName: string; email: string };
  }, userId: string) {
    const { data, error } = await supabase
      .from("customer_forms")
      .insert([
        {
          user_id: userId,
          customer_name: formData.customerInfo.legalName,
          sales_tax_id: formData.customerInfo.taxId,
          resale_certificate: formData.customerInfo.resaleCertNumber,
          billing_address: JSON.stringify(formData.billingAddress),
          shipping_address: JSON.stringify(formData.shippingAddress),
          ap_contact_name: `${formData.apContact.firstName} ${formData.apContact.lastName}`,
          ap_contact_email: formData.apContact.email,
          buyer_name: `${formData.buyerInfo.firstName} ${formData.buyerInfo.lastName}`,
          buyer_email: formData.buyerInfo.email,
          status: "pendente",
        },
      ])
      .select(); // ✅ Corrige o erro do `returning`
  
    if (error) throw new Error(`Erro ao enviar formulário: ${error.message}`);
    return data; // Retorna os dados inseridos, caso precise usá-los
  }
  

  async getFormStatus(userId: string) {
    const { data, error } = await supabase
      .from("customer_forms")
      .select("status, feedback")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw new Error(`Erro ao buscar status do formulário: ${error.message}`);
    return data;
  }
}

export const api = new SupabaseAPI();
