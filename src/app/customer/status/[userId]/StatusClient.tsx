"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as S from "../../styles";
import { FileEdit } from "lucide-react";
import { api } from "@/lib/supabase/index"; // ajuste se necessário

interface StatusClientProps {
  initialUserId: string;
  initialFormStatus: string | null;
  initialIsLoading: boolean; // Mantido, mas agora usado internamente
}

export default function StatusClient({
  initialUserId,
  initialFormStatus,
  initialIsLoading,
}: StatusClientProps) {
  const [formStatus] = useState<string | null>(initialFormStatus);
  const [isLoading, setIsLoading] = useState<boolean>(initialIsLoading); // Gerencia o estado de carregamento

  const [wholesaleFeedback, setWholesaleFeedback] = useState<string>("");
  const [creditFeedback, setCreditFeedback] = useState<string>("");
  const [taxFeedback, setTaxFeedback] = useState<string>("");
  const [cscInitialFeedback, setCscInitialFeedback] = useState<string>("");
    const [cscFinalFeedback, setCscFinalFeedback] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (!initialUserId) {
      setIsLoading(false); // Se não houver userId, não está carregando
      return;
    }

    async function loadFeedbacks() {
      setIsLoading(true); // Começa a carregar
      try {
        const { data } = await api.getFeedbackTeams(initialUserId);
        setWholesaleFeedback(data?.wholesale_feedback || "");
        setCreditFeedback(data?.credit_feedback || "");
        setTaxFeedback(data?.tax_feedback || "");
        setCscInitialFeedback(data?.csc_initial_feedback || "");
        setCscFinalFeedback(data?.csc_final_feedback || "");

      } catch (error) {
        console.error("Erro ao buscar feedbacks via getFeedbackTeams:", error);
        // Opcional: setar um feedback de erro genérico se a busca falhar
        // setWholesaleFeedback("Erro ao carregar feedback.");
      } finally {
        setIsLoading(false); // Termina de carregar, independentemente do sucesso ou falha
      }
    }

    loadFeedbacks();
  }, [initialUserId]);

  const canEditForm =
    formStatus === "review requested by the initial CSC team" ||
    formStatus === "review requested by the CSC final team" ||
    formStatus === "review requested by the tax team" ||
    formStatus === "review requested by the wholesale team";

  // Exibe um estado de carregamento enquanto os feedbacks estão sendo buscados
  if (isLoading) {
    return (
      <S.ReviewContainer>
        <S.ReviewTitle>Carregando Status...</S.ReviewTitle>
        <S.ReviewSubtitle>Por favor, aguarde enquanto buscamos as informações.</S.ReviewSubtitle>
      </S.ReviewContainer>
    );
  }

  return (
    <S.ReviewContainer>
      <S.ReviewTitle>Request Status</S.ReviewTitle>
      <S.ReviewSubtitle>
        {formStatus === "pending" && (
          <div>Your form is currently <strong>pending review</strong>.</div>
        )}

        {formStatus === "approved by the csc initial team" && (
          <div>
            Your form has been <strong>approved by the CSC Initial team</strong> and is now under review by the Tax team.
            {cscInitialFeedback && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from the CSC Team:</S.FeedbackTitle>
                <S.FeedbackContent>{cscInitialFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}

        

        {formStatus === "approved by the tax team" && (
          <div>
            Your form has been <strong>approved by the Tax team</strong> and is now under review by the Wholesale team.
            {taxFeedback && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from the Tax Team:</S.FeedbackTitle>
                <S.FeedbackContent>{taxFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}

        {formStatus === "approved by the wholesale team" && (
          <div>
            Your form has been <strong>approved by the Wholesale team</strong> and is now under review by the Credit team.
            {wholesaleFeedback && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from the Wholesale Team:</S.FeedbackTitle>
                <S.FeedbackContent>{wholesaleFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}

        {formStatus === "approved by the credit team" && (
          <div>
            Your form has been <strong>approved by all teams!</strong> You&apos;re good to go!
            {creditFeedback && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from the Credit Team:</S.FeedbackTitle>
                <S.FeedbackContent>{creditFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}

        {formStatus === "rejected by the wholesale team" && (
          <div>
            Unfortunately, your submission was not approved by our team at this time.
            Please contact our wholesale team at <strong>wholesale@farmrio.com</strong>.
            {wholesaleFeedback && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from the Wholesale Team:</S.FeedbackTitle>
                <S.FeedbackContent>{wholesaleFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}

        {formStatus === "finished" && (
          <div>
            Your form has been <strong>successfully finalized!</strong>
          </div>
        )}

        {formStatus === "review requested by the CSC initial team" && (
          <div>
            Your form has been <strong>review requested by the CSC team</strong>. Please check the feedback.
            {cscInitialFeedback && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from the CSC Team:</S.FeedbackTitle>
                <S.FeedbackContent>{cscInitialFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}

        {formStatus === "review requested by the CSC final team" && (
          <div>
            Your corrected form has been <strong>requested again by the CSC team</strong>. Please review carefully.
            {cscFinalFeedback && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from the CSC Team:</S.FeedbackTitle>
                <S.FeedbackContent>{cscFinalFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}

        {formStatus === "review requested by the tax team" && (
          <div>
            Your form has been <strong>review requested by the Tax team</strong>. Please check the feedback.
            {taxFeedback && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from the Tax Team:</S.FeedbackTitle>
                <S.FeedbackContent>{taxFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}

        {formStatus === "review requested by the wholesale team" && (
          <div>
            Your form has been <strong>review requested by the Wholesale team</strong>. Please check the feedback.
            {wholesaleFeedback && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from the Wholesale Team:</S.FeedbackTitle>
                <S.FeedbackContent>{wholesaleFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}

        {formStatus === "data corrected by the client" && (
          <div>
            Your corrected data is awaiting validation by the CSC team.
            {/* Aqui você pode adicionar lógica para mostrar feedback de outras equipes,
                se você tiver uma maneira de saber qual equipe solicitou a correção.
                Por exemplo, se a API retornasse um campo 'last_review_request_team'. */}
            {cscInitialFeedback && (
              <S.FeedbackCard>
                <S.FeedbackTitle>Feedback from the CSC Team:</S.FeedbackTitle>
                <S.FeedbackContent>{cscInitialFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
            {/* Exemplo de como você poderia estender (requer dados adicionais da API):
            {taxFeedback && initialFormStatus === "review requested by the tax team" && (
                <S.FeedbackCard>
                  <S.FeedbackTitle>Feedback from the Tax Team:</S.FeedbackTitle>
                  <S.FeedbackContent>{taxFeedback}</S.FeedbackContent>
                </S.FeedbackCard>
            )}
            */}
          </div>
        )}
      </S.ReviewSubtitle>

      {canEditForm && (
        <S.EditButton onClick={() => router.push(`/edit-form/${initialUserId}`)}>
          <FileEdit size={18} />
          Edit your information
        </S.EditButton>
      )}
    </S.ReviewContainer>
  );
}