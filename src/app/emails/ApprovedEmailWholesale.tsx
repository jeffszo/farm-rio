import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text
} from '@react-email/components';

const main = {
  backgroundColor: '#ffffff', // Fundo padrão para o Body
  fontFamily:
    'Verdana, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const table = {
  backgroundImage: "url('https://qfnidijiykdjnbbtfvbl.supabase.co/storage/v1/object/public/email-images/template-padrao.JPG')",
  backgroundSize: 'cover',
  backgroundColor: '#769bb5',// Fundo de fallback
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


export const ApprovedEmailWholesale = () => (
  <Html>
    <Head />
    <Body style={main}>
      <table style={table} border={0} cellPadding={0} cellSpacing={0}>
        <tr>
          <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '20px' }}>
            <Container style={container}>
              <Heading style={h1}>FARM RIO Onboarding - Internal Review Update (1/5)</Heading>
              <Text style={text}>
Welcome! Your account has been approved and is now under internal review to ensure all information is correct. Soon, you’ll be able to explore our catalog and begin your vibrant journey with FARM RIO.
              </Text>
            </Container>
          </td>
        </tr>
      </table>
    </Body>
  </Html>
);

export default ApprovedEmailWholesale;