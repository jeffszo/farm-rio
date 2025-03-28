import { supabase } from "./client"


export async function getApprovedCustomers() {
  const { data, error } = await supabase
    .from("customer_forms")
    .select(`
      created_at, 
      status, 
      customer_name, 
      ap_contact_name, 
      ap_contact_email, 
      buyer_name, 
      buyer_email, 
      sales_tax_id, 
      resale_certificate, 
      billing_address, 
      shipping_address,
      validations (
        customer_id,
        atacado_invoicing_company, 
        atacado_warehouse, 
        atacado_currency, 
        atacado_terms, 
        atacado_credit, 
        atacado_discount,
        credito_invoicing_company,
        credito_warehouse,
        credito_currency,
        credito_credit,
        credito_discount
      )
    `)
    .eq("status", "approved by the CSC team")

  console.log("Clientes aprovados:", data) // 🔍 Debug aqui

  if (error) {
    console.error("Erro ao buscar clientes aprovados:", error.message)
    return []
  }

  return data || []
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
    .in("status", ["approved by the wholesale team", "rejected by CSC team"]) // 🔥 Busca múltiplos status
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
    .eq("status", "approved by the credit team")
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




export async function getWarehousesByCompany(invoicingCompany: string) {
  if (!invoicingCompany) return [] // 🚨 Evita consultas inválidas

  const { data, error } = await supabase.from("warehouses").select("name").eq("invoicing_company", invoicingCompany)

  if (error) {
    console.error("Erro ao buscar armazéns:", error.message)
    return []
  }

  return data ?? []
}

