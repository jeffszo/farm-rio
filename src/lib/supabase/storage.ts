import { supabaseServerClient } from './index'; 


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
  const uniqueSuffix = uuidv4(); 
  const fileName = `${customerId}/${uniqueSuffix}-${file.name}`;
  const filePath = fileName;

  const { error } = await supabaseServerClient.storage
    .from("customerimages")
    .upload(filePath, file, { upsert: false });

  if (error) throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);

  const { data: signedUrlData, error: signedUrlError } = await supabaseServerClient.storage
    .from("customerimages")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 anos

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error("Erro ao gerar link da imagem.");
  }

  return signedUrlData.signedUrl;
}



// src/lib/supabase/storage.ts

export async function uploadFinancialStatements(file: File, customerId: string) {
  // Mantém o nome original do arquivo
  const originalFileName = file.name;
  // Cria o caminho no formato: [ID_DO_USUÁRIO]/[NOME_DO_ARQUIVO]
  const filePath = `${customerId}/${originalFileName}`;

  // Upload para o bucket
  const { error: uploadError } = await supabaseServerClient.storage
    .from("financialstatements")
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`)
  }

  // Cria URL assinada válida por 10 anos
  const { data: signedUrlData, error: signedUrlError } = await supabaseServerClient.storage
    .from("financialstatements")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10)

  if (signedUrlError) {
    throw new Error(`Erro ao gerar link assinado: ${signedUrlError.message}`)
  }

  if (!signedUrlData?.signedUrl) {
    throw new Error("Erro desconhecido ao gerar link assinado.")
  }

  const signedUrl = signedUrlData.signedUrl

  // Salva o link na tabela customer_forms
  const { error: dbError } = await supabaseServerClient
    .from("customer_forms")
    .update({ financial_statements: signedUrl })
    .eq("id", customerId)

  if (dbError) {
    throw new Error(`Erro ao salvar URL no banco de dados: ${dbError.message}`)
  }

  return signedUrl
}