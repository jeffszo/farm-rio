import { supabaseServerClient } from './index';
import { createClient } from './client';

import { v4 as uuidv4 } from 'uuid'

export async function uploadResaleCertificate(file: File, customerId: string) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${customerId}.${fileExt}`
  const filePath = `${fileName}` // Evita duplicação de diretório

  // Upload
  const { error } = await supabaseServerClient.storage
    .from("resalecertificates")
    .upload(filePath, file, { upsert: true })

  if (error) {
    throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`)
  }

  // Link assinado por 10 anos
  const { data: signedUrlData, error: signedUrlError } = await supabaseServerClient.storage
    .from("resalecertificates")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10)

  if (signedUrlError) {
    throw new Error(`Erro ao gerar link assinado: ${signedUrlError.message}`)
  }
  if (!signedUrlData?.signedUrl) {
    throw new Error("Erro desconhecido ao gerar link assinado.")
  }

  const signedUrl = signedUrlData.signedUrl

  // Salva no banco
  const { error: dbError } = await supabaseServerClient
    .from("customer_forms")
    .update({ resale_certificate: signedUrl })
    .eq("id", customerId)

  if (dbError) {
    throw new Error(`Erro ao salvar URL no banco de dados: ${dbError.message}`)
  }

  return signedUrl
}


/**
 * Upload de imagens (múltiplas fotos)
 */
export async function uploadImage(file: File, customerId: string): Promise<string> {
  const supabase = createClient();

  console.log("📦 Iniciando upload da imagem...");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("👤 Usuário autenticado:", user?.id);
  if (userError) {
    console.error("❌ Erro ao obter usuário:", userError.message);
  }

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  if (customerId !== user.id) {
    console.log("🔒 Verificando permissão para o customerId:", customerId);

    const {
      data: customer,
      error: customerError,
    } = await supabase
      .from("customer_forms")
      .select("id")
      .eq("id", customerId)
      .eq("user_id", user.id)
      .single();

    if (customerError) {
      console.error("❌ Erro ao verificar cliente:", customerError.message);
    }

    if (!customer) {
      throw new Error("Sem permissão para fazer upload para este cliente");
    }

    console.log("✅ Permissão confirmada para upload do cliente:", customerId);
  }

  const uniqueSuffix = uuidv4();
  const fileName = `${customerId}/${uniqueSuffix}-${file.name}`;
  const filePath = fileName;

  console.log("📁 Caminho do arquivo a ser enviado:", filePath);
  console.log("🗂️ Nome original do arquivo:", file.name);

  const { error } = await supabase.storage
    .from("customerimages")
    .upload(filePath, file, { upsert: false });

  if (error) {
    console.error("❌ Erro ao fazer upload da imagem:", error.message);
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }

  console.log("✅ Upload realizado com sucesso!");

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("customerimages")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 anos

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error("❌ Erro ao gerar link assinado:", signedUrlError?.message);
    throw new Error("Erro ao gerar link da imagem.");
  }

  console.log("🔗 Link assinado gerado com sucesso:", signedUrlData.signedUrl);

  return signedUrlData.signedUrl;
}

export async function uploadFinancialStatements(
  file: File,
  customerId: string
): Promise<string> {
  const supabase = createClient();

  console.log("📦 Iniciando upload do demonstrativo financeiro...");

  // Verificar autenticação do usuário
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("👤 Usuário autenticado:", user?.id);
  console.log("👤 Customer ID:", customerId);

  if (userError) {
    throw new Error(`Erro ao obter usuário: ${userError.message}`);
  }

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Verificar permissão para o customerId
  if (customerId !== user.id) {
    const { data: customer, error: customerError } = await supabase
      .from("customer_forms")
      .select("id, user_id")
      .eq("id", customerId)
      .eq("user_id", user.id)
      .single();

    if (customerError) {
      throw new Error(`Erro ao verificar cliente: ${customerError.message}`);
    }

    if (!customer) {
      throw new Error("Sem permissão para fazer upload para este cliente");
    }
  }

  // Pega a extensão do arquivo (ex.: .pdf, .png, .docx)
  const extension = file.name.includes(".")
    ? file.name.substring(file.name.lastIndexOf("."))
    : "";

  // Nome final: customerId.extensão
  const filePath = `${customerId}${extension}`;

  console.log("📁 Caminho do arquivo a ser enviado:", filePath);

  // Upload direto no bucket (sem pasta), sobrescrevendo se existir
  const { error: uploadError } = await supabase.storage
    .from("financialstatements")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`);
  }

  console.log("✅ Upload realizado com sucesso!");

  // Gera link assinado válido por 10 anos
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("financialstatements")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error("Erro ao gerar link assinado.");
  }

  const signedUrl = signedUrlData.signedUrl;

  // Salva o link no banco
  const { error: dbError } = await supabase
    .from("customer_forms")
    .update({ financial_statements: signedUrl })
    .eq("id", customerId);

  if (dbError) {
    throw new Error(`Erro ao salvar URL no banco: ${dbError.message}`);
  }

  console.log("💾 URL salva no banco de dados com sucesso");

  return signedUrl;
}