"use client";
import { usePathname } from "next/navigation"; // 🔹 Importa o pathname para saber em qual rota está
import { Nunito_Sans } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Global from "../styles/global";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // 🔹 Captura a rota atual

  const isValidationPage = pathname.startsWith("/validations"); // 🔥 Verifica se está na área de validação

  return (
    <html lang="en">
      <body className={`${nunitoSans.variable}`}>
        <Global />
        
        {!isValidationPage && <Header />} {/* ✅ Só renderiza o Header se NÃO for Validations */}
        
        <main>{children}</main> 

        {!isValidationPage && <Footer />}
      </body>
    </html>
  );
}
