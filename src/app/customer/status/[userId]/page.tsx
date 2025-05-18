// src/app/customer/status/[userId]/page.tsx
// Este é um Server Component, não use "use client" aqui!
import React from 'react';
import { notFound } from 'next/navigation';
import { api } from '../../.././../lib/supabase/index'; // Ajuste o caminho conforme necessário
import StatusClient from './StatusClient'; // Importa o componente cliente renomeado

interface FormStatusData {
  status: string;
  csc_feedback: string | null;
  // Opcional: Inclua user_id se sua função getFormStatus também o retornar
  user_id?: string;
}

// Isso é para o Server Component para pegar os parâmetros de rota
interface StatusPageProps {
  params: {
    userId: string;
  };
}

export default async function StatusPage({ params }: StatusPageProps) {
  const { userId } = params;

  // Log no servidor para verificar o userId ANTES de passar para o cliente
  console.log("SERVER COMPONENT: userId from params:", userId);

  if (!userId) {
    // Isso deve ser raro com rota dinâmica, mas é uma segurança
    console.error("SERVER COMPONENT: userId is undefined. Showing notFound.");
    notFound(); // Ou redirecionar para uma página de erro
  }

  // Chame a API para obter o status aqui no servidor
  let initialFormStatus: FormStatusData | null = null;
  let initialFeedback: string = "";
  let dataFound: boolean = false;

  try {
    const formData = await api.getFormStatus(userId);
    console.log("SERVER COMPONENT: Raw form data from API (server side):", formData);

    if (formData) {
      initialFormStatus = formData; // Passa o objeto completo se necessário
      initialFeedback = formData.csc_feedback || "";
      dataFound = true;
    } else {
      console.log("SERVER COMPONENT: No form data found for this user ID on server.");
    }
  } catch (error) {
    console.error("SERVER COMPONENT: Error fetching form status on server:", error);
    // Aqui você pode definir um estado de erro para o cliente também
    initialFormStatus = { status: "error", csc_feedback: "An error occurred on server." };
  }

  // Passe os dados como props para o componente cliente
  return (
    <StatusClient
      initialUserId={userId} // Passa o userId explicitamente
      initialFormStatus={initialFormStatus?.status || (dataFound ? "no_data_found" : null)}
      initialFeedback={initialFeedback}
      initialIsLoading={false} // Já carregamos no servidor
    />
  );
}