import React from 'react'
import { useForm, type SubmitHandler } from "react-hook-form"
import * as S from './styles'
import type { LoginFormData } from "../../types/auth";
import { useRouter } from "next/navigation";
import { api } from '../../lib/supabase/index';

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>()


const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
 
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Erro ao fazer login.");
      }

      console.log(result);


      const user = result.user;

      // ✅ Verifica se o usuário é um cliente ou parte do time de validação
      if (user.role === "cliente") {
        const formStatus = await api.getFormStatus(user.id); // Você já buscou o status com user.id
      
        if (formStatus?.status) {
          // CORREÇÃO: Passar o user.id para a rota dinâmica
          router.push(`/customer/status/${user.id}`); // <--- MUDANÇA AQUI!
        } else {
          router.push("/customer/form");
        }
      } else if (user.role === "atacado") {
        router.push("/validations/wholesale");
      } else if (user.role === "credito") {
        router.push("/validations/credit");
      } else if (user.role === "csc") {
        router.push("/validations/csc");
      }
      
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string }).message || "Erro desconhecido";
      console.error("Erro no login:", errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <S.Form onSubmit={handleSubmit(onSubmit)}>
      <S.InputWrapper>
        <S.Label htmlFor="email">Email</S.Label>
        <S.Input
          id="email"
          type="email"
          placeholder="example@farmrio.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email",
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
          placeholder="••••••••"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 8 characters long",
            },
          })}
        />
        {errors.password && <S.ErrorMessage>{errors.password.message}</S.ErrorMessage>}
      </S.InputWrapper>

      <S.Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Loading..." : "Enter"}
      </S.Button>
    </S.Form>
  )
}


