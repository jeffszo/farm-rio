
// interface CustomerInfo {
//   customerName: string;
//   status: string;
//   feedback?: string; // Opcional para feedback de rejeição
// }

// export const getValidationEmailTemplate = ({ customerName, status, feedback }: CustomerInfo): { subject: string; html: string } => {
//   const subject = `Atualização sobre o seu cadastro: ${status}`;
//   let bodyHtml = `
//     <p>Prezado(a) ${customerName},</p>
//     <p>Gostaríamos de informar que o status do seu cadastro foi atualizado.</p>
//     <p><strong>Status atual:</strong> ${status}</p>
//   `;

//   if (feedback) {
//     bodyHtml += `<p><strong>Feedback da equipe:</strong> ${feedback}</p>`;
//   }

//   bodyHtml += `
//     <p>Agradecemos a sua paciência.</p>
//     <p>Atenciosamente,</p>
//     <p>A Equipe do Seu Sistema</p>
//   `;

//   return { subject, html: bodyHtml };
// };