// src/app/validations/tax/[id]/page.tsx
"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/supabase/index"; // Ensure `api` imports your validation functions
import * as S from "./styles"; // Assuming you have specific or global styles for this page
import { User, MapPin, Mail, CircleCheck, Copy, Check, MessageSquare} from "lucide-react"; // Import only necessary icons

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
  financial_statements: string;

  photo_urls: string[]; // Changed to array of strings
  instagram: string;
  website: string;
  branding_mix: string;
  // Add Tax-specific fields here if any, e.g., tax_status, tax_notes
  tax_status?: string;
  css_initial_feedback?: string;
}

export default function TaxValidationDetailsPage() {
  const { id } = useParams();
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [loading, setLoading] = useState(true);
    const [taxIdCopied, setTaxIdCopied] = useState<boolean>(false);
  const [dunsCopied, setDunsCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const [feedback, setFeedback] = useState(""); // This will be tax_notes
  const [taxStatus, setTaxStatus] = useState<string>("approved"); // State for tax_status
  const router = useRouter();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        if (typeof id === "string") {
          const data = await api.getCustomerFormById(id); // Ensure this function fetches all relevant data
          if (!data) throw new Error("Form not found.");
          setCustomerForm(data);
          setFeedback(data.css_initial_feedback || ""); // Initialize feedback with existing notes if any
          setTaxStatus(data.tax_status || "approved"); // Initialize status with existing
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
      setLoading(true);
      if (typeof id !== "string") {
        throw new Error("Invalid client ID.");
      }

      if (!approved && !feedback.trim()) {
        setModalContent({
          title: "Error!",
          description: "Feedback is required when rejecting a client.",
        });
        setShowModal(true);
        return;
      }

      // Call the new validation function specific to Tax
      await api.validateTaxCustomer(id, approved, {
        tax_status: approved ? "approved" : "rejected",
        css_initial_feedback: feedback.trim() === "" ? undefined : feedback, // Send notes if any
      });

      // --- NOVA ADIÇÃO: Enviar e-mail após a validação TAX ---
      if (customerForm) {
        try {
          const emailResponse = await fetch("/api/send-tax-validation-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerId: id,
              customerName: customerForm.customer_name,
              customerEmail: customerForm.buyer_email, // Assumindo que o buyer_email é o email do cliente para notificação
              validationStatus: approved,
              feedback: feedback,
              currentStatus: customerForm.status, // Envia o status atual para a rota para diferenciar os e-mails
            }),
          });

          if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            console.error("Falha ao enviar e-mail de validação TAX:", errorData);
            // Você pode optar por mostrar um erro aqui ou apenas logar, dependendo da criticidade do e-mail
          } else {
            console.log("E-mail de validação TAX enviado com sucesso.");
          }
        } catch (emailError) {
          console.error("Erro ao enviar e-mail de validação TAX:", emailError);
        }
      }
      // --- FIM DA NOVA ADIÇÃO ---

      setModalContent({
        title: "Success!",
        description: approved
          ? "Client approved! Forwarded to the credit team."
          : "Client rejected by the Tax team!",
      });
      setShowModal(true);
    } catch (err) {
      console.error("Error validating client:", err);
      setModalContent({
        title: "Error!",
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    // Redirect to the next step of the flow after validation
    if (modalContent.title === "Success!" || modalContent.title === "Error!") {
      router.push("/validations/tax"); // Redirect to the Tax validation page
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
        } else if (field === 'duns') {
            setDunsCopied(true);
            setTimeout(() => setDunsCopied(false), 1000); // Volta ao ícone original após 2 segundos
        }
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
              <strong>Legal Name:</strong> {customerForm.customer_name}
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
                "Not sent"
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

            <S.FormRow>
              <strong>Instagram: </strong>
              <a target="_blank" href={customerForm.instagram}>
                {customerForm.instagram}
              </a>
            </S.FormRow>
            <S.FormRow>
              <strong>Website: </strong>
              <a target="_blank" href={customerForm.website}>
                {customerForm.website}
              </a>
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
            {/* <S.FormRow>
              <strong>AP:</strong> {customerForm.ap_contact_name}
            </S.FormRow>
            <S.FormRow>
              <strong>AP Email:</strong> {customerForm.ap_contact_email}
            </S.FormRow> */}
            <S.FormRow>
              <strong>Buyer Name:</strong> {customerForm.buyer_name}
            </S.FormRow>
            <S.FormRow>
              <strong>Buyer Email:</strong> {customerForm.buyer_email}
            </S.FormRow>

                        <S.Divider /> 

                        <S.SectionTitle>
              <MessageSquare  size={16} /> CSC Team Feedback
            </S.SectionTitle>
                                   <S.FormRow>
              <strong>Feedback:</strong> {customerForm.css_initial_feedback || "No feedback provided by CSC Team."}
            </S.FormRow>
          </S.FormSection>
        </S.FormDetails>

        {/* Feedback/Notes field for the Tax team */}
        {(customerForm.status === "approved by the CSC team initial" ||
          customerForm.status === "rejected by the tax team") && (
          <S.FeedbackGroup>
            <S.Label htmlFor="feedback">
              Observation
            </S.Label>
            <S.Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain the reason for rejection or add relevant..."
            />
          </S.FeedbackGroup>
        )}

        {/* Approve/Reject buttons for the Tax team
        {(customerForm.status === "approved by the CSC team initial" || customerForm.status === "rejected by the tax team") && ( */}
        <S.ButtonContainer>
          <S.Button onClick={() => handleApproval(false)} variant="secondary">
            Reject
          </S.Button>
          <S.Button onClick={() => handleApproval(true)} variant="primary">
            Approve
          </S.Button>
        </S.ButtonContainer>
        {/* )} */}

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