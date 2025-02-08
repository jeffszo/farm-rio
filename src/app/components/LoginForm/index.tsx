import { useForm, type SubmitHandler } from "react-hook-form"
import type { LoginFormData } from "../../types/auth"
import * as S from './styles'


export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>()

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    // Simular um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Form data:", data)
  }

  return (
    <S.Form onSubmit={handleSubmit(onSubmit)}>
      <S.InputWrapper>
        <S.Label htmlFor="email">Email</S.Label>
        <S.Input
          id="email"
          type="email"
          placeholder="seuemail@farmrio.com"
          {...register("email", {
            required: "Email é obrigatório",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email inválido",
            },
          })}
        />
        {errors.email && <S.ErrorMessage>{errors.email.message}</S.ErrorMessage>}
      </S.InputWrapper>

      <S.InputWrapper>
        <S.Label htmlFor="password">Senha</S.Label>
        <S.Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password", {
            required: "Senha é obrigatória",
            minLength: {
              value: 6,
              message: "A senha deve ter pelo menos 6 caracteres",
            },
          })}
        />
        {errors.password && <S.ErrorMessage>{errors.password.message}</S.ErrorMessage>}
      </S.InputWrapper>

      <S.Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </S.Button>
    </S.Form>
  )
}


