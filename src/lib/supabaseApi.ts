import { createClient } from "@supabase/supabase-js"
import type { AuthAPI, User } from "../types/api"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export class SupabaseAPI implements AuthAPI {
  async signUp(name: string, email: string, password: string, userType: User["userType"]): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name,
          userType,
        },
      },
    })

    if (error) throw error
    if (!data.user) throw new Error("User not created")

    const { error: insertError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        name,
        email,
        role: userType,
      },
    ])

    if (insertError) throw insertError

    return {
      id: data.user.id,
      name,
      email: data.user.email!,
      userType,
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error("User not found")

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (userError) throw new Error("Error fetching user type")

    return {
      id: data.user.id,
      name: data.user.user_metadata?.name || "",
      email: data.user.email!,
      userType: userData.role,
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return null
    }

    if (!session) {
      return null
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Error getting user:", userError)
      return null
    }

    if (!user) {
      return null
    }

    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (userDataError) {
      console.error("Error fetching user data:", userDataError)
      return null
    }

    return {
      id: user.id,
      name: user.user_metadata?.name || "",
      email: user.email!,
      userType: userData?.role || user.user_metadata?.userType || "",
    }
  }

  async submitForm(formData: any, userId: string) {
    const { data, error } = await supabase
      .from("customer_forms")
      .insert([
        {
          user_id: userId,
          customer_name: formData.customerInfo.legalName,
          sales_tax_id: formData.customerInfo.taxId,
          resale_certificate: formData.customerInfo.resaleCertNumber,
          billing_address: JSON.stringify(formData.billingAddress),
          shipping_address: JSON.stringify(formData.shippingAddress),
          ap_contact_name: `${formData.apContact.firstName} ${formData.apContact.lastName}`,
          ap_contact_email: formData.apContact.email,
          buyer_name: `${formData.buyerInfo.firstName} ${formData.buyerInfo.lastName}`,
          buyer_email: formData.buyerInfo.email,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getFormStatus(userId: string) {
    const { data, error } = await supabase
      .from("customer_forms")
      .select("status, feedback")
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }
}

export const api = new SupabaseAPI()

