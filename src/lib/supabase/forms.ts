import { supabase } from "./client"

export async function submitForm(formData: unknown, userId: string) {

  interface FormData {
    customer_name: string
    sales_tax_id: string
    resale_certificate?: string | null
    billing_address: string
    shipping_address: string
    ap_contact_name: string
    ap_contact_email: string
    buyer_name: string
    buyer_email: string
    dba_number?: string | null
    duns_number?: string | null
  }
  


  if (typeof formData === 'object' && formData !== null) {
    // Agora formData pode ser tratado como um objeto com propriedades
    const { customer_name, sales_tax_id, resale_certificate, billing_address, shipping_address, ap_contact_name, ap_contact_email, buyer_name, buyer_email, dba_number, duns_number } = formData as FormData;
  
    // Insira os dados no banco
    const { data, error } = await supabase
      .from("customer_forms")
      .insert([
        {
          user_id: userId,
          customer_name,
          sales_tax_id,
          resale_certificate: resale_certificate ?? null,
          billing_address,
          shipping_address,
          ap_contact_name,
          ap_contact_email,
          buyer_name,
          buyer_email,
          dba_number: dba_number ?? null,
          duns_number: duns_number ?? null,
          status: "pending",
        },
      ])
      .select()
      .single()
  
    if (error) throw new Error(`Erro ao enviar formulário: ${error.message}`)
    return data
  } else {
    throw new Error("formData não possui o formato esperado.")
  }
  
}

export async function getFormStatus(userId: string) {
  const { data, error } = await supabase
    .from("customer_forms")
    .select("status")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") throw new Error(`Erro ao buscar status do formulário: ${error.message}`)
  return data
}

export async function getCustomerFormById(customerId: string) {
  const { data, error } = await supabase.from("customer_forms").select("*").eq("id", customerId).single()

  if (error) {
    console.error("Erro ao buscar formulário do cliente:", error.message)
    return null
  }

  return data
}

