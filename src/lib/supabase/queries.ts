import { supabase } from "./client"

export async function getApprovedCustomers() {
  const { data, error } = await supabase
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
      credit_discount
    `)
    .eq("status", "approved by the CSC team");

  if (error) {
    console.error("Erro ao buscar formulários de clientes:", error.message);
    return [];
  }

  return data || [];
}



export async function getPendingValidations(page = 1, itemsPerPage = 10) {
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const { data, error, count } = await supabase
    .from("customer_forms")
    .select("*", { count: "exact" }) // 🔥 Pegando a contagem exata dos registros
    .in("status", ["pending", "rejected by credit team"])
    .range(from, to) // 🔥 Pegando apenas os clientes da página atual
    .order("created_at", { ascending: true })

  if (error) {
    console.error("❌ Erro ao buscar clientes pendentes:", error.message)
    return { data: [], error, count: 0 }
  }

  console.log(`✅ Página ${page} | Clientes retornados:`, data.length, "| Total:", count)
  return { data, error: null, count }
}

export async function getPendingCreditValidations(page = 1, itemsPerPage = 10) {
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const { data, error, count } = await supabase
    .from("customer_forms")
    .select("*", { count: "exact" }) // 🔥 Pegando a contagem exata dos registros
    .in("status", ["approved by the wholesale team"]) // 🔥 Busca múltiplos status
    .range(from, to) // 🔥 Pegando apenas os clientes da página atual
    .order("created_at", { ascending: true })

  if (error) {
    console.error("❌ Erro ao buscar clientes pendentes:", error.message)
    return { data: [], error, count: 0 }
  }

  console.log(`✅ Página ${page} | Clientes retornados:`, data.length, "| Total:", count)
  return { data, error: null, count }
}



export async function getPendingCSCValidations(page = 1, itemsPerPage = 10) {
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const { data, error, count } = await supabase
    .from("customer_forms")
    .select("*", { count: "exact" }) // 🔥 Pegando a contagem exata dos registros
    .in("status", ["approved by the credit team", "approved by the CSC team", "data corrected by client"]) 
    .range(from, to) // 🔥 Pegando apenas os clientes da página atual
    .order("created_at", { ascending: true })

  if (error) {
    console.error("❌ Erro ao buscar clientes pendentes:", error.message)
    return { data: [], error, count: 0 }
  }

  console.log(`✅ Página ${page} | Clientes retornados:`, data.length, "| Total:", count)
  return { data, error: null, count }
}

export async function getInvoicingCompanies(): Promise<string[]> {
  const { data, error } = await supabase
    .from("warehouses")
    .select("invoicing_company");

  if (error) {
    console.error("Error fetching invoicing companies:", error);
    throw new Error("Failed to fetch invoicing companies");
  }

  // Removendo duplicatas no JavaScript
  const uniqueCompanies = Array.from(new Set((data ?? []).map((item) => item.invoicing_company)));

  return uniqueCompanies;
}


export async function getCustomerValidationDetails(customerId: string) {
  const { data, error } = await supabase
    .from("customer_forms")
    .select("*")
    .eq("id", customerId) // agora é .eq("id", ...)
    .single();

  if (error) {
    console.error("Erro ao buscar dados do cliente:", error);
    return null;
  }

  return data;
}




export async function updateDunsNumber(customerId: string, duns: string) {
  const { error } = await supabase.from("customer_forms").update({ duns_number: duns }).eq("id", customerId)

  if (error) {
    console.error("Error updating D-U-N-S number:", error)
    throw new Error(`Failed to update D-U-N-S number: ${error.message}`)
  }

  return { success: true }
}



export async function getWarehousesByCompany(invoicingCompany: string) {
  if (!invoicingCompany) return [] // 🚨 Evita consultas inválidas

  const { data, error } = await supabase.from("warehouses").select("name").eq("invoicing_company", invoicingCompany)

  if (error) {
    console.error("Erro ao buscar armazéns:", error.message)
    return []
  }

  return data ?? []
}







export async function resetFormStatus(id: string) {
  try {
    console.log("Resetting form status for ID:", id)

    const { data, error } = await supabase
      .from("customer_forms")
      .update({
        status: "pending",
        updated_at: new Date().toISOString(), // Add timestamp
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Supabase reset status error:", error)
      throw new Error(error.message || "Failed to reset form status")
    }

    console.log("Form status reset successfully:", data)
    return data
  } catch (error) {
    console.error("Error resetting form status:", error)
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error("Unknown error occurred while resetting form status")
    }
  }
}