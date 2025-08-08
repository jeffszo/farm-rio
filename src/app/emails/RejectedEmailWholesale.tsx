import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Link
} from '@react-email/components';

 interface ReviewEmailProps {
   name?: string;
      feedback?: string;
 }

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


export const RejectedEmailWholesale = ({feedback}: ReviewEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Wholesale - Account update</Heading>
          <Text style={text}>
                            We’re sorry to inform you that your account was not approved by our Sales Team
                            <br />
                            <br />
                            Feedback from our team:{" "} <br/>
                            {feedback || "No specific feedback was provided."}
                          </Text>
                          <Text style={text}>
                            Please visit{" "}
                            <Link style={linkStyle} href="https://customer.farmrio.com/">
                              https://customer.farmrio.com/
                            </Link>{" "}
                            to review and make the necessary adjustments.
                          </Text>
                          <Text style={text}>
                            Best regards,
                            <br />
                            FARM RIO Team
                          </Text>
      </Container>
    </Body>
  </Html>
);

export default RejectedEmailWholesale;