export async function sendEmail(to: string, name: string) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          name: "Farm Rio",
          email: "jefersonferreira27@outlook.com", // <- mesmo email que foi verificado no painel
        },
        to: [{ email: to, name }],
        subject: "Teste de envio com Outlook",
        htmlContent: `<p>Olá ${name}, este é um teste de envio usando Outlook como remetente.</p>`,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("❌ Erro ao enviar email:", response.status, response.statusText, responseText);
    } else {
      console.log("✅ Email enviado com sucesso:", responseText);
    }
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
  }
}
