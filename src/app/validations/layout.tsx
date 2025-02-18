"use client"
// import { Metadata } from "next"
import HeaderValidations from "../../components/HeaderValidations";
import FooterValidations from "../../components/FooterValidations";

// export const metadata: Metadata = {
//   title: 'FARM Rio - Customer Onboarding',
//   description: 'FARM Rio'
// }




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <>
        <HeaderValidations/>
          {children}
        <FooterValidations/>
        </>
  );
}
