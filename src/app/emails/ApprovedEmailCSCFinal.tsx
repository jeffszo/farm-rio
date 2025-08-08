import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Link,
} from '@react-email/components';

// interface ApprovedEmailProps {
//   name?: string;
      
// }

const main = {
  backgroundImage: "url('https://qfnidijiykdjnbbtfvbl.supabase.co/storage/v1/object/public/email-images/farm.jpg')",
  height: '98vh',
  width: '100%',
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

const linkStyle = {
  color: '#84C9FF', // Exemplo de cor azul claro
  textDecoration: 'underline', // Sublinhado para indicar que é um link
  fontSize: '14px',
};



export const ApprovedEmailCSCFinal = () => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>CSC - Account approved</Heading>
          <Text style={text}>
            Your onboarding is now complete! You are more than welcome to dive into the full FARM RIO experience by visiting <Link style={linkStyle}>farmriowholesale.com. </Link>
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
      </Container>
    </Body>
  </Html>
);

export default ApprovedEmailCSCFinal;