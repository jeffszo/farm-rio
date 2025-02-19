import { createClient } from "@supabase/supabase-js"
import type { AuthAPI, User } from "../types/api"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
          status: "pending",
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

  async getPendingValidations (page = 1, itemsPerPage = 10) {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
  
    const { data, error, count } = await supabase
      .from("customer_forms")
      .select("*", { count: "exact" }) // 🔥 Pegando a contagem exata dos registros
      .eq("status", "pending")
      .range(from, to) // 🔥 Pegando apenas os clientes da página atual
      .order("created_at", { ascending: true });
  
    if (error) {
      console.error("❌ Erro ao buscar clientes pendentes:", error.message);
      return { data: [], error, count: 0 };
    }
  
    console.log(`✅ Página ${page} | Clientes retornados:`, data.length, "| Total:", count);
    return { data, error: null, count };
  }


  async getCustomerFormById(customerId: string) {
    const { data, error } = await supabase
      .from("customer_forms")
      .select("*")
      .eq("id", customerId)
      .single();
  
    if (error) {
      console.error("Erro ao buscar formulário do cliente:", error.message);
      return null;
    }
  
    return data;
  }  

  async validateCustomer(customerId: string, teamRole: string, approved: boolean, terms: any) {
    // Obtém o usuário autenticado
    const { data: userSession, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !userSession?.user) {
      throw new Error("Usuário não autenticado.");
    }
  
    const userId = userSession.user.id;
    const userEmail = userSession.user.email;  // Pegue o e-mail do usuário atual
  
    // Verifica se o usuário é o autorizado para validar clientes do time de Atacado
    if (userEmail !== 'wholesale@farm.com') {
      throw new Error("Usuário não autorizado para validar os clientes do time de Atacado.");
    }
  
    // 🚨 Verifica se o usuário está cadastrado na tabela `team_users`
    const { data: teamUser, error: teamError } = await supabase
      .from("team_users")
      .select("id")
      .eq("user_id", userId)
      .eq("team_role", teamRole)
      .single();

      if (approved) {
        const allTermsAccepted = Object.values(terms).every((term) => term === true);
        if (!allTermsAccepted) {
          throw new Error("Todos os termos devem ser aceitos para aprovar!");
        }
      }
    
      // ✅ Atualiza o cliente com validação do time atual
      const updateData: any = {
        status: approved ? "aguardando crédito" : "reprovado",
      };
    
      if (teamRole === "atacado") {
        updateData.validated_by_atacado = approved; // 🔥 Campo específico do time
      }

      
  
    if (teamError || !teamUser) {
      throw new Error("Usuário não encontrado na equipe de validação.");
    }
  
    // 🚨 Agora garantimos que `validated_by` seja um ID válido
    const validatedById = teamUser.id;
  
    // Insere o registro na tabela `validations`
    const { error } = await supabase.from("validations").insert([
      {
        term_id: customerId,
        validated_by: validatedById, // Agora sempre será um ID válido
        team_role: teamRole,
        status: approved ? "aprovado" : "reprovado",
        comments: approved ? null : "Revisão necessária",
        created_at: new Date(),
      },
    ]);
  
    if (error) throw new Error(`Erro ao validar cliente: ${error.message}`);
  
    // Atualiza o status do cliente
    if (approved) {
      await supabase.from("customer_forms").update({ status: "aguardando crédito" }).eq("id", customerId);
    } else {
      await supabase.from("customer_forms").update({ status: "reprovado" }).eq("id", customerId);
    }
  }

  async validateWholesaleCustomer(customerId: string, approved: boolean, terms: any) {
    // ✅ Verifica se todos os checkboxes foram marcados antes de aprovar
    if (approved) {
      const allTermsAccepted = Object.values(terms).every((term) => term === true);
      if (!allTermsAccepted) {
        throw new Error("⚠️ Todos os termos devem ser aceitos para aprovar!");
      }
    }
  
    // ✅ Atualiza o status na tabela `customer_forms`
    const updateData = {
      status: approved ? "aguardando crédito" : "reprovado",
      validated_by_atacado: approved, // 🔥 Registra que foi validado pelo atacado
    };
  
    const { error: updateError } = await supabase
      .from("customer_forms")
      .update(updateData)
      .eq("id", customerId);
  
    if (updateError) throw new Error(`Erro ao atualizar cliente: ${updateError.message}`);
  
    // ✅ Insere a validação na tabela `validations`
    const { error: validationError } = await supabase.from("validations").insert([
      {
        term_id: customerId,
        team_role: "atacado",
        status: approved ? "aprovado" : "reprovado",
        comments: approved ? null : "Revisão necessária",
        created_at: new Date(),
      },
    ]);
  
    if (validationError) throw new Error(`Erro ao registrar validação: ${validationError.message}`);
  }
  
  
  
}

export const api = new SupabaseAPI()

