"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "../../../../lib/supabase/index"
import * as S from "./styles"
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
  CircleCheck,
  Pencil,
  Check,
  X
} from "lucide-react"

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
  id: string
  customer_name: string
  sales_tax_id: string
  duns_number: string
  dba_number: string
  resale_certificate: string
  billing_address: AddressDetail[]; // Updated to AddressDetail[]
  shipping_address: AddressDetail[]; // Updated to AddressDetail[]
  ap_contact_name: string
  ap_contact_email: string
  buyer_name: string
  buyer_email: string
  status: string
  created_at: string
  credit_invoicing_company?: string
  credit_warehouse?: string
  credit_currency?: string
  credit_terms?: string
  credit_credit?: number
  credit_discount?: number
}

interface ValidationDetails {
  wholesale_invoicing_company: string
  wholesale_warehouse: string
  wholesale_currency: string
  wholesale_terms: string
  wholesale_credit: string
  wholesale_discount: number
  credit_invoicing_company: string
  credit_warehouse: string
  credit_currency: string
  credit_terms: string
  credit_credit: string
  credit_discount: number
}

interface CreditTerms {
  invoicing_company: string
  warehouse: string
  currency: string
  payment_terms: string
  credit_limit: number
  discount: number
}

const INVOICING_COMPANIES = [
  "Plantage Rio Inc - United States",
  "Soma Brands International - European Union",
  "Soma Brands UK Limited - United Kingdom",
  "Soma Brands France - France",
]

const CURRENCIES = ["USD", "EUR", "GBP"]

const PAYMENT_TERMS = ["100% Prior Ship", "Net 45 Days", "Net 30 Days", "Net 90 Days", "Net 15 Days"]

// Helper function to format an address object into a single string
const formatAddress = (address: AddressDetail): string => {
  const parts = [];

  // Check for defined keys in the interface and also common variations
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
  const { id } = useParams()
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ title: "", description: "" })
  const router = useRouter()
  const [validation, setValidation] = useState<ValidationDetails | null>(null)
  const [newDuns, setNewDuns] = useState("")
  const [editingDuns, setEditingDuns] = useState(false)
  const [savingDuns, setSavingDuns] = useState(false)

  useEffect(() => {
    if (customerForm?.duns_number) {
      setNewDuns(customerForm.duns_number)
    }
  }, [customerForm])

  const [terms, setTerms] = useState<CreditTerms>({
    invoicing_company: "",
    warehouse: "",
    currency: "",
    payment_terms: "",
    credit_limit: 0,
    discount: 0,
  })

  const [warehouses, setWarehouses] = useState<string[]>([])

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true)
        const data = await api.getCustomerFormById(id as string)
        console.log("ID received:", id);
        console.log("RAW form data (before processing):", data);

        if (!data) throw new Error("Formulário não encontrado.")

        // Function to process and ensure address data are arrays of objects
        const processAddressArray = (addrData: unknown): AddressDetail[] => {
            if (!addrData) return []; // Return empty array if no data

            // If it's a single JSON string
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
        };

        setCustomerForm(processedData);
        // Log processed address data for debugging
        console.log("Processed Billing Addresses (after parse):", processedData.billing_address);
        console.log("Processed Shipping Addresses (after parse):", processedData.shipping_address);

      } catch (err) {
        console.error("Erro ao buscar detalhes do cliente:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchCustomerDetails()
  }, [id])

  // useEffect(() => {
  //   if (typeof window === "undefined") return

  //   const fetchUser = async () => {
  //     try {
  //       const currentUser = await api.getCurrentUser()
  //       if (!currentUser) return
  //       setUser({ email: currentUser.email, role: currentUser.userType })
  //     } catch (err) {
  //       console.error("Erro ao obter usuário:", err)
  //     }
  //   }

  //   fetchUser()
  // }, [])

  useEffect(() => {
    const fetchValidationDetails = async () => {
      const validationData = await api.getCustomerValidationDetails(id as string)
      if (validationData) setValidation(validationData)
    }

    if (id) fetchValidationDetails()
  }, [id])

  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!terms.invoicing_company) {
        setWarehouses([])
        return
      }

      try {
        const warehouses = await api.getWarehousesByCompany(terms.invoicing_company)
        setWarehouses(warehouses.map((warehouse: { name: string }) => warehouse.name))
      } catch (err) {
        console.error("Erro ao buscar warehouses:", err)
        setWarehouses([])
      }
    }

    fetchWarehouses()
  }, [terms.invoicing_company])

  const handleSaveDuns = async () => {
    try {
      setSavingDuns(true)
      await api.updateDunsNumber(id as string, newDuns)

      // Update the local state to reflect the change
      if (customerForm) {
        setCustomerForm({
          ...customerForm,
          duns_number: newDuns,
        })
      }

      setEditingDuns(false)
    } catch (error) {
      console.error("Error updating DUNS number:", error)
      // Optionally show an error message to the user
    } finally {
      setSavingDuns(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset to original value and exit edit mode
    if (customerForm) {
      setNewDuns(customerForm.duns_number || "")
    }
    setEditingDuns(false)
  }

  const handleTermChange = (field: keyof CreditTerms, value: string | number) => {
    if (field === "credit_limit" || field === "discount") {
      const numericValue = value === "" ? 0 : Number(value)

      if (isNaN(numericValue)) return

      setTerms((prev) => ({ ...prev, [field]: numericValue })) // Changed value to numericValue for these fields
    } else {
      setTerms((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleApproval = async (approved: boolean) => {
    try {
      setLoading(true);

      if (approved) {
        const requiredFields: (keyof CreditTerms)[] = [
          "invoicing_company",
          "warehouse",
          "currency",
          "payment_terms",
        ];
        const missingFields = requiredFields.filter((field) => !terms[field]);
        if (missingFields.length > 0) {
          throw new Error(
            `⚠️ Por favor, preencha todos os campos obrigatórios: ${missingFields.join(", ")}`
          );
        }

        if (terms.credit_limit < 0 || terms.discount < 0) {
          throw new Error("⚠️ O limite de crédito e o desconto devem ser não-negativos!");
        }
      }

      await api.validateCreditCustomer(id as string, approved, {
        credit_invoicing_company: terms.invoicing_company,
        credit_warehouse: terms.warehouse,
        credit_currency: terms.currency,
        credit_terms: terms.payment_terms,
        credit_credit: terms.credit_limit,
        credit_discount: terms.discount,
      });

      setModalContent({
        title: "Ok!",
        description: approved
          ? "Customer approved! Forwarded to CSC team."
          : "Customer rejected!",
      });
      setShowModal(true);
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
    setShowModal(false)
    router.push("/validations/credit")
  }

  if (loading) return <S.Message>Loading...</S.Message>
  if (error) return <S.Message>Erro: {error}</S.Message>
  if (!customerForm) return <S.Message>Formulário não encontrado.</S.Message>

  return (
    <S.ContainerMain>
      <S.Container>
        <S.Header>
          <S.Title>Customer Details</S.Title>
          <S.StatusBadge status={customerForm.status}>{customerForm.status}</S.StatusBadge>
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
                    <S.CheckButton onClick={handleSaveDuns} disabled={savingDuns} title="Save">
                      <Check size={16} />
                    </S.CheckButton>
                    <S.CancelButton onClick={handleCancelEdit} disabled={savingDuns} title="Cancel">
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
              <strong>DBA:</strong> {customerForm.dba_number || "Not provided"}
            </S.FormRow>
            <S.FormRow>
              <strong>Resale Certificate:</strong>{" "}
              {customerForm.resale_certificate ? (
                <a href={customerForm.resale_certificate} target="_blank" rel="noopener noreferrer">
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

          {validation && (
            <S.TermsCardsContainer>
              <S.TermsCard>
                <h3>Wholesale Team Validation</h3>
                <p>
                  <strong>Invoicing Company:</strong> {validation.wholesale_invoicing_company}
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
            </S.TermsCardsContainer>
          )}
        </S.FormDetails>

        <S.TermsContainer>
          <S.TermsTitle>Validation Terms (Credit Team)</S.TermsTitle>
          <S.TermsGrid>
            <S.TermsSection>
              <label>
                <Building2 size={16} /> Invoicing Company
              </label>
              <S.Select
                value={terms.invoicing_company}
                onChange={(e) => handleTermChange("invoicing_company", e.target.value)}
              >
                <option value="">Select company</option>
                {INVOICING_COMPANIES.map((company) => (
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
                value={terms.warehouse}
                onChange={(e) => handleTermChange("warehouse", e.target.value)}
                disabled={!terms.invoicing_company}
              >
                <option value="">Select warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </S.Select>
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <CreditCard size={16} /> Currency
              </label>
              <S.Select value={terms.currency} onChange={(e) => handleTermChange("currency", e.target.value)}>
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
                <Calendar size={16} /> Payment Terms
              </label>
              <S.Select value={terms.payment_terms} onChange={(e) => handleTermChange("payment_terms", e.target.value)}>
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
                value={terms.credit_limit}
                onChange={(e) => handleTermChange("credit_limit", Number.parseFloat(e.target.value))}
                min="0"
                step="0.01"
              />
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <Percent size={16} /> Discount
              </label>
              <S.NumericInput
                value={terms.discount}
                onChange={(e) => handleTermChange("discount", Number.parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
              />
            </S.TermsSection>
          </S.TermsGrid>
        </S.TermsContainer>

        <S.ButtonContainer>
          <S.Button type="button" onClick={() => handleApproval(false)} variant="secondary">
            Reject
          </S.Button>
          <S.Button type="button" onClick={() => handleApproval(true)} variant="primary">
            Approve
          </S.Button>
        </S.ButtonContainer>

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
  )
}