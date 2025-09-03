/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// src/app/validations/wholesale/[id]/page.tsx
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
  // Building2,
  // Warehouse,
  // CreditCard,
  // Calendar,
  // // DollarSign,
  // Percent,
  Pencil,
  Check,
  X,
  Truck,
  CircleAlert,
  MessageSquare
} from "lucide-react";

// Interface definition for a single address (AddressDetail)
interface AddressDetail {
  street?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  county?: string;
  country?: string;
  // Add other address properties if they exist
  // Add possible variations of key names that might come from the backend
  street_name?: string; // Example of variation
  address_city?: string; // Example of variation
  state_province?: string; // Example of variation
  zip_code?: string; // Example of variation
  postal_code?: string; // Example of variation
  address_county?: string; // Example of variation
  suburb?: string; // Example of variation
  address_country?: string; // Example of variation
}

// Updated CustomerForm interface to reflect that addresses are arrays of objects
interface CustomerForm {
  id: string;
  customer_name: string;
  sales_tax_id: string;
  duns_number: string;
  dba_number: string;
  financial_statements: string;
  resale_certificate: string;
  billing_address: AddressDetail[]; // Updated to AddressDetail[]
  shipping_address: AddressDetail[]; // Updated to AddressDetail[]
  ap_contact_name: string;
  ap_contact_email: string;
  buyer_name: string;
  buyer_email: string;
  status: string;
  created_at: string;
  photo_urls: string[]; // Changed to array of strings
  instagram: string;
  website: string;
  branding_mix: string;
  tax_feedback: string;
  // Campos relacionados ao crédito
  credit_invoicing_company?: string;
  credit_warehouse?: string;
  credit_currency?: string;
  credit_terms?: string;
  credit_credit?: string;
  credit_discount?: string;
  credit_feedback?: string; // Added new field for credit feedback
  user_id: string; 
  category: string;
  joor: string;
  users: {
    email: string;
  };
  agent?: {
    name: string;
    email?: string;
    country: string;
  };
}



// Interface para os termos de validação do Credit (mais consistente com o uso no componente)
interface CreditTerms {
  invoicing_company: string;
  warehouse: string;
  currency: string;
  payment_terms: string;
  credit_limit: string;
  discount: string;
}

interface InternalComment {
  id: string;
  comment: string;
  team_role: string;
  created_at: string;
  created_by?: { email: string };
}

interface ValidationDetails { // Interface para dados de validação existentes (se houver)
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
  credit_discount: string;
  estimated_purchase_amount: string;
  terms: string;
}


// Dados de empresas de faturamento que possuem armazéns, associados a moedas.
// Assumimos que esta informação viria do backend, mas para o exemplo, é estática.
// Mapeamento de moeda para empresas de faturamento relevantes.
const INVOICING_COMPANIES_BY_CURRENCY: Record<string, string[]> = {
    "USD": [
        "Plantage Rio Inc - United States"
    ],
    "EUR": [
        "Soma Brands International - European Union",
        // "Soma Brands France - France" // Adicionei Soma Brands France com base no seu código original
    ],
    "GBP": [
        "Soma Brands International"
    ],
};

const CURRENCIES = ["USD", "EUR", "GBP"];

const PAYMENT_TERMS = [
  "100% Prior Ship",
  "Net 15 Days",
  "Net 30 Days",
];

// Helper function to format an address object into a single string
const formatAddress = (address: AddressDetail): string => {
  const parts = [];

  // Check for defined keys in the interface and also common variations
  // Based on your console.log, keys are in camelCase.
  const street = address.street || address.street_name || '';
  const city = address.city || address.address_city || '';
  const state = address.state || address.state_province || '';
  const zipCode = address.zipCode || address.zip_code || address.postal_code || '';
  const county = address.county || address.address_county || address.suburb || '';
  const country = address.country || address.address_country || '';

  if (street) parts.push(street);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  if (county) parts.push(county);
  if (country) parts.push(country);

  return parts.join(', ') || 'Not provided';
};

export default function ValidationDetailsPage() {
  const { id } = useParams();
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [taxComments, setTaxComments] = useState<InternalComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [internalComment, setInternalComment] = useState("");




  const [feedback, setFeedback] = useState(""); // Unified feedback state for the textarea

  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
    shouldRedirect: false 
  });
  const router = useRouter();
  const [newDuns, setNewDuns] = useState("");
  const [editingDuns, setEditingDuns] = useState(false);
          const [loadingReview, setloadingReview] = useState(false);

  const [savingDuns, setSavingDuns] = useState(false);
  const [validation, setValidation] = useState<ValidationDetails | null>(null); // Para mostrar os termos do wholesale

  useEffect(() => {
    if (customerForm?.duns_number) {
      setNewDuns(customerForm.duns_number);
    }
    // Initialize feedback when customerForm is available
    if (customerForm?.credit_feedback) {
      setFeedback(customerForm.credit_feedback);
    }
  }, [customerForm]);

  // Estado para os termos do time de CRÉDITO
  const [creditTerms, setCreditTerms] = useState<CreditTerms>({
    invoicing_company: "",
    warehouse: "",
    currency: "",
    payment_terms: "",
    credit_limit: "",
    discount: "",
  });

  // Estado para os armazéns disponíveis para o time de CRÉDITO
  const [creditWarehouses, setCreditWarehouses] = useState<string[]>([]);
  // Estado para as empresas de faturamento disponíveis para o time de CRÉDITO (baseado na moeda)
  const [availableCreditInvoicingCompanies, setAvailableCreditInvoicingCompanies] = useState<string[]>([]);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getCustomerValidationDetails(id as string);
        console.log("ID received:", id);
        console.log("RAW form data (before processing):", data);

        if (!data) throw new Error("Form not found.");

        // Function to process and ensure address data are arrays of objects
        const processAddressArray = (addrData: unknown): AddressDetail[] => {
          if (!addrData) return []; // Return empty array if no data

          // If it's a single JSON string (scenario from your console.log)
          if (typeof addrData === 'string') {
              try {
                  const parsed = JSON.parse(addrData);
                  // If the parsed JSON is an array, return it; otherwise, wrap the object in an array
                  return Array.isArray(parsed) ? parsed : [parsed];
              } catch (e) {
                  console.error("Error parsing address string JSON:", e);
                  return []; // Return empty array in case of parsing error
              }
          }
          // If it's already an array, iterate over it to ensure all items are objects
          if (Array.isArray(addrData)) {
              return addrData.map(item => {
                  if (typeof item === 'string') {
                      try {
                          return JSON.parse(item);
                      } catch (e) {
                          console.error("Error parsing address item in array:", e);
                          return {}; // Return empty object if an item fails parsing
                      }
                  }
                  return item; // Item is already an object
              });
          }
          // If it's a single object (not a string and not an array), wrap it in an array
          return [addrData];
        };

        const processedData: CustomerForm = {
          ...data,
          // Apply the processing function for billing_address and shipping_address
          billing_address: processAddressArray(data.billing_address),
          shipping_address: processAddressArray(data.shipping_address),
          financial_statements:
  data.financial_statements && typeof data.financial_statements === "string"
    ? data.financial_statements.trim()
    : "",

          photo_urls: (() => {
            if ("photo_urls" in data) {
              if (Array.isArray(data.photo_urls)) {
                return data.photo_urls as string[];
              }
              if (typeof data.photo_urls === "string") {
                try {
                  const parsed = JSON.parse(data.photo_urls);
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  return [];
                }
              }
            }
            return [];
          })(),
          users: {
            email: Array.isArray(data.users)
              ? (data.users[0] as { email?: string })?.email ?? ""
              : (data.users as { email?: string })?.email ?? "",
          },
          instagram: "instagram" in data ? (typeof data.instagram === "string" ? data.instagram : "") : "",
          website:
  data.website && typeof data.website === "string" && data.website.trim().toLowerCase() !== "null"
    ? data.website.trim()
    : "",

          branding_mix: "branding_mix" in data
            ? typeof data.branding_mix === "string"
              ? data.branding_mix
              : data.branding_mix
                ? JSON.stringify(data.branding_mix)
                : ""
            : "",
 tax_feedback: "tax_feedback" in data 
  ? (typeof data.tax_feedback === "string" && data.tax_feedback.trim() !== "" 
      ? data.tax_feedback 
      : "") 
  : "",

        };

if (Array.isArray(data.internal_comments)) {
  const taxMapped = data.internal_comments
    .filter((c: any) => c.team_role === "tax")
    .map((c: any) => ({
      id: c.id,
      comment: c.comment,
      team_role: c.team_role,
      created_at: c.created_at,
      created_by: c.created_by?.email || "Team",
    }));

  setTaxComments(taxMapped);
} else {
  setTaxComments([]);
}

setLoadingComments(false);


        setCustomerForm(processedData);
        // Log processed address data for debugging
        console.log("Processed Billing Addresses (after parse):", processedData.billing_address);
        console.log("Processed Shipping Addresses (after parse):", processedData.shipping_address);

      } catch (err) {
        console.error("Error fetching customer details:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
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
        const currentUser = await api.getCurrentUserServer();
        if (!currentUser) return;
        // setUser({ email: currentUser.email, role: currentUser.userType });
      } catch (err) {
        console.error("Error getting user:", err);
      }
    };

    fetchUser();
  }, []);

  // // useEffect para buscar detalhes de validação (se ainda houver)
  useEffect(() => {
    const fetchValidationDetails = async () => {
      const validationData = await api.getCustomerValidationDetails(id as string)
      if (validationData) setValidation(validationData)
    }

    if (id) fetchValidationDetails()
  }, [id])

  // NOVO useEffect para o time de CRÉDITO: atualizar empresas de faturamento disponíveis com base na moeda selecionada
  useEffect(() => {
    const selectedCurrency = creditTerms.currency;
    if (selectedCurrency) {
        // Obtenha as empresas de faturamento diretamente da constante
        const companies = INVOICING_COMPANIES_BY_CURRENCY[selectedCurrency] || [];
        setAvailableCreditInvoicingCompanies(companies);
        
        // Se houver apenas uma empresa, pré-seleciona ela
        if (companies.length === 1) {
            setCreditTerms(prev => ({ 
                ...prev, 
                invoicing_company: companies[0],
                warehouse: '' // Limpa o warehouse ao mudar a currency
            }));
        } else {
            // Limpa a empresa se houver mais de uma ou nenhuma
            setCreditTerms(prev => ({ 
                ...prev, 
                invoicing_company: "",
                warehouse: ""
            }));
        }
    } else {
        setAvailableCreditInvoicingCompanies([]);
        setCreditTerms(prev => ({
            ...prev,
            invoicing_company: "",
            warehouse: ""
        }));
    }
  }, [creditTerms.currency]);

  // useEffect para o time de CRÉDITO: buscar armazéns quando a empresa de faturamento muda
  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!creditTerms.invoicing_company) {
        setCreditWarehouses([]);
        return;
      }
      try {
        const warehouses = await api.getWarehousesByCompany(
          creditTerms.invoicing_company
        );
        setCreditWarehouses(
          warehouses.map((warehouse: { name: string }) => warehouse.name)
        );
      } catch (err) {
        console.error("Error fetching credit warehouses:", err);
        setCreditWarehouses([]);
      }
    };
    fetchWarehouses();
  }, [creditTerms.invoicing_company]);

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

  // Handler para as mudanças nos termos do CRÉDITO
  const handleCreditTermChange = (
    field: keyof CreditTerms,
    value: string | number
  ) => {
    if (field === "credit_limit" || field === "discount") {
      const numericValue = value === "" ? "" : Number(value);
      if (value !== "" && typeof numericValue === "number" && isNaN(numericValue)) return;
      setCreditTerms((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setCreditTerms((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleApproval = async (approved: boolean) => {
  console.log("Starting handleApproval. approved =", approved);

  // 🔹 Reseta o estado oposto e ativa o correto
  if (approved) {
    setloadingReview(false);
    setLoadingApprove(true);
  } else {
    setLoadingApprove(false);
    setloadingReview(true);
  }

  try {
    if (approved) {
      // Specific validations for approval for CREDIT TEAM
      // const requiredFields: (keyof CreditTerms)[] = [
      //   "invoicing_company",
      //   "warehouse",
      //   "currency",
      //   "payment_terms",
      // ];
      // const missingFields = requiredFields.filter((field) => !creditTerms[field]);
      // if (missingFields.length > 0) {
      //   throw new Error(
      //     `Please fill in all required fields: ${missingFields.join(", ")}`
      //   );
      // }
      const creditLimitNum = Number(creditTerms.credit_limit);
      const discountNum = Number(creditTerms.discount);
      if (
        isNaN(creditLimitNum) ||
        isNaN(discountNum) ||
        creditLimitNum < 0 ||
        discountNum < 0
      ) {
        throw new Error("⚠️ The credit limit and discount must be non-negative");
      }
    } else {
      // If rejecting, feedback is required
      if (feedback.trim() === "") {
        setModalContent({
          title: "Alerta!",
          description: "Feedback is required when sending to review.",
          shouldRedirect: false,
        });
        setShowModal(true);
        return;
      }
    }

    console.log("Calling validateCreditCustomer");
await api.validateCreditCustomer(
  id as string,
  approved,
  {
    credit_invoicing_company: creditTerms.invoicing_company,
    credit_warehouse: creditTerms.warehouse,
    credit_currency: creditTerms.currency,
    credit_terms: creditTerms.payment_terms,
    credit_credit: Number(creditTerms.credit_limit),
    credit_discount: Number(creditTerms.discount),
    credit_feedback: feedback.trim() === "" ? undefined : feedback,
  },
  internalComment.trim() === "" ? undefined : internalComment, // 🔹 aqui
  "credit" // 🔹 team_role
);


    console.log("Validation completed successfully");

    try {
      const payload = {
        name: customerForm?.buyer_name || "Cliente",
        email: customerForm?.users?.email || "",
      };

      if (approved) {
        await fetch("/api/send/credit/send-approved-email", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });
      } else {
        await fetch("/api/send/credit/send-review-email", {
          method: "POST",
          body: JSON.stringify({ ...payload, feedback }),
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (emailError) {
      console.error("Erro ao enviar e-mail:", emailError);
    }

    if (customerForm) {
      setCustomerForm({
        ...customerForm,
        status: approved ? "approved" : "rejected",
      });
    }

    setModalContent({
      title: "Ok!",
      description: approved
        ? "Customer approved! Forwarded to the Governance team."
        : "The form has been sent for the client's review. They can edit it now!",
      shouldRedirect: true,
    });
    setShowModal(true);
    console.log("Success modal displayed");
  } catch (err) {
    console.error("Error validating client:", err);
    setModalContent({
      title: "Alerta!",
      description:
        err instanceof Error ? err.message : "Unknown error while approving.",
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


const closeModal = () => {
  setShowModal(false);
  // Redireciona somente se a flag shouldRedirect for verdadeira
  if (modalContent.shouldRedirect) {
    router.push("/validations/credit");
  }
};

// Função para garantir que a URL tenha http(s)
const formatUrl = (url?: string) =>
  url
    ? url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`
    : undefined


  if (loading) return <S.Message>Loading...</S.Message>;
  if (error) return <S.Message>Error: {error}</S.Message>;
  if (!customerForm) return <S.Message>Form not found.</S.Message>;

  let parsedPhotoUrls: string[] = [];
  try {
    if (customerForm.photo_urls && typeof customerForm.photo_urls === 'string') {
        parsedPhotoUrls = JSON.parse(customerForm.photo_urls);
    } else if (Array.isArray(customerForm.photo_urls)) { // Handle case if already an array
        parsedPhotoUrls = customerForm.photo_urls;
    }
  } catch (e) {
    console.error("Error parsing photo_urls JSON:", e);
    parsedPhotoUrls = []; // Fallback to empty array on error
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
            <S.FormRow>
              <strong>DBA:</strong> {customerForm.dba_number || "Not provided"}
            </S.FormRow>
            <S.FormRow>
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
                <span>
                  {customerForm.duns_number || "Not provided"}
                  <S.EditIcon onClick={() => setEditingDuns(true)}>
                    <Pencil size={16} />
                  </S.EditIcon>
                </span>
              )}
            </S.FormRow>



            <S.FormRow>

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
               <strong>Photos:</strong>{" "}
              {parsedPhotoUrls.length > 0 ? (
                <S.PhotoGallery> {/* Assuming you have a styled component for a gallery */}
                  {parsedPhotoUrls.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                      View Photo {parsedPhotoUrls.length > 1 ? index + 1 : ''}
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


          <S.FormSection>
            <S.SectionTitle>
              <MapPin size={16} /> Addresses
            </S.SectionTitle>
            <S.FormRow>
              <strong>Billing Addresses:</strong>
              {customerForm.billing_address &&
              customerForm.billing_address.length > 0 ? (
                customerForm.billing_address.map((address, index) => (
                  <S.AddressBlock key={index}>
                    <S.AddressTitle>Address {index + 1}</S.AddressTitle>
                    <div>{formatAddress(address)}</div>
                  </S.AddressBlock>
                ))
              ) : (
                <div>No billing addresses provided.</div>
              )}
            </S.FormRow>
            <S.FormRow>
              <strong>Shipping Addresses:</strong>
              {customerForm.shipping_address &&
              customerForm.shipping_address.length > 0 ? (
                customerForm.shipping_address.map((address, index) => (
                  <S.AddressBlock key={index}>
                    <S.AddressTitle>Address {index + 1}</S.AddressTitle>
                    <div>{formatAddress(address)}</div>
                  </S.AddressBlock>
                ))
              ) : (
                <div>No shipping addresses provided.</div>
              )}
            </S.FormRow>
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
  <S.FormRow>
    <strong>Buyer Category:</strong> {customerForm.category}
  </S.FormRow>
</S.FormSection>



            {validation && (
            <S.TermsCardsContainer>
              <S.TermsCard>
                <S.SectionTitle> <Truck size={16}/> Wholesale Team Validation</S.SectionTitle>
                <S.FormRow>
                  <strong>Invoicing Company:</strong> {validation.wholesale_invoicing_company}
                </S.FormRow>
                <S.FormRow>
                  <strong>Warehouse:</strong> {validation.wholesale_warehouse}
                </S.FormRow>
                <S.FormRow>
                  <strong>Currency:</strong> {validation.wholesale_currency}
                </S.FormRow>
                <S.FormRow>
                  <strong>Terms:</strong> {validation.terms}
                </S.FormRow>
   <S.FormRow>
  <strong>Estimated Purchase Amount Per Season:</strong>{" "}
  {validation.estimated_purchase_amount}
</S.FormRow>

                <S.FormRow>
                  <strong>Discount:</strong> {validation.wholesale_discount}%
                </S.FormRow>
              </S.TermsCard>

            </S.TermsCardsContainer>
          )}   

          <S.FormSection>
            <S.SectionTitle>
              <MessageSquare size={16} /> Internal Comments (Tax)
            </S.SectionTitle>
            {loadingComments ? (
              <S.FormRow>Loading comments...</S.FormRow>
            ) : taxComments.length > 0 ? (
              taxComments.map((comment) => (
                <S.FormRow key={comment.id}>
                  <span>{comment.comment}</span>{" "}
                  <em style={{ fontSize: "0.8rem", color: "#666" }}>
                    ({new Date(comment.created_at).toLocaleString()})
                  </em>
                </S.FormRow>
              ))
            ) : (
              <S.FormRow>No comments from Governance Team.</S.FormRow>
            )}
          </S.FormSection>

                   
        </S.FormDetails>



   


                {/* {(customerForm.status === "approved by the tax team" ||
                          customerForm.status === "rejected by the wholesale team") && ( // Condição para exibir o feedback */}
                          <S.FeedbackGroup>
                            <S.Label htmlFor="feedback">
                              Observation
                            </S.Label>
                            <S.Textarea
                              id="feedback"
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Explain the reason for rejection or add relevant..."
                            />
                          </S.FeedbackGroup>

                                     <S.FeedbackGroup>
                                      <S.Label htmlFor="internalComment">Internal Comments</S.Label>
                                      <S.Textarea
                                        id="internalComment"
                                        value={internalComment}
                                        onChange={(e) => setInternalComment(e.target.value)}
                                        placeholder="Write internal notes for other teams (not visible to the client)..."
                                      />
                                    </S.FeedbackGroup>
                        


        <S.ButtonContainer>
          <S.Button onClick={() => handleApproval(false)} variant="secondary">
            {loadingReview ? "Reviewing..." : "Review" }
          </S.Button>
<S.Button 
  onClick={() => handleApproval(true)} 
  variant="primary" 
  disabled={loadingApprove}
>
  {loadingApprove ? "Approving..." : "Approve"}
</S.Button>


        </S.ButtonContainer>


        {showModal && (
          <S.Modal>
            <S.ModalContent>
              <S.ModalTitle>
                {/* Lógica do ícone alterada para refletir o status de aprovação/erro */}
                {modalContent.title.toLowerCase().includes("alerta") ? <CircleAlert size={48} /> : <CircleCheck size={48} />}
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