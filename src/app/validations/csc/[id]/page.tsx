// src/app/validations/csc/[id]/page.tsx
"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/supabase/index";
import * as S from "./styles";
import { User, MapPin, Mail, CircleCheck, Pencil, Check, X } from "lucide-react"; // Import Pencil, Check, X

interface Address {
  street: string;
  zipCode: string;
  city: string;
  state: string;
  county: string;
  country: string;
}

interface CustomerForm {
  id: string;
  customer_name: string;
  sales_tax_id: string;
  duns_number: string;
  dba_number: string;
  resale_certificate: string;
  billing_address: string; // This is a JSON string of Address[]
  shipping_address: string; // This is a JSON string of Address[]
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
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const [feedback, setFeedback] = useState("");
  const router = useRouter();

  // States for editable DUNS field ONLY
  const [editingDuns, setEditingDuns] = useState(false);
  const [editedDuns, setEditedDuns] = useState("");


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
      // Ensure id is a string before passing to API
      if (typeof id === 'string') {
        const validationData = await api.getCustomerValidationDetails(id);
        if (validationData) setValidation(validationData);
      }
    };

    if (id) fetchValidationDetails();
  }, [id]);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        // Ensure id is a string before passing to API
        if (typeof id === 'string') {
          const data = await api.getCustomerFormById(id);
          if (!data) throw new Error("Formulário não encontrado.");
          setCustomerForm(data);
          // Initialize editable DUNS state with fetched data
          setEditedDuns(data.duns_number || "");
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do cliente:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomerDetails();
  }, [id]);

  // Function to handle saving edits for D-U-N-S
 const handleSaveDuns = async () => {
    if (!customerForm || typeof id !== 'string') return; // Ensure customerForm and id are valid
    try {
      setLoading(true);
      // Alterado para passar apenas id e editedDuns
      await api.updateDunsNumber(id, editedDuns);
      setCustomerForm(prev => prev ? { ...prev, duns_number: editedDuns } : null);
      setEditingDuns(false);
    } catch (err) {
      console.error("Error updating D-U-N-S:", err);
      setModalContent({
        title: "Erro!",
        description: err instanceof Error ? err.message : "Erro ao atualizar D-U-N-S.",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };


  const handleApproval = async (approved: boolean) => {
    try {
      setLoading(true);
      // Ensure id is a string before passing to API
      if (typeof id !== 'string') {
        throw new Error("ID do cliente inválido.");
      }

      if (!approved && !feedback.trim()) {
        setModalContent({
          title: "Error!",
          description: "Feedback is required when rejecting a customer.",
        });
        setShowModal(true);
        return;
      }

      await api.validateCSCCustomer(id, approved, feedback);

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
    // If modal is for success/rejection, redirect
    if (modalContent.title === "Ok!" || modalContent.title === "Error!") {
      router.push("/validations/csc");
    }
    // If modal is for update errors, just close it.
  };

  // Helper function to render an address
  const renderAddress = (address: Address) => (
    <>
      {address.street && <p>{address.street}</p>}
      {address.city && address.state && address.zipCode && (
        <p>{address.city}, {address.state} {address.zipCode}</p>
      )}
      {address.county && <p>{address.county}</p>}
      {address.country && <p>{address.country}</p>}
    </>
  );


  if (loading) return <S.Message>Loading...</S.Message>;
  if (error) return <S.Message>Erro: {error}</S.Message>;
  if (!customerForm) return <S.Message>Formulário não encontrado.</S.Message>;

  let parsedBillingAddresses: Address[] = [];
  try {
    // Only parse if customerForm.billing_address exists and is a string
    if (customerForm.billing_address && typeof customerForm.billing_address === 'string') {
        parsedBillingAddresses = JSON.parse(customerForm.billing_address);
    }
  } catch (e) {
    console.error("Error parsing billing address JSON:", e);
    // Fallback if parsing fails or data is not a string, display as plain text or empty
    parsedBillingAddresses = [{
      street: customerForm.billing_address || '', // Use empty string if null/undefined
      zipCode: '', city: '', state: '', county: '', country: ''
    }];
  }

  let parsedShippingAddresses: Address[] = [];
  try {
    // Only parse if customerForm.shipping_address exists and is a string
    if (customerForm.shipping_address && typeof customerForm.shipping_address === 'string') {
        parsedShippingAddresses = JSON.parse(customerForm.shipping_address);
    }
  } catch (e) {
    console.error("Error parsing shipping address JSON:", e);
    // Fallback if parsing fails or data is not a string, display as plain text or empty
    parsedShippingAddresses = [{
      street: customerForm.shipping_address || '', // Use empty string if null/undefined
      zipCode: '', city: '', state: '', county: '', country: ''
    }];
  }


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

            {/* D-U-N-S Number (Editable) */}
            <S.FormRow>
              <strong>D-U-N-S:</strong>{" "}
              {editingDuns ? (
                <S.EditableValueContainer>
                  <S.EditInput
                    type="text"
                    value={editedDuns}
                    onChange={(e) => setEditedDuns(e.target.value)}
                  />
                  <S.EditButtonContainer>
                    <S.ActionButton onClick={handleSaveDuns} color="green">
                      <Check size={16} />
                    </S.ActionButton>
                    <S.ActionButton onClick={() => { setEditingDuns(false); setEditedDuns(customerForm.duns_number || ""); }} color="red">
                      <X size={16} />
                    </S.ActionButton>
                  </S.EditButtonContainer>
                </S.EditableValueContainer>
              ) : (
                <S.EditableValueContainer>
                  {/* The className "flex items-center ml-1" seems like Tailwind, ensure it's compatible or remove if not needed */}
                  <span className="flex items-center ml-1">
                    {customerForm.duns_number || "Not provided"}
                    <S.EditIcon onClick={() => setEditingDuns(true)}>
                      <Pencil size={16} />
                    </S.EditIcon>
                  </span>
                </S.EditableValueContainer>
              )}
            </S.FormRow>

            {/* DBA Number (NOT Editable - Simple Display) */}
            <S.FormRow>
              <strong>DBA:</strong> {customerForm.dba_number || "Not provided"}
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
            {/* Display Billing Addresses */}
            {parsedBillingAddresses.length > 0 ? parsedBillingAddresses.map((address, index) => (
              <S.AddressBlock key={`billing-${index}`}>
                <S.AddressTitle>Billing Address {parsedBillingAddresses.length > 1 ? index + 1 : ''}:</S.AddressTitle>
                {renderAddress(address)}
              </S.AddressBlock>
            )) : <S.AddressBlock>No billing address provided.</S.AddressBlock>} {/* Fallback for no addresses */}

            {/* Display Shipping Addresses */}
            {parsedShippingAddresses.length > 0 ? parsedShippingAddresses.map((address, index) => (
              <S.AddressBlock key={`shipping-${index}`}>
                <S.AddressTitle>Shipping Address {parsedShippingAddresses.length > 1 ? index + 1 : ''}:</S.AddressTitle>
                {renderAddress(address)}
              </S.AddressBlock>
            )) : <S.AddressBlock>No shipping address provided.</S.AddressBlock>} {/* Fallback for no addresses */}
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