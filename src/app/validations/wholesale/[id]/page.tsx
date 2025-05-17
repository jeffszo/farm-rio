"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/supabase/index";
import { CircleCheck } from "lucide-react";
import * as S from "./styles";
import {
  User,
  MapPin,
  Mail,
  Building2,
  Warehouse,
  CreditCard,
  Calendar,
  DollarSign,
  Percent,
  Pencil,
  Check,
  X,
} from "lucide-react";

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
  atacado_invoicing_company?: string;
  atacado_warehouse?: string;
  atacado_currency?: string;
  atacado_terms?: string;
  atacado_credit?: number;
  atacado_discount?: number;
}

type WholesaleTerms = {
  wholesale_invoicing_company: string;
  wholesale_warehouse: string;
  wholesale_currency: string;
  wholesale_terms: string;
  wholesale_credit: number;
  wholesale_discount: number;
};

const INVOICING_COMPANIES = [
  "Plantage Rio Inc - United States",
  "Soma Brands International - European Union",
  "Soma Brands UK Limited - United Kingdom",
  "Soma Brands France - France",
];

const CURRENCIES = ["USD", "EUR", "GBP"];

const PAYMENT_TERMS = [
  "100% Prior Ship",
  "Net 45 Days",
  "Net 30 Days",
  "Net 90 Days",
  "Net 15 Days",
];

export default function ValidationDetailsPage() {
  const { id } = useParams();
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; role: string } | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const router = useRouter();
  const [newDuns, setNewDuns] = useState("");
  const [editingDuns, setEditingDuns] = useState(false);
  const [savingDuns, setSavingDuns] = useState(false);

  useEffect(() => {
    if (customerForm?.duns_number) {
      setNewDuns(customerForm.duns_number);
    }
  }, [customerForm]);

  const [terms, setTerms] = useState<WholesaleTerms>({
    wholesale_invoicing_company: "",
    wholesale_warehouse: "",
    wholesale_currency: "",
    wholesale_terms: "",
    wholesale_credit: 0,
    wholesale_discount: 0,
  });

  const [warehouses, setWarehouses] = useState<string[]>([]);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getCustomerFormById(id as string);
        console.log("ID recebido:", id);
        console.log("Dados do formulário:", data);
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchUser = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        if (!currentUser) return;
        setUser({ email: currentUser.email, role: currentUser.userType });
      } catch (err) {
        console.error("Erro ao obter usuário:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!terms.wholesale_invoicing_company) {
        setWarehouses([]);
        return;
      }

      try {
        const warehouses = await api.getWarehousesByCompany(
          terms.wholesale_invoicing_company
        );
        setWarehouses(
          warehouses.map((warehouse: { name: string }) => warehouse.name)
        );
      } catch (err) {
        console.error("Erro ao buscar warehouses:", err);
        setWarehouses([]);
      }
    };

    fetchWarehouses();
  }, [terms.wholesale_invoicing_company]);

  const handleTermChange = (
    field: keyof WholesaleTerms,
    value: string | number
  ) => {
    if (field === "wholesale_credit" || field === "wholesale_discount") {
      const numericValue = value === "" ? 0 : Number(value);

      if (isNaN(numericValue)) return;

      setTerms((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setTerms((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleApproval = async (approved: boolean) => {
    console.log("Iniciando handleApproval. approved =", approved);
  
    // 🚫 REMOVIDO: verificação de usuário autenticado
  
    try {
      setLoading(true);
      console.log("Loading true");
  
      if (approved) {
        // Validações específicas para aprovação
        const requiredFields: (keyof WholesaleTerms)[] = [
          "wholesale_invoicing_company",
          "wholesale_warehouse",
          "wholesale_currency",
          "wholesale_terms",
        ];
        const missingFields = requiredFields.filter((field) => !terms[field]);
        if (missingFields.length > 0) {
          throw new Error(
            `⚠️ Please fill in all required fields: ${missingFields.join(", ")}`
          );
        }
        if (terms.wholesale_credit < 0 || terms.wholesale_discount < 0) {
          throw new Error("⚠️ Credit limit and discount must be non-negative!");
        }
      }
  
      console.log("Chamando validateWholesaleCustomer");
      await api.validateWholesaleCustomer(id as string, approved, {
        wholesale_invoicing_company: terms.wholesale_invoicing_company,
        wholesale_warehouse: terms.wholesale_warehouse,
        wholesale_currency: terms.wholesale_currency,
        wholesale_terms: terms.wholesale_terms,
        wholesale_credit: terms.wholesale_credit,
        wholesale_discount: terms.wholesale_discount,
      });
  
      console.log("Validação finalizada com sucesso");
  
      if (customerForm) {
        setCustomerForm({
          ...customerForm,
          status: approved ? "approved" : "rejected",
        });
      }
  
      setModalContent({
        title: "Ok!",
        description: approved
          ? "Client approved! Forwarded to the credit team."
          : "Customer rejected!",
      });
      setShowModal(true);
      console.log("Modal de sucesso exibido");
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
  
  

  const handleSaveDuns = async () => {
    try {
      setSavingDuns(true);
      await api.updateDunsNumber(id as string, newDuns);

      // Update the local state to reflect the change
      if (customerForm) {
        setCustomerForm({
          ...customerForm,
          duns_number: newDuns,
        });
      }

      setEditingDuns(false);
    } catch (error) {
      console.error("Error updating DUNS number:", error);
      // Optionally show an error message to the user
    } finally {
      setSavingDuns(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original value and exit edit mode
    if (customerForm) {
      setNewDuns(customerForm.duns_number || "");
    }
    setEditingDuns(false);
  };

  const closeModal = () => {
    setShowModal(false);
    router.push("/validations/wholesale");
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
              <strong>DBA:</strong> {customerForm.dba_number || "Not provided"}
            </S.FormRow>
            <S.FormRow className="flex items-center">
              <strong>D-U-N-S:</strong>{" "}
              {editingDuns ? (
                <S.InlineEditWrapper>
                  <S.SmallInput
                    type="text"
                    value={newDuns}
                    onChange={(e) => setNewDuns(e.target.value)}
                    disabled={savingDuns}
                    autoFocus
                  />
                  <S.ContainerCheck>
                    <S.CheckButton
                      onClick={handleSaveDuns}
                      disabled={savingDuns}
                      title="Save"
                    >
                      <Check size={16} />
                    </S.CheckButton>
                    <S.CancelButton
                      onClick={handleCancelEdit}
                      disabled={savingDuns}
                      title="Cancel"
                    >
                      <X size={16} />
                    </S.CancelButton>
                  </S.ContainerCheck>
                </S.InlineEditWrapper>
              ) : (
                <span className="flex items-center ml-1">
                  {customerForm.duns_number || "Not provided"}
                  <S.EditIcon onClick={() => setEditingDuns(true)}>
                    <Pencil size={16} />
                  </S.EditIcon>
                </span>
              )}
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

        <S.TermsContainer>
          <S.TermsTitle>Validation Terms (Wholesale Team)</S.TermsTitle>
          <S.TermsGrid>
            <S.TermsSection>
              <label>
                <Building2 size={16} /> Invoicing Company
              </label>
              <S.Select
                value={terms.wholesale_invoicing_company}
                onChange={(e) =>
                  handleTermChange(
                    "wholesale_invoicing_company",
                    e.target.value
                  )
                }
              >
                <option value="">Select company</option>
                {INVOICING_COMPANIES.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </S.Select>
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <Warehouse size={16} /> Warehouse
              </label>
              <S.Select
                value={terms.wholesale_warehouse}
                onChange={(e) =>
                  handleTermChange("wholesale_warehouse", e.target.value)
                }
                disabled={!terms.wholesale_invoicing_company}
              >
                <option value="">Select warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </S.Select>
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <CreditCard size={16} /> Currency
              </label>
              <S.Select
                value={terms.wholesale_currency}
                onChange={(e) =>
                  handleTermChange("wholesale_currency", e.target.value)
                }
              >
                <option value="">Select currency</option>
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </S.Select>
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <Calendar size={16} /> Payment Terms
              </label>
              <S.Select
                value={terms.wholesale_terms}
                onChange={(e) =>
                  handleTermChange("wholesale_terms", e.target.value)
                }
              >
                <option value="">Select terms</option>
                {PAYMENT_TERMS.map((term, index) => (
                  <option key={`${term}-${index}`} value={term}>
                    {term}
                  </option>
                ))}
              </S.Select>
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <DollarSign size={16} /> Credit Limit
              </label>
              <S.NumericInput
                value={terms.wholesale_credit}
                onChange={(e) =>
                  handleTermChange("wholesale_credit", e.target.value)
                }
                min="0"
                step="0.01"
              />
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <Percent size={16} /> Discount
              </label>
              <S.NumericInput
                value={terms.wholesale_discount}
                onChange={(e) =>
                  handleTermChange("wholesale_discount", e.target.value)
                }
                min="0"
                max="100"
                step="0.1"
              />
            </S.TermsSection>
          </S.TermsGrid>
        </S.TermsContainer>

        <S.ButtonContainer>
  <S.Button onClick={() => handleApproval(false)} variant="secondary">
    Reject
  </S.Button>
  
  <S.Button
  variant="primary"
    onClick={() => {
      console.log("Clique detectado!")
      handleApproval(true)
    }}
  >
    Approve
  </S.Button>
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
