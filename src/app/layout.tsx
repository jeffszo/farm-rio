"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Nunito_Sans } from "next/font/google";
import Global from "../styles/global"; // Seu estilo global
import Header from "../components/Header";
import Footer from "../components/Footer";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Atualiza o título da página dinamicamente com base na rota
  useEffect(() => {
    document.title = "FARM Rio - Customer Onboarding"; // Título fixo ou pode ser alterado dinamicamente conforme a rota
  }, [pathname]);

  // Verifica se está em uma página de validação
  const isValidationPage = pathname.startsWith("/validations");

  return (
    <html lang="en">
      <body className={`${nunitoSans.variable}`}>
        {/* Estilos globais */}
        <Global />
        
        {/* Condicionalmente exibe o cabeçalho e o rodapé, dependendo da página */}
        {!isValidationPage && <Header />}
        
        {/* Conteúdo da página */}
        <main>{children}</main>
        
        {!isValidationPage && <Footer />}
      </body>
    </html>
  );
}
