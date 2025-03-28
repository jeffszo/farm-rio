import { supabase } from "./client"

export async function validateCustomer(customerId: string, teamRole: string, approved: boolean, terms: unknown) {
  // Obtém o usuário autenticado
  const { data: userSession, error: sessionError } = await supabase.auth.getUser()
  if (sessionError || !userSession?.user) {
    throw new Error("Usuário não autenticado.")
  }

  const userId = userSession.user.id
  const userEmail = userSession.user.email // Pegue o e-mail do usuário atual

  // Verifica se o usuário é o autorizado para validar clientes do time de Atacado
  if (userEmail !== "wholesale@farm.com") {
    throw new Error("Usuário não autorizado para validar os clientes do time de Atacado.")
  }

  // 🚨 Verifica se o usuário está cadastrado na tabela `team_users`
  const { data: teamUser, error: teamError } = await supabase
    .from("team_users")
    .select("id")
    .eq("user_id", userId)
    .eq("team_role", teamRole)
    .single()

  if (approved) {
    if (typeof terms !== 'object' || terms === null) {
      throw new Error("Os termos fornecidos são inválidos.");
    }
    const allTermsAccepted = Object.values(terms as Record<string, boolean>).every((term) => term === true);
    if (!allTermsAccepted) {
      throw new Error("Todos os termos devem ser aceitos para aprovar!")
    }
  }

  // ✅ Atualiza o cliente com validação do time atual
  const updateData: { status: string; validated_by_atacado?: boolean } = {
    status: approved ? "aguardando crédito" : "reprovado",
  }

  if (teamRole === "atacado") {
    updateData.validated_by_atacado = approved // 🔥 Campo específico do time
  }

  if (teamError || !teamUser) {
    throw new Error("Usuário não encontrado na equipe de validação.")
  }

  // 🚨 Agora garantimos que `validated_by` seja um ID válido
  const validatedById = teamUser.id

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
  ])

  if (error) throw new Error(`Erro ao validar cliente: ${error.message}`)

  // Atualiza o status do cliente
  if (approved) {
    await supabase.from("customer_forms").update({ status: "aguardando crédito" }).eq("id", customerId)
  } else {
    await supabase.from("customer_forms").update({ status: "reprovado" }).eq("id", customerId)
  }
}

export async function validateWholesaleCustomer(customerId: string, approved: boolean, terms: { invoicing_company: string; warehouse: string; currency: string; payment_terms?: string | string[]; credit_limit: number; discount: number; }) {
  // ✅ Atualiza o status na tabela `customer_forms`
  const updateData = {
    status: approved ? "approved by the wholesale team" : "rejected by wholesale team",
  };

  const { error: updateError } = await supabase
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (updateError) throw new Error(`Erro ao atualizar cliente: ${updateError.message}`);

  // ✅ Atualiza ou insere os termos na tabela `validations`
  const { error: validationError } = await supabase
    .from("validations")
    .upsert(
      [
        {
          customer_id: customerId, // 🔥 Relaciona com o cliente
          atacado_status: approved ? "aprovado" : "reprovado",
          atacado_invoicing_company: terms.invoicing_company,
          atacado_warehouse: terms.warehouse,
          atacado_currency: terms.currency,
          atacado_terms: Array.isArray(terms.payment_terms) ? terms.payment_terms.join(", ") : terms.payment_terms,
          atacado_credit: terms.credit_limit,
          atacado_discount: terms.discount,
        }
      ],
      { onConflict: "customer_id" } // 🔥 Se já existir, atualiza; senão, insere
    );

  if (validationError) throw new Error(`Erro ao registrar validação: ${validationError.message}`);
}


interface CreditTerms {
  invoicing_company: string;
  warehouse: string;
  currency: string;
  credit_limit: number;
  discount: number;
  payment_terms?: string; // Ensure this matches the expected type
}

export async function validateCreditCustomer(customerId: string, approved: boolean, creditTerms: CreditTerms) {
  // ✅ Atualiza o status na tabela `customer_forms`
  const updateData = {
    status: approved ? "approved by the credit team" : "rejected by credit team",
  };

  const { error: updateError } = await supabase
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (updateError) throw new Error(`Erro ao atualizar cliente: ${updateError.message}`);

  // ✅ Atualiza ou insere os dados do crédito na tabela `validations`
  const { error: validationError } = await supabase
    .from("validations")
    .upsert(
      [
        {
          customer_id: customerId, // 🔥 Relaciona com o cliente
          credito_status: approved ? "aprovado" : "reprovado",
          credito_invoicing_company: creditTerms.invoicing_company,
          credito_warehouse: creditTerms.warehouse,
          credito_currency: creditTerms.currency,
          credito_credit: creditTerms.credit_limit,
          credito_discount: creditTerms.discount,
        }
      ],
      { onConflict: "customer_id" } // 🔥 Se já existir, atualiza; senão, insere
    );

  if (validationError) throw new Error(`Erro ao registrar validação: ${validationError.message}`);
}



export async function validateCSCCustomer(customerId: string, approved: boolean) {
  const newStatus = approved ? "approved by the CSC team" : "rejected by CSC";

  const { error } = await supabase
    .from("customer_forms")
    .update({ status: newStatus })
    .eq("id", customerId);

  if (error) {
    console.error("Erro ao atualizar status do cliente:", error.message);
    throw new Error("Erro ao atualizar status do cliente.");
  }
}


