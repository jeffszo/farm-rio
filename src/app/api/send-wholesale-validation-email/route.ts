// // src/app/api/send-wholesale-validation-email/route.ts
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
// console.log("📨 Request received to send Wholesale validation email (App Router)");

// const body = await req.json();
// const { customerId, customerName, customerEmail, validationStatus, feedback } = body;

// if (!customerId || !customerName || !customerEmail || validationStatus === undefined || validationStatus === null) {
// console.warn("⚠️ Missing data in the body for sending Wholesale validation email.");
// return NextResponse.json({ message: "Customer ID, name, email, and validation status are required." }, { status: 400 });
// }

// let subject = "";
// let htmlContent = "";

// if (validationStatus) { // Approved by the Wholesale Team
// subject = `Your Farm Rio Request - Approved by the Wholesale Team!`;
// htmlContent = `
// <p>Hello, <strong>${customerName}</strong>!</p>
// <p>We have great news! Your onboarding request at Farm Rio has been <strong>approved</strong> by our Wholesale Team!</p>
// <p>Your process is almost complete. We will contact you soon with the next steps to get you started with us.</p>
// <p>Thank you for choosing Farm Rio.</p>
// <p>Farm Rio Team 💚</p>
// `;
// } else { // Rejected by the Wholesale Team
// subject = `Your Farm Rio Request - Important Update (Wholesale Team)`;
// htmlContent = `
// <p>Hello, <strong>${customerName}</strong>,</p>
// <p>Thank you for your interest in joining Farm Rio. We would like to inform you that your onboarding request was <strong>rejected</strong> by our Wholesale Team.</p>
// ${feedback ? `<p><strong>Wholesale Team Feedback:</strong> ${feedback}</p>` : ""}
// <p>Please review the feedback provided and contact us if you have any questions or would like to discuss next steps.</p>
// <p>Thank you for your understanding.</p>
// <p>Farm Rio Team 💚</p>
// `;
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
// email: "jefersonferreira27@outlook.com", // Sender validated 
// }, 
// to: [{ email: customerEmail, name: customerName }], 
// subject: subject, 
// htmlContent: htmlContent, 
// }), 
// }); 

// const text = await response.text(); 
// console.log("📥 Brevo's response to validation Wholesale:", response.status, response.statusText); 
// console.log("📄 Response body:", text);

// if (!response.ok) {
// console.error("❌ Error sending Wholesale validation email:", response.status, text);
// return NextResponse.json({ error: text }, { status: response.status });
// }

// console.log("✅ Wholesale validation email sent successfully");
// return NextResponse.json({ message: "Wholesale validation email sent successfully!" }, { status: 200 });

// } catch (error) {
// console.error("❌ Unexpected error sending Wholesale validation email:", error);
// return NextResponse.json({ error: "Error sending Wholesale validation email", details: error }, { status: 500 });
// }
// }