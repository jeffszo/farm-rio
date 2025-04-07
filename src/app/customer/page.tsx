"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as S from "./styles"
import { api } from "../../lib/supabase/index"
import type { IFormInputs } from "../../types/form"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronLeft, Upload, Clock4 } from "lucide-react"
import { FaCheckCircle } from "react-icons/fa"

export default function OnboardingForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Por favor, envie um arquivo PDF.")
        return
      }
      setFile(selectedFile)
    }
  }

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    trigger,
  } = useForm<IFormInputs>()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [formStatus, setFormStatus] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; userType?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter()

  // These state setters are used in a future implementation for team-specific views
  const [isWholesaleTeam] = useState(false)
  const [isCreditTeam] = useState(false)

  // ✅ Buscar o usuário e o status do formulário corretamente
  useEffect(() => {
    const fetchUserAndStatus = async () => {
      try {
        setIsLoading(true)
        const currentUser = await api.getCurrentUser()

        if (!currentUser) {
          console.error("Usuário não autenticado.")
          return
        }

        setUser(currentUser)

        // Buscar o status do formulário
        const formData = await api.getFormStatus(currentUser.id)
        setFormStatus(formData?.status || null)
      } catch (error) {
        console.error("Erro ao buscar status do formulário:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndStatus()
  }, [])

  const onSubmit = async (formData: IFormInputs) => {
    try {
      setApiError(null)
      setIsUploading(true)

      const user = await api.getCurrentUser()
      if (!user || !user.id) {
        console.error("Usuário não autenticado.")
        setApiError("Sua sessão expirou. Faça login novamente.")
        return
      }

      console.log("Dados recebidos no formulário:", formData)

      // Upload the PDF file to Supabase if it exists
      let fileUrl = null
      if (file) {
        try {
          // Upload to the resalecertificates bucket
          fileUrl = await api.uploadResaleCertificate(file, user.id)
          console.log("Arquivo enviado com sucesso:", fileUrl)
        } catch (error) {
          console.error("Erro ao enviar o arquivo:", error)
          setApiError("Erro ao enviar o arquivo. Tente novamente.")
          setIsUploading(false)
          return
        }
      }

      // Flatten the nested structure while preserving essential field names
      const flattenedFormData: {
        customer_name: string | null;
        sales_tax_id: string | null;
        resale_certificate: string | null;
        billing_address: string;
        shipping_address: string;
        ap_contact_name: string;
        ap_contact_email: string | null;
        buyer_name: string;
        buyer_email: string | null;
        contact_info?: string[]; // Added contact_info property
        buyer_info?: string[]; // Added buyer_info property
      } = {
        customer_name: formData.customerInfo?.legalName || null,
        sales_tax_id: formData.customerInfo?.taxId || null,
        resale_certificate: fileUrl, // Use the URL from the uploaded file

        billing_address: Object.values(formData.billingAddress || {}).join(", "),
        shipping_address: Object.values(formData.shippingAddress || {}).join(", "),

        ap_contact_name: `${formData.apContact?.firstName || ""} ${formData.apContact?.lastName || ""}`.trim(),
        ap_contact_email: formData.apContact?.email || null,

        buyer_name: `${formData.buyerInfo?.firstName || ""} ${formData.buyerInfo?.lastName || ""}`.trim(),
        buyer_email: formData.buyerInfo?.email || null,
      }

      console.log("Dados formatados para envio:", flattenedFormData)

      // Process customerInfo
      if (formData.customerInfo) {
        Object.values(formData.customerInfo).forEach((value, index) => {
          // Map to expected database fields
          if (index === 0) flattenedFormData.customer_name = value // Assuming first value is legal name
          // Add other mappings as needed
        })
      }

      if (formData.apContact) {
        Object.values(formData.apContact).forEach((value) => {
          flattenedFormData.contact_info = flattenedFormData.contact_info || []
          flattenedFormData.contact_info.push(value)
        })
      }

      if (formData.buyerInfo) {
        Object.values(formData.buyerInfo).forEach((value) => {
          flattenedFormData.buyer_info = flattenedFormData.buyer_info || []
          flattenedFormData.buyer_info.push(value)
        })
      }

      console.log("Sending flattened form data:", flattenedFormData)
      await api.submitForm(flattenedFormData, user.id)
      setIsModalOpen(true) // Open modal instead of alert

      // Router redirect is now handled in the modal close button
    } catch (error: unknown) {
      console.error("Erro ao enviar o formulário:", error instanceof Error ? error.message : String(error))
      setApiError(error instanceof Error ? error.message : "Erro ao enviar o formulário. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  // 🔥 **Evita erro de hidratação: só renderiza depois do carregamento**
  if (isLoading) {
    return <p>Loading...</p>
  }

  // 🔥 **Se o usuário já enviou o formulário, mostra apenas o status**
  if (user?.userType === "cliente" && formStatus) {
    return (
      <S.ReviewContainer>
        <S.ReviewHeader>
          <S.ReviewTitle>Request status</S.ReviewTitle>
          <S.ReviewSubtitle>
            {formStatus === "pending" && (
              <div>
                <Clock4 /> Your submission is under review{" "}
              </div>
            )}

            {formStatus === "approved by the wholesale team" && (
              <div>Your form has already been approved by the wholesale team</div>
            )}

            {formStatus === "approved by the credit team" && (
              <div>Your form has already been approved by the wholesale and credit team.</div>
            )}

            {formStatus === "rejected by CSC team" && (
              <div>Your approval has been rejected by the credit team. Please wait.</div>
            )}

            {formStatus === "approved" && (
              <div>
                Your form has been <strong>approved by all teams!</strong>
              </div>
            )}

            {formStatus === "rejected" && (
              <div>
                Your form has been <strong>rejected</strong>.
              </div>
            )}
          </S.ReviewSubtitle>
        </S.ReviewHeader>
      </S.ReviewContainer>
    )
  }

  // ✅ Criado `nextStep` corretamente
  const nextStep = async () => {
    // Only validate the current step fields
    let fieldsToValidate: Array<"customerInfo" | "billingAddress" | "shippingAddress" | "apContact" | "buyerInfo" | "wholesaleTerms" | "creditTerms" | "customerInfo.legalName" | "customerInfo.taxId" | "customerInfo.dunNumber" | "billingAddress.street" | "billingAddress.zipCode" | "billingAddress.city" | "billingAddress.state" | "billingAddress.county" | "billingAddress.country" | "shippingAddress.street" | "shippingAddress.zipCode" | "shippingAddress.city" | "shippingAddress.state" | "shippingAddress.county" | "shippingAddress.country" | "apContact.firstName" | "apContact.lastName" | "apContact.email" | "apContact.countryCode" | "apContact.contactNumber" | "buyerInfo.firstName" | "buyerInfo.lastName" | "buyerInfo.email" | "buyerInfo.buyerNumber" | "buyerInfo.countryCode"> = [];

    if (currentStep === 1) {
      fieldsToValidate = ["customerInfo.legalName", "customerInfo.taxId", "customerInfo.dunNumber"]
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "billingAddress.street",
        "billingAddress.zipCode",
        "billingAddress.city",
        "billingAddress.state",
        "billingAddress.county",
        "billingAddress.country",
        "shippingAddress.street",
        "shippingAddress.zipCode",
        "shippingAddress.city",
        "shippingAddress.state",
        "shippingAddress.county",
        "shippingAddress.country",
      ]
    } else if (currentStep === 3) {
      fieldsToValidate = [
        "apContact.firstName",
        "apContact.lastName",
        "apContact.email",
        "apContact.countryCode",
        "apContact.contactNumber",
      ]
    }

    const isValid = await trigger(fieldsToValidate)
    if (!isValid) return
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  // ✅ Criado `prevStep` corretamente
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  return (
    <S.ContainerMain>
      <S.FormContainer>
        <S.FormHeader>
          <S.FormTitle>Customer Onboarding</S.FormTitle>
          <S.FormSubtitle>Please fill out the form below to complete the onboarding process.</S.FormSubtitle>
        </S.FormHeader>

        {apiError && <S.ErrorMessage>{apiError}</S.ErrorMessage>}

        <S.ProgressBar>
          <S.ProgressFill progress={(currentStep / totalSteps) * 100} />
        </S.ProgressBar>

        <form onSubmit={hookFormSubmit(onSubmit)}>
          {currentStep === 1 && (
            <S.Section>
              <S.SectionTitle>Customer Information</S.SectionTitle>
              <S.Grid>
                <S.InputGroup>
                  <S.Label htmlFor="legalName">Legal Name</S.Label>
                  <S.Input
                    id="legalName"
                    {...register("customerInfo.legalName", {
                      required: "Legal name is required",
                    })}
                    error={!!errors.customerInfo?.legalName}
                  />
                  {errors.customerInfo?.legalName && (
                    <S.ErrorMessage>{errors.customerInfo.legalName.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="dba">DBA (if applicable)</S.Label>
                  <S.Input id="dba" {...register("customerInfo.dba")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="taxId">Tax ID / VAT #</S.Label>
                  <S.Input
                    id="taxId"
                    {...register("customerInfo.taxId", {
                      required: "Tax ID is required",
                    })}
                    error={!!errors.customerInfo?.taxId}
                  />
                  {errors.customerInfo?.taxId && <S.ErrorMessage>{errors.customerInfo.taxId.message}</S.ErrorMessage>}
                </S.InputGroup>
 
                <S.InputGroup>
                  <S.Label htmlFor="dunNumber">D-U-N-S Number</S.Label>
                  <S.Input
                    id="dunNumber"
                    type="number"
                    {...register("customerInfo.dunNumber", {
                      required: "D-U-N-S number is required",
                      valueAsNumber: true, // Isso converte automaticamente para número
                      validate: (value) =>
                        isNaN(Number(value)) || value === "" ? "D-U-N-S number must be a valid number" : true, // Validando se é um número
                    })}
                    error={!!errors.customerInfo?.dunNumber}
                  />
                  {errors.customerInfo?.dunNumber && (
                    <S.ErrorMessage>{errors.customerInfo.dunNumber.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.FileInputContainer>
                  <S.Label htmlFor="resale">Resale Certificate</S.Label>
                  <S.HiddenInput id="file-upload" type="file" accept="application/pdf" onChange={handleFileChange} />
                  <S.UploadButton htmlFor="file-upload">
                    <Upload size={16} />
                    {file ? file.name : "Attach file (PDF)"}
                  </S.UploadButton>
                </S.FileInputContainer>

              </S.Grid>
            </S.Section>
          )}

          {currentStep === 2 && (
            <S.Section>
              <S.SectionTitle>Shipping and Billing Information</S.SectionTitle>
              <S.Grid>
                <div>
                  <h3>Billing Address</h3>
                  <S.InputGroup>
                    <S.Label htmlFor="billingStreet">Street and Number</S.Label>
                    <S.Input
                      id="billingStreet"
                      {...register("billingAddress.street", {
                        required: "Street is required",
                      })}
                      error={!!errors.billingAddress?.street}
                    />
                    {errors.billingAddress?.street && (
                      <S.ErrorMessage>{errors.billingAddress.street.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="billingZipCode">ZIP Code</S.Label>
                    <S.Input
                      id="billingZipCode"
                      {...register("billingAddress.zipCode", {
                        required: "ZIP code is required",
                      })}
                      error={!!errors.billingAddress?.zipCode}
                    />
                    {errors.billingAddress?.zipCode && (
                      <S.ErrorMessage>{errors.billingAddress.zipCode.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="billingCity">City</S.Label>
                    <S.Input
                      id="billingCity"
                      {...register("billingAddress.city", {
                        required: "City is required",
                      })}
                      error={!!errors.billingAddress?.city}
                    />
                    {errors.billingAddress?.city && (
                      <S.ErrorMessage>{errors.billingAddress.city.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="billingState">State</S.Label>
                    <S.Input
                      id="billingState"
                      {...register("billingAddress.state", {
                        required: "State is required",
                      })}
                      error={!!errors.billingAddress?.state}
                    />
                    {errors.billingAddress?.state && (
                      <S.ErrorMessage>{errors.billingAddress.state.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="billingCounty">County</S.Label>
                    <S.Input
                      id="billingCounty"
                      {...register("billingAddress.county", {
                        required: "County is required",
                      })}
                      error={!!errors.billingAddress?.county}
                    />
                    {errors.billingAddress?.county && (
                      <S.ErrorMessage>{errors.billingAddress.county.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="billingCountry">Country</S.Label>
                    <S.Input
                      id="billingCountry"
                      {...register("billingAddress.country", {
                        required: "Country is required",
                      })}
                      error={!!errors.billingAddress?.country}
                    />
                    {errors.billingAddress?.country && (
                      <S.ErrorMessage>{errors.billingAddress.country.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                </div>

                <div>
                  <h3>Shipping Address</h3>
                  <S.InputGroup>
                    <S.Label htmlFor="shippingStreet">Street and Number</S.Label>
                    <S.Input
                      id="shippingStreet"
                      {...register("shippingAddress.street", {
                        required: "Street is required",
                      })}
                      error={!!errors.shippingAddress?.street}
                    />
                    {errors.shippingAddress?.street && (
                      <S.ErrorMessage>{errors.shippingAddress.street.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="shippingZipCode">ZIP Code</S.Label>
                    <S.Input
                      id="shippingZipCode"
                      {...register("shippingAddress.zipCode", {
                        required: "ZIP code is required",
                      })}
                      error={!!errors.shippingAddress?.zipCode}
                    />
                    {errors.shippingAddress?.zipCode && (
                      <S.ErrorMessage>{errors.shippingAddress.zipCode.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="shippingCity">City</S.Label>
                    <S.Input
                      id="shippingCity"
                      {...register("shippingAddress.city", {
                        required: "City is required",
                      })}
                      error={!!errors.shippingAddress?.city}
                    />
                    {errors.shippingAddress?.city && (
                      <S.ErrorMessage>{errors.shippingAddress.city.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="shippingState">State</S.Label>
                    <S.Input
                      id="shippingState"
                      {...register("shippingAddress.state", {
                        required: "State is required",
                      })}
                      error={!!errors.shippingAddress?.state}
                    />
                    {errors.shippingAddress?.state && (
                      <S.ErrorMessage>{errors.shippingAddress.state.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="shippingCounty">County</S.Label>
                    <S.Input
                      id="shippingCounty"
                      {...register("shippingAddress.county", {
                        required: "County is required",
                      })}
                      error={!!errors.shippingAddress?.county}
                    />
                    {errors.shippingAddress?.county && (
                      <S.ErrorMessage>{errors.shippingAddress.county.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="shippingCountry">Country</S.Label>
                    <S.Input
                      id="shippingCountry"
                      {...register("shippingAddress.country", {
                        required: "Country is required",
                      })}
                      error={!!errors.shippingAddress?.country}
                    />
                    {errors.shippingAddress?.country && (
                      <S.ErrorMessage>{errors.shippingAddress.country.message}</S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="freightForwarder">Freight Forwarder (if applicable)</S.Label>
                    <S.Input id="freightForwarder" {...register("shippingAddress.freightForwarder")} />
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="shippingAccountNumber">Shipping Account Number (if applicable)</S.Label>
                    <S.Input id="shippingAccountNumber" {...register("shippingAddress.shippingAccountNumber")} />
                  </S.InputGroup>
                </div>
              </S.Grid>
            </S.Section>
          )}

          {currentStep === 3 && (
            <S.Section>
              <S.SectionTitle>Accounts Payable Information</S.SectionTitle>
              <S.Grid>
                <S.InputGroup>
                  <S.Label htmlFor="apFirstName">AP Contact First Name</S.Label>
                  <S.Input
                    id="apFirstName"
                    {...register("apContact.firstName", {
                      required: "First name is required",
                    })}
                    error={!!errors.apContact?.firstName}
                  />
                  {errors.apContact?.firstName && <S.ErrorMessage>{errors.apContact.firstName.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="apLastName">AP Contact Last Name</S.Label>
                  <S.Input
                    id="apLastName"
                    {...register("apContact.lastName", {
                      required: "Last name is required",
                    })}
                    error={!!errors.apContact?.lastName}
                  />
                  {errors.apContact?.lastName && <S.ErrorMessage>{errors.apContact.lastName.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="apEmail">AP Contact E-mail</S.Label>
                  <S.Input
                    id="apEmail"
                    type="email"
                    {...register("apContact.email", {
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Invalid email address",
                      },
                    })}
                    error={!!errors.apContact?.email}
                  />
                  {errors.apContact?.email && <S.ErrorMessage>{errors.apContact.email.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="apCountryCode">AP Contact Country Code</S.Label>
                  <S.Input
                    id="apCountryCode"
                    {...register("apContact.countryCode", {
                      required: "Country code is required",
                    })}
                    error={!!errors.apContact?.countryCode}
                  />
                  {errors.apContact?.countryCode && (
                    <S.ErrorMessage>{errors.apContact.countryCode.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="apContactNumber">AP Contact Number</S.Label>
                  <S.Input
                    id="apContactNumber"
                    {...register("apContact.contactNumber", {
                      required: "Contact number is required",
                    })}
                    error={!!errors.apContact?.contactNumber}
                  />
                  {errors.apContact?.contactNumber && (
                    <S.ErrorMessage>{errors.apContact.contactNumber.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
              </S.Grid>
            </S.Section>
          )}

          {currentStep === 4 && (
            <S.Section>
              <S.SectionTitle>Buyer Information</S.SectionTitle>
              <S.Grid>
                <S.InputGroup>
                  <S.Label htmlFor="buyerFirstName">Buyer First Name</S.Label>
                  <S.Input
                    id="buyerFirstName"
                    {...register("buyerInfo.firstName", {
                      required: "First name is required",
                    })}
                    error={!!errors.buyerInfo?.firstName}
                  />
                  {errors.buyerInfo?.firstName && <S.ErrorMessage>{errors.buyerInfo.firstName.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="buyerLastName">Buyer Last Name</S.Label>
                  <S.Input
                    id="buyerLastName"
                    {...register("buyerInfo.lastName", {
                      required: "Last name is required",
                    })}
                    error={!!errors.buyerInfo?.lastName}
                  />
                  {errors.buyerInfo?.lastName && <S.ErrorMessage>{errors.buyerInfo.lastName.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="buyerEmail">Buyer E-mail</S.Label>
                  <S.Input
                    id="buyerEmail"
                    type="email"
                    {...register("buyerInfo.email", {
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Invalid email address",
                      },
                    })}
                    error={!!errors.buyerInfo?.email}
                  />
                  {errors.buyerInfo?.email && <S.ErrorMessage>{errors.buyerInfo.email.message}</S.ErrorMessage>}
                </S.InputGroup>

                <S.InputGroup>
                  <S.Label htmlFor="buyerCountryCode">Buyer Country Code</S.Label>
                  <S.Input
                    id="buyerCountryCode"
                    {...register("buyerInfo.countryCode", {
                      required: "Country code is required",
                    })}
                    error={!!errors.buyerInfo?.countryCode}
                  />
                  {errors.buyerInfo?.countryCode && (
                    <S.ErrorMessage>{errors.buyerInfo.countryCode.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="buyerNumber">Buyer Number</S.Label>
                  <S.Input
                    id="buyerNumber"
                    {...register("buyerInfo.buyerNumber", {
                      required: "Buyer number is required",
                    })}
                    error={!!errors.buyerInfo?.buyerNumber}
                  />
                  {errors.buyerInfo?.buyerNumber && (
                    <S.ErrorMessage>{errors.buyerInfo.buyerNumber.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>

              </S.Grid>
            </S.Section>
          )}

          {isWholesaleTeam && currentStep === 5 && (
            <S.Section>
              <S.SectionTitle>Terms and Conditions Negotiated (For FARM Rio Wholesale Team Use Only)</S.SectionTitle>
              <S.Grid>
                <S.InputGroup>
                  <S.Label htmlFor="wholesaleWarehouse">Warehouse (Shipped From)</S.Label>
                  <S.Input id="wholesaleWarehouse" {...register("wholesaleTerms.warehouse")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="wholesaleInvoicingCompany">Invoicing Company</S.Label>
                  <S.Input id="wholesaleInvoicingCompany" {...register("wholesaleTerms.invoicingCompany")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="wholesaleCurrency">Currency</S.Label>
                  <S.Input id="wholesaleCurrency" {...register("wholesaleTerms.currency")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="wholesaleTerms">Terms</S.Label>
                  <S.Input id="wholesaleTerms" {...register("wholesaleTerms.terms")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="wholesaleDiscount">Discount</S.Label>
                  <S.Input id="wholesaleDiscount" {...register("wholesaleTerms.discount")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="wholesaleCredit">Credit</S.Label>
                  <S.Input id="wholesaleCredit" {...register("wholesaleTerms.credit")} />
                </S.InputGroup>
              </S.Grid>
            </S.Section>
          )}

          {isCreditTeam && currentStep === 5 && (
            <S.Section>
              <S.SectionTitle>Terms and Conditions Approved (For FARM Rio Credit Team Use Only)</S.SectionTitle>
              <S.Grid>
                <S.InputGroup>
                  <S.Label htmlFor="creditWarehouse">Warehouse (Shipped From)</S.Label>
                  <S.Input id="creditWarehouse" {...register("creditTerms.warehouse")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="creditInvoicingCompany">Invoicing Company</S.Label>
                  <S.Input id="creditInvoicingCompany" {...register("creditTerms.invoicingCompany")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="creditCurrency">Currency</S.Label>
                  <S.Input id="creditCurrency" {...register("creditTerms.currency")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="creditTerms">Terms</S.Label>
                  <S.Input id="creditTerms" {...register("creditTerms.terms")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="creditDiscount">Discount</S.Label>
                  <S.Input id="creditDiscount" {...register("creditTerms.discount")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="creditCredit">Credit</S.Label>
                  <S.Input id="creditCredit" {...register("creditTerms.credit")} />
                </S.InputGroup>
              </S.Grid>
            </S.Section>
          )}

          <S.ButtonGroup>
            {currentStep > 1 && (
              <S.Button type="button" onClick={prevStep} variant="secondary">
                <ChevronLeft size={16} /> Previous
              </S.Button>
            )}
            {currentStep < totalSteps ? (
              <S.Button type="button" onClick={nextStep} variant="primary">
                Next <ChevronRight size={16} />
              </S.Button>
            ) : (
              <S.Button type="submit" variant="primary" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Submit"}
              </S.Button>
            )}
          </S.ButtonGroup>
        </form>
      </S.FormContainer>

      {isModalOpen && (
        <S.ModalOverlay>
          <S.ModalContent>
            <S.ModalTitle>
              <FaCheckCircle style={{ color: "#4CAF50", marginRight: "12px", fontSize: "24px" }} />
              Ok!
            </S.ModalTitle>
            <S.ModalMessage>Your form has been submitted successfully!</S.ModalMessage>
            <S.ModalButton
              onClick={() => {
                setIsModalOpen(false)
                router.push("/")
              }}
            >
              OK
            </S.ModalButton>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.ContainerMain>
  )
}

