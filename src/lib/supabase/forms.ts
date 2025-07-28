import { supabase } from "./client"

export async function submitForm(formData: unknown, userId: string) {
  interface FormData {
    customer_name: string;
    sales_tax_id: string;
    resale_certificate?: string | null;
    billing_address: unknown[]; // Usar 'any[]' ou definir uma interface para o endereço
    shipping_address: unknown[]; // Usar 'any[]' ou definir uma interface para o endereço
    ap_contact_name: string;
    ap_contact_email: string;
    ap_contact_country_code?: number | null; // Adicionado
    ap_contact_number?: number | null; // Adicionado
    buyer_name: string;
    buyer_email: string;
    buyer_country_code?: number | null; // Adicionado
    buyer_number?: number | null; // Adicionado
    dba_number?: string | null;
    duns_number?: string | null;
    photo_urls?: string[]; // Adicionado
    branding_mix?: string | null; // Adicionado
    instagram?: string | null; // Adicionado
    website?: string | null; // Adicionado
    terms?: string | null; // Adicionado
    currency?: string | null; // Adicionado
    estimated_purchase_amount?: number | null; // Adicionado
    financial_statements?: string | null; // Adicionado (URL do arquivo)
    status: string; // Adicionado, embora já estivesse no payload, é bom explicitá-lo aqui
  }

  if (typeof formData === "object" && formData !== null) {
    const {
      customer_name,
      sales_tax_id,
      resale_certificate,
      billing_address,
      shipping_address,
      ap_contact_name,
      ap_contact_email,
      ap_contact_country_code, // Desestruturado
      ap_contact_number, // Desestruturado
      buyer_name,
      buyer_email,
      buyer_country_code, // Desestruturado
      buyer_number, // Desestruturado
      dba_number,
      duns_number,
      photo_urls, // Desestruturado
      branding_mix, // Desestruturado
      instagram, // Desestruturado
      website, // Desestruturado
      terms, // Desestruturado
      currency, // Desestruturado
      estimated_purchase_amount, // Desestruturado
      financial_statements, // Desestruturado
      status, // Desestruturado (se vier do formData)
    } = formData as FormData;

    // 🔍 Verifica se já existe formulário
    const { data: existingForm, error: checkError } = await supabase
      .from("customer_forms")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError)
      throw new Error(`Erro ao verificar formulário existente: ${checkError.message}`);

    const payload = {
      user_id: userId,
      customer_name,
      sales_tax_id,
      resale_certificate: resale_certificate ?? null,
      billing_address: JSON.stringify(billing_address),
      shipping_address: JSON.stringify(shipping_address),
      ap_contact_name,
      ap_contact_email,
      ap_contact_country_code: ap_contact_country_code ?? null, // Adicionado ao payload
      ap_contact_number: ap_contact_number ?? null, // Adicionado ao payload
      buyer_name,
      buyer_email,
      buyer_country_code: buyer_country_code ?? null, // Adicionado ao payload
      buyer_number: buyer_number ?? null, // Adicionado ao payload
      dba_number: dba_number ?? null,
      duns_number: duns_number ?? null,
      photo_urls: photo_urls || [], // Adicionado ao payload, garantindo array vazio se null/undefined
      branding_mix: branding_mix ?? null, // Adicionado ao payload
      instagram: instagram ?? null, // Adicionado ao payload
      website: website ?? null, // Adicionado ao payload
      terms: terms ?? null, // Adicionado ao payload
      currency: currency ?? null, // Adicionado ao payload
      estimated_purchase_amount: estimated_purchase_amount ?? null, // Adicionado ao payload
      financial_statements: financial_statements ?? null, // Adicionado ao payload
      status: status ?? "pending", // Garante que o status seja 'pending' se não for fornecido
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
    .select("status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.log("Erro ao buscar status do formulário:", error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  return data[0]; // ✅ retorna o formulário mais recente
}





export async function getCustomerFormById(userId: string) {
  const { data, error } = await supabase
    .from("customer_forms")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.log("Erro ao buscar formulário:", error)
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
      .eq("id", formId) // Use "id" instead of "user_id"
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