"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { FaCheckCircle } from "react-icons/fa"
import * as S from "./styles"
import { api } from "../../lib/supabaseApi"
import { useRouter } from "next/navigation"

interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setApiError(null)
      await api.signUp(data.name, data.email, data.password)

      console.log("Conta criada! Abrindo modal...")
      setIsModalOpen(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Signup error:", error.message)
        setApiError(error.message)
      } else if (typeof error === "string") {
        console.error("Signup error:", error)
        setApiError(error)
      } else {
        console.error("Signup error:", error)
        setApiError("Ocorreu um erro ao criar a conta. Por favor, tente novamente.")
      }
    }
  }

  return (
    <S.Container>
      <S.Main>
        <S.FormContainer>
          <S.FormTitle>Create a new account</S.FormTitle>
          <S.Form onSubmit={handleSubmit(onSubmit)}>
            <S.InputWrapper>
              <S.Label htmlFor="name">Full name</S.Label>
              <S.Input id="name" type="text" {...register("name", { required: "Name is required" })} />
              {errors.name && <S.ErrorMessage>{errors.name.message}</S.ErrorMessage>}
            </S.InputWrapper>

            <S.InputWrapper>
              <S.Label htmlFor="email">Email</S.Label>
              <S.Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido",
                  },
                })}
              />
              {errors.email && <S.ErrorMessage>{errors.email.message}</S.ErrorMessage>}
            </S.InputWrapper>

            <S.InputWrapper>
              <S.Label htmlFor="password">Password</S.Label>
              <S.Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "A senha deve ter pelo menos 8 caracteres" },
                })}
              />
              {errors.password && <S.ErrorMessage>{errors.password.message}</S.ErrorMessage>}
            </S.InputWrapper>

            <S.InputWrapper>
              <S.Label htmlFor="confirmPassword">Confirm password</S.Label>
              <S.Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Confirm your password",
                  validate: (value) => value === watch("password") || "As senhas não coincidem",
                })}
              />
              {errors.confirmPassword && <S.ErrorMessage>{errors.confirmPassword.message}</S.ErrorMessage>}
            </S.InputWrapper>

            <S.Button type="submit">Create account</S.Button>
            {apiError && <S.ErrorMessage>{apiError}</S.ErrorMessage>}
          </S.Form>
          <S.LoginLink href="/">Already have an account? Log in</S.LoginLink>
        </S.FormContainer>
      </S.Main>

      {isModalOpen && (
        <S.ModalOverlay>
          <S.ModalContent>
            <S.ModalTitle>
              <FaCheckCircle style={{ color: "#4CAF50", marginRight: "12px", fontSize: "24px" }} />
              Ok!
            </S.ModalTitle>
            <S.ModalMessage>
            Your account has been successfully created! You will be redirected to the login page            
            </S.ModalMessage>
            <S.ModalButton
              onClick={() => {
                setIsModalOpen(false)
                router.push("/")
              }}
            >
              OK
            </S.ModalButton>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  )
}

