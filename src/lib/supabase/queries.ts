import { supabaseServerClient } from "./index"
import {createClient} from "./client";


export async function getApprovedCustomers() {
  const { data, error } = await supabaseServerClient
    .from("customer_forms")
    .select(`
      created_at,
      status,
      customer_name,
      dba_number,
      duns_number,
      ap_contact_name,
      ap_contact_email,
      buyer_name,
      buyer_email,
      sales_tax_id,
      resale_certificate,
      billing_address,
      shipping_address,
      id,
      credit_invoicing_company,
      credit_warehouse,
      credit_currency,
      credit_credit,
      credit_discount,

    `)
    .eq("status", "finished"); // Alterado para "finished" como status final do fluxo

  if (error) {
    console.error("Erro ao buscar formulários de clientes aprovados:", error.message);
    return [];
  }

  return data || [];
}

export async function getPendingCSCValidations(
  page = 1, // validationType foi removido
  itemsPerPage = 10
) {
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  // Todos os status combinados
  const statuses = [
    "approved by the credit team",
    "review requested by the csc initial team - customer",
    "review requested by the csc final team - customer",
    "approved by the wholesale team",
    "finished"
    // Adicione outros status se houver mais que você deseja buscar nesta visão geral
  ];

  const { data, error, count } = await supabaseServerClient
    .from("customer_forms")
    .select("*", { count: "exact" })
    .in("status", statuses) // Usa o array de status combinado
    .range(from, to)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("❌ Erro ao buscar todos os clientes pendentes:", error.message);
    return { data: [], error, count: 0 };
  }

  console.log(`✅ Página ${page} | Clientes retornados (Todos os Pendentes):`, data.length, "| Total:", count);
  return { data, error: null, count };
}

// New function to get customers for Tax validation
export async function getPendingTaxValidations(page = 1, itemsPerPage = 10) {
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const { data, error, count } = await supabaseServerClient
    .from("customer_forms")
    .select("*", { count: "exact" })
    .in("status", ["approved by the csc initial team", "review requested by the tax team"]) // From CSC initial or rejected by tax
    .range(from, to)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("❌ Erro ao buscar clientes pendentes (Tributário):", error.message)
    return { data: [], error, count: 0 }
  }

  console.log(`✅ Página ${page} | Clientes retornados:`, data.length, "| Total:", count)
  return { data, error: null, count }
}


// Renamed and updated for Wholesale validation
export async function getPendingWholesaleValidations(page = 1, itemsPerPage = 10) {
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const { data, error, count } = await supabaseServerClient
    .from("customer_forms")
    .select("*", { count: "exact" })
    .in("status", ["pending", "review requested by the wholesale team - customer"]) // From Tax or rejected by wholesale
    .range(from, to)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("❌ Erro ao buscar clientes pendentes (Atacado):", error.message)
    return { data: [], error, count: 0 }
  }

  console.log(`✅ Página ${page} | Clientes retornados:`, data.length, "| Total:", count)
  return { data, error: null, count }
}


// Updated for Credit validation
export async function getPendingCreditValidations(page = 1, itemsPerPage = 10) {
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const { data, error, count } = await supabaseServerClient
    .from("customer_forms")
    .select("*", { count: "exact" })
    .in("status", ["approved by the tax team", "review requested by the credit team - customer"]) // From Wholesale or rejected by credit
    .range(from, to)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("❌ Erro ao buscar clientes pendentes (Crédito):", error.message)
    return { data: [], error, count: 0 }
  }

  console.log(`✅ Página ${page} | Clientes retornados:`, data.length, "| Total:", count)
  return { data, error: null, count }
}

// Renamed and updated for final CSC validation



export async function getInvoicingCompanies() {
  const { data, error } = await supabaseServerClient.from("invoicing_companies").select("name")

  if (error) {
    console.error("Erro ao buscar empresas de faturamento:", error.message)
    return []
  }

  return data ?? []
}


export async function getCustomerValidationDetails(id: string) {
  if (!id) {
    console.error("ID do cliente não fornecido.");
    return null;
  }

  const { data, error } = await supabaseServerClient
    .from("customer_forms")
    .select(`
      id,
      created_at,
      status,
      customer_name,
      dba_number,
      duns_number,
      ap_contact_name,
      ap_contact_email,
      buyer_name,
      buyer_email,
      sales_tax_id,
      resale_certificate,
      billing_address,
      shipping_address,
      wholesale_status,
      wholesale_invoicing_company,
      wholesale_warehouse,
      wholesale_currency,
      wholesale_terms,
      wholesale_credit,
      wholesale_feedback,
      wholesale_discount,
      credit_status,
      credit_invoicing_company,
      credit_warehouse,
      credit_currency,
      credit_terms,
      credit_credit,
      credit_discount,
      credit_feedback,
      tax_feedback,
      csc_initial_feedback,
      csc_final_feedback,
      branding_mix,
      instagram,
      website,
      photo_urls,
      financial_statements,
      estimated_purchase_amount,
      currency,
      terms
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar detalhes do cliente:", error.message);
    return null;
  }

  return data;
}

export async function updateDunsNumber(customerId: string, duns: string) {
  const { error } = await supabaseServerClient.from("customer_forms").update({ duns_number: duns, updated_at: new Date().toISOString() }).eq("id", customerId) // Adiciona o timestamp de atualização

  if (error) {
    console.error("Error updating D-U-N-S number:", error)
    throw new Error(`Failed to update D-U-N-S number: ${error.message}`)
  }

  return { success: true }
}



export async function getWarehousesByCompany(invoicingCompany: string) {
  if (!invoicingCompany) return [] // 🚨 Evita consultas inválidas

  const { data, error } = await supabaseServerClient.from("warehouses").select("name").eq("invoicing_company", invoicingCompany)

  if (error) {
    console.error("Erro ao buscar armazéns:", error.message)
    return []
  }

  return data ?? []
}






export async function resetFormStatus(id: string) {
  try {
    console.log("Resetting form status for ID:", id)

    const { data, error } = await supabaseServerClient
      .from("customer_forms")
      .update({
        status: "pending",
        updated_at: new Date().toISOString(), // Add timestamp
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("supabaseServerClient reset status error:", error)
      throw new Error(error.message || "Failed to reset form status")
    }

    console.log("Form status reset successfully:", data)
    return { success: true, data }
  } catch (err) {
    console.error("Error in resetFormStatus:", err)
    throw err
  }
}


 export async function getCustomerFormById(customerId: string) {
   const response = await supabaseServerClient
     .from("customer_forms")
     .select("*")
     .eq("user_id", customerId)
     .single();



   return {
     data: response?.data ?? null,
     error: response?.error ?? null,
   };
 }

export async function getFeedbackTeams(customerId: string) {
  console.log("📌 ID recebido:", customerId);

  const supabase = createClient();
  const response = await supabase
    .from("customer_forms")
    .select("status, user_id, wholesale_feedback, credit_feedback, tax_feedback, csc_initial_feedback, csc_final_feedback")
    .eq("user_id", customerId)
    .single();

  console.log("Dados de feedback recebidos da supabaseServerClient:", response.data);
  if (response.error) { // Adicione esta verificação
    console.error("Erro ao buscar feedback no supabaseServerClient:", response.error); // Loga o erro
  }

  return {
    data: response?.data ?? null,
    error: response?.error ?? null,
  };
}