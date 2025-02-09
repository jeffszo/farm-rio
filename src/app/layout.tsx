"use client"
// import { Metadata } from "next"
import { Nunito_Sans } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Global from "../styles/global"

// export const metadata: Metadata = {
//   title: 'FARM Rio - Customer Onboarding',
//   description: 'FARM Rio'
// }

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body className={`${nunitoSans.variable}`}>
        <Global/>
        <Header/>
          {children}
        <Footer/>
      </body>
    </html>
  );
}
