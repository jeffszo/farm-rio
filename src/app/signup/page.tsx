"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FaCheckCircle } from "react-icons/fa"; // Importando o ícone
import * as S from "./styles"; // Importando os estilos
import { api } from "../../lib/supabaseApi";
import { useRouter } from "next/navigation";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: "cliente" | "atacado" | "credito" | "csc";
}

export default function SignUp() {
  const { register, handleSubmit, control, formState: { errors }, watch } = useForm<SignUpFormData>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setApiError(null);
      await api.signUp(data.name, data.email, data.password, data.userType);
  
      console.log("Conta criada! Abrindo modal...");
      setIsModalOpen(true);
    } catch (error: unknown) {
      // Verifique se o erro é uma instância de Error e tem a propriedade 'message'
      if (error instanceof Error) {
        console.error("Signup error:", error.message);
        setApiError(error.message);
      } else if (typeof error === "string") {
        // Caso o erro seja uma string
        console.error("Signup error:", error);
        setApiError(error);
      } else {
        // Se o erro não for nem um Error nem uma string
        console.error("Signup error:", error);
        setApiError("Ocorreu um erro ao criar a conta. Por favor, tente novamente.");
      }
    }
  };
  

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
              <S.Label htmlFor="userType">User type</S.Label>
              <Controller
                name="userType"
                control={control}
                rules={{ required: "Select a user type" }}
                render={({ field }) => (
                  <S.Select {...field}>
                    <option value="">Select...</option>
                    <option value="cliente">Customer</option>
                    <option value="atacado">Wholesale</option>
                    <option value="credito">Credit</option>
                    <option value="csc">CSC</option>
                  </S.Select>
                )}
              />
              {errors.userType && <S.ErrorMessage>{errors.userType.message}</S.ErrorMessage>}
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

      {/* Modal de Confirmação */}
      {isModalOpen && (
        <S.ModalOverlay>
          <S.ModalContent>
            <S.ModalTitle>
              <FaCheckCircle style={{ color: "#4CAF50", marginRight: "12px", fontSize: "24px" }} />
              Sucesso!
            </S.ModalTitle>
            <S.ModalMessage>
              Sua conta foi criada com sucesso! Você será redirecionado para a página inicial.
            </S.ModalMessage>
            <S.ModalButton
              onClick={() => {
                setIsModalOpen(false);
                router.push("/");
              }}
            >
              OK
            </S.ModalButton>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Container>
  );
}
