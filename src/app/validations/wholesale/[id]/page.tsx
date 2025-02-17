"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, supabase } from "../../../../lib/supabaseApi";
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
  const { id } = useParams(); // 📌 Obtém o ID do cliente da URL
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState({
    warehouse: false,
    invoicingCompany: false,
    currency: false,
    terms: false,
    discount: false,
    credit: false,
  });
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = supabase.auth.user();
      console.log("Usuário autenticado:", user); // Verifique os detalhes do usuário
      if (user) {
        setUserEmail(user.email);
      }
    };
  
    fetchUser();
  }, []);
  

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

    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  const handleCheckboxChange = (field: string) => {
    setTerms((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleApproval = async (approved: boolean) => {
    if (userEmail !== "wholesale@farm.com") {
      alert("Você não tem permissão para validar os clientes do time de Atacado.");
      return;
    }
  
    try {
      setLoading(true);
      
      // ✅ Validação dos checkboxes antes de aprovar
      if (approved) {
        const allTermsAccepted = Object.values(terms).every((term) => term);
        if (!allTermsAccepted) {
          throw new Error("Marque todos os termos para aprovar!");
        }
      }
  
      await api.validateCustomer(id as string, "atacado", approved, terms);
      alert(approved ? "Cliente aprovado! Segue para o time de Crédito." : "Cliente reprovado!");
      router.push("/validations");
    } catch (err) {
      console.error("Erro ao validar cliente:", err);
      alert(err instanceof Error ? err.message : "Erro desconhecido"); // ✅ Mostra erro específico
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

      <S.TermsContainer>
        <S.TermsTitle>Termos de Validação (Time de Atacado)</S.TermsTitle>
        <S.CheckboxWrapper>
          <S.CheckboxLabel>
            <S.Checkbox type="checkbox" checked={terms.warehouse} onChange={() => handleCheckboxChange("warehouse")} />
            Warehouse (Shipped From)
          </S.CheckboxLabel>
          <S.CheckboxLabel>
            <S.Checkbox type="checkbox" checked={terms.invoicingCompany} onChange={() => handleCheckboxChange("invoicingCompany")} />
            Invoicing Company
          </S.CheckboxLabel>
          <S.CheckboxLabel>
            <S.Checkbox type="checkbox" checked={terms.currency} onChange={() => handleCheckboxChange("currency")} />
            Currency
          </S.CheckboxLabel>
          <S.CheckboxLabel>
            <S.Checkbox type="checkbox" checked={terms.terms} onChange={() => handleCheckboxChange("terms")} />
            Terms
          </S.CheckboxLabel>
          <S.CheckboxLabel>
            <S.Checkbox type="checkbox" checked={terms.discount} onChange={() => handleCheckboxChange("discount")} />
            Discount
          </S.CheckboxLabel>
          <S.CheckboxLabel>
            <S.Checkbox type="checkbox" checked={terms.credit} onChange={() => handleCheckboxChange("credit")} />
            Credit
          </S.CheckboxLabel>
        </S.CheckboxWrapper>
      </S.TermsContainer>

      <S.ButtonContainer>
        <S.RejectButton onClick={() => handleApproval(false)}>Reprovar</S.RejectButton>
        <S.ApproveButton onClick={() => handleApproval(true)}>Aprovar</S.ApproveButton>

      </S.ButtonContainer>

      {/* <S.Button onClick={() => router.push("/validations")}>Voltar</S.Button> */}
    </S.Container>
  );
}
