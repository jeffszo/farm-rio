// // src/app/api/send-csc-validation-email/route.ts
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
// console.log("📨 Request received to send CSC validation email (App Router)");

// const body = await req.json();
// const { customerId, customerName, customerEmail, validationStatus, feedback, currentStatus } = body;

// if (!customerId || !customerName || !customerEmail || validationStatus === undefined || validationStatus === null) {
// console.warn("⚠️ Missing data in the body for sending CSC validation email.");
// return NextResponse.json({ message: "Customer ID, name, email, and validation status are required." }, { status: 400 });
// }

// let subject = "";
// let htmlContent = "";

// if (validationStatus) { // Approved
// subject = `Your Farm Rio Request - Approved by the CSC Team!`;
// htmlContent = `
// <p>Hello, <strong>${customerName}</strong>!</p>
// <p>We have great news! Your onboarding request at Farm Rio has been <strong>approved</strong> by our Customer Success Team!</p>
// <p>You're one step closer to joining our partner network.</p>
// ${currentStatus === "approved by the credit team" ?
// `<p>Final CSC validation has been completed. You will soon receive more information to help you get started with us.</p>` :
// `<p>Your request will now proceed to the next validation step with the Credit team.</p>`
// }
// <p>Thank you for choosing Farm Rio.</p>
// <p>Farm Rio Team 💚</p>
// `;
// } else { // Rejected
// subject = `Your Farm Rio Request - Important Update`;
// htmlContent = `
// <p>Hello, <strong>${customerName}</strong>,</p>
// <p>Thank you for your interest in joining Farm Rio. We would like to inform you that your onboarding request was <strong>rejected</strong> by our Customer Success Team.</p>
// ${feedback ? `<p><strong>Team Feedback:</strong> ${feedback}</p>` : ""}
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
// console.log("📥 Brevo's response to CSC validation:", response.status, response.statusText); 
// console.log("📄 Response body:", text);

// if (!response.ok) {
// console.error("❌ Error sending CSC validation email:", response.status, text);
// return NextResponse.json({ error: text }, { status: response.status });
// }

// console.log("✅ CSC validation email sent successfully");
// return NextResponse.json({ message: "CSC validation email sent successfully!" }, { status: 200 });

// } catch (error) {
// console.error("❌ Unexpected error sending CSC validation email:", error);
// return NextResponse.json({ error: "Error sending CSC validation email", details: error }, { status: 500 });
// }
// }