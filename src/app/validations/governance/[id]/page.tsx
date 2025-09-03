/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

interface InternalComment {
  id: string;
  comment: string;
  team_role: string;
  created_at: string;
  created_by?: { email: string };
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
  currency: string;
  wholesale_feedback: string;
  credit_feedback: string;
  csc_initial_feedback: string;
  csc_final_feedback: string;
  user_id: string;
  category: string;
  users: {
    email: string;
  };
  agent?: {
    name: string;
    email?: string;
    country: string;
  };
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
  terms: string;
}

export default function ValidationDetailsPage() {
  const { id } = useParams();
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingApprove, setLoadingApprove] = useState(false);
    const [internalComment, setInternalComment] = useState("");


  const [feedback, setFeedback] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
      const [loadingReview, setloadingReview] = useState(false);

  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
    shouldRedirect: false
  });
  const router = useRouter();
  const [taxIdCopied, setTaxIdCopied] = useState<boolean>(false);
  // States for editable DUNS field ONLY
  const [editingDuns, setEditingDuns] = useState(false);
  const [editedDuns, setEditedDuns] = useState("");
  const [wholesaleComments, setWholesaleComments] = useState<InternalComment[]>([]);
  const [creditComments, setCreditComments] = useState<InternalComment[]>([]);
const [loadingComments, setLoadingComments] = useState(true);

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
    if (!id) return;

    try {
      setLoading(true);
      setLoadingComments(true);
      setError(null);

      let data: any; // use "any" ou tipagem correta da API

      if (typeof id === "string") {
        data = await api.getCustomerValidationDetails(id);
      }

      if (!data) throw new Error("Formulário não encontrado.");

      // --- Mapear dados do cliente ---
      const customerFormData: CustomerForm = {
        id: data.id,
        customer_name: data.customer_name,
        sales_tax_id: data.sales_tax_id,
        duns_number: data.duns_number,
        dba_number: data.dba_number,
        category: data.category,
        currency: data.currency,
        resale_certificate: data.resale_certificate,
        photo_urls: Array.isArray(data.photo_urls)
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
          : [],
        instagram: typeof data.instagram === "string" ? data.instagram : "",
        website:
          typeof data.website === "string"
            ? data.website
            : data.website
            ? String(data.website)
            : "",
        branding_mix:
          typeof data.branding_mix === "string"
            ? data.branding_mix
            : data.branding_mix
            ? JSON.stringify(data.branding_mix)
            : "",
        joor: typeof data.joor === "string" ? data.joor : "",
        financial_statements:
          typeof data.financial_statements === "string"
            ? data.financial_statements
            : data.financial_statements
            ? JSON.stringify(data.financial_statements)
            : "",
        billing_address: data.billing_address ?? "",
        shipping_address: data.shipping_address ?? "",
        ap_contact_name:
          typeof data.ap_contact_name === "string" ? data.ap_contact_name : "",
        ap_contact_email: data.ap_contact_email ?? "",
        buyer_name: data.buyer_name ?? "",
        buyer_email: data.buyer_email ?? "",
        status: data.status,
        created_at: data.created_at,
        wholesale_feedback: data.wholesale_feedback ?? "",
        credit_feedback: data.credit_feedback ?? "",
        csc_initial_feedback: data.csc_initial_feedback ?? "",
        csc_final_feedback: data.csc_final_feedback ?? "",
        user_id: data.user_id ?? "",
        users: Array.isArray(data.users)
          ? { email: data.users[0]?.email ?? "" }
          : data.users?.email
          ? { email: data.users.email }
          : { email: "" },
        agent: data.agent_id
          ? {
              name: data.agent_id.name ?? "",
              email: data.agent_id.email ?? "",
              country: data.agent_id.country ?? "",
            }
          : undefined,
      };

      setCustomerForm(customerFormData);
      setEditedDuns(customerFormData.duns_number || "");

      // --- Mapear comentários internos do wholesale ---
if (Array.isArray(data.internal_comments)) {
  const wholesaleMapped = data.internal_comments
    .filter((c: any) => c.team_role === "wholesale")
    .map((c: any) => ({
      id: c.id,
      comment: c.comment,
      team_role: c.team_role,
      created_at: c.created_at,
      created_by: c.created_by?.email || "Team",
    }));

  const creditMapped = data.internal_comments
    .filter((c: any) => c.team_role === "credit")
    .map((c: any) => ({
      id: c.id,
      comment: c.comment,
      team_role: c.team_role,
      created_at: c.created_at,
      created_by: c.created_by?.email || "Team",
    }));

  setWholesaleComments(wholesaleMapped);
  setCreditComments(creditMapped);
} else {
  setWholesaleComments([]);
  setCreditComments([]);
}

    } catch (err) {
      console.error("Erro ao buscar detalhes do cliente:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setWholesaleComments([]);
    } finally {
      setLoading(false);
      setLoadingComments(false); // garante que o loading dos comentários seja finalizado
    }
  };

  fetchCustomerDetails();
}, [id]);


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
      shouldRedirect: false,
    });
    setShowModal(true);
    return;
  }

  try {
    if (approved) {
      setLoadingApprove(true);
    } else {
      setloadingReview(true);
    }

    if (
      customerForm?.status === "approved by the wholesale team" ||
      customerForm?.status === "review requested by the compliance team - customer"
    ) {
      // envia feedback + comentário interno
      await api.validateCSCInitialCustomer(id, approved, feedback, internalComment, "csc_initial" );

      // Envio de e-mail CSC inicial
      try {
        const emailPayload = {
          name: customerForm?.buyer_name || "Cliente",
          email: customerForm?.users?.email || "",
          feedback: feedback || "",
        };
        const endpoint = approved
          ? "/api/send/csc_initial/send-approved-email"
          : "/api/send/csc_initial/send-review-email";
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    } else if (
      customerForm?.status === "approved by the credit team" ||
      customerForm?.status === "review requested by the governance final team - customer"
    ) {
      // envia feedback + comentário interno
      await api.validateCSCFinalCustomer(id, approved, feedback, internalComment, "csc_final");

      // Envio de e-mail CSC final
      try {
        const emailPayload = {
          name: customerForm?.buyer_name || "Cliente",
          email: customerForm?.users?.email || "",
          feedback: feedback || "",
        };
        const endpoint = approved
          ? "/api/send/csc_final/send-approved-email"
          : "/api/send/csc_final/send-review-email";
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    } else {
      throw new Error("Customer status is not valid for Governance validation");
    }

    setModalContent({
      title: approved ? "Approved!" : "Review!",
      description: approved
        ? "Customer approved!"
        : "The form has been sent for the client's review. They can edit it now.",
      shouldRedirect: true,
    });
    setShowModal(true);

    // limpa comentário depois de salvar
    setInternalComment("");
  } catch (error) {
    console.error("Erro ao validar cliente:", error);
    setModalContent({
      title: "Erro",
      description: `Houve um erro: ${
        error instanceof Error ? error.message : String(error)
      }`,
      shouldRedirect: false,
    });
    setShowModal(true);
  } finally {
    if (approved) {
      setLoadingApprove(false);
    } else {
      setloadingReview(false);
    }
  }
};





// ... O restante do seu componente
const closeModal = () => {
  setShowModal(false);
  if (modalContent.shouldRedirect) { // <<-- O if verifica o valor da propriedade
    router.push("/validations/governance");
  }
};

// Função para garantir que a URL tenha http(s)
const formatUrl = (url?: string) =>
  url
    ? url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`
    : undefined


  // Helper function to render an address
const renderAddress = (address: Address) => {
  const parts: string[] = [];

   const street = address.street || "";
  const city = address.city || "";
  const state = address.state || "";
  const zipCode = address.zipCode || "";
  const county = address.county || "";
  const country = address.country || "";

  if (street) parts.push(street);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  if (county) parts.push(county);
  if (country) parts.push(country);

  return <p>{parts.join(", ") || "Not provided"}</p>;
};


  if (loading) return <S.Message>Loading...</S.Message>;
  if (error) return <S.Message>Erro: {error}</S.Message>;
  if (!customerForm) return <S.Message>Form not found.</S.Message>;

  let parsedBillingAddresses: Address[] = [];
  try {
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

const handleCopyToClipboard = async (text: string, field: 'taxId') => {
    try {
        await navigator.clipboard.writeText(text);
        if (field === 'taxId') {
            setTaxIdCopied(true);
            setTimeout(() => setTaxIdCopied(false), 1000); // Volta ao ícone original após 2 segundos
        }
        // Removed dunsCopied logic as it's unused
    } catch (err) {
        console.error("Error copying:", err);
        // Você pode adicionar um tratamento visual para erro aqui se desejar, mas a requisição é para sucesso.
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
           <S.FormRow style={{
            display: "flex",
            gap: "0.5rem"
           }}>
  <strong>Tax ID:</strong>
  <S.ValueWithCopy>
    {customerForm.sales_tax_id}
    {customerForm.sales_tax_id && (
      <S.CopyButton onClick={() => handleCopyToClipboard(customerForm.sales_tax_id, 'taxId')}>
        {taxIdCopied ? <Check size={16} /> : <Copy size={16} />}
      </S.CopyButton>
    )}
  </S.ValueWithCopy>
</S.FormRow>
            <S.FormRow> <strong>Customer Currency: </strong> {customerForm.currency} </S.FormRow>

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
  <strong>Country:</strong> {customerForm.agent?.country || "Not provided"}
</S.FormRow>
<S.FormRow>
  <strong>Agent:</strong> {customerForm.agent?.name || "Not provided"}
</S.FormRow>

           <S.FormRow>
  <strong>Instagram:</strong>{" "}
  {customerForm.instagram ? (
    <a
      href={formatUrl(customerForm.instagram)}
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
      href={formatUrl(customerForm.website)}
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
      href={formatUrl(customerForm.joor)}
      target="_blank"
      rel="noopener noreferrer"
    >
      Access Profile
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

             <S.FormRow>
              <strong>Branding Mix:</strong>{" "}
              {(() => {
                try {
                  const parsed = JSON.parse(customerForm.branding_mix);
                  if (Array.isArray(parsed)) {
                    return (
                      <ul
                        style={{
                          marginTop: "0.5rem",
                          paddingLeft: "1.2rem",
                          listStyleType: "disc",
                        }}
                      >
                        {parsed.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    );
                  }
                  return customerForm.branding_mix || "Not provided";
                } catch {
                  return customerForm.branding_mix || "Not provided";
                }
              })()}
            </S.FormRow>
          </S.FormSection>

          

          {/* Addresses Section */}
<S.FormSection>
  <S.SectionTitle>
    <MapPin size={16} /> Addresses
  </S.SectionTitle>

  {/* Billing Addresses */}
  <S.FormRow>
    <strong>Billing Addresses:</strong>
    {parsedBillingAddresses && parsedBillingAddresses.length > 0 ? (
      parsedBillingAddresses.map((address, index) => (
        <S.AddressBlock key={`billing-${index}`}>
          <S.AddressTitle>Address {index + 1}</S.AddressTitle>
          <div>{renderAddress(address)}</div>
        </S.AddressBlock>
      ))
    ) : (
      <div>No billing addresses provided.</div>
    )}
  </S.FormRow>

  {/* Shipping Addresses */}
  <S.FormRow>
    <strong>Shipping Addresses:</strong>
    {parsedShippingAddresses && parsedShippingAddresses.length > 0 ? (
      parsedShippingAddresses.map((address, index) => (
        <S.AddressBlock key={`shipping-${index}`}>
          <S.AddressTitle>Address {index + 1}</S.AddressTitle>
          <div>{renderAddress(address)}</div>
        </S.AddressBlock>
      ))
    ) : (
      <div>No shipping addresses provided.</div>
    )}
  </S.FormRow>
</S.FormSection>




          {/* Contact Information Section */}
          <S.FormSection>
            <S.SectionTitle>
              <Mail size={16} /> Billing Contacts
            </S.SectionTitle>

            <S.FormRow>
              <strong>Buyer Name:</strong> {customerForm.buyer_name || "N/A"}
            </S.FormRow>
            <S.FormRow>
              <strong>Buyer Email:</strong> {customerForm.buyer_email || "N/A"}
            </S.FormRow>

                      <S.FormRow>
              <strong>Buyer Category:</strong> {customerForm.category || "N/A"}
            </S.FormRow>

{/* 
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
</S.FormRow> */}


          </S.FormSection>

          {/* Conditional Rendering for Wholesale and Credit Terms */}
{(customerForm.status === "approved by the credit team" ||
  customerForm.status === "approved by the wholesale team" ||
  customerForm.status === "finished" ||
  customerForm.status === "review requested by the governance final team - customer" ||
  (customerForm.status as string) === "review requested by the compliance team - customer") && validation && (

            <>
              {/* Wholesale Terms Section */}
              <S.FormSection>
                <S.MainSectionTitle>
                  <DollarSign size={16} /> Wholesale Terms
                </S.MainSectionTitle>
                <S.TermsGrid>
                  <S.TermsSection>
                    <S.SectionTitleTerms>
                      <Building2 size={16} /> Invoicing Company:
                    </S.SectionTitleTerms>
                    <S.InfoText>
                      {validation.wholesale_invoicing_company || "N/A"}
                    </S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <S.SectionTitleTerms>
                      <Warehouse size={16} /> Warehouse:
                    </S.SectionTitleTerms>
                    <S.InfoText>{validation.wholesale_warehouse || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <S.SectionTitleTerms>
                      <CreditCard size={16} /> Company Currency:
                    </S.SectionTitleTerms>
                    <S.InfoText>{validation.wholesale_currency || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <S.SectionTitleTerms>
                      <Calendar size={16} /> Payment Terms:
                    </S.SectionTitleTerms>
                    <S.InfoText>{validation.terms || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <S.SectionTitleTerms>
                      <DollarSign size={16} />  Estimated Puchase Amount Per Season:
                    </S.SectionTitleTerms>
                    <S.InfoText>
                      {validation.estimated_purchase_amount !== undefined &&
                      validation.estimated_purchase_amount !== null
                        ? validation.estimated_purchase_amount
                        : "N/A"}
                    </S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <S.SectionTitleTerms>
                      <Percent size={16} /> Discount:
                    </S.SectionTitleTerms>
                    <S.InfoText>
                      {validation.wholesale_discount !== undefined &&
                      validation.wholesale_discount !== null
                        ? validation.wholesale_discount.toFixed(1) + "%"
                        : "N/A"}
                    </S.InfoText>
                  </S.TermsSection>
                </S.TermsGrid>
              </S.FormSection>
{(customerForm.status === "approved by the wholesale team" ||
  (customerForm.status as string) === "review requested by the compliance team - customer") && (

  <S.FormSection>
    <S.SectionTitle>
      <MessageSquare size={16} /> Internal Comments (Wholesale)
    </S.SectionTitle>
    {loadingComments ? (
      <S.FormRow>Loading comments...</S.FormRow>
    ) : wholesaleComments.length > 0 ? (
      wholesaleComments.map((comment) => (
        <S.FormRow key={comment.id}>
          <span>{comment.comment}</span>{" "}
          <em style={{ fontSize: "0.8rem", color: "#666" }}>
            ({new Date(comment.created_at).toLocaleString()})
          </em>
        </S.FormRow>
      ))
    ) : (
      <S.FormRow>No comments from Wholesale Team.</S.FormRow>
    )}
  </S.FormSection>
)}

{customerForm.status === "approved by the credit team" && (
  <S.FormSection>
    <S.SectionTitle>
      <MessageSquare size={16} /> Internal Comments (Credit)
    </S.SectionTitle>
    {loadingComments ? (
      <S.FormRow>Loading comments...</S.FormRow>
    ) : creditComments.length > 0 ? (
      creditComments.map((comment) => (
        <S.FormRow key={comment.id}>
          <span>{comment.comment}</span>{" "}
          <em style={{ fontSize: "0.8rem", color: "#666" }}>
            ({new Date(comment.created_at).toLocaleString()})
          </em>
        </S.FormRow>
      ))
    ) : (
      <S.FormRow>No comments from Credit Team.</S.FormRow>
    )}
  </S.FormSection>
)}





              {/* Credit Terms Section */}
              {/* <S.FormSection>
                <S.MainSectionTitle>
                  <CreditCard size={16} /> Credit Terms
                </S.MainSectionTitle>
                <S.TermsGrid>
                  <S.TermsSection>
                    <S.SectionTitle>
                      <Building2 size={16} /> Invoicing Company:
                    </S.SectionTitle>
                    <S.InfoText>
                      {validation.credit_invoicing_company || "N/A"}
                    </S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <S.SectionTitle>
                      <Warehouse size={16} /> Warehouse:
                    </S.SectionTitle>
                    <S.InfoText>{validation.credit_warehouse || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <S.SectionTitle> <CreditCard size={16} /> Company Currency:
                    </S.SectionTitle>
                    <S.InfoText>{validation.credit_currency || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <S.SectionTitle>
                      <Calendar size={16} /> Payment Terms:
                    </S.SectionTitle>
                    <S.InfoText>{validation.credit_terms || "N/A"}</S.InfoText>
                  </S.TermsSection>

                  <S.TermsSection>
                    <S.SectionTitle>
                      <DollarSign size={16} /> Estimated Puchase Amount Per Season:
                    </S.SectionTitle>
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
                    <S.SectionTitle>
                      <Percent size={16} /> Discount
                    </S.SectionTitle>
                    <S.InfoText>
{validation.credit_discount !== undefined &&
validation.credit_discount !== null &&
!isNaN(Number(validation.credit_discount))
  ? Number(validation.credit_discount).toFixed(1) + "%"
  : "N/A"}
                    </S.InfoText>
                  </S.TermsSection>
                </S.TermsGrid>
              </S.FormSection> */}
            </>
          )}
        </S.FormDetails>

{customerForm.status !== "finished" && customerForm.status !== "approved by the credit team" &&  (
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


{customerForm.status !== "finished" && customerForm.status !== "approved by the credit team" &&  (
 <S.FeedbackGroup>
  <S.Label htmlFor="internalComment">Internal Comments</S.Label>
  <S.Textarea
    id="internalComment"
    value={internalComment}
    onChange={(e) => setInternalComment(e.target.value)}
    placeholder="Write internal notes for other teams (not visible to the client)..."
  />
</S.FeedbackGroup>
)}

<S.ButtonContainer>
  {customerForm.status !== "review requested by the governance final team - customer" &&
   customerForm.status !== "approved by the credit team" &&
   customerForm.status !== "finished" && (
    <S.Button
      onClick={async () => {
        setloadingReview(true);
        await handleApproval(false);
        setloadingReview(false);
      }}
      variant="secondary"
      disabled={loadingReview}
    >
      {loadingReview ? "Reviewing..." : "Review"}
    </S.Button>
  )}

  {customerForm.status !== "finished" && (
    <S.Button
      onClick={async () => {
        setLoadingApprove(true);
        await handleApproval(true);
        setLoadingApprove(false);
      }}
      variant="primary"
      disabled={loadingApprove}
    >
      {loadingApprove ? "Approving..." : "Approve"}
    </S.Button>
  )}
</S.ButtonContainer>



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