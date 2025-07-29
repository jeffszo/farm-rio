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
  Building2,
  Warehouse,
  CreditCard,
  Calendar,
  DollarSign,
  Percent,
  Pencil,
  Check,
  X,
  // MessageSquare,
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
  estimated_purchase_amount: string; // O CAMPO AGORA SERÁ USADO PARA INICIALIZAR O CREDIT LIMIT
  photo_urls: string[]; // Changed to array of strings
  instagram: string;
  website: string;
  branding_mix: string; // O campo de Branding Mix
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
  terms: string;
  currency: string;
}

type WholesaleTerms = {
  wholesale_invoicing_company: string;
  wholesale_warehouse: string;
  wholesale_currency: string;
  wholesale_terms: string;
  wholesale_credit: number; // Este agora será o Credit Limit
  wholesale_discount: number;
  wholesale_feedback?: string; // Made optional
};

const INVOICING_COMPANIES_BY_CURRENCY: Record<string, string[]> = {
    "USD": [
        "Plantage Rio Inc - United States"
    ],
    "EUR": [
        "Soma Brands International - European Union",
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

const formatAddress = (address: AddressDetail): string => {
  const parts = [];
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
  const [feedback, setFeedback] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const router = useRouter();
  const [newDuns, setNewDuns] = useState("");
  const [editingDuns, setEditingDuns] = useState(false);
  const [savingDuns, setSavingDuns] = useState(false);
  const [editingValidationTerms, setEditingValidationTerms] = useState(false);
  const [initialTerms, setInitialTerms] = useState<WholesaleTerms>({
    wholesale_invoicing_company: "",
    wholesale_warehouse: "",
    wholesale_currency: "",
    wholesale_terms: "",
    wholesale_credit: 0,
    wholesale_discount: 0,
  });

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
    wholesale_feedback: "",
  });

  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [availableInvoicingCompanies, setAvailableInvoicingCompanies] = useState<string[]>([]);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getCustomerValidationDetails(id as string);
        console.log("ID received:", id);
        console.log("RAW form data (before processing):", data);

        if (!data) throw new Error("Form not found.");

        const processAddressArray = (addrData: unknown): AddressDetail[] => {
          if (!addrData) return [];
          if (typeof addrData === 'string') {
              try {
                  const parsed = JSON.parse(addrData);
                  return Array.isArray(parsed) ? parsed : [parsed];
              } catch (e) {
                  console.error("Error parsing address string JSON:", e);
                  return [] as AddressDetail[];
              }
          }
          if (Array.isArray(addrData)) {
              return addrData.map(item => {
                  if (typeof item === 'string') {
                      try {
                          return JSON.parse(item);
                      } catch (e) {
                          console.error("Error parsing address item in array:", e);
                          return {} as AddressDetail;
                      }
                  }
                  return item;
              });
          }
          return [addrData];
        };

        const processedData: CustomerForm = {
          id: data.id ?? "",
          customer_name: data.customer_name ?? "",
          sales_tax_id: data.sales_tax_id ?? "",
          duns_number: data.duns_number ?? "",
          dba_number: data.dba_number ?? "",
          financial_statements: "financial_statements" in data
            ? typeof data.financial_statements === "string"
              ? data.financial_statements
              : data.financial_statements
                ? JSON.stringify(data.financial_statements)
                : ""
            : "",
          resale_certificate: data.resale_certificate ?? "",
          billing_address: processAddressArray(data.billing_address),
          shipping_address: processAddressArray(data.shipping_address),
          ap_contact_name: data.ap_contact_name ?? "",
          ap_contact_email: data.ap_contact_email ?? "",
          estimated_purchase_amount: "estimated_purchase_amount" in data
            ? typeof data.estimated_purchase_amount === "string"
              ? data.estimated_purchase_amount
              : data.estimated_purchase_amount
                ? JSON.stringify(data.estimated_purchase_amount)
                : ""
            : "",
          photo_urls: (() => {
            if (!("photo_urls" in data)) return [];
            const value = data.photo_urls;
            if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
            if (typeof value === "string") {
              try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed)
                  ? parsed.filter((v) => typeof v === "string")
                  : [];
              } catch {
                return [];
              }
            }
            return [];
          })(),
          instagram: "instagram" in data
            ? typeof data.instagram === "string"
              ? data.instagram
              : ""
            : "",
          website: "website" in data
            ? typeof data.website === "string"
              ? data.website
              : data.website
                ? JSON.stringify(data.website)
                : ""
            : "",
          branding_mix: "branding_mix" in data
            ? typeof data.branding_mix === "string"
              ? data.branding_mix
              : data.branding_mix
                ? JSON.stringify(data.branding_mix)
                : ""
            : "",
          buyer_name: typeof data.buyer_name === "string" ? data.buyer_name : "",
          buyer_email: data.buyer_email ?? "",
          status: data.status ?? "",
          created_at: data.created_at ?? "",
          atacado_invoicing_company: data.credit_invoicing_company ?? "",
          atacado_warehouse: data.wholesale_warehouse ?? "",
          atacado_currency: data.wholesale_currency ?? "",
          atacado_terms: data.wholesale_terms ?? "",
          atacado_credit: data.wholesale_credit ?? 0,
          atacado_discount: data.credit_discount ?? 0,
          terms: data.wholesale_terms ?? "",
          currency: data.wholesale_currency ?? "",
        };

        setCustomerForm(processedData);
        console.log("Processed Billing Addresses (after parse):", processedData.billing_address);
        console.log("Processed Shipping Addresses (after parse):", processedData.shipping_address);

        const fetchedTerms: WholesaleTerms = {
          wholesale_invoicing_company: data.credit_invoicing_company || "",
          wholesale_warehouse: data.wholesale_warehouse || "",
          wholesale_currency: data.wholesale_currency || "",
          wholesale_terms: data.wholesale_terms || "",
          // CORREÇÃO: Inicializa wholesale_credit com atacado_credit
          wholesale_credit: Number(data.wholesale_credit) || 0,
          wholesale_discount: data.credit_discount || 0,
          wholesale_feedback: "", // Initialize feedback for wholesale
        };
        setTerms(fetchedTerms);
        setInitialTerms(fetchedTerms); // Define initialTerms here

        setFeedback(""); // Initialize the feedback state for the textarea

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
        // Replace 'userId' with the actual user ID value available in your context
        const userId = typeof window !== "undefined" ? window.localStorage.getItem("userId") : null;
        if (!userId) return;
        const currentUser = await api.getCurrentUser();
        if (!currentUser) return;
      } catch (err) {
        console.error("Error getting user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const selectedCurrency = terms.wholesale_currency;
    if (selectedCurrency && INVOICING_COMPANIES_BY_CURRENCY[selectedCurrency]) {
      setAvailableInvoicingCompanies(INVOICING_COMPANIES_BY_CURRENCY[selectedCurrency]);
    } else {
      setAvailableInvoicingCompanies([]);
    }
    if (!editingValidationTerms) {
      setTerms((prev) => ({
        ...prev,
        wholesale_invoicing_company: "",
        wholesale_warehouse: "",
      }));
      setWarehouses([]);
    }
  }, [terms.wholesale_currency, editingValidationTerms]);

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
        console.error("Error fetching warehouses:", err);
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

const handleCancelValidationTermsEdit = () => {
    setTerms(initialTerms); // Reverte 'terms' para o valor original
    setEditingValidationTerms(false); // Sai do modo de edição
};

  const handleApproval = async (approved: boolean) => {
    console.log("Starting handleApproval. approved =", approved);

    try {
      setLoading(true);
      console.log("Loading true");

      if (approved) {
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
    
      await api.validateWholesaleCustomer(id as string, approved, {
        wholesale_invoicing_company: terms.wholesale_invoicing_company,
        wholesale_warehouse: terms.wholesale_warehouse,
        wholesale_currency: terms.wholesale_currency,
        wholesale_terms: terms.wholesale_terms,
        wholesale_credit: terms.wholesale_credit, // O valor de Credit Limit será salvo aqui
        wholesale_discount: terms.wholesale_discount,
        wholesale_feedback: feedback.trim() === "" ? undefined : feedback, // Use the separate feedback state
      });

      console.log("Validation completed successfully");

      // --- NOVA ADIÇÃO: Enviar e-mail após a validação Wholesale ---
      // if (customerForm) {
      //   try {
      //     const emailResponse = await fetch("/api/send-wholesale-validation-email", {
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
      //       console.error("Falha ao enviar e-mail de validação Wholesale:", errorData);
      //     } else {
      //       console.log("E-mail de validação Wholesale enviado com sucesso.");
      //     }
      //   } catch (emailError) {
      //     console.error("Erro ao enviar e-mail de validação Wholesale:", emailError);
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
        title: "Success!",
        description: approved
          ? "Client approved! Forwarded to the CSC team."
          : "Customer rejected!",
      });
      setShowModal(true);
      console.log("Success modal displayed");
    } catch (err) {
      console.error("Error validating customer:", err);
      setModalContent({
        title: "Error!",
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

// src/app/validations/wholesale/[id]/page.tsx
// ...
const handleReview = async () => {
  if (!id) {
    console.error("ID do cliente não encontrado para revisão.");
    return;
  }

  try {
    setLoading(true); // Se você tem um estado de loading

    setModalContent({
      title: "Revisando Formulário...",
      description: "Aguarde enquanto o status do formulário é atualizado para revisão do cliente.",
    });
    setShowModal(true);

    console.log("Revisando formulário para edição do cliente...", { customerId: id });

    // CHAMA A FUNÇÃO DEDICADA PARA REVISÃO
    await api.reviewCustomer(id as string, null);

    if (customerForm) {
      setCustomerForm({
        ...customerForm,
        status: "review requested by the wholesale team",
      });
    }

    setModalContent({
      title: "Success!",
      description: "The form has been sent for the client's review. They can edit it now.",
    });
    setShowModal(true);
    setTimeout(() => {
      closeModal();
      router.push("/validations/wholesale"); // Redirecione para a lista de validações, por exemplo
    }, 2000);

  } catch (err: unknown) {
    console.error("Erro ao enviar para revisão:", err);
    setModalContent({
      title: "Erro!",
      description: err instanceof Error ? err.message : "Ocorreu um erro ao enviar para revisão. Tente novamente.",
    });
    setShowModal(true);
    setLoading(false); // Desativa o loading no final
  }
};



  const handleSaveDuns = async () => {
    try {
      setSavingDuns(true);
      await api.updateDunsNumber(id as string, newDuns);

      if (customerForm) {
        setCustomerForm({
          ...customerForm,
          duns_number: newDuns,
        });
      }

      setEditingDuns(false);
    } catch (error) {
      console.error("Error updating DUNS number:", error);
    } finally {
      setSavingDuns(false);
    }
  };

  const handleCancelEdit = () => {
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
  if (error) return <S.Message>Error: {error}</S.Message>;
  if (!customerForm) return <S.Message>Form not found.</S.Message>;

  let parsedPhotoUrls: string[] = [];
  try {
    if (customerForm.photo_urls && typeof customerForm.photo_urls === 'string') {
        parsedPhotoUrls = JSON.parse(customerForm.photo_urls);
    } else if (Array.isArray(customerForm.photo_urls)) {
        parsedPhotoUrls = customerForm.photo_urls;
    }
  } catch (e) {
    console.error("Error parsing photo_urls JSON:", e);
    parsedPhotoUrls = [];
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
                <S.PhotoGallery>
                  {parsedPhotoUrls.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                      View Photo {parsedPhotoUrls.length > 1 ? index + 1 : ''}
                    </a>
                  ))}
                </S.PhotoGallery>
              ) : (
                "Not sent"
              )}

            </S.FormRow>

                        <S.FormRow>
              <strong>Branding Mix:</strong>{" "}
              {customerForm.branding_mix && String(customerForm.branding_mix).trim() !== '' ?
                String(customerForm.branding_mix).split(/[,;\s]+/).filter(Boolean).join(', ') :
                "Not provided"
              }
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

            {/* <S.Divider />  */}

            {/* <S.SectionTitle>
              <MessageSquare  size={16} /> Tax Team Feedback
            </S.SectionTitle>
            <S.FormRow>
              <strong>Feedback:</strong> {customerForm.csc_feedback || "No feedback provided by CSC Team."}
            </S.FormRow> */}

          </S.FormSection>
        </S.FormDetails>

        
        <S.TermsContainer>
          <S.TermsHeader>
            <S.TermsTitle>Validation Terms (Wholesale Team)</S.TermsTitle>
<S.EditButton onClick={() => {
    if (editingValidationTerms) {
        handleCancelValidationTermsEdit(); // Chama a função de cancelar
    }
    setEditingValidationTerms(!editingValidationTerms); // Alterna o estado de edição
}}>
    {editingValidationTerms ? <X size={16} /> : <Pencil size={16} />}
    {editingValidationTerms ? "Cancel" : "Edit"}
</S.EditButton>
          </S.TermsHeader>
          <S.TermsGrid>
            <S.TermsSection>
              <label>
                <CreditCard size={16} /> Currency
              </label>
             
<S.Select
  value={terms.wholesale_currency}
  onChange={(e) =>
    handleTermChange("wholesale_currency", e.target.value)
  }
  disabled={!editingValidationTerms}
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
                value={terms.wholesale_invoicing_company}
                onChange={(e) =>
                  handleTermChange("wholesale_invoicing_company", e.target.value)
                }
                disabled={!editingValidationTerms || !terms.wholesale_currency}
              >
                <option value="">Select company</option>
                {availableInvoicingCompanies.map((company) => (
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
                disabled={!editingValidationTerms || !terms.wholesale_invoicing_company}
              >
                <option value="">Select warehouse</option>
                {warehouses.length > 0 ? (
                    warehouses.map((warehouse) => (
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
  value={terms.wholesale_terms}
  onChange={(e) =>
    handleTermChange("wholesale_terms", e.target.value)
  }
  disabled={!editingValidationTerms}
>
  <option value="">Select payment terms</option>
  {PAYMENT_TERMS.map((term, index) => (
    <option key={`${term}-${index}`} value={term}>
      {term}
    </option>
  ))}
</S.Select>
            </S.TermsSection>

            {/* NOVO CAMPO: Credit Limit (substitui Estimated purchase amount) */}
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
                step="0.01" // Ajuste o passo conforme a precisão desejada para o valor monetário
                disabled={!editingValidationTerms}
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
                disabled={!editingValidationTerms}
              />
            </S.TermsSection>
            
          </S.TermsGrid>
        </S.TermsContainer>

        {(customerForm.status === "pending" ||
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


<S.ButtonContainer>
  <S.Button onClick={() => handleApproval(false)} variant="secondary">
    Reject
  </S.Button>

  <S.Button onClick={handleReview} variant="secondary">
    Review
  </S.Button>

  <S.Button variant="primary" onClick={() => handleApproval(true)}>
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