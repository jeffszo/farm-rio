import { createGlobalStyle, styled } from 'styled-components';
import { theme } from "./theme"


const Global = createGlobalStyle`

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Nunito Sans', sans-serif;
    scroll-behavior: smooth;
    text-decoration: none;
  }


  html, body {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  #__next {
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* 🔥 Faz com que o conteúdo ocupe toda a tela */
  }

  main {
    flex: 1; /* 🔥 Faz com que o conteúdo ocupe todo o espaço disponível */
    display: flex;
    flex-direction: column;
  }
`;

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.background};
  color: ${theme.colors.foreground};
`

export const Main = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[6]};
  margin-bottom: 4rem;
`

export const FormContainer = styled.div`
  background-color: ${theme.colors.card};
  color: ${theme.colors.cardForeground};
  padding: ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`

export const FormTitle = styled.h1`
  text-align: center;
  color: ${theme.colors.foreground};
  margin-bottom: ${theme.spacing[6]};
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
`

export const FormLink = styled.p`
  color: ${theme.colors.primary};
  text-decoration: none;
  text-align: center;
  display: block;
  margin-top: ${theme.spacing[4]};
  font-size: ${theme.fontSizes.sm};
  
  &:hover {
    text-decoration: underline;
  }
`



export default Global;
