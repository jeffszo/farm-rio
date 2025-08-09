import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  // Link,
} from '@react-email/components';

// interface ApprovedEmailProps {
//   name: string;
// }

const main = {
  backgroundImage: "url('https://qfnidijiykdjnbbtfvbl.supabase.co/storage/v1/object/public/email-images/template-padrao.JPG')",
  height: '95vh',
  backgroundSize: 'cover', 
  fontFamily:
    'Verdana, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};


const container = {
  margin: '0 auto',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center' as const, // Centraliza o conteúdo
  maxWidth: '600px', // Limita a largura para melhor visualização
};


const text = {
  color: '#fff', // Texto branco
  fontSize: '14px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#fff',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
};



export const ApprovedEmailWholesale = () => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Wholesale - Account approved</Heading>
          <Text style={text}>
            Your account has been approved and is now under internal review to ensure all information is correct. Soon, you’ll be able to explore our catalog and begin your vibrant journey with FARM RIO.
          </Text>
          {/* <Link
            href="https://customer.farmrio.com"
            style={button}
          >
            Acessar o portal de atacado
          </Link> */}
          {/* <Text style={text}>
            Best regards, 
            <br />
            FARM RIO Team
          </Text> */}
      </Container>
    </Body>
  </Html>
);

export default ApprovedEmailWholesale;