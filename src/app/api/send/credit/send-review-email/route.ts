// app/api/send/csc_initial/send-review-email/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import ReviewEmail from '../../../../emails/ReviewEmailCredit'; // Ajuste o caminho de importação, se necessário

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // ✅ Alterando para extrair também o feedback
    const { name, email, feedback } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios." }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'FARM RIO <credit@customer.farmrio.com>',
      to: email,
      subject: `Your FARM RIO account is under review`,
      react: ReviewEmail({ feedback }), 
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("E-mail de revisão enviado com sucesso:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("General API Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}