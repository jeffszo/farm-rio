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

interface WelcomeEmailProps {
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
  color: '#fff', // Texto branco
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#fff', // Texto branco
  fontSize: '14px',
  margin: '24px 0',
};

const button = {
  backgroundColor: '#2e78c8',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to FARM RIO!</Heading>
        <Text style={text}>Hello, {name}!</Text>
        <Text style={text}>
          Your account has been successfully created. We&#39;re thrilled to have
          you!
        </Text>
        <Text style={text}>
          You can now access the portal and start exploring our exclusive
          products.
        </Text>
        <Link href="https://customer.farmrio.com" style={button}>
          Access the portal
        </Link>
        <Text style={text}>If you have any questions, please contact us.</Text>
        <Text style={text}>
          Sincerely,
          <br />
          FARM RIO Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;
