"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "../../../../lib/supabase/index"
import * as S from "./styles"
import { User, MapPin, Mail, Building2, Warehouse, CreditCard, Calendar, DollarSign, Percent } from "lucide-react"

interface CustomerForm {
  id: string
  customer_name: string
  sales_tax_id: string
  resale_certificate: string
  billing_address: string
  shipping_address: string
  ap_contact_name: string
  ap_contact_email: string
  buyer_name: string
  buyer_email: string
  status: string
  created_at: string
}

// Updated interface to match the actual structure used in the component
interface ValidationTerms {
  invoicing_company: string
  warehouse: string
  currency: string
  payment_terms: string
  credit_limit: number
  discount: number
  [key: string]: string | number // Allow dynamic access to properties
}

const INVOICING_COMPANIES = [
  "Plantage Rio Inc - United States",
  "Soma Brands International - European Union",
  "Soma Brands UK Limited - United Kingdom",
  "Soma Brands France - France",
]

const CURRENCIES = ["USD", "EUR", "GBP"]

const PAYMENT_TERMS = ["100% Prior Ship", "Net 45 Days", "Net 30 Days", "Net 90 Days", "Net 15 Days"]

export default function ValidationDetailsPage() {
  const { id } = useParams()
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ title: "", description: "" })
  const router = useRouter()

  const [terms, setTerms] = useState<ValidationTerms>({
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
        if (!data) throw new Error("Formulário não encontrado.")
        setCustomerForm(data)
      } catch (err) {
        console.error("Erro ao buscar detalhes do cliente:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchCustomerDetails()
  }, [id])

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        router.push("/");
      } else {
        const currentUser = await api.getCurrentUser();
        setUser({ email: currentUser.email, role: currentUser.userType });
      }
    });
  
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);
  

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

  const handleTermChange = (field: keyof ValidationTerms, value: string | number) => {
    if (field === "credit_limit" || field === "discount") {
      const numericValue = value === "" ? 0 : Number(value)

      if (isNaN(numericValue)) return

      setTerms((prev) => ({ ...prev, [field]: numericValue }))
    } else {
      setTerms((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleApproval = async (approved: boolean) => {
    if (!user) return

    try {
      setLoading(true)

      if (approved) {
        const requiredFields: (keyof ValidationTerms)[] = [
          "invoicing_company",
          "warehouse",
          "currency",
          "payment_terms",
        ]
        const missingFields = requiredFields.filter((field) => !terms[field])
        if (missingFields.length > 0) {
          throw new Error(`⚠️ Please fill in all required fields: ${missingFields.join(", ")}`)
        }
        if (terms.credit_limit < 0 || terms.discount < 0) {
          throw new Error("⚠️ Credit limit and discount must be non-negative!")
        }
      }

      await api.validateWholesaleCustomer(id as string, approved, terms)

      setModalContent({
        title: "Ok!",
        description: approved ? "Client approved! Forwarded to the CSC team." : "Customer rejected!",
      })
      setShowModal(true)
    } catch (err) {
      console.error("Erro ao validar cliente:", err)
      setModalContent({
        title: "Erro!",
        description: err instanceof Error ? err.message : "Erro desconhecido",
      })
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    router.push("/validations/wholesale")
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
            <S.FormRow>
              <strong>Resale Certificate:</strong>{" "}
              {customerForm.resale_certificate ? (
                <a href={customerForm.resale_certificate} target="_blank" rel="noopener noreferrer">
                  View PDF
                </a>
              ) : (
                "Não enviado"
              )}
            </S.FormRow>
          </S.FormSection>
          <S.FormSection>
            <S.SectionTitle>
              <MapPin size={16} /> Addresses
            </S.SectionTitle>
            <S.FormRow>
              <strong>Billing:</strong> {customerForm.billing_address}
            </S.FormRow>
            <S.FormRow>
              <strong>Shipping:</strong> {customerForm.shipping_address}
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
        </S.FormDetails>

        <S.TermsContainer>
          <S.TermsTitle>Validation Terms (Wholesale Team)</S.TermsTitle>
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
          <S.Button onClick={() => handleApproval(false)} variant="secondary">
            Reject
          </S.Button>
          <S.Button onClick={() => handleApproval(true)} variant="primary">
            Approve
          </S.Button>
        </S.ButtonContainer>

        {showModal && (
          <S.Modal>
            <S.ModalContent>
              <S.ModalTitle>{modalContent.title}</S.ModalTitle>
              <S.ModalDescription>{modalContent.description}</S.ModalDescription>
              <S.ModalButton onClick={closeModal}>Ok</S.ModalButton>
            </S.ModalContent>
          </S.Modal>
        )}
      </S.Container>
    </S.ContainerMain>
  )
}

