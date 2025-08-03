'use client';

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as S from "./styles"; // seu styled components
import { api } from "@/lib/supabase";

const supabase = createClient();

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: { email: string; password: string; }) => {
    setApiError("");
    const { email, password } = data;

    try {
      setIsSubmitting(true); // ✅ Inicia o estado de carregamento
      await supabase.auth.signOut();
      // document.cookie = "sb-access-token=; Max-Age=0; path=/;";
      // document.cookie = "sb-refresh-token=; Max-Age=0; path=/;";

      const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authResult.user) {
        setApiError("Email ou senha inválidos.");
        setIsSubmitting(false); // ✅ Reseta o estado em caso de erro
        return;
      }

      const { user } = authResult;

      const { data: teamUser, error: teamError } = await supabase
        .from("team_users")
        .select("id, team_role")
        .eq("email", user.email)
        .single();

      let finalRole = teamUser?.team_role;
      let userId = teamUser?.id;

      if (!teamUser || teamError) {
        const { data: cliente, error: clienteError } = await supabase
          .from("users")
          .select("id, role")
          .eq("email", user.email)
          .single();
        
        if (teamError && teamError.code !== "PGRST116") {
        console.error("Erro na busca de team_users:", teamError);
}

        if (clienteError || !cliente) {
          await supabase.auth.signOut();
          setApiError("Usuário não autorizado ou não encontrado na base de dados.");
          setIsSubmitting(false); // ✅ Reseta o estado em caso de erro
          return;
        }

        finalRole = cliente.role;
        userId = cliente.id;
      }

      router.refresh();
      
      if (finalRole === "cliente") {
        const formStatus = await api.getFormStatus(userId);
        console.log("📦 STATUS DO FORMULÁRIO:", formStatus);

        if (formStatus?.status) {
          router.push("/customer/status");
        } else {
          router.push("/customer/form");
        }
      } else if (finalRole === "tax") {
        router.push("/validations/tax");
      } else if (finalRole === "atacado" || finalRole === "wholesale") {
        router.push("/validations/wholesale");
      } else if (finalRole === "credito") {
        router.push("/validations/credit");
      } else if (finalRole === "csc") {
        router.push("/validations/csc");
      } else {
        await supabase.auth.signOut();
        setApiError("Papel de usuário inválido.");
      }
      
      // ✅ O estado de carregamento não é mais resetado aqui.
      // A navegação do Next.js se encarregará de descarregar este componente.

    } catch (error) {
      const e = error as { message?: string; status?: number };
      console.error("Erro no login:", e);
      setApiError(e.message || "Erro desconhecido");
      setIsSubmitting(false); // ✅ Reseta o estado em caso de erro na rede ou na API
    }
  };

  return (
    <S.Form onSubmit={handleSubmit(onSubmit)}>
      <S.InputWrapper>
        <S.Label>Email:</S.Label>
        <S.Input
          {...register("email", { required: "Email é obrigatório" })}
          type="email"
        />
        {errors.email && <S.ErrorMessage>{errors.email.message}</S.ErrorMessage>}
      </S.InputWrapper>

      <S.InputWrapper>
        <S.Label>Senha:</S.Label>
        <S.Input
          {...register("password", { required: "Senha é obrigatória" })}
          type="password"
        />
        {errors.password && <S.ErrorMessage>{errors.password.message}</S.ErrorMessage>}
      </S.InputWrapper>

      {apiError && <S.ErrorMessage>{apiError}</S.ErrorMessage>}

      <S.Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Loading..." : "Enter"}
      </S.Button>
    </S.Form>
  );
}