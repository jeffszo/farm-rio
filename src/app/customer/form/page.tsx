"use client"
import React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import * as S from "../../customer/styles" // Verifique se este caminho está correto para seus estilos
import type { IFormInputs } from "../../../types/form" // Verifique se este caminho está correto para seus tipos
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronLeft, Upload, CircleCheck, Plus, Trash2 } from "lucide-react"
import { api } from "../../../lib/supabase/index" // Verifique se este caminho está correto para sua API Supabase

// Não precisamos de FormStatusData aqui, pois é um formulário de onboarding
// interface FormStatusData {
//   status: string
//   csc_feedback: string
// }

export default function OnboardingForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  // `shippingAddress` e `billingAddress` são usados para controlar o número de campos dinâmicos no JSX.
  // Eles devem iniciar com um elemento para o primeiro endereço.
  const [shippingAddress, setshippingAddress] = useState<number[]>([0])
  const [billingAddress, setbillingAddress] = useState<number[]>([0])
  // feedback, formStatus, user, isLoading não são necessários para um onboarding simples,
  // mas estou mantendo se você tiver outra lógica atrelada a eles.
  // const [feedback, setFeedback] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  // const [formStatus, setFormStatus] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; userType?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Considerar se é realmente necessário aqui
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    trigger,// getValues é útil se você precisar acessar os valores antes do submit completo
  } = useForm<IFormInputs>({
    mode: "onChange",
    // Adicione defaultValues para inicializar arrays vazios, evitando 'undefined' se nada for preenchido
    defaultValues: {
      billingAddress: [{}],
      shippingAddress: [{}],
      // Outros campos se necessário
    },
  })

  // useEffect para carregar o usuário, se aplicável
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await api.getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }
    fetchUser()
  }, [])


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

      const currentUser = user || (await api.getCurrentUser()) // Garante que o user está disponível
      if (!currentUser || !currentUser.id) {
        console.error("Usuário não autenticado. Redirecionando para login.")
        setApiError("Sua sessão expirou ou você não está logado. Faça login novamente.")
        router.push("/login") // Redirecione para a página de login, se apropriado
        return
      }

      console.log("Dados recebidos no formulário:", formData)

      let fileUrl: string | null = null
      if (file) {
        try {
          // O id do usuário é usado como parte do caminho de armazenamento no Supabase
          fileUrl = await api.uploadResaleCertificate(file, currentUser.id)
          console.log("Arquivo enviado com sucesso:", fileUrl)
        } catch (error) {
          console.error("Erro ao enviar o arquivo:", error)
          setApiError(error instanceof Error ? error.message : "Erro ao enviar o arquivo. Tente novamente.")
          setIsUploading(false)
          return
        }
      }

      // Prepara o payload para o Supabase
      // As colunas JSONB (billing_address, shipping_address) receberão diretamente o array de objetos
      const payload = {
        user_id: currentUser.id, // Garante que o user_id está no payload
        customer_name: formData.customerInfo?.legalName || null,
        sales_tax_id: formData.customerInfo?.taxId || null,
        duns_number: formData.customerInfo?.dunNumber || null,
        dba_number: formData.customerInfo?.dba || null,
        resale_certificate: fileUrl,
        
        // AQUI ESTÁ A SOLUÇÃO: Passar o array de objetos diretamente
        // Certifique-se de que billingAddress e shippingAddress no IFormInputs
        // são definidos como `AddressInput[]` (ou similar)
        billing_address: formData.billingAddress || [],
        shipping_address: formData.shippingAddress || [],

        ap_contact_name: `${formData.apContact?.firstName || ""} ${formData.apContact?.lastName || ""}`.trim(),
        ap_contact_email: formData.apContact?.email || null,
        // É importante que buyer_name e ap_contact_name sejam strings ou null.
        // Se `buyerInfo.firstName` e `lastName` puderem ser nulos, `trim()` pode falhar.
        buyer_name: `${formData.buyerInfo?.firstName || ""} ${formData.buyerInfo?.lastName || ""}`.trim(),
        buyer_email: formData.buyerInfo?.email || null,
        // Status inicial para um novo formulário de onboarding
        status: "pending", 
      }

      console.log("Payload sendo enviado para submitForm:", payload)

      // A função submitForm deve estar preparada para receber o objeto payload e enviá-lo
      // diretamente para o Supabase (sem stringify adicional se o Supabase espera um objeto).
      await api.submitForm(payload, currentUser.id)
      setIsModalOpen(true)
    } catch (error: unknown) {
      console.error("Erro ao enviar o formulário:", error instanceof Error ? error.message : String(error))
      setApiError(error instanceof Error ? error.message : "Erro ao enviar o formulário. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: string[] = []

    if (currentStep === 1) {
      fieldsToValidate = ["customerInfo.legalName", "customerInfo.taxId", "customerInfo.dunNumber"]
      // Você pode adicionar validação para o arquivo aqui se `resale_certificate` for obrigatório
      // if (!file && !getValues('resale_certificate')) { /* ... error handling ... */ }
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
    } else if (currentStep === 4) { // Adicionado para garantir validação do último passo antes de submeter
        fieldsToValidate = [
            "buyerInfo.firstName",
            "buyerInfo.lastName",
            "buyerInfo.email",
            "buyerInfo.countryCode",
            "buyerInfo.buyerNumber",
        ];
    }

    // @ts-expect-error - Ignorando erro de tipo para fieldsToValidate dinâmicos
    const isValid = await trigger(fieldsToValidate)
    if (!isValid) return
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const addShippingAddress = () => {
    // Adiciona um novo índice ao array de estado para renderizar mais campos
    setshippingAddress((prev) => [...prev, prev.length])
  }

  const addBillingAddress = () => {
    // Adiciona um novo índice ao array de estado para renderizar mais campos
    setbillingAddress((prev) => [...prev, prev.length])
  }

  const removeShippingAddress = (indexToRemove: number) => {
    if (shippingAddress.length <= 1) return // Não permite remover o último endereço
    setshippingAddress((prev) => prev.filter((_, index) => index !== indexToRemove))
    // Opcional: Limpar os valores do react-hook-form para o índice removido
    // setValue(`shippingAddress.${indexToRemove}`, undefined);
  }

  const removeBillingAddress = (indexToRemove: number) => {
    if (billingAddress.length <= 1) return // Não permite remover o último endereço
    setbillingAddress((prev) => prev.filter((_, index) => index !== indexToRemove))
    // Opcional: Limpar os valores do react-hook-form para o índice removido
    // setValue(`billingAddress.${indexToRemove}`, undefined);
  }

  if (isLoading) {
    return <p>Loading...</p> // Ou seu componente de loading
  }

  return (
    <S.ContainerMain>
      <S.FormContainer>
        <S.FormHeader>
          <S.FormTitle>Customer Onboarding</S.FormTitle>
          <S.FormSubtitle>Please fill out the form to create your account.</S.FormSubtitle>
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
                    type="string"
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
                          <S.Label htmlFor={`billingAddress.${index}.street`}>Street and Number</S.Label>
                          <S.Input
                            id={`billingAddress.${index}.street`}
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
                          <S.Label htmlFor={`billingAddress.${index}.zipCode`}>ZIP Code</S.Label>
                          <S.Input
                            id={`billingAddress.${index}.zipCode`}
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
                          <S.Label htmlFor={`billingAddress.${index}.city`}>City</S.Label>
                          <S.Input
                            id={`billingAddress.${index}.city`}
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
                          <S.Label htmlFor={`billingAddress.${index}.state`}>State</S.Label>
                          <S.Input
                            id={`billingAddress.${index}.state`}
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
                          <S.Label htmlFor={`billingAddress.${index}.county`}>County</S.Label>
                          <S.Input
                            id={`billingAddress.${index}.county`}
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
                          <S.Label htmlFor={`billingAddress.${index}.country`}>Country</S.Label>
                          <S.Input
                            id={`billingAddress.${index}.country`}
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
                          <S.Label htmlFor={`shippingAddress.${index}.street`}>Street and Number</S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.street`}
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
                          <S.Label htmlFor={`shippingAddress.${index}.zipCode`}>ZIP Code</S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.zipCode`}
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
                          <S.Label htmlFor={`shippingAddress.${index}.city`}>City</S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.city`}
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
                          <S.Label htmlFor={`shippingAddress.${index}.state`}>State</S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.state`}
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
                          <S.Label htmlFor={`shippingAddress.${index}.county`}>County</S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.county`}
                            {...register(`shippingAddress.${index}.county`, {
                              required: "County is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.county}
                          />
                          {errors.shippingAddress?.[index]?.county && (
                            <S.ErrorMessage>{errors.shippingAddress[index].county.message}</S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.country`}>Country</S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.country`}
                            {...register(`shippingAddress.${index}.country`, {
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
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Please enter a valid email address.",
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
                {isUploading ? "Submitting..." : "Submit"}
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
            <S.ModalMessage>Your form has been submitted successfully!</S.ModalMessage>
            <S.ModalButton
              onClick={() => {
                setIsModalOpen(false)
                router.push("/") // Redirecione para a página inicial ou de sucesso
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