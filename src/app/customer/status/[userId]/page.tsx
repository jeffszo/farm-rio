import React from 'react';
import { notFound } from 'next/navigation';
import { api } from '../../../../lib/supabase/index';
import StatusClient from './StatusClient';

interface FormStatusData {
  status: string;
  csc_feedback: string | null;
  user_id?: string;
}


interface StatusPageProps {
  params: {
    userId: string;
  };
}


// Use a interface StatusPageProps que você definiu diretamente
export default async function StatusPage({ params }: StatusPageProps) {
  const { userId } = params;

  console.log("SERVER COMPONENT: userId from params:", userId);

  if (!userId) {
    console.error("SERVER COMPONENT: userId is undefined. Showing notFound.");
    notFound();
  }

  let initialFormStatus: FormStatusData | null = null;
  let initialFeedback: string = "";
  let dataFound = false;

  try {
    const formData = await api.getFormStatus(userId);
    console.log("SERVER COMPONENT: Raw form data from API (server side):", formData);

    if (formData) {
      initialFormStatus = formData;
      initialFeedback = formData.csc_feedback || "";
      dataFound = true;
    } else {
      console.log("SERVER COMPONENT: No form data found for this user ID on server.");
    }
  } catch (error) {
    console.error("SERVER COMPONENT: Error fetching form status on server:", error);
    initialFormStatus = { status: "error", csc_feedback: "An error occurred on server." };
  }

  return (
    <StatusClient
      initialUserId={userId}
      initialFormStatus={initialFormStatus?.status || (dataFound ? "no_data_found" : null)}
      initialFeedback={initialFeedback}
      initialIsLoading={false}
    />
  );
}