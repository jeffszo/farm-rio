// validations.ts
import { supabase } from "./client"


// Helper function to determine the next status in the new flow
function getNextStatus(teamRole: "csc_initial" | "tax" | "wholesale" | "credit" | "csc_final"): string {
  switch (teamRole) {
    case "csc_initial":
      return "approved by the CSC team initial";
    case "tax":
      return "approved by the tax team";
    case "wholesale":
      return "approved by the wholesale team";
    case "credit":
      return "approved by the credit team";
    case "csc_final":
      return "finished"; // Assuming "finished" is the ultimate final status
    default:
      return "pending"; // Initial state for new forms
  }
}

export async function validateCustomer(
  customerId: string,
  teamRole: "csc_initial" | "tax" | "wholesale" | "credit" | "csc_final",
  approved: boolean,
  terms: Record<string, boolean> | null = null // Terms only for initial CSC if needed
) {
  // 1. Autenticação
  const { data: userSession, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !userSession?.user) {
    throw new Error("Usuário não autenticado.");
  }

  const userId = userSession.user.id;
  const userEmail = userSession.user.email;

  // 2. Autorização (Update emails for each team if restricted)
  // Adicione verificações de email para cada equipe se houver restrições de domínio.
  if (teamRole === "wholesale" && userEmail !== "wholesale@farm.com") {
    throw new Error("Usuário não autorizado para validar os clientes do time de Atacado.");
  }

  const { data: teamUser, error: teamError } = await supabase
    .from("team_users")
    .select("id")
    .eq("user_id", userId)
    .eq("team_role", teamRole) // This assumes your team_users table has roles like "csc_initial", "tax", etc.
    .single();

  if (teamError || !teamUser) {
    throw new Error(`Usuário não encontrado na equipe de validação de ${teamRole}.`);
  }

  // 4. Verification of terms (if approving and terms are provided, currently only relevant for initial CSC)
  if (approved && terms) {
    const allTermsAccepted = Object.values(terms).every((term) => term === true);
    if (!allTermsAccepted) {
      throw new Error("Todos os termos devem ser aceitos para aprovação.");
    }
  }

  // 5. Update customer_forms table
  const updateFields: Record<string, string | boolean | null> = { // Adicionado 'null' para tipos possíveis
    status: approved ? getNextStatus(teamRole) : "reprovado",
    updated_at: new Date().toISOString() // Adiciona o timestamp de atualização
  };

  // Mark the team as having validated
  if (teamRole === "csc_initial") {
    updateFields.validated_by_csc_initial = approved;
    updateFields.csc_initial_status = approved ? "aprovado" : "reprovado";
    // Nota: feedback não é tratado aqui, mas nas funções específicas de validação
  }
  if (teamRole === "tax") {
    updateFields.validated_by_tax = approved;
    updateFields.tax_status = approved ? "aprovado" : "reprovado";
  }
  if (teamRole === "wholesale") {
    updateFields.validated_by_atacado = approved;
    updateFields.wholesale_status = approved ? "aprovado" : "reprovado";
  }
  if (teamRole === "credit") {
    updateFields.validated_by_credito = approved;
    updateFields.credit_status = approved ? "aprovado" : "reprovado";
  }
  if (teamRole === "csc_final") {
    updateFields.validated_by_csc_final = approved;
    updateFields.csc_final_status = approved ? "aprovado" : "reprovado";
  }

  const { error: updateError } = await supabase
    .from("customer_forms")
    .update(updateFields)
    .eq("id", customerId);

  if (updateError) throw new Error(`Erro ao validar cliente: ${updateError.message}`);

  // REMOVIDO: A lógica de envio de e-mail foi movida para as funções de validação específicas.
}


// Nova função para validação inicial do CSC
export async function validateCSCInitialCustomer(customerId: string, approved: boolean, feedback: string) {
  // Obter os dados atuais do cliente antes de atualizar para pegar o email e nome
  const { data: customerData, error: fetchError } = await supabase
    .from("customer_forms")
    .select("customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }

  // const customerEmail = customerData.email;
  // const customerName = customerData.customer_name;

  const newStatus = approved ? getNextStatus("csc_initial") : "rejected by the CSC initial team";
  // const statusMessageForEmail = approved ? "aprovado pela equipe CSC Inicial" : "rejeitado pela equipe CSC Inicial";

  const updateData = {
    status: newStatus,
    csc_initial_status: approved ? "aprovado" : "reprovado",
    csc_initial_feedback: feedback || null,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente pelo CSC Inicial: ${error.message}`);
  }


}

// Nova função para validação Tributária (Tax)
interface TaxDetails {
  tax_status: string; // "aprovado" ou "reprovado"
  tax_feedback?: string;
  // Adicione quaisquer outros campos específicos para validação fiscal (por exemplo, tax IDs, certificates, etc.)
}

export async function validateTaxCustomer(customerId: string, approved: boolean, taxDetails: TaxDetails) {
  // Obter os dados atuais do cliente antes de atualizar para pegar o email e nome
  const { data: customerData, error: fetchError } = await supabase
    .from("customer_forms")
    .select("customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }

  // const customerEmail = customerData.email;
  // const customerName = customerData.customer_name;

  const newStatus = approved ? getNextStatus("tax") : "rejected by the tax team";
  // const statusMessageForEmail = approved ? "aprovado pela equipe Fiscal" : "rejeitado pela equipe Fiscal";

  const updateData = {
    status: newStatus,
    tax_status: taxDetails.tax_status,
    tax_feedback: taxDetails.tax_feedback ?? null,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente pelo time de Tributário (Tax): ${error.message}`);
  }

}

// Existing function, now reflecting the new flow's status update
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
    feedback?: string; // Adicionado para passar feedback ao e-mail
  }
) {
  // Obter os dados atuais do cliente antes de atualizar para pegar o email e nome
  const { data: customerData, error: fetchError } = await supabase
    .from("customer_forms")
    .select("customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }

  // const customerEmail = customerData.email;
  // const customerName = customerData.customer_name;

  const newStatus = approved ? getNextStatus("wholesale") : "rejected by the wholesale team";
  // const statusMessageForEmail = approved ? "aprovado pela equipe Atacado" : "rejeitado pela equipe Atacado";

  const updateData = {
    status: newStatus,
    wholesale_status: approved ? "aprovado" : "reprovado",
    wholesale_invoicing_company: terms.wholesale_invoicing_company,
    wholesale_warehouse: terms.wholesale_warehouse,
    wholesale_currency: terms.wholesale_currency,
    wholesale_terms: Array.isArray(terms.wholesale_terms)
      ? terms.wholesale_terms.join(", ")
      : terms.wholesale_terms ?? null,
    wholesale_credit: terms.wholesale_credit,
    wholesale_discount: terms.wholesale_discount,
    updated_at: new Date().toISOString()
  };

  const { error, data } = await supabase
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId)
    .select();

  console.log("Resultado do update no Supabase:", { data, error });

  if (error) {
    throw new Error(`Erro ao validar cliente do atacado: ${error.message}`);
  }

}

// Existing function, now reflecting the new flow's status update
interface CreditTerms {
  credit_invoicing_company: string;
  credit_warehouse: string;
  credit_currency: string;
  credit_credit: number;
  credit_discount: number;
  credit_terms?: string;
  feedback?: string; // Adicionado para passar feedback ao e-mail
}

export async function validateCreditCustomer(customerId: string, approved: boolean, creditTerms: CreditTerms) {
  // Obter os dados atuais do cliente antes de atualizar para pegar o email e nome
  const { data: customerData, error: fetchError } = await supabase
    .from("customer_forms")
    .select("customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }

  // const customerEmail = customerData.email;
  // const customerName = customerData.customer_name;

  const newStatus = approved ? getNextStatus("credit") : "rejected by the wholesale team"; // MODIFICAÇÃO AQUI
  // const statusMessageForEmail = approved ? "aprovado pela equipe de Crédito" : "rejeitado pela equipe de Crédito";

  const updateData = {
    status: newStatus,
    credit_status: approved ? "aprovado" : "reprovado",
    credit_invoicing_company: creditTerms.credit_invoicing_company,
    credit_warehouse: creditTerms.credit_warehouse,
    credit_currency: creditTerms.credit_currency,
    credit_terms: creditTerms.credit_terms ?? null,
    credit_credit: creditTerms.credit_credit,
    credit_discount: creditTerms.credit_discount,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente pelo time de crédito: ${error.message}`);
  }

}

// Existing function, now for the final CSC review
export async function validateCSCFinalCustomer(customerId: string, approved: boolean, feedback: string) {
  // Obter os dados atuais do cliente antes de atualizar para pegar o email e nome
  const { data: customerData, error: fetchError } = await supabase
    .from("customer_forms")
    .select("customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }

  // const customerEmail = customerData.email;
  // const customerName = customerData.customer_name;

  const newStatus = approved ? getNextStatus("csc_final") : "rejected by the CSC final team";
  // const statusMessageForEmail = approved ? "finalizado e aprovado" : "rejeitado pela equipe CSC Final";

  const updateData = {
    status: newStatus,
    csc_final_status: approved ? "aprovado" : "reprovado", // New field for final CSC
    csc_final_feedback: feedback || null,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente pelo CSC Final: ${error.message}`);
  }
}

// Finaliza o cliente na customer_forms (This might be redundant if validateCSCFinalCustomer sets status to "finished")
export async function finishCustomer(customerId: string) {
  // Obter os dados atuais do cliente antes de atualizar para pegar o email e nome
  const { data: customerData, error: fetchError } = await supabase
    .from("customer_forms")
    .select("email, customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }


  const { error: customerError } = await supabase
    .from("customer_forms")
    .update({ status: "finished", updated_at: new Date().toISOString() })
    .eq("id", customerId);

  if (customerError) {
    throw new Error(`Erro ao atualizar cliente: ${customerError.message}`);
  }


}