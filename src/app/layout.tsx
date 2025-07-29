import { Nunito_Sans } from "next/font/google";
import ClientLayout from "@/components/ClientWrapper";
import HeaderValidations from "@/components/HeaderValidations";
// import { SupabaseProvider } from '@/supabase/supabase-provider';

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
          {/* <SupabaseProvider> */}
            {children}
          {/* </SupabaseProvider> */}
        </ClientLayout>
      </body>
    </html>
  );
}
