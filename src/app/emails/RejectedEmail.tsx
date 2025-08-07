import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Section,
} from '@react-email/components';

interface RejectedEmailProps {
  name: string;
}

// Estilos... (use os mesmos estilos dos outros templates)
const main = {
  backgroundColor: '#2e2e2e',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#2e2e2e',
  margin: '0 auto',
  padding: '20px 0 48px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#333',
  fontSize: '14px',
  margin: '24px 0',
};

export const RejectedEmail = ({ name }: RejectedEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Wholesale - Account update</Heading>
        <Section style={{ padding: '20px' }}>
          <Text style={text}>
            Hello! {name}
          </Text>
          <Text style={text}>
            Unfortunately, your submission for new customer registration was not approved by our team at this time.
            For more information, please contact our wholesale team at wholesale@farm.com.
          </Text>
          {/* <Text style={text}>
            Se você tiver alguma dúvida ou quiser mais detalhes sobre o motivo, por favor, entre em contato com nosso suporte.
          </Text> */}
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

export default RejectedEmail;