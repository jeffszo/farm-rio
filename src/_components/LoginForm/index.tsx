'use client';

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as S from "./styles";
import { api } from "@/lib/supabase";

const supabase = createClient();

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: { email: string; password: string }) => {
    setApiError("");
    const { email, password } = data;

    try {
      setIsSubmitting(true);
      await supabase.auth.signOut();

      const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authResult.user) {
        setApiError("Invalid email or password.");
        setIsSubmitting(false);
        return;
      }

      const { user } = authResult;

      // Primeiro tenta buscar no team_users
      const { data: teamUser, error: teamError } = await supabase
        .from("team_users")
        .select("id, team_role")
        .eq("email", user.email)
        .single();

      let finalRole = teamUser?.team_role;
      let userId = teamUser?.id;

      if (!teamUser || teamError) {
        // Se não achou no team_users, busca em users
        if (teamError && teamError.code !== "PGRST116") {
          console.error("Erro na busca de team_users:", teamError);
        }

        const { data: cliente, error: clienteError } = await supabase
          .from("users")
          .select("id, role")
          .eq("email", user.email)
          .single();

        if (clienteError || !cliente) {
          await supabase.auth.signOut();
          setApiError("User not authorized or not found in the database.");
          setIsSubmitting(false);
          return;
        }

        finalRole = cliente.role;
        userId = cliente.id;
      }

      router.refresh();

      // Redireciona com base no papel
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
        setIsSubmitting(false);
      }

    } catch (error) {
      const e = error as { message?: string; status?: number };
      console.error("Erro no login:", e);
      setApiError(e.message || "Erro desconhecido");
      setIsSubmitting(false);
    }
  };

  return (
    <S.Form onSubmit={handleSubmit(onSubmit)}>
      <S.InputWrapper>
        <S.Label>Email:</S.Label>
        <S.Input
          {...register("email", { required: "Email is required" })}
          type="email"
        />
        {errors.email && <S.ErrorMessage>{errors.email.message}</S.ErrorMessage>}
      </S.InputWrapper>

      <S.InputWrapper>
        <S.Label>Password:</S.Label>
        <S.Input
          {...register("password", { required: "Password is required" })}
          type="password"
        />
        {errors.password && <S.ErrorMessage>{errors.password.message}</S.ErrorMessage>}
      </S.InputWrapper>

      {apiError && <S.ErrorMessage>{apiError}</S.ErrorMessage>}

{/* <S.ForgotPassword onClick={() => router.push("/reset-password")}>
  Forgot your password? Reset it here!
</S.ForgotPassword> */}

      <S.Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Loading..." : "Enter"}
      </S.Button>
    </S.Form>
  );
}
