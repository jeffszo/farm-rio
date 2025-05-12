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
