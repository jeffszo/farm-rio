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

interface ReviewEmailProps {
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

export const ReviewEmail = ({ name }: ReviewEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Wholesale - Account to review</Heading>
        <Section style={{ padding: '20px' }}>
          <Text style={text}>
            Hello, {name}!
          </Text>
          <Text style={text}>
            There is information that needs to be reviewed and edited on the portal. Please review the feedback and resubmit the corrected form.
          </Text>
          {/* <Text style={text}>
            Entraremos em contato caso precisemos de mais informações.
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

export default ReviewEmail;