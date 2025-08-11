/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/validations/wholesale/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/supabase/index";
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
  CircleAlert,
  CircleCheck,
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
  joor: string;
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
  wholesale_invoicing_company: string;
  wholesale_warehouse: string;
  wholesale_currency: string;
  wholesale_terms: string;
  wholesale_credit: string;
  wholesale_discount: string;
  wholesale_feedback?: string; // ✅ Adicione isso
  user_id: string;
  users: {
    email: string;
  };
  terms: string;
  currency: string;
}

type WholesaleTerms = {
  wholesale_invoicing_company: string;
  wholesale_warehouse: string;
  wholesale_currency: string;
  wholesale_terms: string;
  wholesale_credit: string; // Este agora será o Credit Limit
  wholesale_discount: string;
  wholesale_feedback?: string; // Made optional
};

const INVOICING_COMPANIES_BY_CURRENCY: Record<string, string[]> = {
  USD: ["Plantage Rio Inc - United States"],
  EUR: ["Soma Brands International - European Union"],
  GBP: ["Soma Brands International"],
};

const CURRENCIES = ["USD", "EUR", "GBP"];

const PAYMENT_TERMS = ["100% Prior Ship", "Net 15 Days", "Net 30 Days"];

const formatAddress = (address: AddressDetail): string => {
  const parts = [];
  const street = address.street || address.street_name || "";
  const city = address.city || address.address_city || "";
  const state = address.state || address.state_province || "";
  const zipCode =
    address.zipCode || address.zip_code || address.postal_code || "";
  const county =
    address.county || address.address_county || address.suburb || "";
  const country = address.country || address.address_country || "";

  if (street) parts.push(street);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  if (county) parts.push(county);
  if (country) parts.push(country);

  return parts.join(", ") || "Not provided";
};

export default function ValidationDetailsPage() {
  const { id } = useParams();
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const [pendingReject, setPendingReject] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
    shouldRedirect: false, // <<-- A propriedade é inicializada aqui
  });
  const router = useRouter();
  const [newDuns, setNewDuns] = useState("");
  const [editingDuns, setEditingDuns] = useState(false);
  const [savingDuns, setSavingDuns] = useState(false);
  const [initialTerms, setInitialTerms] = useState<WholesaleTerms>({
    wholesale_invoicing_company: "",
    wholesale_warehouse: "",
    wholesale_currency: "",
    wholesale_terms: "",
    wholesale_credit: "",
    wholesale_discount: "",
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
    wholesale_credit: "", // Mude de 0 ou null para ""
    wholesale_discount: "",
    wholesale_feedback: "",
  });

  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [availableInvoicingCompanies, setAvailableInvoicingCompanies] =
    useState<string[]>([]);

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
          if (typeof addrData === "string") {
            try {
              const parsed = JSON.parse(addrData);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              console.error("Error parsing address string JSON:", e);
              return [] as AddressDetail[];
            }
          }
          if (Array.isArray(addrData)) {
            return addrData.map((item) => {
              if (typeof item === "string") {
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

        console.log(data);

        // Add a type assertion to help TypeScript understand the structure of data.users
        const processedData: CustomerForm = {
          users: {
            email: Array.isArray(data.users)
              ? ((data.users[0] as { email?: string })?.email ?? "")
              : ((data.users as { email?: string })?.email ?? ""),
          },
          id: data.id ?? "",
          user_id: data.user_id ?? "", // <-- Add this line to include user_id
          customer_name: data.customer_name ?? "",
          sales_tax_id: data.sales_tax_id ?? "",
          duns_number: data.duns_number ?? "",
          dba_number: data.dba_number ?? "",
          financial_statements:
            "financial_statements" in data
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
          estimated_purchase_amount:
            "estimated_purchase_amount" in data
              ? typeof data.estimated_purchase_amount === "string"
                ? data.estimated_purchase_amount
                : data.estimated_purchase_amount
                  ? JSON.stringify(data.estimated_purchase_amount)
                  : ""
              : "",
          photo_urls: (() => {
            if (!("photo_urls" in data)) return [];
            const value = data.photo_urls;
            if (Array.isArray(value))
              return value.filter((v) => typeof v === "string");
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
          instagram:
            "instagram" in data
              ? typeof data.instagram === "string"
                ? data.instagram
                : ""
              : "",
          website:
            "website" in data
              ? typeof data.website === "string"
                ? data.website
                : data.website
                  ? JSON.stringify(data.website)
                  : ""
              : "",
          joor:
            "joor" in data
              ? typeof data.joor === "string"
                ? data.joor
                : data.joor
                  ? JSON.stringify(data.joor)
                  : ""
              : "", // Adicionado o campo joor com verificação de existência
          branding_mix:
            "branding_mix" in data
              ? typeof data.branding_mix === "string"
                ? data.branding_mix
                : data.branding_mix
                  ? JSON.stringify(data.branding_mix)
                  : ""
              : "",
          buyer_name:
            typeof data.buyer_name === "string" ? data.buyer_name : "",
          buyer_email: data.buyer_email ?? "",
          status: data.status ?? "",
          created_at: data.created_at ?? "",
          wholesale_invoicing_company: data.credit_invoicing_company ?? "",
          wholesale_warehouse: data.wholesale_warehouse ?? "",
          wholesale_currency: data.wholesale_currency ?? "",
          wholesale_terms: data.wholesale_terms ?? "",
          wholesale_credit: data.wholesale_credit ?? "",
          wholesale_discount: data.credit_discount ?? "",
          terms: data.terms ?? "",
          currency: data.currency ?? "",
        };

        setCustomerForm(processedData);
        console.log(
          "Processed Billing Addresses (after parse):",
          processedData.billing_address
        );
        console.log(
          "Processed Shipping Addresses (after parse):",
          processedData.shipping_address
        );

        const fetchedTerms: WholesaleTerms = {
          wholesale_invoicing_company: "",
          wholesale_warehouse: "",
          wholesale_currency: "",
          wholesale_terms: "",
          wholesale_credit: "",
          wholesale_discount: "",
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
        const userId =
          typeof window !== "undefined"
            ? window.localStorage.getItem("userId")
            : null;
        if (!userId) return;
        const currentUser = await api.getCurrentUser();
        if (!currentUser) return;
      } catch (err) {
        console.error("Error getting user:", err);
      }
    };

    fetchUser();
  }, []);

  const confirmRejectAction = () => {
    if (!feedback.trim()) {
      setModalContent({
        title: "Error!",
        description: "Feedback is required when submitting for rejection",
        shouldRedirect: false,
      });
      setShowModal(true);
      return;
    }

    setShowConfirmReject(true);
  };

  const onConfirmReject = () => {
    handleApproval(false, true); // rejeita e pula confirmação
  };

  const onRejectClick = () => {
    if (!feedback.trim()) {
      setModalContent({
        title: "Error!",
        description: "Feedback is required when submitting for rejection",
        shouldRedirect: false,
      });
      setShowModal(true);
      return;
    }
    setShowConfirmReject(true);
  };

const executeReject = async (e?: React.MouseEvent<HTMLButtonElement>) => {
  e?.preventDefault();
  setPendingReject(true);
  setShowConfirmReject(false);

  await handleApproval(false, true); // skipConfirm = true → não abre modal novamente
  setPendingReject(false);
};


  // FUNÇÃO LOCAL PARA BUSCAR EMPRESAS
  const getCompaniesByCurrency = (currency: string): string[] => {
    return INVOICING_COMPANIES_BY_CURRENCY[currency] || [];
  };

  useEffect(() => {
    const selectedCurrency = terms.wholesale_currency;
    if (selectedCurrency) {
      const companies = getCompaniesByCurrency(selectedCurrency);
      setAvailableInvoicingCompanies(companies);

      // Pré-seleciona se houver apenas uma empresa
      if (companies.length === 1) {
        setTerms((prev) => ({
          ...prev,
          wholesale_invoicing_company: companies[0],
          // Limpa o warehouse ao mudar a currency
          wholesale_warehouse: "",
        }));
      } else {
        // Limpa a empresa se houver mais de uma ou nenhuma
        setTerms((prev) => ({
          ...prev,
          wholesale_invoicing_company: "",
          wholesale_warehouse: "",
        }));
      }
    } else {
      setAvailableInvoicingCompanies([]);
      setTerms((prev) => ({
        ...prev,
        wholesale_invoicing_company: "",
        wholesale_warehouse: "",
      }));
    }
  }, [terms.wholesale_currency]);

  // useEffect para buscar warehouses
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
      // CORREÇÃO: Usa uma string vazia para limpar o input.
      const newValue = value === "" ? "" : Number(value);

      // Se o valor não for vazio e for NaN, retorna.
      if (value !== "" && typeof newValue === "number" && isNaN(newValue))
        return;

      setTerms((prev) => ({ ...prev, [field]: newValue }));
    } else {
      setTerms((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleApproval = async (approved: boolean, skipConfirm = false) => {
  console.log("Starting handleApproval. approved =", approved, "skipConfirm =", skipConfirm);

  try {
    // Se for rejeição e não confirmou ainda → abre modal de confirmação
    if (!approved && !skipConfirm) {
      setShowConfirmReject(true);
      return;
    }

    // Se for rejeição já confirmada → abre modal de sucesso imediatamente e processa em segundo plano
    if (!approved && skipConfirm) {
      setShowDeleteSuccessModal(true);

      (async () => {
        try {
          if (!feedback.trim()) {
            console.warn("Feedback required for rejection");
            return;
          }

          // Atualiza status no banco
          await api.validateWholesaleCustomer(id as string, false, {
            wholesale_invoicing_company: terms.wholesale_invoicing_company,
            wholesale_warehouse: terms.wholesale_warehouse,
            wholesale_currency: terms.wholesale_currency,
            wholesale_terms: terms.wholesale_terms,
            wholesale_credit: Number(terms.wholesale_credit),
            wholesale_discount: Number(terms.wholesale_discount),
            wholesale_feedback: feedback.trim(),
          });

          console.log("Validation (rejection) completed successfully");

          // Envia e-mail de rejeição
          if (customerForm?.users?.email) {
            await fetch("/api/send/wholesale/send-rejected-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: customerForm?.buyer_name || "Client",
                email: customerForm.users.email,
                feedback: feedback.trim(),
              }),
            });
          }

          // Excluir conta do usuário
          if (customerForm?.user_id) {
            const deleteResponse = await fetch("/api/delete-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: customerForm.user_id }),
            });
            if (!deleteResponse.ok) {
              console.error("Error deleting user:", await deleteResponse.text());
            } else {
              console.log("User account deleted successfully!");
            }
          }

        } catch (err) {
          console.error("Error during reject/delete:", err);
        }
      })();

      return; // Sai sem mostrar modal genérico ou loading
    }

    // Fluxo de aprovação → ativa loading
    setLoading(true);

    // Valida campos obrigatórios
    const requiredFields: (keyof WholesaleTerms)[] = [
      "wholesale_invoicing_company",
      "wholesale_warehouse",
      "wholesale_currency",
      "wholesale_terms",
    ];
    const missingFields = requiredFields.filter((field) => !terms[field]);
    if (missingFields.length > 0) {
      throw new Error(`Please fill in all required fields: ${missingFields.join(", ")}`);
    }
    if (Number(terms.wholesale_credit) < 0 || Number(terms.wholesale_discount) < 0) {
      throw new Error("⚠️ Credit limit and discount must be non-negative!");
    }

    // Atualiza status no banco
    await api.validateWholesaleCustomer(id as string, true, {
      wholesale_invoicing_company: terms.wholesale_invoicing_company,
      wholesale_warehouse: terms.wholesale_warehouse,
      wholesale_currency: terms.wholesale_currency,
      wholesale_terms: terms.wholesale_terms,
      wholesale_credit: Number(terms.wholesale_credit),
      wholesale_discount: Number(terms.wholesale_discount),
      wholesale_feedback: feedback.trim() === "" ? undefined : feedback,
    });

    console.log("Validation (approval) completed successfully");

    // Envia e-mail de aprovação
    const emailPayload = {
      name: customerForm?.buyer_name || "Client",
      email: customerForm?.users?.email || "",
      feedback: feedback.trim(),
    };

    const emailResponse = await fetch("/api/send/wholesale/send-approved-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    });

    if (emailResponse.ok) {
      console.log("Email sent successfully!");
    } else {
      console.error("Failed to send email:", await emailResponse.text());
    }

    // Atualiza estado local
    if (customerForm) {
      setCustomerForm({
        ...customerForm,
        status: "approved",
      });
    }

    // Modal de sucesso para aprovação
    setModalContent({
      title: "Approved!",
      description: "Client approved! Forwarded to the CSC team.",
      shouldRedirect: true,
    });
    setShowModal(true);

  } catch (err) {
    console.error("Error validating customer:", err);
    setModalContent({
      title: "Error!",
      description: err instanceof Error ? err.message : "Unknown error",
      shouldRedirect: false,
    });
    setShowModal(true);
  } finally {
    setLoading(false);
  }
};


  const handleReview = async () => {
    if (!id) {
      console.error("ID do cliente não encontrado para revisão.");
      return;
    }

    if (!feedback.trim()) {
      setModalContent({
        title: "Error!",
        description: "Feedback is required when sending to review.",
        shouldRedirect: false,
      });
      setShowModal(true);
      return;
    }

    try {
      setLoading(true);
      console.log("Reviewing form for client editing...", { customerId: id });

      await api.reviewCustomer(id as string, feedback);

      try {
        const emailPayload = {
          name: customerForm?.buyer_name || "Cliente",
          email: customerForm?.users?.email || "",
          feedback: feedback.trim(),
        };
        console.log("Sending review email...");
        const emailResponse = await fetch(
          "/api/send/wholesale/send-review-email",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailPayload),
          }
        );

        if (emailResponse.ok) {
          console.log("Review email sent successfully!");
        } else {
          console.error(
            "Failed to send review email:",
            await emailResponse.text()
          );
        }
      } catch (emailError) {
        console.error("Error sending review email:", emailError);
      }

      if (customerForm) {
        setCustomerForm({
          ...customerForm,
          status: "review requested by the wholesale team",
        });
      }



    } catch (err) {
      setModalContent({
        title: "Error!",
        description:
          err instanceof Error
            ? err.message
            : "An error occurred while submitting for review. Please try again.",
        shouldRedirect: false,
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  }

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
    if (modalContent.shouldRedirect) {
      router.push("/validations/wholesale");
    }
  };

  if (loading) return <S.Message>Loading...</S.Message>;
  if (error) return <S.Message>Error: {error}</S.Message>;
  if (!customerForm) return <S.Message>Form not found.</S.Message>;

  let parsedPhotoUrls: string[] = [];
  try {
    if (
      customerForm.photo_urls &&
      typeof customerForm.photo_urls === "string"
    ) {
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
              <strong>JOOR:</strong>{" "}
              {customerForm.joor ? (
                <a
                  href={customerForm.joor}
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
                <S.PhotoGallery>
                  {parsedPhotoUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Photo {parsedPhotoUrls.length > 1 ? index + 1 : ""}
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

            {/* <S.Divider />  */}

            {/* <S.SectionTitle>
              <MessageSquare  size={16} /> Tax Team Feedback
            </S.SectionTitle>
            <S.FormRow>
              <strong>Feedback:</strong> {customerForm.csc_feedback || "No feedback provided by CSC Team."}
            </S.FormRow> */}
          </S.FormSection>
        </S.FormDetails>

        {/* NOVO CARD PARA EXIBIR TERMOS E CONDIÇÕES */}
        <S.TermsCard>
          <S.TermsTitle>Terms (filled in by the customer)</S.TermsTitle>
          <S.TermsCardContent>
            <S.FieldGroup>
              <S.Label>
                {" "}
                <Calendar size={16} /> Terms
              </S.Label>
              <S.Value>{customerForm.terms || "N/A"}</S.Value>
            </S.FieldGroup>
            <S.FieldGroup>
              <S.Label>
                {" "}
                <CreditCard size={16} /> Currency
              </S.Label>
              <S.Value>{customerForm.currency || "N/A"}</S.Value>
            </S.FieldGroup>
            <S.FieldGroup>
              <S.Label>
                {" "}
                <DollarSign size={16} /> Estimated Puchase Amount Per Season
              </S.Label>
              <S.Value>
                {customerForm.estimated_purchase_amount || "N/A"}
              </S.Value>
            </S.FieldGroup>
          </S.TermsCardContent>
        </S.TermsCard>

        <S.TermsContainer>
          <S.TermsHeader>
            <S.TermsTitle>Validation Terms (Wholesale Team)</S.TermsTitle>
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
                value={
                  availableInvoicingCompanies.length === 1
                    ? availableInvoicingCompanies[0]
                    : terms.wholesale_invoicing_company
                }
                onChange={(e) =>
                  handleTermChange(
                    "wholesale_invoicing_company",
                    e.target.value
                  )
                }
                disabled={!terms.wholesale_currency}
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
                disabled={!terms.wholesale_invoicing_company}
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
            {/* <S.TermsSection>
  <label>
    <DollarSign size={16} /> Estimated Amount
  </label>
  <S.NumericInput
    // CORREÇÃO: Garante que o valor nunca seja null, usando "" como fallback.
    value={terms.wholesale_credit ?? ''}
    onChange={(e) =>
      handleTermChange("wholesale_credit", e.target.value)
    }
    min="0"
    step="0.01"
  />
</S.TermsSection> */}

            <S.TermsSection>
              <label>
                <Percent size={16} /> Discount
              </label>
              <S.NumericInput
                // CORREÇÃO: Garante que o valor nunca seja null, usando "" como fallback.
                value={terms.wholesale_discount ?? ""}
                onChange={(e) =>
                  handleTermChange("wholesale_discount", e.target.value)
                }
                min="0"
                step="0.01"
              />
            </S.TermsSection>
          </S.TermsGrid>
        </S.TermsContainer>

        <S.FeedbackGroup>
          <S.Label htmlFor="feedback">Observation</S.Label>
          <S.Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Explain the reason for rejection or add relevant..."
          />
        </S.FeedbackGroup>

        <S.ButtonContainer>
          <S.Button onClick={onRejectClick} variant="secondary">
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
                {modalContent.title.toLowerCase().includes("error") ||
                modalContent.title.toLowerCase().includes("review") ? (
                  <CircleAlert size={48} />
                ) : (
                  <CircleCheck size={48} />
                )}
              </S.ModalTitle>
              <S.ModalDescription>
                {modalContent.description}
              </S.ModalDescription>
              <S.ModalButton onClick={closeModal}>Ok</S.ModalButton>
            </S.ModalContent>
          </S.Modal>
        )}

        {showConfirmReject && (
  <S.Modal>
    <S.ModalContent>
      <S.ModalTitle>
        <CircleAlert size={48} />
      </S.ModalTitle>
      <S.ModalDescription>
        Are you sure you want to <strong>reject</strong> this customer?
        <br />
        This will also <strong>delete the user account</strong> from the system.
      </S.ModalDescription>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <S.ModalButton
          type="button"
          style={{ backgroundColor: "#dc2626" }}
          onClick={executeReject}
          disabled={pendingReject}
        >
          {pendingReject ? "Deleting..." : "Yes, confirm"}
        </S.ModalButton>
        <S.ModalButton type="button" onClick={() => setShowConfirmReject(false)}>
          Cancel
        </S.ModalButton>
      </div>
    </S.ModalContent>
  </S.Modal>
)}

       {showDeleteSuccessModal && (
  <S.Modal>
    <S.ModalContent>
      <S.ModalTitle>
        <CircleCheck size={48}/>
      </S.ModalTitle>
      <S.ModalDescription>
        User account deleted successfully.
      </S.ModalDescription>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
        <S.ModalButton
          type="button"
          onClick={() => {
            setShowDeleteSuccessModal(false);
            setTimeout(() => {
              router.push("/validations/wholesale");
            }, 500);
          }}
        >
          OK
        </S.ModalButton>
      </div>
    </S.ModalContent>
  </S.Modal>
)}


      </S.Container>
    </S.ContainerMain>
  );
}
