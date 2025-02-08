"use client"

import Header from "./components/Header"
import { Container, FormContainer, FormLink, FormTitle, Main } from "./components/styles/Layout.styled"
import LoginForm from "./components/LoginForm"
import Link from "next/link"
import Footer from "./components/Footer"
import GlobalStyles from "./GlobalStyles"



export default function Home() {
  return (
    <>
    <GlobalStyles/>
    <Container>
      <Header />
      <Main>
        <FormContainer>
          <FormTitle>Login</FormTitle>
          <LoginForm />
          <Link href="/signup" passHref legacyBehavior>
            <FormLink>Não tem uma conta? Cadastre-se</FormLink>
          </Link>
        </FormContainer>
      </Main>
      <Footer />
    </Container>
    </>
  )
}

