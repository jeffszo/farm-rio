import { supabase } from "./client"

export async function uploadResaleCertificate(file: File, userId: string) {
  try {
    console.log("Starting file upload for user:", userId)
    console.log("File details:", { name: file.name, type: file.type, size: file.size })

    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `resalecertificates/${fileName}`

    console.log("Generated file path:", filePath)

    // Make sure the bucket exists and is accessible
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log("Available buckets:", buckets)

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      throw new Error(`Cannot access storage buckets: ${bucketsError.message}`)
    }

    // Check if our bucket exists
    const bucketExists = buckets.some((bucket) => bucket.name === "resalecertificates")
    if (!bucketExists) {
      console.error("Bucket 'resalecertificates' does not exist")
      throw new Error("Storage bucket 'resalecertificates' does not exist")
    }

    // Upload with more detailed error handling
    const { error: uploadError, data } = await supabase.storage.from("resalecertificates").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Use upsert to overwrite if file exists
    })

    if (uploadError) {
      console.error("Upload error details:", uploadError)
      throw new Error(`File upload failed: ${uploadError.message}`)
    }

    console.log("Upload successful, data:", data)

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("resalecertificates").getPublicUrl(filePath)

    console.log("Generated public URL:", publicUrl)
    return publicUrl
  } catch (error) {
    console.error("Detailed error in uploadResaleCertificate:", error)
    // Rethrow with more context
    if (error instanceof Error) {
      throw new Error(`File upload failed: ${error.message}`)
    } else {
      throw new Error("Unknown error during file upload")
    }
  }
}