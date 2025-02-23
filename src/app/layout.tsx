"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Nunito_Sans } from "next/font/google";
import Global from "../styles/global";
import Header from "../components/Header";
import Footer from "../components/Footer";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.title = "FARM Rio - Customer Onboarding"; // 🔥 Define o título dinamicamente
  }, [pathname]); // Atualiza quando a rota mudar

  const isValidationPage = pathname.startsWith("/validations");

  return (
    <html lang="en">
      <body className={`${nunitoSans.variable}`}>
        <Global />
        {!isValidationPage && <Header />}
        <main>{children}</main>
        {!isValidationPage && <Footer />}
      </body>
    </html>
  );
}
