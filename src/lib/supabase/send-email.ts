// supabase/functions/send-email-notification/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@1.0.0' // Ou o SDK do seu serviço de e-mail

const resend = new Resend(Deno.env.get('RESEND_API_KEY')) // Sua chave de API do Resend

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const { toEmail, customerName, newStatus, feedback } = await req.json()

    // Lógica para determinar o conteúdo do e-mail com base no status
    let subject = ''
    let body = ''

    switch (newStatus) {
      case 'approved by the CSC team':
        subject = `🎉 Sua solicitação foi APROVADA!`
        body = `Olá ${customerName},\n\nSua solicitação foi aprovada pela equipe CSC e está progredindo! Estamos empolgados em tê-lo(a) conosco.\n\nAtenciosamente,\nSua Equipe.`
        break
      case 'rejected by the CSC final team':
        subject = `❌ Sua solicitação foi REJEITADA - Ação Necessária`
        body = `Olá ${customerName},\n\nLamentamos informar que sua solicitação foi rejeitada pela equipe CSC. Por favor, revise os detalhes e faça as correções necessárias. Feedback: ${feedback || 'Nenhum feedback específico.'}\n\nAtenciosamente,\nSua Equipe.`
        break
      // Adicione mais casos para cada status (Tributário, Wholesale, Crédito, etc.)
      case 'approved by the tax team':
        subject = `✅ Sua solicitação foi aprovada pela equipe Tributária!`
        body = `Olá ${customerName},\n\nSua solicitação de cadastro avançou e foi aprovada pela nossa equipe Tributária. O próximo passo é a análise da equipe Wholesale.\n\nAtenciosamente,\nSua Equipe.`
        break
      case 'rejected by the tax team':
        subject = `⚠️ Sua solicitação foi REJEITADA pela equipe Tributária`
        body = `Olá ${customerName},\n\nSua solicitação foi revisada pela equipe Tributária e requer atenção. Por favor, verifique o feedback e faça as correções. Feedback: ${feedback || 'Nenhum feedback específico.'}\n\nAtenciosamente,\nSua Equipe.`
        break
      case 'approved by the wholesale team':
        subject = `🚀 Sua solicitação foi aprovada pela equipe Wholesale!`
        body = `Olá ${customerName},\n\nExcelente notícia! Sua solicitação foi aprovada pela nossa equipe Wholesale e seguirá para a etapa de Crédito.\n\nAtenciosamente,\nSua Equipe.`
        break
      case 'rejected by the wholesale team':
        subject = `🚫 Sua solicitação foi REJEITADA pela equipe Wholesale`
        body = `Olá ${customerName},\n\nSua solicitação foi rejeitada pela equipe Wholesale. Por favor, verifique o feedback e faça as correções. Feedback: ${feedback || 'Nenhum feedback específico.'}\n\nAtenciosamente,\nSua Equipe.`
        break
      case 'approved by the credit team':
        subject = `🥳 Sua conta está APROVADA - Bem-vindo(a)!`
        body = `Olá ${customerName},\n\nParabéns! Sua conta foi aprovada por todas as nossas equipes e você está pronto(a) para começar. Em breve você receberá informações sobre os próximos passos.\n\nAtenciosamente,\nSua Equipe.`
        break
      // Você pode adicionar um caso 'pending' ou 'data corrected by the client' se desejar notificar o cliente sobre o status inicial ou correções.
      default:
        subject = `Atualização de Status da Sua Solicitação`
        body = `Olá ${customerName},\n\nO status da sua solicitação foi atualizado para: ${newStatus}.\n\nAtenciosamente,\nSua Equipe.`
        break
    }

    if (!toEmail || !subject || !body) {
      return new Response(JSON.stringify({ error: 'Missing email parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data, error } = await resend.emails.send({
      from: 'Seu Nome <jefersonferreira27@outlook.com>', // Use um e-mail de remetente verificado
      to: [toEmail],
      subject: subject,
      html: `<p>${body.replace(/\n/g, '<br/>')}</p>`, // Converte quebras de linha para HTML
    })

    if (error) {
      console.error('Error sending email:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ message: 'Email sent successfully!', data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Request error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})