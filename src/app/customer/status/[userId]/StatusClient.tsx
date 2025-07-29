// src/app/customer/status/[userId]/StatusClient.tsx
"use client"; // ESSENCIAL: Este é o componente cliente

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Não precisamos de useParams aqui
import * as S from "../../styles"; // Caminho relativo ajustado
import { FileEdit } from "lucide-react";

// Props que este componente cliente receberá do Server Component
interface StatusClientProps {
  initialUserId: string;
  initialFormStatus: string | null;
  initialFeedback: string;
  initialIsLoading: boolean;
}

export default function StatusClient({
  initialUserId,
  initialFormStatus,
  initialFeedback,
  initialIsLoading,
}: StatusClientProps) {
  // Inicializamos o estado com as props recebidas do servidor
  const [formStatus] = useState<string | null>(initialFormStatus);
  const [feedback] = useState<string>(initialFeedback);
  const [isLoading] = useState(initialIsLoading); // Será false inicialmente

  const router = useRouter();

  useEffect(() => {
    console.log(
      "CLIENT COMPONENT: Initial form status received:",
      initialFormStatus
    );
    console.log("CLIENT COMPONENT: Initial userId received:", initialUserId);
  }, [initialUserId, initialFormStatus]);

  if (isLoading) {
    console.log(
      "CLIENT COMPONENT: Rendering: isLoading TRUE (should be false on initial render)"
    );
    return <p>Loading...</p>;
  }

  // Determine se o formulário está em um status de rejeição que requer feedback
  const isRejectedStatusWithFeedback =
    formStatus === "rejected by the wholesale team";

  // Determine se o formulário está em um status que permite edição
  const canEditForm =
    formStatus === "review requested by the CSC initial team" ||
    formStatus === "review requested by the CSC final team" ||
    formStatus === "review requested by the tax team" ||
    formStatus === "review requested by the wholesale team";

  return (
    <S.ReviewContainer>
      <S.ReviewTitle>Your Request Status</S.ReviewTitle>
      <S.ReviewSubtitle>
        {formStatus === "pending" && (
          <div>
            Your form is currently <strong>pending review</strong>. 
          </div>
        )}

        {formStatus === "approved by the CSC team" && (
          <div>
            Your form has been <strong>approved by the CSC team</strong> and is now under review by the Tax team.
          </div>
        )}

        {formStatus === "approved by the tax team" && (
          <div>
            Your form has been <strong>approved by the Tax team</strong> and is now under review by the Wholesale team.
          </div>
        )}

        {formStatus === "approved by the wholesale team" && (
          <div>
            Your form has been <strong>approved by the Wholesale team</strong> and is now under review by the Credit team.
          </div>
        )}

        {formStatus === "approved by the credit team" && (
          <div>
            Your form has been <strong>approved by all teams!</strong> You're good to go!
          </div>
        )}

        {formStatus === "finished" && (
          <div>
            Your form has been <strong>successfully finalized!</strong>
          </div>
        )}

        {formStatus === "review requested by the CSC initial team" && (
          <div>
            Your form has been <strong>review requested by the CSC team</strong>. Please review the feedback and make the necessary corrections.
          </div>
        )}

        {formStatus === "review requested by the CSC final team" && (
          <div>
            Your corrected form has been <strong>review requested by the CSC team</strong> again. Please review the feedback carefully.
          </div>
        )}

        {formStatus === "review requested by the tax team" && (
          <div>
            Your form has been <strong>review requested by the Tax team</strong>. Please review the feedback and make the necessary corrections.
          </div>
        )}

        {formStatus === "review requested by the wholesale team" && (
          <div>
            Your form has been <strong>review requested by the Wholesale team</strong>. Please review the feedback and make the necessary corrections.
          </div>
        )}

        {formStatus === "data corrected by the client" && (
          <div>Your corrected data is awaiting validation by the CSC team.</div>
        )}

        {/* Exibe o FeedbackCard apenas se houver feedback e for um status de rejeição */}
        {isRejectedStatusWithFeedback && feedback && feedback.trim() !== "" && (
          <S.FeedbackCard>
            <S.FeedbackTitle>Feedback from the Team:</S.FeedbackTitle>
            <S.FeedbackContent>
              {feedback || "No specific feedback provided. Please contact support for more details."}
            </S.FeedbackContent>
          </S.FeedbackCard>
        )}
      </S.ReviewSubtitle>

      {canEditForm && (
        <S.EditButton
          onClick={() => router.push(`/edit-form/${initialUserId}`)}
>
          <FileEdit size={18} />
          Edit your information
        </S.EditButton>
      )}
    </S.ReviewContainer>
  );
}