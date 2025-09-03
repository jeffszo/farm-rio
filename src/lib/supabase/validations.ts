/* eslint-disable @typescript-eslint/no-unused-vars */
// validations.ts
import { supabaseServerClient } from "./client"


// Helper function to determine the next status in the new flow
function getNextStatus(teamRole: "wholesale" | "csc_initial" | "tax" | "credit" | "csc_final"): string {
  switch (teamRole) {
    case "wholesale":
      return "approved by the wholesale team";
    case "csc_initial":
      return "approved by the compliance team"; 
    case "tax":
      return "approved by the tax team";
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
  const { data: userSession, error: sessionError } = await supabaseServerClient.auth.getUser();
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

  const { data: teamUser, error: teamError } = await supabaseServerClient
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

  const { error: updateError } = await supabaseServerClient
    .from("customer_forms")
    .update(updateFields)
    .eq("id", customerId);

  if (updateError) throw new Error(`Erro ao validar cliente: ${updateError.message}`);

  // REMOVIDO: A lógica de envio de e-mail foi movida para as funções de validação específicas.
}


// Nova função para validação inicial do CSC
export async function validateCSCInitialCustomer(customerId: string, approved: boolean, feedback: string, internalComment?: string, p0?: string) {
  // Obter os dados atuais do cliente antes de atualizar para pegar o email e nome
  const { data: customerData, error: fetchError } = await supabaseServerClient
    .from("customer_forms")
    .select("customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }

  // const customerEmail = customerData.email;
  // const customerName = customerData.customer_name;

  const newStatus = approved ? getNextStatus("csc_initial") : "review requested by the compliance team";
  // const statusMessageForEmail = approved ? "aprovado pela equipe CSC Inicial" : "rejeitado pela equipe CSC Inicial";

  const updateData = {
    status: newStatus,
    // csc_initial_status: approved ? "aprovado" : "reprovado",
    csc_initial_feedback: feedback || null,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseServerClient
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente pelo CSC Inicial: ${error.message}`);
  }

    if (internalComment && internalComment.trim() !== "") {
    await saveInternalComment(customerId, "csc_initial", internalComment);
  }


}

// Nova função para validação Tributária (Tax)
interface TaxDetails {
  tax_status: string; // "aprovado" ou "reprovado"
  tax_feedback?: string;
  // Adicione quaisquer outros campos específicos para validação fiscal (por exemplo, tax IDs, certificates, etc.)
}

export async function validateTaxCustomer(
  customerId: string,
  approved: boolean,
  taxDetails: TaxDetails,
  internalComment?: string
) {
  const { data: customerData, error: fetchError } = await supabaseServerClient
    .from("customer_forms")
    .select("customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }

  const newStatus = approved ? getNextStatus("tax") : "review requested by the tax team";

  const updateData = {
    status: newStatus,
    tax_status: taxDetails.tax_status,
    tax_feedback: taxDetails.tax_feedback ?? null,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseServerClient
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente pelo time de Tributário (Tax): ${error.message}`);
  }

  if (internalComment && internalComment.trim() !== "") {
    await saveInternalComment(customerId, "tax", internalComment);
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
    wholesale_credit: number | null;
    wholesale_discount: number | null;
    wholesale_feedback?: string;
  },
  isReview?: boolean,
  internalComment?: string
) {
  const { data: customerData, error: fetchError } = await supabaseServerClient
    .from("customer_forms")
    .select("customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }

  const newStatus = isReview
    ? "review requested by the wholesale team"
    : approved
    ? getNextStatus("wholesale")
    : "rejected by the wholesale team";

  const wholesaleCreditValue =
    typeof terms.wholesale_credit === "string" && terms.wholesale_credit === ""
      ? null
      : terms.wholesale_credit;

  const wholesaleDiscountValue =
    typeof terms.wholesale_discount === "string" && terms.wholesale_discount === ""
      ? null
      : terms.wholesale_discount;

  const updateData = {
    status: newStatus,
    wholesale_status: approved ? "aprovado" : "reprovado",
    wholesale_invoicing_company: terms.wholesale_invoicing_company,
    wholesale_warehouse: terms.wholesale_warehouse,
    wholesale_currency: terms.wholesale_currency,
    wholesale_terms: Array.isArray(terms.wholesale_terms)
      ? terms.wholesale_terms.join(", ")
      : terms.wholesale_terms ?? null,
    wholesale_credit: wholesaleCreditValue,
    wholesale_discount: wholesaleDiscountValue,
    wholesale_feedback: terms.wholesale_feedback ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error, data } = await supabaseServerClient
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId)
    .select();

  if (error) {
    throw new Error(`Erro ao validar cliente do atacado: ${error.message}`);
  }

  if (internalComment && internalComment.trim() !== "") {
    await saveInternalComment(customerId, "wholesale", internalComment);
  }

  return data;
}



// Existing function, now reflecting the new flow's status update
interface CreditTerms {
  credit_invoicing_company: string;
  credit_warehouse: string;
  credit_currency: string;
  credit_credit: number;
  credit_discount: number;
  credit_terms?: string;
  credit_feedback?: string; // Adicionado para passar feedback ao e-mail
}

export async function validateCreditCustomer(
customerId: string, approved: boolean, creditTerms: CreditTerms, internalComment?: string, p0?: string) {
  const { data: customerData, error: fetchError } = await supabaseServerClient
    .from("customer_forms")
    .select("customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }

  const newStatus = approved ? getNextStatus("credit") : "review requested by the credit team";

  const updateData = {
    status: newStatus,
    credit_status: approved ? "aprovado" : "reprovado",
    credit_invoicing_company: creditTerms.credit_invoicing_company,
    credit_warehouse: creditTerms.credit_warehouse,
    credit_currency: creditTerms.credit_currency,
    credit_terms: creditTerms.credit_terms ?? null,
    credit_credit: creditTerms.credit_credit,
    credit_discount: creditTerms.credit_discount,
    credit_feedback: creditTerms.credit_feedback,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseServerClient
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente pelo time de crédito: ${error.message}`);
  }

  if (internalComment && internalComment.trim() !== "") {
    await saveInternalComment(customerId, "credit", internalComment);
  }
}


// Existing function, now for the final CSC review
export async function validateCSCFinalCustomer(
customerId: string, approved: boolean, feedback: string | null = null, internalComment?: string, p0?: string) {
  const { data: customerData, error: fetchError } = await supabaseServerClient
    .from("customer_forms")
    .select("customer_name")
    .eq("id", customerId)
    .single();

  if (fetchError || !customerData) {
    throw new Error(`Erro ao buscar dados do cliente: ${fetchError?.message}`);
  }

  const newStatus = approved ? getNextStatus("csc_final") : "review requested by the governance final team";
  
  const updateData: { status: string; updated_at: string; csc_final_status?: string; csc_final_feedback?: string | null; } = {
    status: newStatus,
    updated_at: new Date().toISOString(),
    csc_final_status: approved ? "aprovado" : "reprovado"
  };

  if (feedback && feedback.trim() !== "") {
    updateData.csc_final_feedback = feedback;
  }

  const { error } = await supabaseServerClient
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    throw new Error(`Erro ao validar cliente pelo governance final: ${error.message}`);
  }

  if (internalComment && internalComment.trim() !== "") {
    await saveInternalComment(customerId, "csc_final", internalComment);
  }
}



export async function reviewCustomer(
  customerId: string,
  feedback: string | null = null,
  internalComment?: string
) {
  console.log(`Revisando cliente ${customerId} para edição...`);

  const updateData: {
    status: string;
    updated_at: string;
    wholesale_feedback?: string | null;
  } = {
    status: "review requested by the wholesale team",
    updated_at: new Date().toISOString(),
  };

  if (feedback) {
    updateData.wholesale_feedback = feedback;
  }

  const { error } = await supabaseServerClient
    .from("customer_forms")
    .update(updateData)
    .eq("id", customerId);

  if (error) {
    console.error("Erro ao enviar formulário para revisão do cliente:", error);
    throw new Error(`Falha ao enviar formulário para revisão: ${error.message}`);
  }

  // 🔹 Salva comentário interno se informado
  if (internalComment && internalComment.trim() !== "") {
    await saveInternalComment(customerId, "wholesale", internalComment);
  }

  return { success: true };
}


export async function saveInternalComment(
  customerId: string,
  teamRole: "csc_initial" | "tax" | "wholesale" | "credit" | "csc_final",
  comment: string
) {


  const { error } = await supabaseServerClient
    .from("internal_comments")
    .insert({
      customer_id: customerId,
      team_role: teamRole,
      comment    });

  if (error) {
    throw new Error(`Erro ao adicionar comentário interno: ${error.message}`);
  }
}

