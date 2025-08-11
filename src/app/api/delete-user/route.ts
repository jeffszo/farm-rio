import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // cuidado, use SERVICE ROLE na API server-side
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // 1. Deletar dados na tabela customer_forms
    const { error: errorCustomerForms } = await supabase
      .from("customer_forms")
      .delete()
      .eq("user_id", userId);

    if (errorCustomerForms) {
      return NextResponse.json({ error: errorCustomerForms.message }, { status: 500 });
    }

    // 2. Deletar dados na tabela users
    const { error: errorUsers } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (errorUsers) {
      return NextResponse.json({ error: errorUsers.message }, { status: 500 });
    }

    // 3. Deletar usuário da autenticação do Supabase
    const { error: errorAuth } = await supabase.auth.admin.deleteUser(userId);
    if (errorAuth) {
      return NextResponse.json({ error: errorAuth.message }, { status: 500 });
    }

    return NextResponse.json({ message: "User and related data deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
