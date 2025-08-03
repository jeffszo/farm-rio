import { redirect } from "next/navigation";
import { api } from "@/lib/supabase";
import StatusClient from "./StatusClient";

export default async function StatusPage() {
  const currentUser = await api.getCurrentUserServer();

  if (!currentUser?.id) {
    redirect("/login");
  }

  const userId = currentUser.id;

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
