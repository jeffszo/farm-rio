import { supabase } from "./client"

export async function uploadResaleCertificate(file: File, customerId: string) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${customerId}.${fileExt}`
  const filePath = `${fileName}` // Evita duplicação de diretório

  // Upload
  const { error } = await supabase.storage
    .from("resalecertificates")
    .upload(filePath, file, { upsert: true })

  if (error) {
    throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`)
  }

  // Link assinado por 10 anos
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
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
  const { error: dbError } = await supabase
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
  const fileName = `${customerId}/${uniqueSuffix}-${file.name}`
  const filePath = fileName

  const { error } = await supabase.storage
    .from("customerimages")
    .upload(filePath, file, { upsert: false })

  if (error) throw new Error(`Erro ao fazer upload da imagem: ${error.message}`)

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("customerimages")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10)

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error("Erro ao gerar link da imagem.")
  }

  return signedUrlData.signedUrl
}



export async function uploadFinancialStatements(file: File, customerId: string) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${customerId}.${fileExt}`
  const filePath = `${fileName}`

  // Upload para bucket
  const { error: uploadError } = await supabase.storage
    .from("financialstatements")
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`)
  }

  // Cria URL assinada válida por 10 anos
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
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
  const { error: dbError } = await supabase
    .from("customer_forms")
    .update({ financial_statements: signedUrl })// 🆕 novo campo
    .eq("id", customerId)

  if (dbError) {
    throw new Error(`Erro ao salvar URL no banco de dados: ${dbError.message}`)
  }

  return signedUrl
}
