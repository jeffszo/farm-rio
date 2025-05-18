import { supabase } from "./client"

export async function submitForm(formData: unknown, userId: string) {
  interface FormData {
    customer_name: string
    sales_tax_id: string
    resale_certificate?: string | null
    billing_address: string[]
    shipping_address: string[]
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

    // 🔍 Verifica se já existe formulário
    const { data: existingForm, error: checkError } = await supabase
      .from("customer_forms")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError) throw new Error(`Erro ao verificar formulário existente: ${checkError.message}`);

    const payload = {
      user_id: userId,
      customer_name,
      sales_tax_id,
      resale_certificate: resale_certificate ?? null,
      billing_address: JSON.stringify(billing_address),
      shipping_address: JSON.stringify(shipping_address),
      ap_contact_name,
      ap_contact_email,
      buyer_name,
      buyer_email,
      dba_number: dba_number ?? null,
      duns_number: duns_number ?? null,
      status: "pending",
    };

    if (existingForm) {
      // 🔄 Atualiza formulário existente
      const { error: updateError } = await supabase
        .from("customer_forms")
        .update(payload)
        .eq("id", existingForm.id);

      if (updateError) throw new Error(`Erro ao atualizar formulário: ${updateError.message}`);
      return { id: existingForm.id, updated: true };
    } else {
      // 🆕 Insere novo formulário
      const { data, error } = await supabase
        .from("customer_forms")
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(`Erro ao enviar formulário: ${error.message}`);
      return data;
    }
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
    .order("created_at", { ascending: false }) // 🔽 Último formulário
    .limit(1)
    .maybeSingle() // 🔥 Retorna null se não houver dados

  if (error) {
    console.error("Erro ao buscar status do formulário:", error.message)
    return null
  }
  
  console.log("🔥 Dados brutos da query:", data); // ✅ Adicione esse log


  return data
}




export async function getCustomerFormById(userId: string) {
  const { data, error } = await supabase
    .from("customer_forms")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Erro ao buscar formulário:", error)
    return null
  }

  return data
}



export async function updateForm(formData: string, formId: string) {
  try {
    // Parse the formData string into an object
    const parsedData = JSON.parse(formData)

    // Perform the update using the correct column (id, not user_id)
    const { data, error } = await supabase
      .from("customer_forms")
      .update(parsedData)
      .eq("user_id", formId) // Use "id" instead of "user_id"
      .select() // Return the updated data

    if (error) {
      console.error("Erro ao atualizar formulário:", error)
      throw new Error(error.message)
    }

    console.log("Update successful, returned data:", data)
    return data
  } catch (error) {
    console.error("Erro ao processar atualização:", error)
    throw error
  }
}