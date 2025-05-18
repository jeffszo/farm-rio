"use client"

import React from "react"
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
  <FormLink>Don&apos;t have an account? Sign up</FormLink>
</Link>

        </FormContainer>
      </Main>
    </Container>
  )
}

