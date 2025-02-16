import { createClient } from "@supabase/supabase-js"
import type { AuthAPI, User } from "../types/api"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export class SupabaseAPI implements AuthAPI {
  async signUp(name: string, email: string, password: string): Promise<User> {
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

  async signIn(email: string, password: string): Promise<User> {
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

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(`Erro ao sair: ${error.message}`)
  }

  async getCurrentUser(): Promise<User | null> {
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

  async submitForm(
    formData: {
      customerInfo: { legalName: string; taxId: string; resaleCertNumber: string }
      billingAddress: object
      shippingAddress: object
      apContact: { firstName: string; lastName: string; email: string }
      buyerInfo: { firstName: string; lastName: string; email: string }
    },
    userId: string,
  ) {
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
      .select()
      .single()

    if (error) throw new Error(`Erro ao enviar formulário: ${error.message}`)
    return data
  }

  async getFormStatus(userId: string) {
    const { data, error } = await supabase
      .from("customer_forms")
      .select("status, feedback")
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") throw new Error(`Erro ao buscar status do formulário: ${error.message}`)
    return data
  }

  async getPendingCustomers() {
    const { data, error, count } = await supabase
      .from("customer_forms")
      .select("*")
      .eq("status", "pendente")
      .order("created_at", { ascending: true });
  
    if (error) {
      console.error("❌ Erro ao buscar clientes pendentes:", error.message);
      return { data: [], error, count: 0 };
    }
  
    console.log("✅ Clientes pendentes retornados:", data?.length);
    return { data, error: null, count };
  }
  
}

export const api = new SupabaseAPI()

