"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/supabaseApi"
import * as S from "./styles"
import { User, MapPin, Mail, CheckSquare } from "lucide-react"

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

export default function ValidationDetailsPage() {
  const { id } = useParams()
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ title: "", description: "" })
  const router = useRouter()

  const [terms, setTerms] = useState({
    warehouse: false,
    invoicingCompany: false,
    currency: false,
    terms: false,
    discount: false,
    credit: false,
  })

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
    const fetchUser = async () => {
      try {
        const currentUser = await api.getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }
        setUser({ email: currentUser.email, role: currentUser.userType })
      } catch (err) {
        console.error("Erro ao obter usuário:", err)
      }
    }
    fetchUser()
  }, [router])

  const handleCheckboxChange = (field: string) => {
    setTerms((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleApproval = async (approved: boolean) => {
    if (!user) return

    try {
      setLoading(true)

      if (approved) {
        const allTermsAccepted = Object.values(terms).every((term) => term)
        if (!allTermsAccepted) {
          throw new Error("⚠️ Marque todos os termos para aprovar!")
        }
      }

      await api.validateCreditCustomer(id as string, approved, terms)

      setModalContent({
        title: "Ok!",
        description: approved ? "Client approved!" : "Customer rejected!",
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
    router.push("/validations/csc")
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
              <strong>Resale Certificate:</strong> {customerForm.resale_certificate}
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

        {/* <S.TermsContainer>
          <S.TermsTitle>
            <CheckSquare size={16} /> Validation terms
          </S.TermsTitle>
          <S.CheckboxWrapper>
            {Object.keys(terms).map((key) => (
              <S.CheckboxLabel key={key}>
                <S.Checkbox checked={terms[key as keyof typeof terms]} onChange={() => handleCheckboxChange(key)} />
                {key.replace(/([A-Z])/g, " $1").trim()}
              </S.CheckboxLabel>
            ))}
          </S.CheckboxWrapper>
        </S.TermsContainer> */}

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
              <S.ModalButton onClick={closeModal}>Close</S.ModalButton>
            </S.ModalContent>
          </S.Modal>
        )}
      </S.Container>
    </S.ContainerMain>
  )
}

