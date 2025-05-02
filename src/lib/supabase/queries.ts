import { supabase } from "./client"

export async function getApprovedCustomers() {
  // Primeira consulta para obter os dados da tabela customer_forms
  const { data: customerForms, error: customerFormsError } = await supabase
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
      id
    `)
    .eq("status", "approved by the CSC team");

  if (customerFormsError) {
    console.error("Erro ao buscar formulários de clientes:", customerFormsError.message);
    return [];
  }

  // Segunda consulta para obter os dados da tabela validations
  const { data: validations, error: validationsError } = await supabase
    .from("validations")
    .select(`
      customer_id,
      credito_invoicing_company,
      credito_warehouse,
      credito_currency,
      credito_credit,
      credito_discount
    `);

  if (validationsError) {
    console.error("Erro ao buscar validações:", validationsError.message);
    return [];
  }

  // Junta os dados da tabela customer_forms com os dados da tabela validations
  const formattedData = customerForms.map((customer) => {
    // Busca a validação correspondente ao cliente
    const validation = validations.find((v) => v.customer_id === customer.id);

    return {
      ...customer,
      credito_invoicing_company: validation?.credito_invoicing_company,
      credito_warehouse: validation?.credito_warehouse,
      credito_currency: validation?.credito_currency,
      credito_credit: validation?.credito_credit,
      credito_discount: validation?.credito_discount,
    };
  });


  return formattedData || [];
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
    .filter('status', 'in', '("approved by the credit team","approved by the CSC team")')
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
    .from("validations")
    .select("*")
    .eq("customer_id", customerId)
    .single();

  if (error) {
    console.error("Erro ao buscar validações:", error);
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

// Add these methods to your existing api object

// Get form by ID\

export async function getFormById(formId: string)
{
  try {
    console.log("🔍 Buscando formulário com ID:", formId);
    const { data, error } = await supabase.from("customer_forms").select("*").eq("id", formId).single()

    if (error) throw error
    return data;
  } catch (error) {
    console.error("Error fetching form by ID:", error)
    throw error
  }
}


// Update form data
export async function updateForm(formData: unknown, formId: string)
{
  try {
    const { error } = await supabase.from("customer_forms").update(formData).eq("id", formId)

    if (error) throw error
    return true;
  } catch (error) {
    console.error("Error updating form:", error)
    throw error
  }
}


// Update form status
export async function updateFormStatus(formId: string, status: string)
{
  try {
    const { error } = await supabase.from("customer_forms").update({ status }).eq("id", formId)

    if (error) throw error
    return true;
  } catch (error) {
    console.error("Error updating form status:", error)
    throw error
  }
}
