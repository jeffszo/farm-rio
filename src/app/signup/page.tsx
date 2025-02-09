// app/signup/page.tsx
'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import * as S from './styles'
import { api } from '../../lib/supabaseApi'
// import { User } from '../../types/api'
import { useRouter } from "next/navigation"


interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  userType: 'cliente' | 'atacado' | 'credito' | 'csc'
}


export default function SignUp()  {
  const { register, handleSubmit, control, formState: { errors }, watch } = useForm<SignUpFormData>()
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter();
  
  const onSubmit = async (data: SignUpFormData) => {
    try {
      setApiError(null);
      await api.signUp(data.name, data.email, data.password, data.userType);
      alert("Conta criada com sucesso!");
  
      setTimeout(() => {
        router.push("/");
      }, );
    } catch (error: unknown) {
      console.error("Signup error:", error?.message || error); // Captura melhor os erros
      setApiError(error?.message || "Ocorreu um erro ao criar a conta. Por favor, tente novamente.");
    }
  };
  
  const password = watch('password')

  return (
    <S.Container>
    <S.Main>
      <S.FormContainer>
        <S.FormTitle>Criar Conta</S.FormTitle>
        <S.Form onSubmit={handleSubmit(onSubmit)}>
          <S.InputWrapper>
            <S.Label htmlFor="name">Nome</S.Label>
            <S.Input
              id="name"
              type="text"
              {...register('name', { required: 'Nome é obrigatório' })}
            />
            {errors.name && <S.ErrorMessage>{errors.name.message}</S.ErrorMessage>}
          </S.InputWrapper>

          <S.InputWrapper>
            <S.Label htmlFor="email">Email</S.Label>
            <S.Input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
            />
            {errors.email && <S.ErrorMessage>{errors.email.message}</S.ErrorMessage>}
          </S.InputWrapper>
          
          <S.InputWrapper>
            <S.Label htmlFor="userType">Tipo de Usuário</S.Label>
            <Controller
              name="userType"
              control={control}
              rules={{ required: 'Selecione um tipo de usuário' }}
              render={({ field }) => (
                <S.Select {...field}>
                  <option value="">Selecione...</option>
                  <option value="cliente">Cliente</option>
                  <option value="atacado">Atacado</option>
                  <option value="credito">Crédito</option>
                  <option value="csc">CSC</option>
                </S.Select>
              )}
            />
            {errors.userType && <S.ErrorMessage>{errors.userType.message}</S.ErrorMessage>}
          </S.InputWrapper>

          <S.InputWrapper>
            <S.Label htmlFor="password">Senha</S.Label>
            <S.Input
              id="password"
              type="password"
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 8,
                  message: 'A senha deve ter pelo menos 8 caracteres',
                },
              })}
            />
            {errors.password && <S.ErrorMessage>{errors.password.message}</S.ErrorMessage>}
          </S.InputWrapper>

          <S.InputWrapper>
            <S.Label htmlFor="confirmPassword">Confirmar Senha</S.Label>
            <S.Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Confirme sua senha',
                validate: value => value === password || 'As senhas não coincidem',
              })}
            />
            {errors.confirmPassword && <S.ErrorMessage>{errors.confirmPassword.message}</S.ErrorMessage>}
          </S.InputWrapper>

          <S.Button type="submit">Criar Conta</S.Button>
          {apiError && <S.ErrorMessage>{apiError}</S.ErrorMessage>}
        </S.Form>
        <S.LoginLink href="/">Já tem uma conta? Faça login</S.LoginLink>
      </S.FormContainer>
    </S.Main>
  </S.Container>
  )
}
