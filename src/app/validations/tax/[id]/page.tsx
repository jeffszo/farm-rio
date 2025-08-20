// src/app/validations/tax/[id]/page.tsx
"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/supabase/index"; // Ensure `api` imports your validation functions
import * as S from "./styles"; // Assuming you have specific or global styles for this page
import { User, MapPin, Mail, CircleCheck, Copy, Check, MessageSquare, CircleAlert } from "lucide-react"; // Importamos o CircleAlert aqui

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
  joor: string;
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
  financial_statements: string;

  photo_urls: string[]; // Changed to array of strings
  instagram: string;
  website: string;
  branding_mix: string;
  // Add Tax-specific fields here if any, e.g., tax_status, tax_notes
  tax_status?: string;
  csc_initial_feedback?: string;
    users: {
    email: string;
  };
}

export default function TaxValidationDetailsPage() {
  const { id } = useParams();
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [loading, setLoading] = useState(true);
    const [taxIdCopied, setTaxIdCopied] = useState<boolean>(false);
    const [loadingApprove, setLoadingApprove] = useState(false);
        const [loadingReview, setloadingReview] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
const [modalContent, setModalContent] = useState({
  title: "",
  description: "",
  shouldRedirect: false // 
});
  const [feedback, setFeedback] = useState(""); // This will be tax_notes
  // Removed unused taxStatus state
  const router = useRouter();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        if (typeof id === "string") {
          const data = await api.getCustomerValidationDetails(id); // Ensure this function fetches all relevant data
          if (!data) throw new Error("Form not found.");
          setCustomerForm({
            ...data,
                   users: {
            email: Array.isArray(data.users)
              ? ((data.users[0] as { email?: string })?.email ?? "")
              : ((data.users as { email?: string })?.email ?? ""),
          },
           financial_statements:
  data.financial_statements && typeof data.financial_statements === "string"
    ? data.financial_statements.trim()
    : "",
            photo_urls: "photo_urls" in data
              ? Array.isArray(data.photo_urls)
                ? data.photo_urls
                : typeof data.photo_urls === "string"
                  ? JSON.parse(data.photo_urls)
                  : typeof data.photo_urls === "object" && data.photo_urls !== null
                    ? []
                    : []
              : [],
            instagram: "instagram" in data
              ? typeof data.instagram === "string"
                ? data.instagram
                : ""
              : "",
            website: "website" in data
              ? typeof data.website === "string"
                ? data.website
                : typeof data.website === "object" && data.website !== null
                  ? JSON.stringify(data.website)
                  : ""
              : "",
                joor: "joor" in data
            ? typeof data.joor === "string"
              ? data.joor
              : data.joor
                ? JSON.stringify(data.joor)
                : ""
            : "", 
            branding_mix: "branding_mix" in data
              ? typeof data.branding_mix === "string"
                ? data.branding_mix
                : typeof data.branding_mix === "object" && data.branding_mix !== null
                  ? JSON.stringify(data.branding_mix)
                  : ""
              : "",
            // Add any other missing fields with default values if needed
          });
          // setFeedback(data.csc_initial_feedback || "");// Initialize feedback with existing notes if any
          // setTaxStatus(data.tax_status || "approved"); // Initialize status with existing
        }
      } catch (err) {
        console.error("Error fetching client details:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomerDetails();
  }, [id]);

  const handleApproval = async (approved: boolean) => {
  try {
    // Ativa o loading específico para cada botão
    if (approved) {
      setLoadingApprove(true);
    } else {
      setloadingReview(true);
    }

    if (typeof id !== "string") {
      throw new Error("Invalid client ID.");
    }

    // Exige feedback para revisão
    if (!approved && feedback.trim() === "") {
      setModalContent({
        title: "Error!",
        description: "Feedback is required when sending to review.",
        shouldRedirect: false, // Não redireciona em caso de erro
      });
      setShowModal(true);
      return;
    }

    // Valida cliente no time de Tax
    await api.validateTaxCustomer(id, approved, {
      tax_status: approved ? "approved" : "rejected",
      tax_feedback: feedback.trim() === "" ? undefined : feedback,
    });

    // ✅ Envio de e-mail para o time de Tax
    try {
      const emailPayload = {
        name: customerForm?.buyer_name || "Cliente",
        email: customerForm?.users?.email || "",
        feedback: feedback || "",
      };
      const endpoint = approved
        ? "/api/send/tax/send-approved-email"
        : "/api/send/tax/send-review-email";
      const emailResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });
      if (emailResponse.ok) {
        console.log("Email sent successfully!");
      } else {
        console.error("Failed to send email:", await emailResponse.text());
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    // Mensagem final de sucesso ou revisão
    setModalContent({
      title: approved ? "Success!" : "Review!",
      description: approved
        ? "Client approved! Forwarded to the Credit team."
        : "The form has been sent for the client's review. They can edit it now",
      shouldRedirect: true,
    });
    setShowModal(true);
  } catch (err) {
    console.error("Error validating client:", err);
    setModalContent({
      title: "Error!",
      description: err instanceof Error ? err.message : "Unknown error",
      shouldRedirect: false,
    });
    setShowModal(true);
  } finally {
    // Desativa o loading do botão correto
    if (approved) {
      setLoadingApprove(false);
    } else {
      setloadingReview(false);
    }
  }
};


const closeModal = () => {
  setShowModal(false);
  if (modalContent.shouldRedirect) {
    router.push("/validations/tax");
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
  if (error) return <S.Message>Error: {error}</S.Message>;
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
    parsedBillingAddresses = [
      {
        street: customerForm.billing_address || "",
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
    if (
      customerForm.shipping_address &&
      typeof customerForm.shipping_address === "string"
    ) {
      parsedShippingAddresses = JSON.parse(customerForm.shipping_address);
    }
  } catch (e) {
    console.error("Error parsing shipping address JSON:", e);
    parsedShippingAddresses = [
      {
        street: customerForm.shipping_address || "",
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
        console.error("Erro ao copiar: ", err);
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
          <S.FormSection>
            <S.SectionTitle>
              <User size={16} /> Customer Information
            </S.SectionTitle>
            <S.FormRow>
              <strong>Name:</strong> {customerForm.customer_name}
            </S.FormRow>
<S.FormRow>
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
            <S.FormRow>
              <strong>D-U-N-S:</strong>{" "}
              {customerForm.duns_number || "Not provided"}
            </S.FormRow>

            <S.FormRow>
              <strong>DBA:</strong> {customerForm.dba_number || "Not provided"}
            </S.FormRow>

               
<S.FormRow>
              <strong>Financial Statements: </strong>{" "}
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
              <strong>Photos:</strong>{" "}
              {parsedPhotoUrls.length > 0 ? (
                <S.PhotoGallery>
                  {" "}
                  {/* Assuming you have a styled component for a gallery */}
                  {parsedPhotoUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
          <S.FormSection>
            <S.SectionTitle>
              <Mail size={16} /> Billing Contacts
            </S.SectionTitle>
  
            <S.FormRow>
              <strong>Buyer Name:</strong> {customerForm.buyer_name}
            </S.FormRow>
            <S.FormRow>
              <strong>Buyer Email:</strong> {customerForm.buyer_email}
            </S.FormRow>

                        <S.Divider /> 

                        <S.SectionTitle>
              <MessageSquare  size={16} /> Governance Team Feedback
            </S.SectionTitle>
                                   <S.FormRow>
              <strong>Feedback:</strong> {customerForm.csc_initial_feedback || "No feedback provided by Governance Team."}
            </S.FormRow>
          </S.FormSection>
        </S.FormDetails>

        {/* Feedback/Notes field for the Tax team */}
        {/* {(customerForm.status === "approved by the csc initial team" ||
          customerForm.status === "rejected by the tax team") && ( */}
          <S.FeedbackGroup>
            <S.Label htmlFor="feedback">
              Observation
            </S.Label>
            <S.Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain the reason for review or add relevant..."
            />
          </S.FeedbackGroup>
        {/* )} */}

        {/* Approve/Reject buttons for the Tax team
        {(customerForm.status === "approved by the CSC team initial" || customerForm.status === "rejected by the tax team") && ( */}
        <S.ButtonContainer>
          <S.Button onClick={() => handleApproval(false)} variant="secondary"   disabled={loadingReview}
>
            {loadingReview ? "Reviewing..." : "Review"}
          </S.Button>
<S.Button 
  onClick={() => handleApproval(true)} 
  variant="primary" 
  disabled={loadingApprove}
>
  {loadingApprove ? "Approving..." : "Approve"}
</S.Button>


        </S.ButtonContainer>
        {/* )} */}

        {showModal && (
          <S.Modal>
            <S.ModalContent>
              <S.ModalTitle>
                 {modalContent.title.toLowerCase().includes("error") || modalContent.title.toLowerCase().includes("review")
                  ? <CircleAlert size={48} />
                  : <CircleCheck size={48} />}
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