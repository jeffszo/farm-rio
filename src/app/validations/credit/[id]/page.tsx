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
  Truck,
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
  credit_credit?: number;
  credit_discount?: number;
  credit_feedback?: string; // Added new field for credit feedback
  // Campos relacionados ao atacado (mantidos para referência se ambos os fluxos estiverem na mesma página)
  atacado_invoicing_company?: string;
  atacado_warehouse?: string;
  atacado_currency?: string;
  atacado_terms?: string;
  atacado_credit?: number;
  atacado_discount?: number;
}



// Interface para os termos de validação do Credit (mais consistente com o uso no componente)
interface CreditTerms {
  invoicing_company: string;
  warehouse: string;
  currency: string;
  payment_terms: string;
  credit_limit: number;
  discount: number;
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
  credit_discount: number;
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
  const [feedback, setFeedback] = useState(""); // Unified feedback state for the textarea

  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const router = useRouter();
  const [newDuns, setNewDuns] = useState("");
  const [editingDuns, setEditingDuns] = useState(false);
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
    credit_limit: 0,
    discount: 0,
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
          financial_statements: "financial_statements" in data ? String(data.financial_statements) : "",
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
          instagram: "instagram" in data ? (typeof data.instagram === "string" ? data.instagram : "") : "",
          website: "website" in data ? String(data.website) : "",
          branding_mix: "branding_mix" in data
            ? typeof data.branding_mix === "string"
              ? data.branding_mix
              : data.branding_mix
                ? JSON.stringify(data.branding_mix)
                : ""
            : "",
          tax_feedback: "tax_feedback" in data ? (typeof data.tax_feedback === "string" ? data.tax_feedback : JSON.stringify(data.tax_feedback ?? "")) : "",
        };

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
    const selectedCurrency = creditTerms.currency; // Usa o estado de termos do CRÉDITO
    if (selectedCurrency && INVOICING_COMPANIES_BY_CURRENCY[selectedCurrency]) {
      setAvailableCreditInvoicingCompanies(INVOICING_COMPANIES_BY_CURRENCY[selectedCurrency]);
    } else {
      setAvailableCreditInvoicingCompanies([]);
    }
    // Resetar empresa de faturamento e armazém do CRÉDITO quando a moeda muda
    setCreditTerms((prev) => ({
      ...prev,
      invoicing_company: "",
      warehouse: "",
    }));
    // Limpar armazéns do CRÉDITO também
    setCreditWarehouses([]);
  }, [creditTerms.currency]); // Dependência na moeda do CRÉDITO

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
  }, [creditTerms.invoicing_company]); // Dependência na empresa de faturamento do CRÉDITO

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
      const numericValue = value === "" ? 0 : Number(value);

      if (isNaN(numericValue)) return;

      setCreditTerms((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setCreditTerms((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleApproval = async (approved: boolean) => {
    console.log("Starting handleApproval. approved =", approved);

    try {
      setLoading(true);
      console.log("Loading true");

      if (approved) {
        // Specific validations for approval for CREDIT TEAM
        const requiredFields: (keyof CreditTerms)[] = [
          "invoicing_company",
          "warehouse",
          "currency",
          "payment_terms",
        ];
        const missingFields = requiredFields.filter((field) => !creditTerms[field]); // Usa creditTerms
        if (missingFields.length > 0) {
          throw new Error(
            `⚠️ Por favor, preencha todos os campos obrigatórios: ${missingFields.join(", ")}`
          );
        }
        if (creditTerms.credit_limit < 0 || creditTerms.discount < 0) { // Usa creditTerms
          throw new Error("⚠️ O limite de crédito e o desconto devem ser não-negativos!");
        }
      } else { // If rejecting, feedback is required
          if (!feedback.trim()) {
              setModalContent({
                  title: "Error!",
                  description: "Feedback is required when rejecting a customer.",
              });
              setShowModal(true);
              return;
          }
      }

      console.log("Calling validateCreditCustomer");
      await api.validateCreditCustomer(id as string, approved, {
        credit_invoicing_company: creditTerms.invoicing_company, // Usa creditTerms
        credit_warehouse: creditTerms.warehouse, // Usa creditTerms
        credit_currency: creditTerms.currency, // Usa creditTerms
        credit_terms: creditTerms.payment_terms, // Usa creditTerms
        credit_credit: creditTerms.credit_limit, // Usa creditTerms
        credit_discount: creditTerms.discount, // Usa creditTerms
        credit_feedback: feedback.trim() === "" ? undefined : feedback, // Passa o feedback do textarea
      });

      console.log("Validation completed successfully");

      // --- NOVA ADIÇÃO: Enviar e-mail após a validação de Crédito ---
      // if (customerForm) {
      //   try {
      //     const emailResponse = await fetch("/api/send-credit-validation-email", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({
      //         customerId: id,
      //         customerName: customerForm.customer_name,
      //         customerEmail: customerForm.buyer_email, // Assumindo que o buyer_email é o email do cliente para notificação
      //         validationStatus: approved,
      //         feedback: feedback, // Passa o feedback do textarea
      //         currentStatus: customerForm.status,
      //       }),
      //     });

      //     if (!emailResponse.ok) {
      //       const errorData = await emailResponse.json();
      //       console.error("Falha ao enviar e-mail de validação de Crédito:", errorData);
      //     } else {
      //       console.log("E-mail de validação de Crédito enviado com sucesso.");
      //     }
      //   } catch (emailError) {
      //     console.error("Erro ao enviar e-mail de validação de Crédito:", emailError);
      //   }
      // }
      // --- FIM DA NOVA ADIÇÃO ---


      if (customerForm) {
        setCustomerForm({
          ...customerForm,
          status: approved ? "approved" : "rejected",
        });
      }

      setModalContent({
        title: "Ok!",
        description: approved
          ? "Customer approved! Forwarded to CSC team final."
          : "The form has been sent for the client's review. They can edit it now!",
      });
      setShowModal(true);
      console.log("Success modal displayed");
    } catch (err) {
      console.error("Erro ao validar cliente:", err);
      setModalContent({
        title: "Erro!",
        description:
          err instanceof Error ? err.message : "Erro desconhecido ao aprovar.",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    router.push("/validations/credit"); // Redireciona para a página de validações de crédito
  };

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
              <strong>Legal Name:</strong> {customerForm.customer_name}
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

{/* <S.FormRow>
  <strong>Branding Mix:</strong>{" "}
  {customerForm.branding_mix && String(customerForm.branding_mix).trim() !== '' ?
    String(customerForm.branding_mix).split(/[,;\s]+/).filter(Boolean).join(', ') :
    "Not provided"
  }
</S.FormRow> */}

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
                              "Not sent"
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
          </S.FormSection>
          <S.FormSection>
            <S.SectionTitle>
              <MapPin size={16} /> Addresses
            </S.SectionTitle>
            <S.FormRow>
              <strong>Billing Addresses:</strong>
              {customerForm.billing_address && customerForm.billing_address.length > 0 ? (
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
              {customerForm.shipping_address && customerForm.shipping_address.length > 0 ? (
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
            <S.SectionTitle style={{marginTop:"32px"}}>
              <Mail size={16} /> Billing Contacts
            </S.SectionTitle>
            <S.FormRow>
              <strong>Buyer Name:</strong> {customerForm.buyer_name}
            </S.FormRow>
            <S.FormRow>
              <strong>Buyer Email:</strong> {customerForm.buyer_email}
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
                  <strong>Terms:</strong> {validation.wholesale_terms}
                </S.FormRow>
                <S.FormRow>
                  <strong>Credit Limit:</strong> {validation.wholesale_credit}
                </S.FormRow>
                <S.FormRow>
                  <strong>Discount:</strong> {validation.wholesale_discount}%
                </S.FormRow>
              </S.TermsCard>

            </S.TermsCardsContainer>
          )}   

          <S.FormSection>

                        <S.SectionTitle>
              <MessageSquare  size={16} /> Team Feedback
            </S.SectionTitle>
                                   <S.FormRow>
              <strong>Feedback:</strong> {customerForm.tax_feedback || "No feedback provided by Tax Team."}
            </S.FormRow>

          </S.FormSection>

                   
        </S.FormDetails>



        <S.TermsContainer>
          <S.TermsTitle>Validation Terms (Credit Team)</S.TermsTitle>


          <S.TermsGrid>
            <S.TermsSection>
              <label>
                <CreditCard size={16} /> Currency
              </label>
              <S.Select
                value={creditTerms.currency} // Usa creditTerms
                onChange={(e) => handleCreditTermChange("currency", e.target.value)} // Usa handleCreditTermChange
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
                <Building2 size={16} /> Invoicing Company
              </label>
              <S.Select
                value={creditTerms.invoicing_company} // Usa creditTerms
                onChange={(e) => handleCreditTermChange("invoicing_company", e.target.value)} // Usa handleCreditTermChange
                disabled={!creditTerms.currency} // Desabilita até que uma moeda seja selecionada
              >
                <option value="">Select company</option>
                {availableCreditInvoicingCompanies.map((company) => ( // Renderiza opções baseadas no novo estado
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
                value={creditTerms.warehouse} // Usa creditTerms
                onChange={(e) => handleCreditTermChange("warehouse", e.target.value)} // Usa handleCreditTermChange
                disabled={!creditTerms.currency} // HABILITA AQUI APÓS A SELEÇÃO DA MOEDA
              >
                <option value="">Select warehouse</option>
                {/* Se não houver invoicing_company selecionada, creditWarehouses estará vazio */}
                {creditWarehouses.length > 0 ? (
                    creditWarehouses.map((warehouse) => (
                        <option key={warehouse} value={warehouse}>
                            {warehouse}
                        </option>
                    ))
                ) : (
                    <option value="" disabled>
                        Select an Invoicing Company first
                    </option>
                )}
              </S.Select>
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <Calendar size={16} /> Payment Terms
              </label>
              <S.Select
                value={creditTerms.payment_terms} // Usa creditTerms
                onChange={(e) => handleCreditTermChange("payment_terms", e.target.value)} // Usa handleCreditTermChange
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
                value={creditTerms.credit_limit} // Usa creditTerms
                onChange={(e) => handleCreditTermChange("credit_limit", e.target.value)} // Usa handleCreditTermChange
                min="0"
                step="0.01"
              />
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <Percent size={16} /> Discount
              </label>
              <S.NumericInput
                value={creditTerms.discount} // Usa creditTerms
                onChange={(e) => handleCreditTermChange("discount", e.target.value)} // Usa handleCreditTermChange
                min="0"
                max="100"
                step="0.1"
              />
            </S.TermsSection>
          </S.TermsGrid>
        </S.TermsContainer>


                {(customerForm.status === "approved by the tax team" ||
                          customerForm.status === "rejected by the wholesale team") && ( // Condição para exibir o feedback
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


        <S.ButtonContainer>

          <S.Button onClick={() => handleApproval(false)} variant="secondary">
            Review
          </S.Button>

          <S.Button
            variant="primary"
            onClick={() => {
              console.log("Click detected!")
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