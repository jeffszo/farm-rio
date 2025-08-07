// app/api/send-form-confirmation/route.ts

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import FormSubmissionConfirmationEmail from '../../../emails/FormSubmissionConfirmationEmail';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name } = await req.json(); // Apenas o nome é necessário no body
    
    // 1. 🔐 Obtém o usuário autenticado do Supabase no lado do servidor
    // Utilize createServerActionClient para rotas de API
    const supabase = createServerActionClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("⚠️ Usuário não autenticado na API.");
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const recipientEmail = user.email;
    if (!recipientEmail) {
      console.error("⚠️ Email do usuário não encontrado.");
      return NextResponse.json({ error: "Email do usuário não encontrado." }, { status: 400 });
    }

    // 2. ✅ Envia o e-mail para o e-mail do usuário autenticado
    const { data, error } = await resend.emails.send({
      from: 'FARM RIO <contact@customer.farmrio.com>',
      to: recipientEmail, 
      subject: `Contact Confirmation - FARM RIO`, 
      react: FormSubmissionConfirmationEmail({ name }),
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("E-mail de confirmação enviado com sucesso:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("General API Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}