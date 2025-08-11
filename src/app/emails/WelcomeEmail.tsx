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
  backgroundColor: '#ffffff', // Cor de fundo padrão
  fontFamily: 'Verdana, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const table = {
  backgroundImage: "url('https://qfnidijiykdjnbbtfvbl.supabase.co/storage/v1/object/public/email-images/template-padrao.JPG')",
  backgroundSize: 'cover',
  backgroundColor: '#2e2e2e',
  height: '448px', // Define a altura mínima
  width: '990px',
  margin: '0 auto'
};

const container = {
  margin: '0 auto',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  maxWidth: '600px', // Limita a largura do conteúdo interno para melhor leitura
};

const text = {
  color: '#fff',
  fontSize: '14px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const linkStyle = {
  color: '#84C9FF',
  textDecoration: 'underline',
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
      {/* Usamos uma tabela para garantir a largura e o background */}
      <table style={table} border={0} cellPadding={0} cellSpacing={0}>
        <tr>
          <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '20px' }}>
            <Container style={container}>
              <Text style={h1}>Welcome to FARM RIO </Text>
              
              <Text style={text}>
                {name}, your account has been successfully created. Please visit <Link href="https://customer.farmrio.com/" style={linkStyle}>https://customer.farmrio.com/</Link> to provide your company and tax information so our Sales Team can proceed with the evaluation.
              </Text>
            </Container>
          </td>
        </tr>
      </table>
    </Body>
  </Html>
);

export default WelcomeEmail;