import * as React from "react";
import {
  Html,
  Body,
  Container,
  Text,
} from "@react-email/components";

interface FormSubmissionConfirmationEmailProps {
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
  padding: '0 20px ',
  borderRadius: '8px',
  textAlign: 'center' as const, // Centraliza o conteúdo
  maxWidth: '600px', // Limita a largura para melhor visualização
};

const h1 = {
  color: '#fff',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
};



const text = {
  color: '#fff', // Texto branco
  fontSize: '14px',
  margin: '24px 0',
  textAlign: 'center' as const,
};



export const FormSubmissionConfirmationEmail = (
  { name }: FormSubmissionConfirmationEmailProps
) => (
  <Html>
      <Body style={main}>
        <Container style={container}>
          <Text style={h1}>Form submitted successfully!</Text>
          <Text style={text}>
            Thank you! {name} Your onboarding form has been submitted for internal review. Please note that further updates may be requested during this process.
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

export default FormSubmissionConfirmationEmail;
