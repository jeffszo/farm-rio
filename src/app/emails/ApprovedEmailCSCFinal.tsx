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

const main = {
  backgroundColor: '#ffffff', // Fundo padrão para o Body
  fontFamily:
    'Verdana, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const table = {
  backgroundImage: "url('https://qfnidijiykdjnbbtfvbl.supabase.co/storage/v1/object/public/email-images/template-padrao.JPG')",
  backgroundSize: 'cover',
  backgroundColor: '#2e2e2e', // Fundo de fallback
  height: '448px',
  width: '990px',
  margin: '0 auto'
};

const container = {
  margin: '0 auto',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  maxWidth: '600px',
};


const text = {
  color: '#fff',
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
  color: '#84C9FF',
  textDecoration: 'underline',
  fontSize: '14px',
};


export const ApprovedEmailCSCFinal = () => (
  <Html>
    <Head />
    <Body style={main}>
      <table style={table} border={0} cellPadding={0} cellSpacing={0}>
        <tr>
          <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '20px' }}>
            <Container style={container}>
              <Heading style={h1}>FARM RIO Onboarding - Your onboarding is now complete!</Heading>
              <Text style={text}>
                Your onboarding is now complete! You are more than welcome to dive into the full FARM RIO experience by visiting <Link style={linkStyle}>farmriowholesale.com. </Link>
              </Text>
            </Container>
          </td>
        </tr>
      </table>
    </Body>
  </Html>
);

export default ApprovedEmailCSCFinal;