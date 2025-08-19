// app/api/send-email/route.ts

import { NextResponse } from 'next/server';
import WelcomeEmail from '../../../emails/WelcomeEmail'; // Ajuste o caminho conforme necessário
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json(); 
    
    console.log("Chave de API da Resend:", process.env.RESEND_API_KEY ? "Existe" : "Não existe"); // LOG ADICIONADO
    console.log("Corpo da requisição recebido:", { email, name }); // LOG ADICIONADO

    // Verificação adicional para garantir que os dados não são 'undefined'
    if (!email || !name) {
      console.error("Dados de email ou nome estão faltando.");
      return NextResponse.json({ error: "Dados de email ou nome estão faltando." }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'FARM RIO Onboarding <contact@customer.farmrio.com>',
      to: email, 
      subject: `FARM RIO Onboarding - Your account has been successfully created.`, 
      react: WelcomeEmail({ name }),
      attachments: [
    {
      path: 'https://qfnidijiykdjnbbtfvbl.supabase.co/storage/v1/object/public/email-images/welcome-anexo.jpg',
      filename: 'welcome-anexo.jpg',
    },
  ],
    });

    if (error) {
      console.error("Resend API Error:", error); // LOG ADICIONADO
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("E-mail enviado com sucesso:", data); // LOG ADICIONADO
    return NextResponse.json({ data });
  } catch (error) {
    console.error("General API Error:", error); // LOG ADICIONADO
    return NextResponse.json({ error }, { status: 500 });
  }
}