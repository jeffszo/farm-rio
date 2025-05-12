import { supabase } from "./client"

export async function submitForm(formData: unknown, userId: string) {
  interface FormData {
    customer_name: string
    sales_tax_id: string
    resale_certificate?: string | null
    billing_address: string[] // agora é um array
    shipping_address: string[] // agora é um array
    ap_contact_name: string
    ap_contact_email: string
    buyer_name: string
    buyer_email: string
    dba_number?: string | null
    duns_number?: string | null
  }

  if (typeof formData === 'object' && formData !== null) {
    const {
      customer_name,
      sales_tax_id,
      resale_certificate,
      billing_address,
      shipping_address,
      ap_contact_name,
      ap_contact_email,
      buyer_name,
      buyer_email,
      dba_number,
      duns_number
    } = formData as FormData;

    const { data, error } = await supabase
      .from("customer_forms")
      .insert([
        {
          user_id: userId,
          customer_name,
          sales_tax_id,
          resale_certificate: resale_certificate ?? null,
          billing_address: JSON.stringify(billing_address), // ✅ transformando para JSON
          shipping_address: JSON.stringify(shipping_address), // ✅ transformando para JSON
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
      .single();

    if (error) throw new Error(`Erro ao enviar formulário: ${error.message}`);
    return data;
  } else {
    throw new Error("formData não possui o formato esperado.");
  }
}


interface FormStatusData {
  status: string
  csc_feedback: string
}

export async function getFormStatus(userId: string): Promise<FormStatusData | null> {

  
  const { data, error } = await supabase
    .from("customer_forms")
    .select("status, csc_feedback")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("Erro ao buscar status do formulário:", error.message)
    return null
  }

  return data
}



export async function getCustomerFormById(userId: string) {
  const { data, error } = await supabase
    .from("customer_forms")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("Erro ao buscar formulário:", error)
    return null
  }

  return data
}


