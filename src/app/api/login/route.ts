import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    if (req.method !== "POST") {
      return NextResponse.json({ success: false, message: "Método não permitido" }, { status: 405 });
    }

    const { email, password } = await req.json();

    // 🔍 1️⃣ Verifica se o usuário está na tabela `team_users`
    const { data: teamUser } = await supabase
      .from("team_users")
      .select("id, email, team_role, password")
      .eq("email", email)
      .single();

    if (teamUser) {
      // 🔐 Compara a senha criptografada usando `pgcrypto`
      
      const { data: validUser, error: passwordError } = await supabase
      .rpc('verify_team_user_password', {
        user_email: email,
        plain_password: password
      })
      .select('id')
      .single();

      if (!validUser || passwordError) {
        return NextResponse.json({ success: false, message: "Senha incorreta." }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: { id: teamUser.id, email: teamUser.email, role: teamUser.team_role },
      });
    }

    // 🔍 2️⃣ Se não está em `team_users`, verifica no Supabase Auth (clientes)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.json({ success: false, message: "Usuário ou senha inválidos." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: { id: data.user.id, email: data.user.email, role: "cliente" },
    });
  } catch (error) {
    console.error("Erro na API de login:", error);
    return NextResponse.json({ success: false, message: "Erro interno no servidor." }, { status: 500 });
  }
}
