"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/supabase/index";
import * as S from "./styles";
import { User, MapPin, Mail, CircleCheck } from "lucide-react";

interface CustomerForm {
  id: string;
  customer_name: string;
  sales_tax_id: string;
  duns_number: string;
  dba_number: string;
  resale_certificate: string;
  billing_address: string;
  shipping_address: string;
  ap_contact_name: string;
  ap_contact_email: string;
  buyer_name: string;
  buyer_email: string;
  status: string;
  created_at: string;
}

export default function ValidationDetailsPage() {
  const { id } = useParams();
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const [feedback, setFeedback] = useState("");
  const router = useRouter();

  interface ValidationDetails {
    wholesale_invoicing_company: string;
    wholesale_warehouse: string;
    wholesale_currency: string;
    wholesale_terms: string;
    wholesale_credit: string;
    wholesale_discount: number;
    credit_invoicing_company: string;
    credit_warehouse: string;
    credit_currency: string;
    credit_terms: string;
    credit_credit: string;
    credit_discount: number;
  }

  const [validation, setValidation] = useState<ValidationDetails | null>(null);

  const handleFinish = async () => {
    try {
      setLoading(true);
      await api.finishCustomer(id as string);
      setModalContent({
        title: "Success!",
        description: "Customer finalized successfully!",
      });
      setShowModal(true);
    } catch (err) {
      console.error("Erro ao finalizar cliente:", err);
      setModalContent({
        title: "Erro!",
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchValidationDetails = async () => {
      const validationData = await api.getCustomerValidationDetails(
        id as string
      );
      if (validationData) setValidation(validationData);
    };

    if (id) fetchValidationDetails();
  }, [id]);

  // ✅ Obtém os detalhes do cliente
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getCustomerFormById(id as string);
        if (!data) throw new Error("Formulário não encontrado.");
        setCustomerForm(data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do cliente:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomerDetails();
  }, [id]);

  // ✅ Aprovação/Rejeição do Cliente
  const handleApproval = async (approved: boolean) => {
    try {
      setLoading(true);

      // Check if feedback is provided when rejecting
      if (!approved && !feedback.trim()) {
        setModalContent({
          title: "Error!",
          description: "Feedback is required when rejecting a customer.",
        });
        setShowModal(true);
        return;
      }

      // Pass the feedback to the API function
      await api.validateCSCCustomer(id as string, approved, feedback);

      setModalContent({
        title: "Ok!",
        description: approved
          ? "Client approved by the CSC team!"
          : "Customer rejected!",
      });
      setShowModal(true);
    } catch (err) {
      console.error("Erro ao validar cliente:", err);
      setModalContent({
        title: "Erro!",
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    router.push("/validations/csc");
  };

  if (loading) return <S.Message>Loading...</S.Message>;
  if (error) return <S.Message>Erro: {error}</S.Message>;
  if (!customerForm) return <S.Message>Formulário não encontrado.</S.Message>;

  return (
    <S.ContainerMain>
      <S.Container>
        <S.Header>
          <S.Title>Customer Details</S.Title>
          <S.StatusBadge status={customerForm.status}>
            {customerForm.status}
          </S.StatusBadge>
        </S.Header>
        <S.FormDetails>
          <S.FormSection>
            <S.SectionTitle>
              <User size={16} /> Customer Information
            </S.SectionTitle>
            <S.FormRow>
              <strong>Name:</strong> {customerForm.customer_name}
            </S.FormRow>
            <S.FormRow>
              <strong>Tax ID:</strong> {customerForm.sales_tax_id}
            </S.FormRow>
            <S.FormRow>
              <strong>D-U-N-S:</strong>{" "}
              {customerForm.dba_number || "Not provided"}
            </S.FormRow>

            <S.FormRow>
              <strong>DBA:</strong> {customerForm.duns_number || "Not provided"}
            </S.FormRow>
            <S.FormRow>
              <strong>Resale Certificate:</strong>{" "}
              {customerForm.resale_certificate ? (
                <a
                  href={customerForm.resale_certificate}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View PDF
                </a>
              ) : (
                "Not sent"
              )}
            </S.FormRow>
          </S.FormSection>
          <S.FormSection>
            <S.SectionTitle>
              <MapPin size={16} /> Addresses
            </S.SectionTitle>
            <S.FormRow>
              <strong>Billing:</strong> {customerForm.billing_address}
            </S.FormRow>
            <S.FormRow>
              <strong>Shipping:</strong> {customerForm.shipping_address}
            </S.FormRow>
          </S.FormSection>
          <S.FormSection>
            <S.SectionTitle>
              <Mail size={16} /> Contacts
            </S.SectionTitle>
            <S.FormRow>
              <strong>AP:</strong> {customerForm.ap_contact_name}
            </S.FormRow>
            <S.FormRow>
              <strong>AP Email:</strong> {customerForm.ap_contact_email}
            </S.FormRow>
            <S.FormRow>
              <strong>Buyer:</strong> {customerForm.buyer_name}
            </S.FormRow>
            <S.FormRow>
              <strong>Buyer Email:</strong> {customerForm.buyer_email}
            </S.FormRow>
          </S.FormSection>
        </S.FormDetails>

        {validation && (
          <S.TermsCardsContainer>
            <S.TermsCard>
              <h3>Wholesale Team Validation</h3>
              <p>
                <strong>Invoicing Company:</strong>{" "}
                {validation.wholesale_invoicing_company}
              </p>
              <p>
                <strong>Warehouse:</strong> {validation.wholesale_warehouse}
              </p>
              <p>
                <strong>Currency:</strong> {validation.wholesale_currency}
              </p>
              <p>
                <strong>Terms:</strong> {validation.wholesale_terms}
              </p>
              <p>
                <strong>Credit Limit:</strong> {validation.wholesale_credit}
              </p>
              <p>
                <strong>Discount:</strong> {validation.wholesale_discount}%
              </p>
            </S.TermsCard>

            <S.TermsCard>
              <h3>Credit Team Validation</h3>
              <p>
                <strong>Invoicing Company:</strong>{" "}
                {validation.credit_invoicing_company}
              </p>
              <p>
                <strong>Warehouse:</strong> {validation.credit_warehouse}
              </p>
              <p>
                <strong>Currency:</strong> {validation.credit_currency}
              </p>
              <p>
                <strong>Terms:</strong> {validation.credit_terms}
              </p>
              <p>
                <strong>Credit Limit:</strong> {validation.credit_credit}
              </p>
              <p>
                <strong>Discount:</strong> {validation.credit_discount}%
              </p>
            </S.TermsCard>
          </S.TermsCardsContainer>
        )}

        {(customerForm.status === "approved by the credit team" ||
          customerForm.status === "data corrected by the client") && (
          <S.FeedbackGroup>
            <S.Label htmlFor="feedback">
              Feedback (required if rejected)
            </S.Label>
            <S.Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain the reason for rejection..."
            />
          </S.FeedbackGroup>
        )}

        {/* ✅ Botões de Aprovação/Reprovação */}
        <S.ButtonContainer>
          {customerForm.status === "approved by the CSC team" ? (
            <S.Button onClick={handleFinish} variant="primary">
              Finish
            </S.Button>
          ) : (
            <>
              <S.Button
                onClick={() => handleApproval(false)}
                variant="secondary"
              >
                Reject
              </S.Button>
              <S.Button onClick={() => handleApproval(true)} variant="primary">
                Approve
              </S.Button>
            </>
          )}
        </S.ButtonContainer>

        {showModal && (
          <S.Modal>
            <S.ModalContent>
              <S.ModalTitle>
                <CircleCheck size={48} />
              </S.ModalTitle>
              <S.ModalDescription>
                {modalContent.description}
              </S.ModalDescription>
              <S.ModalButton onClick={closeModal}>Ok</S.ModalButton>
            </S.ModalContent>
          </S.Modal>
        )}
      </S.Container>
    </S.ContainerMain>
  );
}
