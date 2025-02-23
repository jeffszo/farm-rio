

import HeaderValidations from "../../components/HeaderValidations";
import FooterValidations from "../../components/FooterValidations";

 

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
