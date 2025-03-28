import { supabase } from "./client"

export async function uploadResaleCertificate(file: File, customerId: string) {
  const fileExt = file.name.split(".").pop() // Obtém a extensão do arquivo
  const fileName = `${customerId}.${fileExt}` // Nomeia o arquivo com o ID do cliente
  const filePath = `resalecertificates/${fileName}`

  // ✅ Upload para o Supabase Storage
  const { error } = await supabase.storage.from("resalecertificates").upload(filePath, file, { upsert: true })

  if (error) {
    throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`)
  }

  // ✅ Gerar um link assinado válido por 10 anos
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("resalecertificates")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10)

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error("Erro ao gerar link assinado.")
  }

  const signedUrl = signedUrlData.signedUrl

  // ✅ Atualizar a URL no banco de dados
  const { error: dbError } = await supabase
    .from("customer_forms")
    .update({ resale_certificate: signedUrl })
    .eq("id", customerId)

  if (dbError) {
    throw new Error(`Erro ao salvar URL no banco de dados: ${dbError.message}`)
  }

  return signedUrl
}

