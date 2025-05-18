// src/app/customer/status/[userId]/StatusClient.tsx
"use client"; // ESSENCIAL: Este é o componente cliente

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Não precisamos de useParams aqui
import * as S from "../../styles"; // Caminho relativo ajustado
import { Clock4, FileEdit } from "lucide-react";

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
    return <p>Loading your request status...</p>;
  }

  if (
    formStatus === null ||
    formStatus === "no_data_found" ||
    formStatus === "error" ||
    formStatus === "no_id_provided"
  ) {
    console.log(
      "CLIENT COMPONENT: Rendering: Status not found or error. formStatus:",
      formStatus
    );
    let message = "Could not load your request status.";
    if (formStatus === "no_id_provided") {
      message =
        "No user ID was provided in the URL to fetch the status. Please ensure the URL is correct (e.g., /customer/status/YOUR_USER_ID).";
    } else if (formStatus === "no_data_found") {
      message = "No application status found for the provided user ID.";
    } else if (formStatus === "error") {
      message =
        "An error occurred while fetching your status. Please try again later.";
    }
    return (
      <S.ReviewContainer>
        <S.ReviewHeader>
          <S.ReviewTitle>Request Status</S.ReviewTitle>
          <S.ReviewSubtitle>{message}</S.ReviewSubtitle>
        </S.ReviewHeader>
      </S.ReviewContainer>
    );
  }

  console.log("CLIENT COMPONENT: Rendering: Valid status:", formStatus);

  return (
    <S.ReviewContainer>
      <S.ReviewTitle>Request Status</S.ReviewTitle>
      <S.ReviewSubtitle>
        {formStatus === "pending" && (
          <div>
            <Clock4 /> Your submission is under review.
          </div>
        )}

        {formStatus === "approved by the wholesale team" && (
          <div>Your form has already been approved by the wholesale team.</div>
        )}

        {formStatus === "approved by the credit team" && (
          <div>
            Your form has been approved by the wholesale and credit team.
          </div>
        )}

        {formStatus === "rejected by the CSC team" && (
          <div>
            <p>
              Your registration was rejected by our team. Please correct the
              data and submit again.
            </p>

            {formStatus.includes("rejected by the CSC team") && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from CSC Team:</S.FeedbackTitle>
                <S.FeedbackContent>
                  {feedback ||
                    "No specific feedback provided. Please contact support for more details."}
                </S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}

        {formStatus === "approved by the CSC team" && (
          <div>
            Your form has been <strong>approved by all teams!</strong>
          </div>
        )}

        {formStatus === "finished" && (
          <div>
            Your form has been <strong>successfully finalized!</strong>
          </div>
        )}
      </S.ReviewSubtitle>

      {formStatus.includes("rejected by the CSC team") && (
        <S.EditButton
          onClick={() => router.push(`/edit-form/${initialUserId}`)}
        >
          <FileEdit size={18} />
          Edit Your Information
        </S.EditButton>
      )}
    </S.ReviewContainer>
  );
}
