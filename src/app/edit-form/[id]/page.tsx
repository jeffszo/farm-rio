// src/app/customer/form/page.tsx
"use client"
import React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter, useParams } from "next/navigation"
import * as S from "../../customer/styles"
import type { IFormInputs } from "../../../types/form"
import { api } from "../../../lib/supabase/index"
import { ChevronRight, ChevronLeft, Upload, CircleCheck, Plus, Trash2, Info } from "lucide-react"

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

export default async function OnboardingForm() {
  const { id: userId } = useParams();
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
const customerId = typeof params?.id === "string" ? params.id : "";

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

    // 🔽 Usa diretamente o ID do usuário já carregado
    const userId = user?.id;

    console.log("Dados recebidos no formulário (formData):", formData);

    const termsSelected = formData.buyerInfo?.terms;

    if (
  termsSelected &&
  termsSelected !== "100% Prior to Ship" &&
  !financialStatementsFile
) {
  setError("buyerInfo.financialStatements", {
    type: "required",
    message:
      "Financial Statements são obrigatórias se os termos não forem 100% Prior to Ship.",
  });
  console.log(
    "Erro de validação (nextStep): Financial Statements obrigatórias para termos diferentes de 100%."
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



    let fileUrl: string | null = null;
    if (file) {
      try {
        fileUrl = await api.uploadResaleCertificate(file, userId);
      } catch (error) {
        setApiError("Erro ao enviar o Resale Certificate.");
        setIsUploading(false);
        return;
      }
    }

    const photoUrls: string[] = [];
    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        try {
          const imageUrl = await api.uploadImage(imageFile, userId);
          photoUrls.push(imageUrl);
        } catch (error) {
          setApiError("Erro ao enviar imagens.");
          setIsUploading(false);
          return;
        }
      }
    }

    let financialStatementsFileUrl: string | null = null;
    if (financialStatementsFile) {
      try {
        financialStatementsFileUrl = await api.uploadFinancialStatements(
          financialStatementsFile,
          userId
        );
      } catch (error) {
        setApiError("Erro ao enviar Financial Statements.");
        setIsUploading(false);
        return;
      }
    }

    const termsValue =
      formData.buyerInfo?.terms === "" ? null : formData.buyerInfo?.terms;
    const currencyValue =
      formData.buyerInfo?.currency === ""
        ? null
        : formData.buyerInfo?.currency;

    const payload = {
      user_id: userId,
      customer_name: formData.customerInfo?.legalName || null,
      sales_tax_id: formData.customerInfo?.taxId || null,
      duns_number: formData.customerInfo?.dunNumber || null,
      dba_number: formData.customerInfo?.dba || null,
      resale_certificate: fileUrl,
      billing_address: formData.billingAddress || [],
      shipping_address: formData.shippingAddress || [],
      ap_contact_name: `${formData.apContact?.firstName || ""} ${formData.apContact?.lastName || ""}`.trim(),
      ap_contact_email: formData.apContact?.email || null,
      ap_contact_country_code: formData.apContact?.countryCode || null,
      ap_contact_number: formData.apContact?.contactNumber || null,
      buyer_name: `${formData.buyerInfo?.firstName || ""} ${formData.buyerInfo?.lastName || ""}`.trim(),
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

    await api.submitForm(payload, userId);
    setIsModalOpen(true);
  } catch (error: unknown) {
    console.error("Erro ao enviar formulário:", error);
    setApiError("Erro ao enviar o formulário. Tente novamente.");
  } finally {
    setIsUploading(false);
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
  const fetchCustomerData = async () => {
    if (!customerId) return;

    try {
      const { data, error } = await api.getCustomerFormById(customerId as string); // Crie esse método na sua API se ainda não existir

      if (error || !data) {
        console.error("Erro ao buscar dados do cliente:", error);
        return;
      }

      // Preenche os valores nos campos
      setValue("customerInfo.legalName", data.customer_name || "");
      setValue("customerInfo.taxId", data.sales_tax_id || "");
      setValue("customerInfo.dunNumber", data.duns_number || "");
      setValue("customerInfo.dba", data.dba_number || "");
      setValue("instagram", data.instagram || "");
      setValue("website", data.website || "");
      setValue("brandingMix", (data.branding_mix || []).join(", "));

      setValue("apContact.firstName", data.ap_contact_name?.split(" ")[0] || "");
      setValue("apContact.lastName", data.ap_contact_name?.split(" ")[1] || "");
      setValue("apContact.email", data.ap_contact_email || "");
      setValue("apContact.countryCode", data.ap_contact_country_code || "");
      setValue("apContact.contactNumber", data.ap_contact_number || "");

      setValue("buyerInfo.firstName", data.buyer_name?.split(" ")[0] || "");
      setValue("buyerInfo.lastName", data.buyer_name?.split(" ")[1] || "");
      setValue("buyerInfo.email", data.buyer_email || "");
      setValue("buyerInfo.countryCode", data.buyer_country_code || "");
      setValue("buyerInfo.buyerNumber", data.buyer_number || "");
      setValue("buyerInfo.terms", data.terms || "");
      setValue("buyerInfo.currency", data.currency || "");
      setValue("buyerInfo.estimatedPurchaseAmount", data.estimated_purchase_amount || "");

      const parsedBilling =
        typeof data.billing_address === "string"
          ? JSON.parse(data.billing_address)
          : data.billing_address || [];

      const parsedShipping =
        typeof data.shipping_address === "string"
          ? JSON.parse(data.shipping_address)
          : data.shipping_address || [];

          setValue("billingAddress", parsedBilling);
setbillingAddress(parsedBilling.map((_, i) => i));

setValue("shippingAddress", parsedShipping);
setshippingAddress(parsedShipping.map((_, i) => i));

    } catch (err) {
      console.error("Erro ao popular dados:", err);
    }
  }

  fetchCustomerData();
}, [customerId, setValue]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <S.ContainerMain>
      <S.FormContainer>
        <S.FormHeader>
          <S.FormTitle>Edit Customer Onboarding</S.FormTitle>
          <S.FormSubtitle>
            Please edit the form and submit again.
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
                      
                    }}>
                  <S.Label style={{marginBottom: 0}} htmlFor="brandingMix">Branding Mix</S.Label>
                  <S.InfoButton
                    style={{textAlign:"center"}}
                    type="button"
                    title="list all the brands you work with (separate the brands by comma"
                  >
                    <Info size={16} />
                  </S.InfoButton>
                  </div>
                  <S.Input
                    style={{
                      width:"500px",
                      height: "200px",
                      paddingBottom:"170px",
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
                    <S.Label htmlFor="financialStatements-upload">
                      Financial Statements
                    </S.Label>
                    <S.InfoButton
                      type="button"
                      title="Most disclosed tax period"
                    >
                      <Info size={16} />
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
