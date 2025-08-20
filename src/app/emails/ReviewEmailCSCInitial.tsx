// emails/ReviewEmailCSCInitial.tsx
import * as React from "react";
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Link,
} from "@react-email/components";

interface ReviewEmailProps {
  name?: string;
  feedback?: string;
}

const main = {
  backgroundColor: '#ffffff', // Fundo padrão para o Body
  fontFamily:
    'Verdana, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const table = {
  backgroundImage: "url('https://qfnidijiykdjnbbtfvbl.supabase.co/storage/v1/object/public/email-images/template-padrao.JPG')",
  backgroundSize: 'cover',
  backgroundColor: '#769bb5', // Fundo de fallback
  height: '448px',
  width: '990px',
  margin: '0 auto'
};

const container = {
  margin: "0 auto",
  padding: "20px",
  textAlign: "center" as const,
  maxWidth: "600px",
};

const text = {
  color: "#fff",
  fontSize: "14px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const h1 = {
  color: "#fff",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "30px 0",
};

const linkStyle = {
  color: "#0a0a0a",
  textDecoration: "underline",
  fontSize: "14px",
};

export const ReviewEmailCSCInitial = ({ feedback }: ReviewEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <table style={table} border={0} cellPadding={0} cellSpacing={0}>
        <tr>
          <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '20px' }}>
            <Container style={container}>
              <Heading style={h1}>FARM RIO Onboarding - Review Requested</Heading>
              <Text style={text}>
                Our Governance Team has requested updates to your onboarding form.
                <br />
                <br />
                Feedback from our team: <br/>
                {feedback || "No specific feedback was provided."}
              </Text>
              <Text style={text}>
                Please visit{" "}
                <Link style={linkStyle} href="https://customer.farmrio.com/">
                  https://customer.farmrio.com/
                </Link>{" "}
                to review and make the necessary adjustments.
              </Text>
            </Container>
          </td>
        </tr>
      </table>
    </Body>
  </Html>
);

export default ReviewEmailCSCInitial;