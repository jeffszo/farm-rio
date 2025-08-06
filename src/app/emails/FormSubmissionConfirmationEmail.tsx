import * as React from "react";
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Section,
  Hr,
} from "@react-email/components";

interface FormSubmissionConfirmationEmailProps {
  name: string;
}

const main = {
  backgroundColor: '#2e2e2e', // Cor de fundo do corpo (a cor preta)
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};


const container = {
  backgroundColor: '#2e2e2e', // A cor do container também deve ser a preta
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "30px 0",
};

const section = {
  margin: "0 auto",
  padding: "20px",
  border: "1px solid #eaeaea",
  borderRadius: "5px",
};

const text = {
  color: "#333",
  fontSize: "14px",
  margin: "24px 0",
};

export const FormSubmissionConfirmationEmail = ({
  name,
}: FormSubmissionConfirmationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Form submitted successfully!</Heading>
        <Section style={section}>
          <Text style={text}>Hello, {name}!</Text>
          <Text style={text}>
            Your data was submitted correctly! It will now proceed to validation by the respective teams.
          </Text>
          <Hr />
          <Text style={text}>
            Best regards,
            <br />
            FARM RIO Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default FormSubmissionConfirmationEmail;
