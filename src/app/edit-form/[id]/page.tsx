"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter, useParams } from "next/navigation"
import { ChevronRight, ChevronLeft, Upload, CircleCheck, Trash2, Plus } from "lucide-react"
import type { IFormInputs } from "../../../types/form"
import * as S from "../../customer/styles"
import { api } from "../../../lib/supabase/index"

export default function EditForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState<number[]>([0])
  const [billingAddress, setBillingAddress] = useState<number[]>([0])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>(null)

  const params = useParams()
  const formId = params.id as string
  const router = useRouter()

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    trigger,
    setValue,
    reset,
  } = useForm<IFormInputs>({
    mode: "onChange",
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

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

  // Fetch the form data to edit
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setIsLoading(true)
        const currentUser = await api.getCurrentUser()

        if (!currentUser) {
          console.error("Usuário não autenticado.")
          router.push("/")
          return
        }

        // Fetch the form data by ID
        const data = await api.getFormById(formId)
        reset(data) // Reset the form with the fetched data
        if (!data) {
          console.error("Form not found")
          router.push("/")
          return
        }

        setFormData(data)

        // Populate the form with existing data
        if (data.customer_name) setValue("customerInfo.legalName", data.customer_name)
        if (data.sales_tax_id) setValue("customerInfo.taxId", data.sales_tax_id)
        if (data.duns_number) setValue("customerInfo.dunNumber", data.duns_number)
        if (data.dba_number) setValue("customerInfo.dba", data.dba_number)

        // Handle billing address
        if (data.billing_address) {
          const addressParts = data.billing_address.split(", ")
          if (addressParts.length >= 6) {
            setValue("billingAddress.0.street", addressParts[0] || "")
            setValue("billingAddress.0.zipCode", addressParts[1] || "")
            setValue("billingAddress.0.city", addressParts[2] || "")
            setValue("billingAddress.0.state", addressParts[3] || "")
            setValue("billingAddress.0.county", addressParts[4] || "")
            setValue("billingAddress.0.country", addressParts[5] || "")
          }
        }

        // Handle shipping address
        if (data.shipping_address) {
          const addressParts = data.shipping_address.split(", ")
          if (addressParts.length >= 6) {
            setValue("shippingAddress.0.street", addressParts[0] || "")
            setValue("shippingAddress.0.zipCode", addressParts[1] || "")
            setValue("shippingAddress.0.city", addressParts[2] || "")
            setValue("shippingAddress.0.state", addressParts[3] || "")
            setValue("shippingAddress.0.county", addressParts[4] || "")
            setValue("shippingAddress.0.country", addressParts[5] || "")
          }
        }

        // Handle AP contact info
        if (data.ap_contact_name) {
          const nameParts = data.ap_contact_name.split(" ")
          setValue("apContact.firstName", nameParts[0] || "")
          setValue("apContact.lastName", nameParts.slice(1).join(" ") || "")
        }
        if (data.ap_contact_email) setValue("apContact.email", data.ap_contact_email)

        // Handle contact info if available
        if (data.contact_info && Array.isArray(data.contact_info)) {
          if (data.contact_info[3]) setValue("apContact.countryCode", data.contact_info[3])
          if (data.contact_info[4]) setValue("apContact.contactNumber", data.contact_info[4])
        }

        // Handle buyer info
        if (data.buyer_name) {
          const nameParts = data.buyer_name.split(" ")
          setValue("buyerInfo.firstName", nameParts[0] || "")
          setValue("buyerInfo.lastName", nameParts.slice(1).join(" ") || "")
        }
        if (data.buyer_email) setValue("buyerInfo.email", data.buyer_email)

        // Handle buyer info if available
        if (data.buyer_info && Array.isArray(data.buyer_info)) {
          if (data.buyer_info[3]) setValue("buyerInfo.countryCode", data.buyer_info[3])
          if (data.buyer_info[4]) setValue("buyerInfo.buyerNumber", data.buyer_info[4])
        }

        // Handle additional addresses if needed
        if (data.additional_shipping_addresses && Array.isArray(data.additional_shipping_addresses)) {
          const additionalAddresses = data.additional_shipping_addresses.length
          if (additionalAddresses > 0) {
            const newShippingAddresses = Array.from({ length: additionalAddresses + 1 }, (_, i) => i)
            setShippingAddress(newShippingAddresses)

            data.additional_shipping_addresses.forEach((address, index) => {
              const addressParts = address.split(", ")
              if (addressParts.length >= 6) {
                setValue(`shippingAddress.${index + 1}.street`, addressParts[0] || "")
                setValue(`shippingAddress.${index + 1}.zipCode`, addressParts[1] || "")
                setValue(`shippingAddress.${index + 1}.city`, addressParts[2] || "")
                setValue(`shippingAddress.${index + 1}.state`, addressParts[3] || "")
                setValue(`shippingAddress.${index + 1}.county`, addressParts[4] || "")
                setValue(`shippingAddress.${index + 1}.country`, addressParts[5] || "")
              }
            })
          }
        }

        if (data.additional_billing_addresses && Array.isArray(data.additional_billing_addresses)) {
          const additionalAddresses = data.additional_billing_addresses.length
          if (additionalAddresses > 0) {
            const newBillingAddresses = Array.from({ length: additionalAddresses + 1 }, (_, i) => i)
            setBillingAddress(newBillingAddresses)

            data.additional_billing_addresses.forEach((address, index) => {
              const addressParts = address.split(", ")
              if (addressParts.length >= 6) {
                setValue(`billingAddress.${index + 1}.street`, addressParts[0] || "")
                setValue(`billingAddress.${index + 1}.zipCode`, addressParts[1] || "")
                setValue(`billingAddress.${index + 1}.city`, addressParts[2] || "")
                setValue(`billingAddress.${index + 1}.state`, addressParts[3] || "")
                setValue(`billingAddress.${index + 1}.county`, addressParts[4] || "")
                setValue(`billingAddress.${index + 1}.country`, addressParts[5] || "")
              }
            })
          }
        }
      } catch (error) {
        console.error("Error fetching form data:", error)
        setApiError("Failed to load your data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFormData()
  }, [formId, router, setValue, reset])

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

      console.log("Dados atualizados no formulário:", formData)

      // Upload the PDF file to Supabase if it exists
      let fileUrl = null
      if (file) {
        try {
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
        customer_name: string | null
        sales_tax_id: string | null
        duns_number: string | null
        dba_number: string | null
        resale_certificate: string | null
        billing_address: string
        shipping_address: string
        ap_contact_name: string
        ap_contact_email: string | null
        buyer_name: string
        buyer_email: string | null
        contact_info?: string[]
        buyer_info?: string[]
        additional_shipping_addresses?: string[]
        additional_billing_addresses?: string[]
      } = {
        customer_name: formData.customerInfo?.legalName || null,
        sales_tax_id: formData.customerInfo?.taxId || null,
        duns_number: formData.customerInfo?.dunNumber || null,
        dba_number: formData.customerInfo?.dba || null,
        resale_certificate: fileUrl || null, // Use the URL from the uploaded file or keep existing

        billing_address: Object.values(formData.billingAddress?.[0] || {}).join(", "),
        shipping_address: Object.values(formData.shippingAddress?.[0] || {}).join(", "),

        ap_contact_name: `${formData.apContact?.firstName || ""} ${formData.apContact?.lastName || ""}`.trim(),
        ap_contact_email: formData.apContact?.email || null,

        buyer_name: `${formData.buyerInfo?.firstName || ""} ${formData.buyerInfo?.lastName || ""}`.trim(),
        buyer_email: formData.buyerInfo?.email || null,
      }

      // Process contact info
      if (formData.apContact) {
        flattenedFormData.contact_info = Object.values(formData.apContact)
      }

      // Process buyer info
      if (formData.buyerInfo) {
        flattenedFormData.buyer_info = Object.values(formData.buyerInfo)
      }

      // Process multiple shipping addresses
      if (formData.shippingAddress && formData.shippingAddress.length > 1) {
        flattenedFormData.additional_shipping_addresses = formData.shippingAddress
          .slice(1)
          .map((addr) => Object.values(addr || {}).join(", "))
      }

      // Process multiple billing addresses
      if (formData.billingAddress && formData.billingAddress.length > 1) {
        flattenedFormData.additional_billing_addresses = formData.billingAddress
          .slice(1)
          .map((addr) => Object.values(addr || {}).join(", "))
      }

      // Update the form with the new data
      await api.updateForm(flattenedFormData, formId)

      // Reset the form status to pending for review
      await api.updateFormStatus(formId, "pending")

      setIsModalOpen(true)
    } catch (error: unknown) {
      console.error("Erro ao atualizar o formulário:", error instanceof Error ? error.message : String(error))
      setApiError(error instanceof Error ? error.message : "Erro ao atualizar o formulário. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: Array<
      | "customerInfo"
      | "billingAddress"
      | "shippingAddress"
      | "apContact"
      | "buyerInfo"
      | "wholesaleTerms"
      | "creditTerms"
      | "customerInfo.legalName"
      | "customerInfo.taxId"
      | "customerInfo.dunNumber"
      | "billingAddress.street"
      | "billingAddress.zipCode"
      | "billingAddress.city"
      | "billingAddress.state"
      | "billingAddress.county"
      | "billingAddress.country"
      | "shippingAddress.street"
      | "shippingAddress.zipCode"
      | "shippingAddress.city"
      | "shippingAddress.state"
      | "shippingAddress.county"
      | "shippingAddress.country"
      | "apContact.firstName"
      | "apContact.lastName"
      | "apContact.email"
      | "apContact.countryCode"
      | "apContact.contactNumber"
      | "buyerInfo.firstName"
      | "buyerInfo.lastName"
      | "buyerInfo.email"
      | "buyerInfo.buyerNumber"
      | "buyerInfo.countryCode"
    > = []

    if (currentStep === 1) {
      fieldsToValidate = ["customerInfo.legalName", "customerInfo.taxId", "customerInfo.dunNumber"]
    } else if (currentStep === 2) {
      // Validar endereços de cobrança
      billingAddress.forEach((index) => {
        fieldsToValidate.push(
          `billingAddress.${index}.street`,
          `billingAddress.${index}.zipCode`,
          `billingAddress.${index}.city`,
          `billingAddress.${index}.state`,
          `billingAddress.${index}.county`,
          `billingAddress.${index}.country`,
        )
      })

      // Validar endereços de envio
      shippingAddress.forEach((index) => {
        fieldsToValidate.push(
          `shippingAddress.${index}.street`,
          `shippingAddress.${index}.zipCode`,
          `shippingAddress.${index}.city`,
          `shippingAddress.${index}.state`,
          `shippingAddress.${index}.county`,
          `shippingAddress.${index}.country`,
        )
      })
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

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const addShippingAddress = () => {
    setShippingAddress((prev) => [...prev, prev.length])
  }

  const addBillingAddress = () => {
    setBillingAddress((prev) => [...prev, prev.length])
  }

  const removeShippingAddress = (indexToRemove: number) => {
    if (shippingAddress.length <= 1) return // Não remover o último endereço
    setShippingAddress((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const removeBillingAddress = (indexToRemove: number) => {
    if (billingAddress.length <= 1) return // Não remover o último endereço
    setBillingAddress((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  if (isLoading) {
    return <p>Loading...</p>
  }

  return (
    <S.ContainerMain>
      <S.FormContainer>
        <S.FormHeader>
          <S.FormTitle>Edit Customer Information</S.FormTitle>
          <S.FormSubtitle>Please update your information and submit for review.</S.FormSubtitle>
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
                  <S.Input type="number" id="dba" {...register("customerInfo.dba")} />
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="taxId">Tax ID / VAT #</S.Label>
                  <S.Input
                    type="number"
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
                      required: "DBA is required",
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
                    {file ? file.name : formData?.resale_certificate ? "Replace current file" : "Attach file (PDF)"}
                  </S.UploadButton>
                  {formData?.resale_certificate && !file && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
                      Current file: {formData.resale_certificate.split("/").pop()}
                    </div>
                  )}
                </S.FileInputContainer>
              </S.Grid>
            </S.Section>
          )}

          {currentStep === 2 && (
            <S.CompactSection>
              <S.SectionTitle>Shipping and Billing Information</S.SectionTitle>
              <S.ResponsiveGrid>
                <S.AddressSection>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <S.AddressTitle>Billing Address</S.AddressTitle>
                  </div>

                  {billingAddress.map((index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: index < billingAddress.length - 1 ? "1.5rem" : "0",
                        paddingBottom: index < billingAddress.length - 1 ? "1.5rem" : "0",
                        borderBottom: index < billingAddress.length - 1 ? "1px dashed #eee" : "none",
                      }}
                    >
                      <S.AddressHeader>
                        {index > 0 && (
                          <div style={{ fontSize: "0.875rem", color: "#71717a" }}>Billing Address {index + 1}</div>
                        )}
                        {index > 0 && (
                          <S.RemoveButton type="button" onClick={() => removeBillingAddress(index)}>
                            <Trash2 size={16} />
                          </S.RemoveButton>
                        )}
                      </S.AddressHeader>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingStreet${index}`}>Street and Number</S.Label>
                          <S.Input
                            id={`billingStreet${index}`}
                            {...register(`billingAddress.${index}.street`, {
                              required: "Street is required",
                            })}
                            error={!!errors.billingAddress?.street}
                          />
                          {errors.billingAddress?.street && (
                            <S.ErrorMessage>{errors.billingAddress.street.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingZipCode${index}`}>ZIP Code</S.Label>
                          <S.Input
                            id={`billingZipCode${index}`}
                            {...register(`billingAddress.${index}.zipCode`, {
                              required: "ZIP code is required",
                            })}
                            error={!!errors.billingAddress?.zipCode}
                          />
                          {errors.billingAddress?.zipCode && (
                            <S.ErrorMessage>{errors.billingAddress.zipCode.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingCity${index}`}>City</S.Label>
                          <S.Input
                            id={`billingCity${index}`}
                            {...register(`billingAddress.${index}.city`, {
                              required: "City is required",
                            })}
                            error={!!errors.billingAddress?.city}
                          />
                          {errors.billingAddress?.city && (
                            <S.ErrorMessage>{errors.billingAddress.city.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingState${index}`}>State</S.Label>
                          <S.Input
                            id={`billingState${index}`}
                            {...register(`billingAddress.${index}.state`, {
                              required: "State is required",
                            })}
                            error={!!errors.billingAddress?.state}
                          />
                          {errors.billingAddress?.state && (
                            <S.ErrorMessage>{errors.billingAddress.state.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingCounty${index}`}>County</S.Label>
                          <S.Input
                            id={`billingCounty${index}`}
                            {...register(`billingAddress.${index}.county`, {
                              required: "County is required",
                            })}
                            error={!!errors.billingAddress?.county}
                          />
                          {errors.billingAddress?.county && (
                            <S.ErrorMessage>{errors.billingAddress.county.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingCountry${index}`}>Country</S.Label>
                          <S.Input
                            id={`billingCountry${index}`}
                            {...register(`billingAddress.${index}.country`, {
                              required: "Country is required",
                            })}
                            error={!!errors.billingAddress?.country}
                          />
                          {errors.billingAddress?.country && (
                            <S.ErrorMessage>{errors.billingAddress.country.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                    </div>
                  ))}

                  <S.AddAddressButton type="button" onClick={addBillingAddress}>
                    <Plus size={16} /> Add another billing address
                  </S.AddAddressButton>
                </S.AddressSection>

                <S.AddressSection>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <S.AddressTitle>Shipping Address</S.AddressTitle>
                  </div>

                  {shippingAddress.map((index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: index < shippingAddress.length - 1 ? "1.5rem" : "0",
                        paddingBottom: index < shippingAddress.length - 1 ? "1.5rem" : "0",
                        borderBottom: index < shippingAddress.length - 1 ? "1px dashed #eee" : "none",
                      }}
                    >
                      <S.AddressHeader>
                        {index > 0 && (
                          <div style={{ fontSize: "0.875rem", color: "#71717a" }}>Shipping Address {index + 1}</div>
                        )}
                        {index > 0 && (
                          <S.RemoveButton type="button" onClick={() => removeShippingAddress(index)}>
                            <Trash2 size={16} />
                          </S.RemoveButton>
                        )}
                      </S.AddressHeader>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingStreet${index}`}>Street and Number</S.Label>
                          <S.Input
                            id={`shippingStreet${index}`}
                            {...register(`shippingAddress.${index}.street`, {
                              required: "Street is required",
                            })}
                            error={!!errors.shippingAddress?.street}
                          />
                          {errors.shippingAddress?.street && (
                            <S.ErrorMessage>{errors.shippingAddress.street.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingZipCode${index}`}>ZIP Code</S.Label>
                          <S.Input
                            id={`shippingZipCode${index}`}
                            {...register(`shippingAddress.${index}.zipCode`, {
                              required: "ZIP code is required",
                            })}
                            error={!!errors.shippingAddress?.zipCode}
                          />
                          {errors.shippingAddress?.zipCode && (
                            <S.ErrorMessage>{errors.shippingAddress.zipCode.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingCity${index}`}>City</S.Label>
                          <S.Input
                            id={`shippingCity${index}`}
                            {...register(`shippingAddress.${index}.city`, {
                              required: "City is required",
                            })}
                            error={!!errors.shippingAddress?.city}
                          />
                          {errors.shippingAddress?.city && (
                            <S.ErrorMessage>{errors.shippingAddress.city.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingState${index}`}>State</S.Label>
                          <S.Input
                            id={`shippingState${index}`}
                            {...register(`shippingAddress.${index}.state`, {
                              required: "State is required",
                            })}
                            error={!!errors.shippingAddress?.state}
                          />
                          {errors.shippingAddress?.state && (
                            <S.ErrorMessage>{errors.shippingAddress.state.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingCounty${index}`}>County</S.Label>
                          <S.Input
                            id={`shippingCounty${index}`}
                            {...register(`shippingAddress.${index}.county`, {
                              required: "County is required",
                            })}
                            error={!!errors.shippingAddress?.county}
                          />
                          {errors.shippingAddress?.county && (
                            <S.ErrorMessage>{errors.shippingAddress.county.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingCountry${index}`}>Country</S.Label>
                          <S.Input
                            id={`shippingCountry${index}`}
                            {...register(`shippingAddress.${index}.country`, {
                              required: "Country is required",
                            })}
                            error={!!errors.shippingAddress?.country}
                          />
                          {errors.shippingAddress?.country && (
                            <S.ErrorMessage>{errors.shippingAddress.country.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                    </div>
                  ))}

                  <S.AddAddressButton type="button" onClick={addShippingAddress}>
                    <Plus size={16} /> Add another shipping address
                  </S.AddAddressButton>
                </S.AddressSection>
              </S.ResponsiveGrid>
            </S.CompactSection>
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
                    placeholder="example@hotmail.com"
                    {...register("apContact.email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|hotmail\.com|yahoo\.com)$/,
                        message: "Only emails from Gmail, Outlook, Hotmail, or Yahoo are allowed",
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
                    type="number"
                    min={0}
                    style={{ width: "80px" }}
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
                  <S.Label htmlFor="apContactNumber">AP Contact Number:</S.Label>
                  <S.Input
                    id="apContactNumber"
                    type="number"
                    min={0}
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
                  <S.Label htmlFor="buyerFirstName">Buyer First Name:</S.Label>
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
                  <S.Label htmlFor="buyerLastName">Buyer Last Name:</S.Label>
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
                  <S.Label htmlFor="buyerEmail">Buyer E-mail:</S.Label>
                  <S.Input
                    id="buyerEmail"
                    type="email"
                    placeholder="example@hotmail.com"
                    {...register("buyerInfo.email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|hotmail\.com|yahoo\.com)$/,
                        message: "Only emails from Gmail, Outlook, Hotmail, or Yahoo are allowed",
                      },
                    })}
                    error={!!errors.buyerInfo?.email}
                  />
                  {errors.buyerInfo?.email && <S.ErrorMessage>{errors.buyerInfo.email.message}</S.ErrorMessage>}
                </S.InputGroup>

                <S.InputGroup>
                  <S.Label htmlFor="buyerCountryCode">Buyer Country Code:</S.Label>
                  <S.Input
                    id="buyerCountryCode"
                    type="number"
                    min={0}
                    style={{ width: "80px" }}
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
                  <S.Label htmlFor="buyerNumber">Buyer Number:</S.Label>
                  <S.Input
                    type="number"
                    id="buyerNumber"
                    min={0}
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
                {isUploading ? "Uploading..." : "Update Information"}
              </S.Button>
            )}
          </S.ButtonGroup>
        </form>
      </S.FormContainer>

      {isModalOpen && (
        <S.ModalOverlay>
          <S.ModalContent>
            <S.ModalTitle>
              <CircleCheck size={48} />
            </S.ModalTitle>
            <S.ModalMessage>Your information has been updated successfully!</S.ModalMessage>
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
