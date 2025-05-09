import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1️⃣ Verifica na tabela interna `team_users`
    const { data: teamUser } = await supabase
      .from("team_users")
      .select("id, email, team_role, password")
      .eq("email", email)
      .single();

    if (teamUser) {
      const { data: validUser, error: passwordError } = await supabase
        .rpc("verify_team_user_password", {
          user_email: email,
          plain_password: password,
        })
        .select("id")
        .single();

      if (!validUser || passwordError) {
        return NextResponse.json({ success: false, message: "Senha incorreta." }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: { id: teamUser.id, email: teamUser.email, role: teamUser.team_role },
      });
    }

    // 2️⃣ Caso não seja team, tenta autenticar como cliente via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.json({ success: false, message: "Invalid username or password." }, { status: 401 });
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
