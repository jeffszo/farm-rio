"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Global from "../styles/global";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isValidationPage = pathname.startsWith("/validations");

  useEffect(() => {
    document.title = "FARM Rio - Customer Onboarding";
  }, [pathname]);

  return (
    <>
      <Global />
      {!isValidationPage && <Header />}
      <main>{children}</main>
      {!isValidationPage && <Footer />}
    </>
  );
}
