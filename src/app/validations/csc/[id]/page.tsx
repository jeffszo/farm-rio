"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/supabaseApi";
import * as S from "./styles";

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
  const router = useRouter();

  const [terms, setTerms] = useState({
    warehouse: false,
    invoicingCompany: false,
    currency: false,
    terms: false,
    discount: false,
    credit: false,
  });

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

  // ✅ Obtém o usuário autenticado (vindo do login)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }
        setUser({ email: currentUser.email, role: currentUser.userType });
      } catch (err) {
        console.error("Erro ao obter usuário:", err);
      }
    };
    fetchUser();
  }, [router]);

  // ✅ Função para marcar os checkboxes
  const handleCheckboxChange = (field: string) => {
    setTerms((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ✅ Aprovação/Reprovação do Cliente
  const handleApproval = async (approved: boolean) => {
    if (!user) return;

    try {
      setLoading(true);

      // ✅ Validação antes de aprovar
      if (approved) {
        const allTermsAccepted = Object.values(terms).every((term) => term);
        if (!allTermsAccepted) {
          throw new Error("⚠️ Marque todos os termos para aprovar!");
        }
      }

      await api.validateCreditCustomer(id as string, approved, terms);

      alert(approved ? "✅ Cliente aprovado! Segue para o time CSC." : "❌ Cliente reprovado!");
      router.push("/validations/csc");
    } catch (err) {
      console.error("Erro ao validar cliente:", err);
      alert(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <S.Message>Carregando...</S.Message>;
  if (error) return <S.Message>Erro: {error}</S.Message>;
  if (!customerForm) return <S.Message>Formulário não encontrado.</S.Message>;

  return (
    <S.Container>
      <S.Title>Detalhes do Cliente</S.Title>
      <S.FormDetails>
        <S.FormRow><strong>Nome:</strong> {customerForm.customer_name}</S.FormRow>
        <S.FormRow><strong>Tax ID:</strong> {customerForm.sales_tax_id}</S.FormRow>
        <S.FormRow><strong>Resale Certificate:</strong> {customerForm.resale_certificate}</S.FormRow>
        <S.FormRow><strong>Billing Address:</strong> {customerForm.billing_address}</S.FormRow>
        <S.FormRow><strong>Shipping Address:</strong> {customerForm.shipping_address}</S.FormRow>
        <S.FormRow><strong>AP Contact:</strong> {customerForm.ap_contact_name} ({customerForm.ap_contact_email})</S.FormRow>
        <S.FormRow><strong>Buyer:</strong> {customerForm.buyer_name} ({customerForm.buyer_email})</S.FormRow>
        <S.FormRow><strong>Status:</strong> {customerForm.status}</S.FormRow>
      </S.FormDetails>

      {/* ✅ Checkboxes de Aprovação */}
      {/* <S.TermsContainer>
        <S.TermsTitle>Termos de Validação (Time CSC)</S.TermsTitle>
        <S.CheckboxWrapper>
          {Object.keys(terms).map((key) => (
            <S.CheckboxLabel key={key}>
              <S.Checkbox type="checkbox" checked={terms[key as keyof typeof terms]} onChange={() => handleCheckboxChange(key)} />
              {key.replace(/([A-Z])/g, " $1").trim()}
            </S.CheckboxLabel>
          ))}
        </S.CheckboxWrapper>
      </S.TermsContainer> */}

      {/* ✅ Botões de Aprovação/Reprovação */}
      <S.ButtonContainer>
        <S.RejectButton onClick={() => handleApproval(false)}>Reprovar</S.RejectButton>
        <S.ApproveButton onClick={() => handleApproval(true)}>Aprovar</S.ApproveButton>
      </S.ButtonContainer>
    </S.Container>
  );
}
