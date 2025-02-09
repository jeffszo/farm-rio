import { useForm, type SubmitHandler } from "react-hook-form"
import * as S from './styles'
import type { LoginFormData } from "../../types/auth";
import { api } from "../../lib/supabaseApi";
import { useRouter } from "next/navigation";


export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>()
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const user = await api.signIn(data.email, data.password);

      // Verifica o tipo de usuário
      if (user.userType === "cliente") {
        router.push("/customer"); // Redireciona para a página do cliente
      } else {
        router.push("/dashboard"); // Outros usuários vão para o dashboard
      }
    } catch (error: any) {
      console.error("Erro no login:", error.message);
      alert("Erro ao entrar. Verifique suas credenciais.");
    }
  };

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


