import { supabase } from "./client"

export async function validateCustomer(
  customerId: string,
  teamRole: "atacado" | "credito" | "csc",
  approved: boolean,
  terms: Record<string, boolean> | null = null
) {
  // 1. Autenticação
  const { data: userSession, error: sessionError } = await supabase.auth.getUser()
  if (sessionError || !userSession?.user) {
    throw new Error("Usuário não autenticado.")
  }

  const userId = userSession.user.id
  const userEmail = userSession.user.email

  // 2. Autorização
  if (teamRole === "atacado" && userEmail !== "wholesale@farm.com") {
    throw new Error("Usuário não autorizado para validar os clientes do time de Atacado.")
  }

  // 3. Verificação de equipe
  const { data: teamUser, error: teamError } = await supabase
    .from("team_users")
    .select("id")
    .eq("user_id", userId)
    .eq("team_role", teamRole)
    .single()

  if (teamError || !teamUser) {
    throw new Error("Usuário não encontrado na equipe de validação.")
  }

  // 4. Verificação dos termos (se aprovando)
  if (approved && terms) {
    const allTermsAccepted = Object.values(terms).every((term) => term === true)
    if (!allTermsAccepted) {
      throw new Error("Todos os termos devem ser aceitos para aprovação.")
    }
  }

  // 5. Atualização do cliente na tabela customer_forms
  const updateFields: Record<string, string | boolean> = {
    status: approved ? getNextStatus(teamRole) : "reprovado",
  }

  // Marca o time como tendo validado
  if (teamRole === "atacado") updateFields.validated_by_atacado = approved
  if (teamRole === "credito") updateFields.validated_by_credito = approved
  if (teamRole === "csc") updateFields.validated_by_csc = approved

  const { error: updateError } = await supabase
    .from("customer_forms")
    .update(updateFields)
    .eq("id", customerId)

  if (updateError) throw new Error(`Erro ao validar cliente: ${updateError.message}`)
}

// Função auxiliar para status com base no time
function getNextStatus(teamRole: string): string {
  switch (teamRole) {
    case "atacado":
      return "approved by the wholesale team"
    case "credito":
      return "approved by the credit team"
    case "csc":
      return "approved by the CSC team"
    default:
      return "pending"
  }
}


export async function validateWholesaleCustomer(
  customerId: string,
  approved: boolean,
  terms: {
    wholesale_invoicing_company: string;
    wholesale_warehouse: string;
    wholesale_currency: string;
    wholesale_terms?: string | string[];
    wholesale_credit: number;
    wholesale_discount: number;
  }
) {
  const updateData = {
    status: approved ? "approved by the wholesale team" : "rejected by the team wholesale",
    wholesale_status: approved ? "aprovado" : "reprovado", // ✅ novo campo de status específico

    // ✅ Termos preenchidos
    wholesale_invoicing_company: terms.wholesale_invoicing_company,
    wholesale_warehouse: terms.wholesale_warehouse,
    wholesale_currency: terms.wholesale_currency,
    wholesale_terms: Array.isArray(terms.wholesale_terms)
      ? terms.wholesale_terms.join(", ")
      : terms.wholesale_terms ?? null,
    wholesale_credit: terms.wholesale_credit,
    wholesale_discount: terms.wholesale_discount,
  };

  const { error } = await supabase
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente do atacado: ${error.message}`);
  }
}



interface CreditTerms {
  credit_invoicing_company: string;
  credit_warehouse: string;
  credit_currency: string;
  credit_credit: number;
  credit_discount: number;
  credit_terms?: string; // Ensure this matches the expected type
}

export async function validateCreditCustomer(customerId: string, approved: boolean, creditTerms: CreditTerms) {
  const updateData = {
    status: approved ? "approved by the credit team" : "rejected by credit team",
    credit_status: approved ? "aprovado" : "reprovado", // novo campo específico
    credit_invoicing_company: creditTerms.credit_invoicing_company,
    credit_warehouse: creditTerms.credit_warehouse,
    credit_currency: creditTerms.credit_currency,
    credit_terms: creditTerms.credit_terms ?? null,
    credit_credit: creditTerms.credit_credit,
    credit_discount: creditTerms.credit_discount,
  };

  const { error } = await supabase
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente pelo time de crédito: ${error.message}`);
  }
}





export async function validateCSCCustomer(customerId: string, approved: boolean, feedback: string) {
  const updateData = {
    status: approved ? "approved by the CSC team" : "rejected by the CSC team",
    csc_status: approved ? "aprovado" : "reprovado",     
    csc_feedback: feedback || null,                      
  };

  const { error } = await supabase
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente pelo CSC: ${error.message}`);
  }
}





// Finaliza o cliente na customer_forms e validations
export async function finishCustomer(customerId: string) {
  // Atualiza status na tabela customer_forms
  const { error: customerError } = await supabase
    .from("customer_forms")
    .update({ status: "finished" })
    .eq("id", customerId);

  if (customerError) {
    throw new Error(`Erro ao atualizar cliente: ${customerError.message}`);
  }

}

