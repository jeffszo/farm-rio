"use client"

import { Container, FormContainer, FormLink, FormTitle, Main } from "../styles/global"
import LoginForm from "../components/LoginForm"
import Link from "next/link"


export default function Home() {
  return (
    <Container>
      <Main>
        <FormContainer>
          <FormTitle>Login</FormTitle>
          <LoginForm />
          <Link href="/signup">
            <FormLink>Não tem uma conta? Cadastre-se</FormLink>
          </Link>
        </FormContainer>
      </Main>
    </Container>
  )
}

