"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/supabase/index";
import * as S from "./styles";
import { User, MapPin, Mail, CircleCheck } from "lucide-react";

interface CustomerForm {
  id: string;
  customer_name: string;
  sales_tax_id: string;
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
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", description: "" });
  const router = useRouter();

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

  // ✅ Obtém o usuário autenticado (garante que apenas CSC acessa)
  useEffect(() => {
    if (typeof window === "undefined") return

    const fetchUser = async () => {
      try {
        const currentUser = await api.getCurrentUser()
        if (!currentUser) return
        setUser({ email: currentUser.email, role: currentUser.userType })
      } catch (err) {
        console.error("Erro ao obter usuário:", err)
      }
    }

    fetchUser()
  }, [])
  
  

  // ✅ Aprovação/Rejeição do Cliente
  const handleApproval = async (approved: boolean) => {
    if (!user) return;

    try {
      setLoading(true);

      await api.validateCSCCustomer(id as string, approved);

      setModalContent({
        title: "Ok!",
        description: approved ? "Client approved by the CSC team!" : "Customer rejected and returned to Credit team!",
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
          <S.StatusBadge status={customerForm.status}>{customerForm.status}</S.StatusBadge>
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
              <strong>Resale Certificate:</strong>{" "}
              {customerForm.resale_certificate ? (
                <a href={customerForm.resale_certificate} target="_blank" rel="noopener noreferrer">
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

        {/* ✅ Botões de Aprovação/Reprovação */}
        <S.ButtonContainer>
          <S.Button onClick={() => handleApproval(false)} variant="secondary">
            Reject
          </S.Button>
          <S.Button onClick={() => handleApproval(true)} variant="primary">
            Approve
          </S.Button>
        </S.ButtonContainer>

        {showModal && (
          <S.Modal>
            <S.ModalContent>
            <S.ModalTitle>
              <CircleCheck size={48}/>
            </S.ModalTitle>
              <S.ModalDescription>{modalContent.description}</S.ModalDescription>
              <S.ModalButton onClick={closeModal}>Ok</S.ModalButton>
            </S.ModalContent>
          </S.Modal>
        )}
      </S.Container>
    </S.ContainerMain>
  );
}
