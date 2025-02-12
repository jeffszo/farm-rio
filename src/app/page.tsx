"use client"

import { Container, FormContainer, FormLink, FormTitle, Main } from "../styles/global"
import LoginForm from "../components/LoginForm"
import Link from "next/link"


export default function Home() {
  return (
    <Container>
      <Main>
        <FormContainer>
          <FormTitle>Customer Onboarding</FormTitle>
          <LoginForm />
          <Link href="/signup">
            <FormLink>Don't have an account? Sign up</FormLink>
          </Link>
        </FormContainer>
      </Main>
    </Container>
  )
}

