// src/app/validations/csc/[id]/page.tsx
"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/supabase/index";
import * as S from "./styles";
import {
  User,
  MapPin,
  Mail,
  CircleCheck,
  Pencil,
  Check,
  X,
  Copy,
  Building2,
  Warehouse,
  CreditCard,
  Calendar,
  DollarSign,
  Percent,
  MessageSquare 
} from "lucide-react";

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
  photo_urls: string[];
  instagram: string;
  website: string;
  branding_mix: string;
  financial_statements: string;
  billing_address: string;
  shipping_address: string;
  ap_contact_name: string;
  ap_contact_email: string;
  buyer_name: string;
  buyer_email: string;
  status: string;
  created_at: string;
  wholesale_feedback: string;
}

interface ValidationDetails {
  wholesale_invoicing_company: string;
  wholesale_warehouse: string;
  wholesale_currency: string;
  wholesale_terms: string;
  wholesale_credit: number;
  wholesale_discount: number;
  credit_invoicing_company: string;
  credit_warehouse: string;
  credit_currency: string;
  credit_terms: string;
  credit_credit: number;
  credit_discount: number;
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
      if (typeof id === "string") {
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
        if (typeof id === "string") {
          const data = await api.getCustomerValidationDetails(id);
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
    if (!customerForm || typeof id !== "string") return; // Ensure customerForm and id are valid
    try {
      setLoading(true);
      // Alterado para passar apenas id e editedDuns
      await api.updateDunsNumber(id, editedDuns);
      setCustomerForm((prev) =>
        prev ? { ...prev, duns_number: editedDuns } : null
      );
      setEditingDuns(false);
    } catch (err) {
      console.error("Error updating D-U-N-S:", err);
      setModalContent({
        title: "Erro!",
        description:
          err instanceof Error ? err.message : "Erro ao atualizar D-U-N-S.",
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
      if (typeof id !== "string") {
        throw new Error("ID do cliente inválido.");
      }

      if (!approved && !feedback.trim()) {
        setModalContent({
          title: "Error!",
          description: "Feedback is required when requesting a customer review.",
        });
        setShowModal(true);
        return;
      }

      let statusUpdated = false;

      if (customerForm?.status === "approved by the credit team") {
        await api.validateCSCFinalCustomer(id, approved, feedback); // Etapa 6
        statusUpdated = true;
      } else {
        await api.validateCSCInitialCustomer(id, approved, feedback); // Etapa 2
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        statusUpdated = true;
      }

      // --- NOVA ADIÇÃO: Enviar e-mail após a validação CSC ---
      // if (statusUpdated && customerForm) {
      //   try {
      //     const emailResponse = await fetch("/api/send-csc-validation-email", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({
      //         customerId: id,
      //         customerName: customerForm.customer_name,
      //         customerEmail: customerForm.buyer_email, // Assumindo que o buyer_email é o email do cliente para notificação
      //         validationStatus: approved,
      //         feedback: feedback,
      //         currentStatus: customerForm.status, // Envia o status atual para a rota para diferenciar os e-mails
      //       }),
      //     });

      //     if (!emailResponse.ok) {
      //       const errorData = await emailResponse.json();
      //       console.error("Falha ao enviar e-mail de validação CSC:", errorData);
      //       // Você pode optar por mostrar um erro aqui ou apenas logar, dependendo da criticidade do e-mail
      //     } else {
      //       console.log("E-mail de validação CSC enviado com sucesso.");
      //     }
      //   } catch (emailError) {
      //     console.error("Erro ao enviar e-mail de validação CSC:", emailError);
      //   }
      // }
      // --- FIM DA NOVA ADIÇÃO ---

      setModalContent({
        title: "Ok!",
        description: approved
          ? "Customer approved!"
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
        <p>
          {address.city}, {address.state} {address.zipCode}
        </p>
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
    if (
      customerForm.billing_address &&
      typeof customerForm.billing_address === "string"
    ) {
      parsedBillingAddresses = JSON.parse(customerForm.billing_address);
    }
  } catch (e) {
    console.error("Error parsing billing address JSON:", e);
    // Fallback if parsing fails or data is not a string, display as plain text or empty
    parsedBillingAddresses = [
      {
        street: customerForm.billing_address || "", // Use empty string if null/undefined
        zipCode: "",
        city: "",
        state: "",
        county: "",
        country: "",
      },
    ];
  }

  let parsedShippingAddresses: Address[] = [];
  try {
    // Only parse if customerForm.shipping_address exists and is a string
    if (
      customerForm.shipping_address &&
      typeof customerForm.shipping_address === "string"
    ) {
      parsedShippingAddresses = JSON.parse(customerForm.shipping_address);
    }
  } catch (e) {
    console.error("Error parsing shipping address JSON:", e);
    // Fallback if parsing fails or data is not a string, display as plain text or empty
    parsedShippingAddresses = [
      {
        street: customerForm.shipping_address || "", // Use empty string if null/undefined
        zipCode: "",
        city: "",
        state: "",
        county: "",
        country: "",
      },
    ];
  }

  let parsedPhotoUrls: string[] = [];
  try {
    if (
      customerForm.photo_urls &&
      typeof customerForm.photo_urls === "string"
    ) {
      parsedPhotoUrls = JSON.parse(customerForm.photo_urls);
    } else if (Array.isArray(customerForm.photo_urls)) {
      // Handle case if already an array
      parsedPhotoUrls = customerForm.photo_urls;
    }
  } catch (e) {
    console.error("Error parsing photo_urls JSON:", e);
    parsedPhotoUrls = []; // Fallback to empty array on error
  }

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setModalContent({
        title: "Sucesso!",
        description: "Número de Tax ID copiado para a área de transferência!",
      });
      setShowModal(true);
    } catch (err) {
      console.error("Erro ao copiar: ", err);
      setModalContent({
        title: "Erro!",
        description: "Falha ao copiar o número de Tax ID.",
      });
      setShowModal(true);
    }
  };

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
          {/* Customer Information Section */}
          <S.FormSection>
            <S.SectionTitle>
              <User size={16} /> Customer Information
            </S.SectionTitle>
            <S.FormRow>
              <strong>Legal Name:</strong> {customerForm.customer_name}
            </S.FormRow>
            <S.FormRow>
              <strong>Tax ID:</strong>{" "}
              <S.ValueWithCopy>
                {/* Novo Styled Component para alinhar valor e botão */}
                {customerForm.sales_tax_id}
                {customerForm.sales_tax_id && (
                  <S.CopyButton
                    onClick={() => handleCopyToClipboard(customerForm.sales_tax_id)}
                  >
                    <Copy size={16} />
                  </S.CopyButton>
                )}
              </S.ValueWithCopy>
            </S.FormRow>

            {/* D-U-N-S Number (Editable) */}
            <S.FormRow
              // style={{
              //   alignItens: "center",
              // }}
            >
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

                    <S.ActionButton
                      onClick={() => {
                        setEditingDuns(false);
                        setEditedDuns(customerForm.duns_number || "");
                      }}
                      color="red"
                    >
                      <X size={16} />
                    </S.ActionButton>
                  </S.EditButtonContainer>
                </S.EditableValueContainer>
              ) : (
                <S.EditableValueContainer>
                  {/* The className "flex items-center ml-1" seems like Tailwind, ensure it's compatible or remove if necessary */}
                  {customerForm.duns_number || "N/A"}
                  <S.ActionButton onClick={() => setEditingDuns(true)}>
                    <Pencil size={16} />
                  </S.ActionButton>
                </S.EditableValueContainer>
              )}
            </S.FormRow>

            {/* <S.FormRow>
              <strong>Branding Mix:</strong> {customerForm.branding_mix || "N/A"}
            </S.FormRow> */}

            <S.FormRow>
              <strong>DBA:</strong> {customerForm.dba_number || "N/A"}
            </S.FormRow>
            <S.FormRow>
              <strong>Instagram:</strong>{" "}
              {customerForm.instagram ? (
                <a
                  href={customerForm.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Access Instagram
                </a>
              ) : (
                "N/A"
              )}
            </S.FormRow>
            <S.FormRow>
              <strong>Website:</strong>{" "}
              {customerForm.website ? (
                <a
                  href={customerForm.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Access Website
                </a>
              ) : (
                "N/A"
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
                "N/A"
              )}
            </S.FormRow>

            <S.FormRow>
              <strong>Financial Statements:</strong>{" "}
              {customerForm.financial_statements ? (
                <a
                  href={customerForm.financial_statements}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View PDF
                </a>
              ) : (
                "N/A"
              )}
            </S.FormRow>
            <S.FormRow>
              <strong>Photos:</strong>{" "}
              {parsedPhotoUrls.length > 0 ? (
                <S.PhotoGallery>
                  {" "}
                  {/* Assuming you have a styled component for a gallery */}
                  {parsedPhotoUrls.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                      View Photo {parsedPhotoUrls.length > 1 ? index + 1 : ""}
                      {/* Or an image tag: <img src={url} alt={`Customer Photo ${index + 1}`} style={{ maxWidth: '100px', maxHeight: '100px', margin: '5px' }} /> */}
                    </a>
                  ))}
                </S.PhotoGallery>
              ) : (
                "Not sent"
              )}
            </S.FormRow>
          </S.FormSection>

          {/* Addresses Section */}
          <S.FormSection>
            <S.SectionTitle>
              <MapPin size={16} /> Addresses
            </S.SectionTitle>
            <S.AddressContainer>
              <S.AddressBlock>
                <S.AddressTitle>Billing Address</S.AddressTitle>
                {parsedBillingAddresses.length > 0 ? (
                  parsedBillingAddresses.map((address, index) => (
                    <div key={index}>{renderAddress(address)}</div>
                  ))
                ) : (
                  <p>No billing address provided.</p>
                )}
              </S.AddressBlock>
              <S.AddressBlock>
                <S.AddressTitle>Shipping Address</S.AddressTitle>
                {parsedShippingAddresses.length > 0 ? (
                  parsedShippingAddresses.map((address, index) => (
                    <div key={index}>{renderAddress(address)}</div>
                  ))
                ) : (
                  <p>No shipping address provided.</p>
                )}
              </S.AddressBlock>
            </S.AddressContainer>
          </S.FormSection>

          {/* Contact Information Section */}
          <S.FormSection>
            <S.SectionTitle>
              <Mail size={16} /> Billing Contacts
            </S.SectionTitle>
            {/* <S.FormRow>
              <strong>AP Contact Name:</strong> {customerForm.ap_contact_name || "N/A"}
            </S.FormRow>
            <S.FormRow>
              <strong>AP Contact Email:</strong> {customerForm.ap_contact_email || "N/A"}
            </S.FormRow> */}
            <S.FormRow>
              <strong>Buyer Name:</strong> {customerForm.buyer_name || "N/A"}
            </S.FormRow>
            <S.FormRow>
              <strong>Buyer Email:</strong> {customerForm.buyer_email || "N/A"}
            </S.FormRow>

                <S.Divider />

              
<S.SectionTitle>
  <MessageSquare size={16} /> Team Feedback
</S.SectionTitle>

<S.FormRow>
  <strong>Feedback:</strong>{" "}
  {customerForm.status === "approved by the wholesale team" ? (
    customerForm.wholesale_feedback || "No feedback provided by Wholesale Team."
  ) : customerForm.status === "approved by the credit team" ? (
    customerForm.credit_feedback || "No feedback provided by Credit Team."
  ) : (
    "No feedback available."
  )}
</S.FormRow>

          </S.FormSection>

          {/* Conditional Rendering for Wholesale and Credit Terms */}
          {(customerForm.status === "approved by the credit team" || customerForm.status === "approved by the wholesale team") && validation && (
            <>
              {/* Wholesale Terms Section */}
              <S.FormSection>
                <S.SectionTitle>
                  <DollarSign size={16} /> Wholesale Terms
                </S.SectionTitle>
                <S.TermsGrid>
                  <S.TermsSection>
                    <label>
                      <Building2 size={16} /> Invoicing Company
                    </label>
                    <S.InfoText>
                      {validation.wholesale_invoicing_company || "N/A"}
                    </S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <Warehouse size={16} /> Warehouse
                    </label>
                    <S.InfoText>{validation.wholesale_warehouse || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <CreditCard size={16} /> Currency
                    </label>
                    <S.InfoText>{validation.wholesale_currency || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <Calendar size={16} /> Payment Terms
                    </label>
                    <S.InfoText>{validation.wholesale_terms || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <DollarSign size={16} /> Credit Limit
                    </label>
                    <S.InfoText>
                      {validation.wholesale_credit !== undefined &&
                      validation.wholesale_credit !== null
                        ? validation.wholesale_credit.toFixed(2)
                        : "N/A"}
                    </S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <Percent size={16} /> Discount
                    </label>
                    <S.InfoText>
                      {validation.wholesale_discount !== undefined &&
                      validation.wholesale_discount !== null
                        ? validation.wholesale_discount.toFixed(1) + "%"
                        : "N/A"}
                    </S.InfoText>
                  </S.TermsSection>
                </S.TermsGrid>
              </S.FormSection>

              {/* Credit Terms Section */}
              <S.FormSection>
                <S.SectionTitle>
                  <CreditCard size={16} /> Credit Terms
                </S.SectionTitle>
                <S.TermsGrid>
                  <S.TermsSection>
                    <label>
                      <Building2 size={16} /> Invoicing Company
                    </label>
                    <S.InfoText>
                      {validation.credit_invoicing_company || "N/A"}
                    </S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <Warehouse size={16} /> Warehouse
                    </label>
                    <S.InfoText>{validation.credit_warehouse || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <CreditCard size={16} /> Currency
                    </label>
                    <S.InfoText>{validation.credit_currency || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <Calendar size={16} /> Payment Terms
                    </label>
                    <S.InfoText>{validation.credit_terms || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <DollarSign size={16} /> Credit Limit
                    </label>
                    <S.InfoText>
                      {validation.credit_credit !== undefined &&
                      validation.credit_credit !== null
                        ? validation.credit_credit.toFixed(2)
                        : "N/A"}
                    </S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <Percent size={16} /> Discount
                    </label>
                    <S.InfoText>
                      {validation.credit_discount !== undefined &&
                      validation.credit_discount !== null
                        ? validation.credit_discount.toFixed(1) + "%"
                        : "N/A"}
                    </S.InfoText>
                  </S.TermsSection>
                </S.TermsGrid>
              </S.FormSection>
            </>
          )}
        </S.FormDetails>

{customerForm.status !== "finished" && (
  <S.FeedbackGroup>
    <S.Label htmlFor="feedback">Observation</S.Label>
    <S.Textarea
      id="feedback"
      value={feedback}
      onChange={(e) => setFeedback(e.target.value)}
      placeholder="Explain the reason for rejection or add relevant..."
    />
  </S.FeedbackGroup>
)}

{customerForm.status !== "finished" && (
  <S.ButtonContainer>
    {customerForm.status === "approved by the CSC team" ? (
      <S.Button onClick={handleFinish} variant="primary">
        Finish
      </S.Button>
    ) : (
      <>
        <S.Button onClick={() => handleApproval(false)} variant="secondary">
          Review
        </S.Button>
        <S.Button onClick={() => handleApproval(true)} variant="primary">
          Approve
        </S.Button>
      </>
    )}
  </S.ButtonContainer>
)}

        {showModal && (
          <S.Modal>
            <S.ModalContent>
              <S.ModalTitle>
                <CircleCheck size={48} />
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