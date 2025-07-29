// // src/app/api/send-form-submission-email/route.ts
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
// console.log("📨 Request received for sending form email (App Router)");

// const body = await req.json();
// const { recipientEmail, recipientName, formData } = body; // Expect more general data

// if (!recipientEmail || !recipientName || !formData) {
// console.warn("⚠️ Missing data in the body for sending form email.");
// return NextResponse.json({ message: "Recipient and form data are required." }, { status: 400 });
// }

// try {
// const response = await fetch("https://api.brevo.com/v3/smtp/email", {
// method: "POST",
// headers: {
// "Content-Type": "application/json",
// "api-key": process.env.BREVO_API_KEY!,
// },
// body: JSON.stringify({
// sender: {
// name: "Farm Rio",
// email: "jefersonferreira27@outlook.com", // Validated sender
// },
// to: [{ email: recipientEmail, name: recipientName }],
// subject: "Onboarding Form Sent!", // Subject for internal notification
// htmlContent: `
// <p>Hello Team,</p>
// <p>A new onboarding form was submitted by <strong>${recipientName}</strong> (${recipientEmail}).</p>
// <p>Form Details:</p>
// <ul>
// <li>Legal Name: ${formData.customerInfo?.legalName || 'N/A'}</li>
// <li>Tax ID: ${formData.customerInfo?.taxId || 'N/A'}</li>
// <li>Website: ${formData.website || 'N/A'}</li>
// </ul>
// <p>Please access the dashboard to review all the details.</p>
// <p>Farm Rio Team 💚</p>
// `,
// }),
// });

// const text = await response.text();
// console.log("📥 Brevo's Response:", response.status, response.statusText);
// console.log("📄 Response Body:", text);

// if (!response.ok) {
// console.error("❌ Error sending form email:", response.status, text);
// return NextResponse.json({ error: text }, { status: response.status });
// }

// console.log("✅ Form email sent successfully");
// return NextResponse.json({ message: "Form email sent successfully!" }, { status: 200 });

// } catch (error) {
// console.error("❌ Unexpected error sending form email:", error);
// return NextResponse.json({ error: "Error sending form email", details: error }, { status: 500 });
// }
// }