import * as React from "react";
import {
  Html,
  Body,
  Head,
  Container,
  Text,
} from "@react-email/components";

// interface FormSubmissionConfirmationEmailProps {
//   name?: string;
// }

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    'Verdana, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const table = {
  backgroundImage: "url('https://qfnidijiykdjnbbtfvbl.supabase.co/storage/v1/object/public/email-images/template-padrao.JPG')",
  backgroundSize: 'cover',
  backgroundColor: '#2e2e2e',
  height: '448px',
  width: '990px',
  margin: '0 auto'
};

const container = {
  margin: "0 auto",
  padding: "0 20px ",
  borderRadius: "8px",
  textAlign: "center" as const,
  maxWidth: "600px",
};

const h1 = {
  color: "#fff",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#fff",
  fontSize: "14px",
  margin: "24px 0",
  textAlign: "center" as const,
};

export const FormSubmissionConfirmationEmail = () => (
  <Html>
    <Head />
    <Body style={main}>
      <table style={table} border={0} cellPadding={0} cellSpacing={0}>
        <tr>
          <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '20px' }}>
            <Container style={container}>
              <Text style={h1}>Form submitted successfully!</Text>
              <Text style={text}>
                Your onboarding form has been submitted for internal review. Please note that further updates may be requested during this process.
              </Text>
            </Container>
          </td>
        </tr>
      </table>
    </Body>
  </Html>
);

export default FormSubmissionConfirmationEmail;