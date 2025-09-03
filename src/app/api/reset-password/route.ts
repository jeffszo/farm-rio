/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/api/reset-password.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

  try {
    // Busca o usuário pelo e-mail
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    const user = users?.users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Atualiza a senha do usuário encontrado
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password });
    if (error) throw error;
    if (error) throw error;

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error updating password.";
    return res.status(500).json({ message: errorMessage });
  }
}
