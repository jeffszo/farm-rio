'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as S from "./styles";
import { FileEdit } from 'lucide-react';
import { api } from '@/lib/supabase/index';

interface StatusClientProps {
  initialUserId: string;
  initialFormStatus: string | null;
  initialIsLoading: boolean;
}

export default function StatusClient({
  initialUserId,
  initialFormStatus,
  initialIsLoading,
}: StatusClientProps) {
  const [formStatus] = useState<string | null>(initialFormStatus);
  const [isLoading, setIsLoading] = useState<boolean>(initialIsLoading);
  const [wholesaleFeedback, setWholesaleFeedback] = useState<string>('');
  const [creditFeedback, setCreditFeedback] = useState<string>('');
  const [taxFeedback, setTaxFeedback] = useState<string>('');
  const [cscInitialFeedback, setCscInitialFeedback] = useState<string>('');
  const [cscFinalFeedback, setCscFinalFeedback] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    if (!initialUserId) {
      setIsLoading(false);
      return;
    }

    async function loadFeedbacks() {
      setIsLoading(true);
      try {
        const { data } = await api.getFeedbackTeams(initialUserId);
        setWholesaleFeedback(data?.wholesale_feedback || '');
        setCreditFeedback(data?.credit_feedback || '');
        setTaxFeedback(data?.tax_feedback || '');
        setCscInitialFeedback(data?.csc_initial_feedback || '');
        setCscFinalFeedback(data?.csc_final_feedback || '');
      } catch (error) {
        console.error('Erro ao buscar feedbacks via getFeedbackTeams:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFeedbacks();
  }, [initialUserId]);

  const canEditForm =
    formStatus === 'review requested by the initial governance team' ||
    formStatus === 'review requested by the governance final team' ||
    formStatus === 'review requested by the tax team' ||
    formStatus === 'review requested by the credit team' ||
    formStatus === 'review requested by the wholesale team';

  // Função para redirecionar sem o ID na URL
  const handleEditForm = () => {
    router.push('/edit-form');
  };

  if (isLoading) {
    return (
      <S.ReviewContainer>
      <S.ReviewTitle>Loading Status...</S.ReviewTitle>
      <S.ReviewSubtitle>Please wait while we retrieve the information.</S.ReviewSubtitle>
      </S.ReviewContainer>
    );
  }

  return (
    <S.ReviewContainer>
      <S.ReviewTitle>Request Status</S.ReviewTitle>
      <S.ReviewSubtitle>
        {/* ... (Todo o seu JSX para exibir os status e feedbacks) ... */}
        {formStatus === 'pending' && <div>Your form is currently pending review.</div>}
        {formStatus === 'approved by the governance initial team' && (
          <div>
            Your form has been approved by the Governance Initial team and is now under review by the Tax team.
            {cscInitialFeedback && (
              <S.FeedbackCard>
                <S.FeedbackContent>{cscInitialFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}
        {/* ... (Todos os outros blocos de status e feedback) ... */}
        {formStatus === 'review requested by the initial governance team' && (
          <div>
            Your form has been reviewed by the Governance Initial Team. Please check their feedback below
            {cscInitialFeedback && (
              <S.FeedbackCard>
                <S.FeedbackContent>{cscInitialFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}
        {formStatus === 'review requested by the governance final team' && (
          <div>
            Your form has been reviewed by the Governance Final Team. Please check their feedback below
            {cscFinalFeedback && (
              <S.FeedbackCard>
                <S.FeedbackContent>{cscFinalFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}
        {formStatus === 'review requested by the tax team' && (
          <div>
            Your form has been reviewed by the Tax Team. Please check their feedback below
            {taxFeedback && (
              <S.FeedbackCard>
                <S.FeedbackContent>{taxFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}
        {formStatus === 'review requested by the wholesale team' && (
          <div>
            Your form has been reviewed by the Wholesale Team. Please check their feedback below
            {wholesaleFeedback && (
              <S.FeedbackCard>
                <S.FeedbackContent>{wholesaleFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}
        {formStatus === 'review requested by the credit team' && (
          <div>
            Your form has been reviewed by the Credit Team. Please check their feedback below
            {creditFeedback && (
              <S.FeedbackCard>
                <S.FeedbackContent>{creditFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}
        {formStatus === 'rejected by the wholesale team' && (
          <div>
           Unfortunately, your submission for new customer registration was not approved by our team at this time.
        For more information, please contact our wholesale team at wholesale@farmrio.com
            {wholesaleFeedback && (
              <S.FeedbackCard>
                <S.FeedbackContent>{wholesaleFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}
        {formStatus === 'finished' && <div>Your form has been successfully finalized!</div>}
        {formStatus === 'approved by the tax team' && (
          <div>
            Your form has been approved by the Tax team and is now under review by the Wholesale team.
            {taxFeedback && (
              <S.FeedbackCard>
                <S.FeedbackContent>{taxFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )}
          </div>
        )}
        {formStatus === 'approved by the wholesale team' && (
          <div>
            Your form has been approved by the Wholesale team and is now under review by the Governance team.
            {/* {wholesaleFeedback && (
              <S.FeedbackCard>
                <S.FeedbackContent>{wholesaleFeedback}</S.FeedbackContent>
              </S.FeedbackCard>
            )} */}
          </div>
        )}
        {formStatus === 'approved by the credit team' && (
          <div>
            Your form has been approved by the Credit team and is now under review by the Governance team.
          </div>
        )}

             {formStatus === 'review requested by the credit team - customer' && (
          <div>
            Your forwarded data is being analyzed by the credit team.
          </div>
        )}

               {formStatus === 'review requested by the wholesale team - customer' && (
          <div>
            Your forwarded data is being analyzed by the wholesale team.
          </div>
        )}

                   {formStatus === 'review requested by the tax team - customer' && (
          <div>
            Your forwarded data is being analyzed by the tax team.
          </div>
        )} 

         {formStatus === 'review requested by the governance initial team - customer' && (
          <div>
            Your forwarded data is being analyzed by the governance team.
          </div>
        )}



        
      </S.ReviewSubtitle>

      {canEditForm && (
        <S.EditButton onClick={handleEditForm}>
          <FileEdit size={18} />
          Edit your information
        </S.EditButton>
      )}
    </S.ReviewContainer>
  );
}