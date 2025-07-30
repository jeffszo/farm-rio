import { notFound } from "next/navigation";
import { api } from "../../../../lib/supabase";
import StatusClient from "./StatusClient";

export default async function StatusPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  if (!userId) {
    notFound();
  }

  try {
    const formData = await api.getFormStatus(userId);

    return (
      <StatusClient
        initialUserId={userId}
        initialFormStatus={formData?.status || "no_data_found"}
        initialIsLoading={false}
      />
    );
  } catch (error) {
    console.error("Erro ao buscar status do formulário:", error);
    return (
      <StatusClient
        initialUserId={userId}
        initialFormStatus="error"
        initialIsLoading={false}
      />
    );
  }
}
