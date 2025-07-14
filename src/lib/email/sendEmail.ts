// // lib/email/sendEmail.ts
// import { Resend } from 'resend'; 

// console.log('Valor de RESEND_API_KEY:', process.env.RESEND_API_KEY); // ADICIONE ESTA LINHA TEMPORARIAMENTE

// const resend = new Resend(process.env.RESEND_API_KEY); // Use sua variável de ambiente

// interface EmailOptions {
//   to: string;
//   subject: string;
//   html: string;
//   // Ou text: string;
// }

// export async function sendEmailToCustomer({ to, subject, html }: EmailOptions) {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: 'FARM Rio <noreply@farmrio.customer>', // Seu e-mail verificado no provedor
//       to: [to],
//       subject: subject,
//       html: html,
//     });

//     if (error) {
//       console.error('❌ Erro ao enviar e-mail para o cliente:', error);
//       return { success: false, error };
//     }

//     console.log('✅ E-mail enviado com sucesso para:', to, data);
//     return { success: true, data };
//   } catch (err) {
//     console.error('❌ Erro inesperado no serviço de e-mail:', err);
//     return { success: false, error: err };
//   }
// }