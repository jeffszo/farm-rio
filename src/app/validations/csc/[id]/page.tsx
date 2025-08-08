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
  MessageSquare,
  CircleAlert // Corrigido o typo CicleAlert para CircleAlert
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
  joor: string;
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
  credit_feedback: string;
  csc_initial_feedback: string;
  csc_final_feedback: string;
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
  estimated_purchase_amount: number;
  credit_discount: number;
}

export default function ValidationDetailsPage() {
  const { id } = useParams();
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
    shouldRedirect: false
  });
  const router = useRouter();

  // States for editable DUNS field ONLY
  const [editingDuns, setEditingDuns] = useState(false);
  const [editedDuns, setEditedDuns] = useState("");

  const [validation, setValidation] = useState<ValidationDetails | null>(null);

  // const handleFinish = async () => {
  //   try {
  //     setLoading(true);
  //     await api.finishCustomer(id as string);
  //     setModalContent({
  //       title: "Success!",
  //       description: "Customer finalized successfully!",
  //     });
  //     setShowModal(true);
  //   } catch (err) {
  //     console.error("Erro ao finalizar cliente:", err);
  //     setModalContent({
  //       title: "Erro!",
  //       description: err instanceof Error ? err.message : "Erro desconhecido",
  //     });
  //     setShowModal(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
          // Map API response to CustomerForm type
          const customerFormData: CustomerForm = {
            id: data.id,
            customer_name: data.customer_name,
            sales_tax_id: data.sales_tax_id,
            duns_number: data.duns_number,
            dba_number: data.dba_number,
            resale_certificate: data.resale_certificate,
            photo_urls:
              "photo_urls" in data
                ? Array.isArray(data.photo_urls)
                  ? data.photo_urls
                  : typeof data.photo_urls === "string"
                  ? (() => {
                      try {
                        const parsed = JSON.parse(data.photo_urls);
                        return Array.isArray(parsed) ? parsed : [];
                      } catch {
                        return [];
                      }
                    })()
                  : []
                : [],
            instagram: "instagram" in data && typeof data.instagram === "string" ? data.instagram : "",
            website: "website" in data ? (typeof data.website === "string" ? data.website : (data.website ? String(data.website) : "")) : "",
            branding_mix: "branding_mix" in data
              ? typeof data.branding_mix === "string"
                ? data.branding_mix
                : data.branding_mix
                ? JSON.stringify(data.branding_mix)
                : ""
              : "",
            joor: "joor" in data && typeof data.joor === "string" ? data.joor : "",
            financial_statements: "financial_statements" in data
              ? typeof data.financial_statements === "string"
                ? data.financial_statements
                : data.financial_statements
                ? JSON.stringify(data.financial_statements)
                : ""
              : "",
            billing_address: data.billing_address ?? "",
            shipping_address: data.shipping_address ?? "",
            ap_contact_name: typeof data.ap_contact_name === "string"
              ? data.ap_contact_name
              : data.ap_contact_name
              ? String(data.ap_contact_name)
              : "",
            ap_contact_email: data.ap_contact_email ?? "",
            buyer_name: data.buyer_name ?? "",
            buyer_email: data.buyer_email ?? "",
            status: data.status,
            created_at: data.created_at,
            wholesale_feedback: "wholesale_feedback" in data
              ? typeof data.wholesale_feedback === "string"
                ? data.wholesale_feedback
                : data.wholesale_feedback
                ? JSON.stringify(data.wholesale_feedback)
                : ""
              : "",
            credit_feedback: "credit_feedback" in data
              ? typeof data.credit_feedback === "string"
                ? data.credit_feedback
                : data.credit_feedback
                ? JSON.stringify(data.credit_feedback)
                : ""
              : "",
            csc_initial_feedback: "csc_initial_feedback" in data
              ? typeof data.csc_initial_feedback === "string"
                ? data.csc_initial_feedback
                : data.csc_initial_feedback
                ? JSON.stringify(data.csc_initial_feedback)
                : ""
              : "",
            csc_final_feedback: "csc_final_feedback" in data
              ? typeof data.csc_final_feedback === "string"
                ? data.csc_final_feedback
                : data.csc_final_feedback
                ? JSON.stringify(data.csc_final_feedback)
                : ""
              : "",
          };
          setCustomerForm(customerFormData);
          // Initialize editable DUNS state with fetched data
          setEditedDuns(customerFormData.duns_number || "");
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
        shouldRedirect: false,
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

const handleApproval = async (approved: boolean) => {
    if (!id || typeof id !== "string") {
        console.error("ID do cliente não encontrado.");
        return;
    }

 if (!approved && feedback.trim() === "") {
    setModalContent({
      title: "Error!",
      description: "Feedback is required when sending to review.",
      shouldRedirect: false, // Permanece na mesma página para o usuário corrigir
    });
    setShowModal(true);
    return;
  }

   try {
  setLoading(true);

  // Chamar a função adequada com base no status, passando o feedback
if (customerForm?.status === "approved by the wholesale team") {
    await api.validateCSCInitialCustomer(id, approved, feedback);
  } else if (
    customerForm?.status === "approved by the credit team" ||
    customerForm?.status === "review requested by the csc final team - customer"
  ) {
    await api.validateCSCFinalCustomer(id, approved, feedback);
  } else {
    throw new Error("Customer status is not valid for CSC validation");
  }


  // Exibe modal com mensagens diferentes para Aprovação e Revisão
  setModalContent({
    title: approved ? "Approved!" : "Review!",
    description: approved
      ? "Customer approved!"
      : "The form has been sent for the client's review. They can edit it now.",
      shouldRedirect:true,
  });

  setShowModal(true);
} catch (error) {
  console.error("Erro ao validar cliente:", error);
  setModalContent({
    title: "Erro",
    description: `Houve um erro: ${error instanceof Error ? error.message : String(error)}`,
    shouldRedirect: false,
  });
  setShowModal(true);
} finally {
  setLoading(false);
}

};


// ... O restante do seu componente
const closeModal = () => {
  setShowModal(false);
  if (modalContent.shouldRedirect) { // <<-- O if verifica o valor da propriedade
    router.push("/validations/csc");
  }
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
        title: "Success!",
        description: "Tax ID number copied to clipboard!",
        shouldRedirect: false,
      });
      setShowModal(true);
    } catch (err) {
      console.error("Erro ao copiar: ", err);
      setModalContent({
        title: "Error!",
        description: "Failed to copy Tax ID number..",
        shouldRedirect: false,
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
              <strong>Name:</strong> {customerForm.customer_name}
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
              <strong>JOOR:</strong>{" "}
              {customerForm.joor ? (
                <a
                  href={customerForm.joor}
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
            {parsedBillingAddresses.length > 0 ? (
              parsedBillingAddresses.map((address, index) => (
                <S.AddressBlock key={`billing-${index}`}>
                  <S.AddressTitle>
                    Billing Address{" "}
                    {parsedBillingAddresses.length > 1 ? index + 1 : ""}:
                  </S.AddressTitle>
                  {renderAddress(address)}
                </S.AddressBlock>
              ))
            ) : (
              <S.AddressBlock>No billing address provided.</S.AddressBlock>
            )}

            {parsedShippingAddresses.length > 0 ? (
              parsedShippingAddresses.map((address, index) => (
                <S.AddressBlock key={`shipping-${index}`}>
                  <S.AddressTitle>
                    Shipping Address{" "}
                    {parsedShippingAddresses.length > 1 ? index + 1 : ""}:
                  </S.AddressTitle>
                  {renderAddress(address)}
                </S.AddressBlock>
              ))
            ) : (
              <S.AddressBlock>No shipping address provided.</S.AddressBlock>
            )}
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
  <strong>
    {customerForm.status === "approved by the wholesale team"
      ? "Wholesale Feedback:"
      : customerForm.status === "approved by the credit team"
      ? "Credit Feedback:"
      : "Team Feedback:"}
  </strong>{" "}
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
          {(customerForm.status === "approved by the credit team" || customerForm.status === "approved by the wholesale team" || customerForm.status === "finished" || customerForm.status === "review requested by the csc final team - customer" ) && validation && (
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
                      <DollarSign size={16} />  Estimated Puchase Amount Per Season
                    </label>
                    <S.InfoText>
                      {validation.estimated_purchase_amount !== undefined &&
                      validation.estimated_purchase_amount !== null
                        ? validation.estimated_purchase_amount.toFixed(2)
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
                      <DollarSign size={16} /> Estimated Puchase Amount Per Season
                    </label>
                    <S.InfoText>
                     {validation.estimated_purchase_amount !== undefined &&
validation.estimated_purchase_amount !== null &&
!isNaN(Number(validation.estimated_purchase_amount)) 
  ? Number(validation.estimated_purchase_amount).toFixed(2)
  : 'N/A' 
}
                    </S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <label>
                      <Percent size={16} /> Discount
                    </label>
                    <S.InfoText>
{validation.credit_discount !== undefined &&
validation.credit_discount !== null &&
!isNaN(Number(validation.credit_discount))
  ? Number(validation.credit_discount).toFixed(1) + "%"
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
      <S.Button variant="primary">
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
                {/* Lógica do ícone alterada para refletir o status de aprovação/erro */}
                {modalContent.title.toLowerCase().includes("alerta") || modalContent.title.toLowerCase().includes("erro")
                  ? <CircleAlert size={48} />
                  : <CircleCheck size={48} />}
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