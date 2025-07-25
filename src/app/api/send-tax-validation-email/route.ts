// src/app/api/send-tax-validation-email/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
console.log("📨 Request received to send TAX validation email (App Router)");

const body = await req.json();
const { customerId, customerName, customerEmail, validationStatus, feedback } = body;

if (!customerId || !customerName || !customerEmail || validationStatus === undefined || validationStatus === null) {
console.warn("⚠️ Missing data in the body for sending the TAX validation email.");
return NextResponse.json({ message: "Customer ID, name, email, and validation status are required." }, { status: 400 });
}

let subject = "";
let htmlContent = "";

if (validationStatus) { // Approved by the TAX team
subject = `Your Farm Rio Request - Approved by the Tax Team!`;
htmlContent = `
<p>Hello, <strong>${customerName}</strong>!</p>
<p>We are pleased to inform you that your onboarding request at Farm Rio has been <strong>approved</strong> by our Tax Team!</p>
<p>Your form is advancing in our validation process.</p>
<p>Thank you for choosing Farm Rio.</p>
<p>Farm Rio Team 💚</p>
`;
} else { // Rejected by the TAX team
subject = `Your Farm Rio Request - Important Update (Tax Team)`;
htmlContent = `
<p>Hello, <strong>${customerName}</strong>,</p>
<p>Thank you for your interest in joining Farm Rio. We would like to inform you that your onboarding request was <strong>rejected</strong> by our Tax Team.</p>
${feedback ? `<p><strong>Tax Team Feedback:</strong> ${feedback}</p>` : ""}
<p>Please review the feedback provided and contact us if you have any questions or would like to discuss next steps.</p>
<p>Thank you for your understanding.</p>
<p>Farm Rio Team 💚</p>
`;
} 

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
email: "jefersonferreira27@outlook.com", // Sender validated 
}, 
to: [{ email: customerEmail, name: customerName }], 
subject: subject, 
htmlContent: htmlContent, 
}), 
}); 

const text = await response.text(); 
console.log("📥 Brevo's response to TAX validation:", response.status, response.statusText); 
console.log("📄 Response body:", text);

if (!response.ok) {
console.error("❌ Error sending TAX validation email:", response.status, text);
return NextResponse.json({ error: text }, { status: response.status });
}

console.log("✅ TAX validation email sent successfully");
return NextResponse.json({ message: "TAX validation email sent successfully!" }, { status: 200 });

} catch (error) {
console.error("❌ Unexpected error sending TAX validation email:", error);
return NextResponse.json({ error: "Error sending TAX validation email", details: error }, { status: 500 });
}
}