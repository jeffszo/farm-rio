// // src/app/api/send-welcome-email/route.ts

// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
// console.log("📨 Request received to send email (App Router)");

// const body = await req.json();
// const { email, name } = body;

// if (!email || !name) {
// console.warn("⚠️ Name or email missing in body");
// return NextResponse.json({ message: "Name and email are required." }, { status: 400 });
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
// email: "jefersonferreira27@outlook.com", // validated sender
// },
// to: [{ email, name }],
// subject: "Account created successfully!",
// htmlContent: `
// <p>Hello, <strong>${name}</strong>!</p>
// <p>Your account was created successfully. You will soon be able to access the registration form.</p>
// <p>Farm Rio Team 💚</p>
// `,
// }),
// });

// const text = await response.text();
// console.log("📥 Brevo's Response:", response.status, response.statusText);
// console.log("📄 Response Body:", text);

// if (!response.ok) {
// console.error("❌ Error sending email:", response.status, text);
// return NextResponse.json({ error: text }, { status: response.status });
// }

// console.log("✅ Email sent successfully");
// return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 });

// } catch (error) {
// console.error("❌ Unexpected error:", error);
// return NextResponse.json({ error: "Error sending email", details: error }, { status: 500 });
// }
// }