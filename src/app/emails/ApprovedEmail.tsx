import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  // Link,
  Section,
} from '@react-email/components';

interface ApprovedEmailProps {
  name: string;
}

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

// const button = {
//   backgroundColor: '#2e78c8',
//   borderRadius: '5px',
//   color: '#fff',
//   fontSize: '14px',
//   fontWeight: '500',
//   textDecoration: 'none',
//   textAlign: 'center' as const,
//   display: 'block',
//   width: '100%',
//   padding: '12px',
// };

export const ApprovedEmail = ({ name }: ApprovedEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Wholesale - Account approved</Heading>
        <Section style={{ padding: '20px' }}>
          <Text style={text}>
            Hello! {name}
          </Text>
          <Text style={text}>
            We have pleased to inform you that your account has been validated by the Wholesale team. Please wait for the other teams to review it.
          </Text>
          {/* <Link
            href="https://customer.farmrio.com"
            style={button}
          >
            Acessar o portal de atacado
          </Link> */}
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

export default ApprovedEmail;