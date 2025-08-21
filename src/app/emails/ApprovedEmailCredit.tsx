import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
} from '@react-email/components';

const main = {
  backgroundColor: '#ffffff', // Fundo padrão para o Body
  fontFamily:
    'Verdana, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const table = {
  backgroundImage: "url('https://qfnidijiykdjnbbtfvbl.supabase.co/storage/v1/object/public/email-images/template-padrao.JPG')",
  backgroundSize: 'cover',
  backgroundColor: '#769bb5', // Fundo de fallback
  height: '448px',
  width: '990px',
  margin: '0 auto'
};


const container = {
  padding: '20px',
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
  margin: '30px 0 0 0',
};


export const ApprovedEmailCredit = () => (
  <Html>
    <Head />
    <Body style={main}>
      <table style={table} border={0} cellPadding={0} cellSpacing={0}>
        <tr>
          <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '20px' }}>
            <Container style={container}>
              <Heading style={h1}>FARM RIO Onboarding - Internal Review Update (5/6)</Heading>
              <Text style={text}>
                Your account has been approved by our Credit Team. You’ll soon be connected to FARM RIO on JOOR.
              </Text>
            </Container>
          </td>
        </tr>
      </table>
    </Body>
  </Html>
);

export default ApprovedEmailCredit;