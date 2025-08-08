import * as React from "react";
import {
  Html,
  Body,
  Container,
  Text,
  Link,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}



const main = {
  // ✅ Adicione a URL da imagem de fundo aqui
  backgroundImage: "url('https://qfnidijiykdjnbbtfvbl.supabase.co/storage/v1/object/public/email-images/farm.jpg')",
  height: '98vh',
  width: '100%',
  backgroundSize: 'cover', 
  fontFamily:
    'Verdana, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  // backgroundColor: 'rgba(46, 46, 46, 0.7)', // Fundo semitransparente para o texto
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

const linkStyle = {
  color: '#84C9FF', // Exemplo de cor azul claro
  textDecoration: 'underline', // Sublinhado para indicar que é um link
  fontSize: '14px',
};



const h1 = {
  color: '#fff',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
};


export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html>
    <Body style={main}>
      <Container style={container}>
                  <Text style={h1}>Welcome to FARM RIO </Text>
        
        <Text style={text}>
          {name}, your account has been successfully created. Please visit <Link href="https://customer.farmrio.com/" style={linkStyle}>https://customer.farmrio.com/</Link> to provide your company and tax information so our Sales Team can proceed with the evaluation.
        </Text>
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