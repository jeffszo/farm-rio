// page.tsx
"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as S from "../../customer/styles";
import type { IFormInputs } from "../../../types/form";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  CircleCheck,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { api } from "../../../lib/supabase/index";

// Opções para os selects (adicione/ajuste conforme suas telas de validação)
const termsOptions = [
  { value: "", label: "Select terms" },
  { value: "100% Prior to Ship", label: "100% Prior to Ship" },
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
];

const currencyOptions = [
  { value: "", label: "Select currency" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

export default function OnboardingForm() {
  const [file, setFile] = useState<File | null>(null); // Para Resale Certificate
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Para Multiple Images
  const [financialStatementsFile, setFinancialStatementsFile] =
    useState<File | null>(null); // ESTADO PARA O ARQUIVO FINANCIAL STATEMENTS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [shippingAddress, setshippingAddress] = useState<number[]>([0]);
  const [isSameAsBilling, setIsSameAsBilling] = useState(false); // Novo estado para "Same as Billing"
  const [billingAddress, setbillingAddress] = useState<number[]>([0]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [user, setUser] = useState<{ id: string; userType?: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  // Adicione esta linha para declarar e gerenciar o estado de validação do passo 4
  const [stepFourAttemptedValidation, setStepFourAttemptedValidation] =
    useState(false);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    clearErrors, // Importe clearErrors
    setError, // Importe setError
  } = useForm<IFormInputs>({
    mode: "onChange",
    defaultValues: {
      billingAddress: [{} as any],
      shippingAddress: [{} as any],
      // Definir valor padrão para os selects para evitar erro de componente não controlado
      buyerInfo: {
        terms: "", // Valor vazio para a opção "Select terms"
        currency: "", // Valor vazio para a opção "Select currency"
        // ... outros campos de buyerInfo
      } as any, // Adicione 'as any' temporariamente se IFormInputs ainda não refletir os defaults
    },
  });

  const handleFinancialStatementsFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("buyerInfo.financialStatements", {
          type: "manual",
          message: "Financial Statements devem ser um arquivo PDF.",
        });
        setFinancialStatementsFile(null); // Limpa o arquivo inválido
        console.log("Arquivo de Financial Statements inválido: não é PDF.");
        return;
      }
      setFinancialStatementsFile(selectedFile);
      // Limpa o erro se um arquivo for selecionado e for PDF válido
      clearErrors("buyerInfo.financialStatements");
      console.log(
        "Arquivo de Financial Statements selecionado:",
        selectedFile.name
      );
    } else {
      setFinancialStatementsFile(null);
      clearErrors("buyerInfo.financialStatements"); // Limpa o erro se nenhum arquivo for selecionado
      console.log("Nenhum arquivo de Financial Statements selecionado.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Please upload a PDF file.");
        setFile(null); // Limpa o arquivo inválido
        console.log("Arquivo de Resale Certificate inválido: não é PDF.");
        return;
      }
      setFile(selectedFile);
      console.log(
        "Arquivo de Resale Certificate selecionado:",
        selectedFile.name
      );
    } else {
      setFile(null);
      console.log("Nenhum arquivo de Resale Certificate selecionado.");
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // É importante usar event.target.files aqui, pois event.files não existe.
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
      console.log(
        "Imagens selecionadas:",
        files.map((f) => f.name)
      );
    } else {
      console.log("Nenhuma imagem selecionada.");
    }
  };

  const onSubmit = async (formData: IFormInputs) => {
  console.log("Submit button clicked. Starting onSubmit function.");
  try {
    setApiError(null);
    setIsUploading(true);
    console.log("isUploading set to true.");

    const currentUser = user || (await api.getCurrentUser());
    if (!currentUser || !currentUser.id) {
      console.error("User not authenticated. Redirecting to login.");
      setApiError(
        "Your session has expired or you are not logged in. Please log in again.."
      );
      router.push("/");
      setIsUploading(false);
      return;
    }
    console.log("Current user ID:", currentUser.id);

    console.log("Dados recebidos no formulário (formData):", formData);

    const termsSelected = formData.buyerInfo?.terms;

    // ... (your existing validation and file upload logic) ...

    let fileUrl: string | null = null;
    if (file) {
      try {
        console.log("Attempting to upload resale certificate.");
        fileUrl = await api.uploadResaleCertificate(file, currentUser.id);
        console.log(
          "Arquivo de certificado de revenda enviado com sucesso:",
          fileUrl
        );
      } catch (error) {
        console.error(
          "Erro ao enviar o arquivo de certificado de revenda:",
          error
        );
        setApiError(
          error instanceof Error
            ? error.message
            : "Erro ao enviar o arquivo. Tente novamente."
        );
        setIsUploading(false);
        return;
      }
    } else {
      console.log("No resale certificate file to upload.");
    }

    const photoUrls: string[] = [];
    if (imageFiles.length > 0) {
      console.log("Attempting to upload image files.");
      for (const imageFile of imageFiles) {
        try {
          const imageUrl = await api.uploadImage(imageFile, currentUser.id);
          photoUrls.push(imageUrl);
          console.log(`Image ${imageFile.name} uploaded successfully.`);
        } catch (error) {
          console.error(`Erro ao enviar a imagem ${imageFile.name}:`, error);
          setApiError(
            error instanceof Error
              ? error.message
              : "Erro ao enviar imagens. Tente novamente."
          );
          setIsUploading(false);
          return;
        }
      }
    } else {
      console.log("No image files to upload.");
    }

    let financialStatementsFileUrl: string | null = null;
    if (financialStatementsFile) {
      try {
        console.log("Attempting to upload financial statements.");
        financialStatementsFileUrl = await api.uploadFinancialStatements(
          financialStatementsFile,
          currentUser.id
        );
        console.log(
          "Arquivo de Financial Statements enviado com sucesso:",
          financialStatementsFileUrl
        );
      } catch (error) {
        console.error("Erro ao enviar Financial Statements:", error);
        setApiError(
          error instanceof Error
            ? error.message
            : "Erro ao enviar Financial Statements. Tente novamente."
        );
        setIsUploading(false);
        return;
      }
    } else {
      console.log("No financial statements file to upload or not required.");
    }

    const termsValue =
      formData.buyerInfo?.terms === "" ? null : formData.buyerInfo?.terms;
    const currencyValue =
      formData.buyerInfo?.currency === ""
        ? null
        : formData.buyerInfo?.currency;

    const payload = {
      user_id: currentUser.id,
      customer_name: formData.customerInfo?.legalName || null,
      sales_tax_id: formData.customerInfo?.taxId || null,
      duns_number: formData.customerInfo?.dunNumber || null,
      dba_number: formData.customerInfo?.dba || null,
      resale_certificate: fileUrl,
      billing_address: formData.billingAddress || [],
      shipping_address: formData.shippingAddress || [],
      ap_contact_name:
        `${formData.apContact?.firstName || ""} ${formData.apContact?.lastName || ""}`.trim(),
      ap_contact_email: formData.apContact?.email || null,
      ap_contact_country_code: formData.apContact?.countryCode || null,
      ap_contact_number: formData.apContact?.contactNumber || null,
      buyer_name:
        `${formData.buyerInfo?.firstName || ""} ${formData.buyerInfo?.lastName || ""}`.trim(),
      buyer_email: formData.buyerInfo?.email || null,
      buyer_country_code: formData.buyerInfo?.countryCode || null,
      buyer_number: formData.buyerInfo?.buyerNumber || null,
      status: "pending",
      photo_urls: photoUrls,
      branding_mix: formData.brandingMix
        ? formData.brandingMix.split(",").map((s) => s.trim())
        : null,
      instagram: formData.instagram || null,
      website: formData.website || null,
      terms: termsValue,
      currency: currencyValue,
      estimated_purchase_amount:
        formData.buyerInfo?.estimatedPurchaseAmount || null,
      financial_statements: financialStatementsFileUrl,
    };

    console.log("Payload sendo enviado para submitForm:", payload);

    await api.submitForm(payload, currentUser.id);
    console.log("Form submitted successfully via API.");

    // --- NEW: Send email after successful form submission ---
    try {
      const emailResponse = await fetch("/api/send-form-submission-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: "your-internal-email@example.com", // Or an email from formData (e.g., buyerInfo.email)
          recipientName: "Admin Team", // Or the user's name from formData (e.g., buyerInfo.firstName)
          formData: payload, // Send the full payload or a subset of it
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error("Failed to send form submission email:", errorData);
        // Optionally, set an API error for email sending, but don't prevent form submission success
      } else {
        console.log("Form submission email sent successfully.");
      }
    } catch (emailError) {
      console.error("Error sending form submission email:", emailError);
      // Handle email sending error, but again, don't necessarily fail the form submission itself
    }
    // --- END NEW ---

    setIsModalOpen(true);
    console.log("Modal set to open.");
  } catch (error: unknown) {
    console.error(
      "Erro GERAL ao enviar o formulário:",
      error instanceof Error ? error.message : String(error)
    );
    setApiError(
      error instanceof Error
        ? error.message
        : "Erro ao enviar o formulário. Tente novamente."
    );
  } finally {
    setIsUploading(false);
    console.log("isUploading set to false. End of onSubmit function.");
  }
};

  const nextStep = async () => {
    let fieldsToValidate: (keyof IFormInputs | string)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = [
        "customerInfo.legalName",
        "customerInfo.taxId",
        "customerInfo.dunNumber",
        "brandingMix",
        "instagram",
        "website",
      ];
    } else if (currentStep === 2) {
      billingAddress.forEach((index) => {
        fieldsToValidate.push(
          `billingAddress.${index}.street`,
          `billingAddress.${index}.zipCode`,
          `billingAddress.${index}.city`,
          `billingAddress.${index}.state`,
          `billingAddress.${index}.county`,
          `billingAddress.${index}.country`
        );
      });

      shippingAddress.forEach((index) => {
        fieldsToValidate.push(
          `shippingAddress.${index}.street`,
          `shippingAddress.${index}.zipCode`,
          `shippingAddress.${index}.city`,
          `shippingAddress.${index}.state`,
          `shippingAddress.${index}.county`,
          `shippingAddress.${index}.country`
        );
      });
    } else if (currentStep === 3) {
      fieldsToValidate = [
        "apContact.firstName",
        "apContact.lastName",
        "apContact.email",
        "apContact.countryCode",
        "apContact.contactNumber",
      ];
    } else if (currentStep === 4) {
      fieldsToValidate = [
        "buyerInfo.firstName",
        "buyerInfo.lastName",
        "buyerInfo.email",
        "buyerInfo.countryCode",
        "buyerInfo.buyerNumber",
        "buyerInfo.terms",
        "buyerInfo.currency",
        "buyerInfo.estimatedPurchaseAmount",
      ];
      setStepFourAttemptedValidation(true);

      const termsSelected = getValues("buyerInfo.terms");
      // Validação de Financial Statements no nextStep
      if (termsSelected && termsSelected !== "" && !financialStatementsFile) {
        setError("buyerInfo.financialStatements", {
          type: "required",
          message:
            "Declarações Financeiras são obrigatórias se os Termos forem selecionados.",
        });
        console.log(
          "Erro de validação (nextStep): Financial Statements são obrigatórias."
        );
      } else if (
        financialStatementsFile &&
        financialStatementsFile.type !== "application/pdf"
      ) {
        setError("buyerInfo.financialStatements", {
          type: "manual",
          message: "Financial Statements devem ser um arquivo PDF.",
        });
        console.log(
          "Erro de validação (nextStep): Financial Statements deve ser PDF."
        );
      } else {
        clearErrors("buyerInfo.financialStatements");
      }
    }

    // @ts-expect-error
    const isValid = await trigger(fieldsToValidate);

    // Se houver erros específicos no passo 4 (financialStatementsFile), impede o avanço
    if (currentStep === 4) {
      if (errors.buyerInfo?.financialStatements || !isValid) {
        // Adicionado !isValid para garantir que todos os campos validados sejam checados
        console.log(
          "Validação do passo 4 falhou devido a Financial Statements ou outros campos."
        );
        return;
      }
    }

    if (!isValid) {
      console.log("Form validation failed for current step:", errors);
      return;
    }
    console.log("Form validation successful for current step.");
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const addShippingAddress = () => {
    setshippingAddress((prev) => [...prev, prev.length]);
  };

  const removeShippingAddress = (indexToRemove: number) => {
    if (shippingAddress.length <= 1) return;
    setshippingAddress((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setValue(`shippingAddress.${indexToRemove}`, {} as any);
  };

  const removeBillingAddress = (indexToRemove: number) => {
    if (billingAddress.length <= 1) return;
    setbillingAddress((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setValue(`billingAddress.${indexToRemove}`, {} as any);
  };

  const handleSameAsBilling = () => {
    const currentBillingAddress = getValues("billingAddress.0");
    if (currentBillingAddress) {
      setValue("shippingAddress.0.street", currentBillingAddress.street || "");
      setValue(
        "shippingAddress.0.zipCode",
        currentBillingAddress.zipCode || ""
      );
      setValue("shippingAddress.0.city", currentBillingAddress.city || "");
      setValue("shippingAddress.0.state", currentBillingAddress.state || "");
      setValue("shippingAddress.0.county", currentBillingAddress.county || "");
      setValue(
        "shippingAddress.0.country",
        currentBillingAddress.country || ""
      );
      clearErrors("shippingAddress.0.street");
      clearErrors("shippingAddress.0.zipCode");
      clearErrors("shippingAddress.0.city");
      clearErrors("shippingAddress.0.state");
      clearErrors("shippingAddress.0.county");
      clearErrors("shippingAddress.0.country");
      console.log(
        "Endereço de entrega preenchido com base no endereço de cobrança."
      );
    } else {
      console.warn("Endereço de cobrança não encontrado para copiar.");
    }
    setIsSameAsBilling(true);
  };

  useEffect(() => {
    // Este useEffect estava vazio, pode ser usado para algo como carregar dados iniciais do usuário
    // ou resetar estados. Mantido aqui se houver um propósito futuro.
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <S.ContainerMain>
      <S.FormContainer>
        <S.FormHeader>
          <S.FormTitle>Customer Onboarding</S.FormTitle>
          <S.FormSubtitle>
            Please fill out the form to create your account.
          </S.FormSubtitle>
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
                    <S.ErrorMessage>
                      {errors.customerInfo.legalName.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>

                <S.InputGroup>
                  <S.Label htmlFor="dba">DBA (if applicable)</S.Label>
                  <S.Input
                    placeholder="Trade name"
                    type="string"
                    id="dba"
                    {...register("customerInfo.dba")}
                  />
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
                  {errors.customerInfo?.taxId && (
                    <S.ErrorMessage>
                      {errors.customerInfo.taxId.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>

                <S.InputGroup>
                  <S.Label htmlFor="dunNumber">D-U-N-S</S.Label>
                  <S.Input
                    id="dunNumber"
                    type="number"
                    {...register("customerInfo.dunNumber", {
                      required: "DUNS is required",
                      valueAsNumber: true, // Garante que seja um número
                    })}
                    error={!!errors.customerInfo?.dunNumber}
                  />
                  {errors.customerInfo?.dunNumber && (
                    <S.ErrorMessage>
                      {errors.customerInfo.dunNumber.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>

                <S.InputGroup>
                  <S.Label htmlFor="instagram">Instagram</S.Label>
                  <S.Input
                    id="instagram"
                    type="url"
                    placeholder="https://instagram.com/yourprofile"
                    {...register("instagram" as any, {
                      pattern: {
                        value:
                          /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
                        message: "Please enter a valid Instagram URL.",
                      },
                    })}
                    error={!!(errors as any).instagram}
                  />
                  {(errors as any).instagram && (
                    <S.ErrorMessage>
                      {(errors as any).instagram.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>

                <S.InputGroup>
                  <S.Label htmlFor="website">Website</S.Label>
                  <S.Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    {...register("website" as any, {
                      pattern: {
                        value:
                          /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d{1,5})?(\/\S*)?$/,
                        message: "Please enter a valid Website URL.",
                      },
                    })}
                    error={!!(errors as any).website}
                  />
                  {(errors as any).website && (
                    <S.ErrorMessage>
                      {(errors as any).website.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>

                <S.FileInputContainer>
                  <S.Label htmlFor="file-upload">Resale Certificate</S.Label>
                  <S.HiddenInput
                    id="file-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                  <S.UploadButton htmlFor="file-upload">
                    <Upload size={16} />
                    {file ? file.name : "Attach file (PDF)"}
                  </S.UploadButton>
                  {errors.customerInfo?.resaleCertificate && (
                    <S.ErrorMessage>
                      {errors.customerInfo.resaleCertificate.message}
                    </S.ErrorMessage>
                  )}
                </S.FileInputContainer>
                <S.FileInputContainer>
                        <S.Label htmlFor="image-upload">Upload POS Photos</S.Label>
                        <S.HiddenInput
                          id="image-upload"
                          type="file"  // Remova o espaço extra aqui
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                        />
                  <S.UploadButton htmlFor="image-upload">
                    <Upload size={16} />
                    {imageFiles.length > 0
                      ? `${imageFiles.length} file(s) selected`
                      : "Attach image files"}
                  </S.UploadButton>
                  {imageFiles.length > 0 && (
                    <S.FilePreviewContainer>
                      {imageFiles.map((img, idx) => (
                        <S.FilePreview key={idx}>{img.name}</S.FilePreview>
                      ))}
                    </S.FilePreviewContainer>
                  )}
                </S.FileInputContainer>

                <S.InputGroup >
                  <div style={{
                      display: "flex",
                      alignItems:"center",
                      marginBottom: "0.5rem",
                    }}>
                  <S.Label style={{marginBottom: 0}} htmlFor="brandingMix">Branding Mix</S.Label>
                  <S.InfoButton
                   type="button"
                    title="list all the brands you work with (separate the brands by comma"
                    style={{
                      display: "flex",
                      // alignItems:"center",
                      // justifyContent: "center",
                      
                    }}
                   
                  >
                    <Info size={16} />
                  </S.InfoButton>
                  </div>
                  <S.Input
                    style={{
                      width:"560px",
                      height: "200px"
                     
                    }}
                    id="brandingMix"
                    {...register("brandingMix" as any, {
                      required: "Brand/Branding Mix is required",
                    })}
                    error={!!(errors as any).brandingMix}
                  />
                  {(errors as any).brandingMix && (
                    <S.ErrorMessage>
                      {(errors as any).brandingMix.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>
              </S.Grid>
            </S.Section>
          )}

          {currentStep === 2 && (
            <S.CompactSection>
              <S.SectionTitle>Shipping and Billing Information</S.SectionTitle>
              <S.ResponsiveGrid>
                <S.AddressSection>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <S.AddressTitle>Billing Address</S.AddressTitle>
                  </div>

                  {billingAddress.map((index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom:
                          index < billingAddress.length - 1 ? "1.5rem" : "0",
                        paddingBottom:
                          index < billingAddress.length - 1 ? "1.5rem" : "0",
                        borderBottom:
                          index < billingAddress.length - 1
                            ? "1px dashed #eee"
                            : "none",
                      }}
                    >
                      <S.AddressHeader>
                        {index > 0 && (
                          <div
                            style={{ fontSize: "0.875rem", color: "#71717a" }}
                          >
                            Billing Address {index + 1}
                          </div>
                        )}
                        {index > 0 && (
                          <S.RemoveButton
                            type="button"
                            onClick={() => removeBillingAddress(index)}
                          >
                            <Trash2 size={16} />
                          </S.RemoveButton>
                        )}
                      </S.AddressHeader>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.street`}>
                            Street and Number
                          </S.Label>
                          <S.Input
                            id={`billingAddress.${index}.street`}
                            {...register(`billingAddress.${index}.street`, {
                              required: "Street is required",
                            })}
                            error={!!errors.billingAddress?.[index]?.street}
                          />
                          {errors.billingAddress?.[index]?.street && (
                            <S.ErrorMessage>
                              {errors.billingAddress[index].street.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.zipCode`}>
                            ZIP Code
                          </S.Label>
                          <S.Input
                            id={`billingAddress.${index}.zipCode`}
                            {...register(`billingAddress.${index}.zipCode`, {
                              required: "ZIP code is required",
                            })}
                            error={!!errors.billingAddress?.[index]?.zipCode}
                          />
                          {errors.billingAddress?.[index]?.zipCode && (
                            <S.ErrorMessage>
                              {errors.billingAddress[index].zipCode.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.city`}>
                            City
                          </S.Label>
                          <S.Input
                            id={`billingAddress.${index}.city`}
                            {...register(`billingAddress.${index}.city`, {
                              required: "City is required",
                            })}
                            error={!!errors.billingAddress?.[index]?.city}
                          />
                          {errors.billingAddress?.[index]?.city && (
                            <S.ErrorMessage>
                              {errors.billingAddress[index].city.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.state`}>
                            State
                          </S.Label>
                          <S.Input
                            id={`billingAddress.${index}.state`}
                            {...register(`billingAddress.${index}.state`, {
                              required: "State is required",
                            })}
                            error={!!errors.billingAddress?.[index]?.state}
                          />
                          {errors.billingAddress?.[index]?.state && (
                            <S.ErrorMessage>
                              {errors.billingAddress[index].state.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.county`}>
                            County
                          </S.Label>
                          <S.Input
                            id={`billingAddress.${index}.county`}
                            {...register(`billingAddress.${index}.county`, {
                              required: "County is required",
                            })}
                            error={!!errors.billingAddress?.[index]?.county}
                          />
                          {errors.billingAddress?.[index]?.county && (
                            <S.ErrorMessage>
                              {errors.billingAddress[index].county.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.country`}>
                            Country
                          </S.Label>
                          <S.Input
                            id={`billingAddress.${index}.country`}
                            {...register(`billingAddress.${index}.country`, {
                              required: "Country is required",
                            })}
                            error={!!errors.billingAddress?.[index]?.country}
                          />
                          {errors.billingAddress?.[index]?.country && (
                            <S.ErrorMessage>
                              {errors.billingAddress[index].country.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                    </div>
                  ))}
                </S.AddressSection>

                <S.AddressSection>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <S.AddressTitle>Shipping Address</S.AddressTitle>
                    <S.Button type="button" onClick={handleSameAsBilling}>
                      Same as Billing Address
                    </S.Button>
                  </div>

                  {shippingAddress.map((index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom:
                          index < shippingAddress.length - 1 ? "1.5rem" : "0",
                        paddingBottom:
                          index < shippingAddress.length - 1 ? "1.5rem" : "0",
                        borderBottom:
                          index < shippingAddress.length - 1
                            ? "1px dashed #eee"
                            : "none",
                      }}
                    >
                      <S.AddressHeader>
                        {index > 0 && (
                          <div
                            style={{ fontSize: "0.875rem", color: "#71717a" }}
                          >
                            Shipping Address {index + 1}
                          </div>
                        )}
                        {index > 0 && (
                          <S.RemoveButton
                            type="button"
                            onClick={() => removeShippingAddress(index)}
                          >
                            <Trash2 size={16} />
                          </S.RemoveButton>
                        )}
                      </S.AddressHeader>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.street`}>
                            Street and Number
                          </S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.street`}
                            {...register(`shippingAddress.${index}.street`, {
                              required: "Street is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.street}
                          />
                          {errors.shippingAddress?.[index]?.street && (
                            <S.ErrorMessage>
                              {errors.shippingAddress[index].street.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.zipCode`}>
                            ZIP Code
                          </S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.zipCode`}
                            {...register(`shippingAddress.${index}.zipCode`, {
                              required: "ZIP code is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.zipCode}
                          />
                          {errors.shippingAddress?.[index]?.zipCode && (
                            <S.ErrorMessage>
                              {errors.shippingAddress[index].zipCode.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.city`}>
                            City
                          </S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.city`}
                            {...register(`shippingAddress.${index}.city`, {
                              required: "City is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.city}
                          />
                          {errors.shippingAddress?.[index]?.city && (
                            <S.ErrorMessage>
                              {errors.shippingAddress[index].city.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.state`}>
                            State
                          </S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.state`}
                            {...register(`shippingAddress.${index}.state`, {
                              required: "State is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.state}
                          />
                          {errors.shippingAddress?.[index]?.state && (
                            <S.ErrorMessage>
                              {errors.shippingAddress[index].state.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.county`}>
                            County
                          </S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.county`}
                            {...register(`shippingAddress.${index}.county`, {
                              required: "County is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.county}
                          />
                          {errors.shippingAddress?.[index]?.county && (
                            <S.ErrorMessage>
                              {errors.shippingAddress[index].county.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.country`}>
                            Country
                          </S.Label>
                          <S.Input
                            id={`shippingAddress.${index}.country`}
                            {...register(`shippingAddress.${index}.country`, {
                              required: "Country is required",
                            })}
                            error={!!errors.shippingAddress?.[index]?.country}
                          />
                          {errors.shippingAddress?.[index]?.country && (
                            <S.ErrorMessage>
                              {errors.shippingAddress[index].country.message}
                            </S.ErrorMessage>
                          )}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                    </div>
                  ))}

                  <S.AddAddressButton
                    type="button"
                    onClick={addShippingAddress}
                  >
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
                  <S.Label htmlFor="apFirstName">First name</S.Label>
                  <S.Input
                    id="apFirstName"
                    {...register("apContact.firstName", {
                      required: "First name is required",
                    })}
                    error={!!errors.apContact?.firstName}
                  />
                  {errors.apContact?.firstName && (
                    <S.ErrorMessage>
                      {errors.apContact.firstName.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="apLastName">Last name</S.Label>
                  <S.Input
                    id="apLastName"
                    {...register("apContact.lastName", {
                      required: "Last name is required",
                    })}
                    error={!!errors.apContact?.lastName}
                  />
                  {errors.apContact?.lastName && (
                    <S.ErrorMessage>
                      {errors.apContact.lastName.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="apEmail">E-mail</S.Label>
                  <S.Input
                    id="apEmail"
                    type="email"
                    placeholder="example@hotmail.com"
                    {...register("apContact.email", {
                      required: "Email is required",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Please enter a valid email address.",
                      },
                    })}
                    error={!!errors.apContact?.email}
                  />
                  {errors.apContact?.email && (
                    <S.ErrorMessage>
                      {errors.apContact.email.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.PhoneInputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="apCountryCode">Country Code</S.Label>
                    <S.Input
                      id="apCountryCode"
                      type="number"
                      min={0}
                      {...register("apContact.countryCode", {
                        required: "Code is required",
                        valueAsNumber: true,
                      })}
                      error={!!errors.apContact?.countryCode}
                    />
                    {errors.apContact?.countryCode && (
                      <S.ErrorMessage>
                        {errors.apContact.countryCode.message}
                      </S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="apContactNumber">Phone:</S.Label>
                    <S.Input
                      id="apContactNumber"
                      type="number"
                      min={0}
                      {...register("apContact.contactNumber", {
                        required: "Contact number is required",
                        valueAsNumber: true,
                      })}
                      error={!!errors.apContact?.contactNumber}
                    />
                    {errors.apContact?.contactNumber && (
                      <S.ErrorMessage>
                        {errors.apContact.contactNumber.message}
                      </S.ErrorMessage>
                    )}
                  </S.InputGroup>
                </S.PhoneInputGroup>
              </S.Grid>
            </S.Section>
          )}

          {currentStep === 4 && (
            <S.Section>
              <S.SectionTitleBuyer>Buyer Information</S.SectionTitleBuyer>

              <S.Grid>
                <S.InputGroup>
                  <S.Label htmlFor="buyerFirstName">First name:</S.Label>
                  <S.Input
                    id="buyerFirstName"
                    {...register("buyerInfo.firstName", {
                      required: "First name is required",
                    })}
                    error={!!errors.buyerInfo?.firstName}
                  />
                  {errors.buyerInfo?.firstName && (
                    <S.ErrorMessage>
                      {errors.buyerInfo.firstName.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="buyerLastName">Last name:</S.Label>
                  <S.Input
                    id="buyerLastName"
                    {...register("buyerInfo.lastName", {
                      required: "Last name is required",
                    })}
                    error={!!errors.buyerInfo?.lastName}
                  />
                  {errors.buyerInfo?.lastName && (
                    <S.ErrorMessage>
                      {errors.buyerInfo.lastName.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="buyerEmail">E-mail:</S.Label>
                  <S.Input
                    id="buyerEmail"
                    type="email"
                    placeholder="example@hotmail.com"
                    {...register("buyerInfo.email", {
                      required: "Email is required",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Please enter a valid email address.",
                      },
                    })}
                    error={!!errors.buyerInfo?.email}
                  />
                  {errors.buyerInfo?.email && (
                    <S.ErrorMessage>
                      {errors.buyerInfo.email.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>

                <S.PhoneInputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="buyerCountryCode">Country Code:</S.Label>
                    <S.Input
                      id="buyerCountryCode"
                      type="number"
                      min={0}
                      {...register("buyerInfo.countryCode", {
                        required: "Code is required",
                        valueAsNumber: true,
                      })}
                      error={!!errors.buyerInfo?.countryCode}
                    />
                    {errors.buyerInfo?.countryCode && (
                      <S.ErrorMessage>
                        {errors.buyerInfo.countryCode.message}
                      </S.ErrorMessage>
                    )}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="buyerNumber">Phone:</S.Label>
                    <S.Input
                      type="number"
                      id="buyerNumber"
                      min={0}
                      {...register("buyerInfo.buyerNumber", {
                        required: "Phone number is required",
                        valueAsNumber: true,
                      })}
                      error={!!errors.buyerInfo?.buyerNumber}
                    />
                    {errors.buyerInfo?.buyerNumber && (
                      <S.ErrorMessage>
                        {errors.buyerInfo.buyerNumber.message}
                      </S.ErrorMessage>
                    )}
                  </S.InputGroup>
                </S.PhoneInputGroup>

                <S.InputGroup>
                  <S.Label htmlFor="terms">Terms</S.Label>
                  <S.Input
                    style={{ width: "250px" }}
                    as="select"
                    id="terms"
                    {...register("buyerInfo.terms", {
                      required: "Terms are required",
                      validate: (value) =>
                        value !== "" || "Please select terms",
                    })}
                    error={!!errors.buyerInfo?.terms}
                  >
                    {termsOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </S.Input>
                  {errors.buyerInfo?.terms && (
                    <S.ErrorMessage>
                      {errors.buyerInfo.terms.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>

                <S.InputGroup>
                  <S.Label htmlFor="currency">Currency</S.Label>
                  <S.Input
                    style={{ width: "250px" }}
                    as="select"
                    id="currency"
                    {...register("buyerInfo.currency", {
                      required: "Currency is required",
                      validate: (value) =>
                        value !== "" || "Please select a currency",
                    })}
                    error={!!errors.buyerInfo?.currency}
                  >
                    {currencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </S.Input>
                  {errors.buyerInfo?.currency && (
                    <S.ErrorMessage>
                      {errors.buyerInfo.currency.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>

                <S.InputGroup>
                  <S.Label htmlFor="estimatedPurchaseAmount">
                    Estimated Purchase Amount
                  </S.Label>
                  <S.Input
                    id="estimatedPurchaseAmount"
                    type="number"
                    min={0}
                    step="0.01"
                    {...register("buyerInfo.estimatedPurchaseAmount", {
                      required: "Estimated purchase amount is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Amount must be positive" },
                    })}
                    error={!!errors.buyerInfo?.estimatedPurchaseAmount}
                  />
                  {errors.buyerInfo?.estimatedPurchaseAmount && (
                    <S.ErrorMessage>
                      {errors.buyerInfo.estimatedPurchaseAmount.message}
                    </S.ErrorMessage>
                  )}
                </S.InputGroup>

                <S.FileInputContainer>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      
                    }}
                  >
                    <S.Label  htmlFor="financialStatements-upload">
                      Financial Statements
                    </S.Label>
                    <S.InfoButton
                      type="button"
                      title="Most disclosed tax period"
                    >
                      <Info size={16} style={{marginBottom: "0.5rem"}} />
                    </S.InfoButton>
                  </div>
                  <S.HiddenInput
                  
                    id="financialStatements-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFinancialStatementsFileChange}
                  />
                  <S.UploadButton htmlFor="financialStatements-upload">
                    <Upload size={16} />
                    {financialStatementsFile
                      ? financialStatementsFile.name
                      : "Attach file (PDF)"}
                  </S.UploadButton>
                  {/* A mensagem de erro só aparece se houve tentativa de validação do passo 4 E houver erro */}
                  {errors.buyerInfo?.financialStatements &&
                    stepFourAttemptedValidation && (
                      <S.ErrorMessage>
                        {errors.buyerInfo.financialStatements.message}
                      </S.ErrorMessage>
                    )}
                </S.FileInputContainer>
              </S.Grid>

              <S.AlertMessage>
                ALL ACCOUNTS START WITH 100% PRIOR TO SHIPMENT PAYMENTS <br />
                You may request alternative payment terms, which will be subject to FARM Rio discretionary approval
              </S.AlertMessage>
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
            <S.ModalMessage>
              Your form has been submitted successfully!
            </S.ModalMessage>
            <S.ModalButton
              onClick={() => {
                setIsModalOpen(false);
                router.push("/");
              }}
            >
              OK
            </S.ModalButton>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.ContainerMain>
  );
}
