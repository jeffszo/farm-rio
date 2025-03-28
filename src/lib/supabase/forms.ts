import { supabase } from "./client"

export async function submitForm(formData: any, userId: string) {
  const { data, error } = await supabase
    .from("customer_forms")
    .insert([
      {
        user_id: userId,
        customer_name: formData.customer_name,
        sales_tax_id: formData.sales_tax_id,
        resale_certificate: formData.resale_certificate ?? null,
        billing_address: formData.billing_address,
        shipping_address: formData.shipping_address,
        ap_contact_name: formData.ap_contact_name,
        ap_contact_email: formData.ap_contact_email,
        buyer_name: formData.buyer_name,
        buyer_email: formData.buyer_email,
        status: "pending",
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Erro ao enviar formulário: ${error.message}`)
  return data
}

export async function getFormStatus(userId: string) {
  const { data, error } = await supabase
    .from("customer_forms")
    .select("status, feedback")
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

