// app/api/send-approved-email/route.ts

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import ApprovedEmail from '../../../../emails/ApprovedEmailCSCFinal'; // Import the ApprovedEmail component

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json(); 

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios." }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'FARM RIO Onboarding <governance@customer.farmrio.com>',
      to: email, 
      subject: `FARM RIO Onboarding - Your onboarding is now complete!`, 
      react: ApprovedEmail(),
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("E-mail de aprovação enviado com sucesso:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("General API Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}