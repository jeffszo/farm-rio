import { Nunito_Sans } from "next/font/google";
import ClientLayout from "@/_components/ClientWrapper";
import HeaderValidations from "@/_components/HeaderValidations";



const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "FARM Rio - Customer Onboarding",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={nunitoSans.variable}>
        <HeaderValidations />
        <ClientLayout>
      {children}
        </ClientLayout>
      </body>
    </html>
  );
}
