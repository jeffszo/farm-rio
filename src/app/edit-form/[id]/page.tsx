// src/app/customer/form/page.tsx
"use client"
import React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter, useParams } from "next/navigation"
import * as S from "../../customer/styles"
import type { IFormInputs } from "../../../types/form"
import { api } from "../../../lib/supabase/index"
import { supabase } from "../../../lib/supabase/client" // ou `supabase.ts`, dependendo do seu projeto
import { ChevronRight, ChevronLeft, Upload, CircleCheck, Plus, Trash2 } from "lucide-react"

export default function EditFormPage() {
  const { id } = useParams()
  const [file, setFile] = useState<File | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [shippingAddress, setShippingAddress] = useState<number[]>([0])
  const [billingAddress, setBillingAddress] = useState<number[]>([0])
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const router = useRouter()
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null)
  const [previousFormStatus, setPreviousFormStatus] = useState<string | null>(null); // NOVO ESTADO: Para guardar o status anterior

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    trigger,
  } = useForm<IFormInputs>({
    mode: "onChange",
  })

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const formData = await api.getCustomerFormById(id as string)
        if (formData) {
          // Atualiza o estado do status anterior
          setPreviousFormStatus(formData.status); //
          if ((formData as { resale_certificate?: string })?.resale_certificate) {
            setExistingFileUrl((formData as { resale_certificate?: string }).resale_certificate ?? null)
          }
          // Você também precisaria usar o 'setValue' do react-hook-form aqui
          // para preencher os campos do formulário com os dados existentes
          // Ex: setValue('customerInfo.legalName', formData.customer_name);
          // Este preenchimento não está no escopo da sua pergunta, mas é importante para um "edit form" completo.
        }
      } catch (error) {
        console.error("Error fetching existing form data:", error)
      }
    }

    if (id) {
      fetchExistingData()
    }
  }, [id])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Please upload a PDF file.")
        return
      }
      setFile(selectedFile)
    }
  }

  const onSubmit = async (formData: IFormInputs) => {
    try {
      setApiError(null)
      setIsUploading(true)

      // Upload the PDF file to Supabase if selected
      let fileUrl: string | null = existingFileUrl // Start with existing URL
      if (file) {
        try {
          console.log("Starting file upload process...")
          fileUrl = await api.uploadResaleCertificate(file, id as string)
          console.log("File uploaded successfully:", fileUrl)
        } catch (error) {
          console.error("Detailed file upload error:", error)
          setApiError(error instanceof Error ? error.message : "Error uploading file. Please try again.")
          setIsUploading(false)
          return
        }
      }

      // Determine the new status based on the previous form status
      let newCalculatedStatus: string;

      
      const normalizedStatus = previousFormStatus?.toLowerCase().trim()

      if (normalizedStatus === "rejected by the team wholesale") {
        newCalculatedStatus = "pending"
      } else if (normalizedStatus === "rejected by the csc team") {
        newCalculatedStatus = "data corrected by client"
      } else {
        newCalculatedStatus = "pending"
      }



      // Flatten the nested structure while preserving essential field names
      const flattenedFormData: {
        id: string // Make sure to include the ID
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
        additional_shipping_addresses?: string[]
        additional_billing_addresses?: string[]
        status: string // Agora dinâmico
      } = {
        id: id as string, // Include the ID in the data
        customer_name: formData.customerInfo?.legalName || null,
        sales_tax_id: formData.customerInfo?.taxId || null,
        duns_number: formData.customerInfo?.dunNumber || null,
        dba_number: formData.customerInfo?.dba || null,
        resale_certificate: fileUrl,
        billing_address: Object.values(formData.billingAddress?.[0] || {}).join(", "),
        shipping_address: Object.values(formData.shippingAddress?.[0] || {}).join(", "),
        ap_contact_name: `${formData.apContact?.firstName || ""} ${formData.apContact?.lastName || ""}`.trim(),
        ap_contact_email: formData.apContact?.email || null,
        buyer_name: `${formData.buyerInfo?.firstName || ""} ${formData.buyerInfo?.lastName || ""}`.trim(),
        buyer_email: formData.buyerInfo?.email || null,
        status: newCalculatedStatus, // USA O STATUS CALCULADO AQUI!
      }

      // Process multiple shipping addresses
      if (shippingAddress.length > 1) {
        flattenedFormData.additional_shipping_addresses = shippingAddress
          .slice(1)
          .map((index) => Object.values(formData.shippingAddress?.[index] || {}).join(", "))
      }

      // Process multiple billing addresses
      if (billingAddress.length > 1) {
        flattenedFormData.additional_billing_addresses = billingAddress
          .slice(1)
          .map((index) => Object.values(formData.billingAddress?.[index] || {}).join(", "))
      }

      // If there's an existing file URL and no new file was uploaded, keep the existing URL
      if (!fileUrl && existingFileUrl) {
        flattenedFormData.resale_certificate = existingFileUrl
      }

      console.log("Sending data to update:", flattenedFormData)

      // Update the form with the edited data
      const sanitizedFormData = Object.fromEntries(
        Object.entries(flattenedFormData).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : value ?? ""])
      )

      console.log("ID usado para update e get:", id)


      const updateResult = await api.updateForm(JSON.stringify(sanitizedFormData), id as string)

      if (!updateResult) {
        setApiError("Falha ao atualizar os dados. Verifique se você tem permissão.")
        return
      }


      // Verify the update was successful by fetching the updated record
      const { data, error } = await supabase
      .from("customer_forms")
      .select("*")
      .eq("id", id)

      console.log("🧪 Data recebida manualmente:", data)
      console.log("🧪 Erro manual:", error)

      setIsModalOpen(true)
    } catch (error: unknown) {
      console.error("Error updating form:", error)
      let errorMessage = "Error updating form. Please try again."

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null) {
        // Try to extract more meaningful error information
        errorMessage = JSON.stringify(error)
      }

      setApiError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const nextStep = async () => {
    // Only validate the current step fields
    let fieldsToValidate: string[] = []

    if (currentStep === 1) {
      fieldsToValidate = ["customerInfo.legalName", "customerInfo.taxId", "customerInfo.dunNumber"]
    } else if (currentStep === 2) {
      // Validate billing addresses
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

      // Validate shipping addresses
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

    // @ts-expect-error - We need to ignore the type error here because the React Hook Form types
    // don't fully support dynamic field names with array indices
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
    if (shippingAddress.length <= 1) return // Don't remove the last address
    setShippingAddress((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const removeBillingAddress = (indexToRemove: number) => {
    if (billingAddress.length <= 1) return // Don't remove the last address
    setBillingAddress((prev) => prev.filter((_, index) => index !== indexToRemove))
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
                  <S.Input placeholder="Trade name" type="string" id="dba" {...register("customerInfo.dba")} />
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
                      required: "DUNS is required",
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
                            error={!!errors.billingAddress?.[index]?.street}
                          />
                          {errors.billingAddress?.[index]?.street && (
                            <S.ErrorMessage>{errors.billingAddress[index].street.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingZipCode${index}`}>ZIP Code</S.Label>
                          <S.Input
                            id={`billingZipCode${index}`}
                            {...register(`billingAddress.${index}.zipCode`, {
                              required: "ZIP code is required",
                            })}
                            error={!!errors.billingAddress?.[index]?.zipCode}
                          />
                          {errors.billingAddress?.[index]?.zipCode && (
                            <S.ErrorMessage>{errors.billingAddress[index].zipCode.message}</S.ErrorMessage>
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
                            error={!!errors.billingAddress?.[index]?.city}
                          />
                          {errors.billingAddress?.[index]?.city && (
                            <S.ErrorMessage>{errors.billingAddress[index].city.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingState${index}`}>State</S.Label>
                          <S.Input
                            id={`billingState${index}`}
                            {...register(`billingAddress.${index}.state`, {
                              required: "State is required",
                            })}
                            error={!!errors.billingAddress?.[index]?.state}
                          />
                          {errors.billingAddress?.[index]?.state && (
                            <S.ErrorMessage>{errors.billingAddress[index].state.message}</S.ErrorMessage>
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
                            error={!!errors.billingAddress?.[index]?.county}
                          />
                          {errors.billingAddress?.[index]?.county && (
                            <S.ErrorMessage>{errors.billingAddress[index].county.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingCountry${index}`}>Country</S.Label>
                          <S.Input
                            id={`billingCountry${index}`}
                            {...register(`billingAddress.${index}.country`, {
                              required: "Country is required",
                            })}
                            error={!!errors.billingAddress?.[index]?.country}
                          />
                          {errors.billingAddress?.[index]?.country && (
                            <S.ErrorMessage>{errors.billingAddress[index].country.message}</S.ErrorMessage>
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
                            error={!!errors.shippingAddress?.[index]?.street}
                          />
                          {errors.shippingAddress?.[index]?.street && (
                            <S.ErrorMessage>{errors.shippingAddress[index].street.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingZipCode${index}`}>ZIP Code</S.Label>
                          <S.Input
                            id={`shippingZipCode${index}`}
                            {...register(`shippingAddress.${index}.zipCode`, {
                              required: "ZIP code is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.zipCode}
                          />
                          {errors.shippingAddress?.[index]?.zipCode && (
                            <S.ErrorMessage>{errors.shippingAddress[index].zipCode.message}</S.ErrorMessage>
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
                            error={!!errors.shippingAddress?.[index]?.city}
                          />
                          {errors.shippingAddress?.[index]?.city && (
                            <S.ErrorMessage>{errors.shippingAddress[index].city.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingState${index}`}>State</S.Label>
                          <S.Input
                            id={`shippingState${index}`}
                            {...register(`shippingAddress.${index}.state`, {
                              required: "State is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.state}
                          />
                          {errors.shippingAddress?.[index]?.state && (
                            <S.ErrorMessage>{errors.shippingAddress[index].state.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingCounty${index}`}>County</S.Label>
                          <S.Input
                            id={`shippingCounty${index}`}
                            {...register(`shippingAddress.${index}.county` as `shippingAddress.${number}.county`, {
                              required: "County is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.county}
                          />
                          {errors.shippingAddress?.[index]?.county && (
                            <S.ErrorMessage>{errors.shippingAddress[index].county.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingCountry${index}`}>Country</S.Label>
                          <S.Input
                            id={`shippingCountry${index}`}
                            {...register(`shippingAddress.${index}.country` as `shippingAddress.${number}.country`, {
                              required: "Country is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.country}
                          />
                          {errors.shippingAddress?.[index]?.country && (
                            <S.ErrorMessage>{errors.shippingAddress[index].country.message}</S.ErrorMessage>
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
                  <S.Label htmlFor="apFirstName">Billing Contact First Name</S.Label>
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
                  <S.Label htmlFor="apLastName">Billing Contact Last Name</S.Label>
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
                  <S.Label htmlFor="apEmail">Billing Contact E-mail</S.Label>
                  <S.Input
                    id="apEmail"
                    type="email"
                    placeholder="example@hotmail.com"
                    {...register("apContact.email", {
                      required: "Email is required",
      pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Please enter a valid email address.",
                },
                    })}
                    error={!!errors.apContact?.email}
                  />
                  {errors.apContact?.email && <S.ErrorMessage>{errors.apContact.email.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="apCountryCode">Billing Contact Country Code</S.Label>
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
                  <S.Label htmlFor="apContactNumber">Billing Contact Number:</S.Label>
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
    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Please enter a valid email address.",
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
                {isUploading ? "Updating..." : "Submit Changes"}
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
            <S.ModalMessage>Your form has been updated successfully and sent for review!</S.ModalMessage>
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