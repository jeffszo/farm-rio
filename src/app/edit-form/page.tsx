// src/app/customer/form/page.tsx
"use client";
import React from "react";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as S from "./styles";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IFormInputs, AddressInput } from "@/types/form";

import { api } from "@/lib/supabase/index";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  CircleCheck,
  Plus,
  Trash2,
  Info,
  CircleAlert,
} from "lucide-react";


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
  const [file, setFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [financialStatementsFile, setFinancialStatementsFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [shippingAddress, setshippingAddress] = useState<number[]>([0]);
  const [, setIsSameAsBilling] = useState(false);
  const [billingAddress, setbillingAddress] = useState<number[]>([0]);
  const [currentStep, setCurrentStep] = useState(1);
  const [modalContent, setModalContent] = useState({ title: "", description: "" });
  const totalSteps = 4;
  const [user, setUser] = useState<{ id: string; userType?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [, setPreviousFormStatus] = useState<string | null>(null);
  const [resaleCertificateError, setResaleCertificateError] = useState<string | null>(null);
  const [posPhotosError, setPosPhotosError] = useState<string | null>(null);
  // ajuste o caminho conforme necessário


  const router = useRouter();
  
  const [stepFourAttemptedValidation, setStepFourAttemptedValidation] = useState(false);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    clearErrors,
    reset,
    setError,
  } = useForm<IFormInputs>({
    mode: "onChange",
    defaultValues: {
      billingAddress: [{} as IFormInputs["billingAddress"][number]],
      shippingAddress: [{} as IFormInputs["shippingAddress"][number]],
      buyerInfo: {
        terms: "",
        currency: "",
      } as IFormInputs["buyerInfo"],
    },
  });

  const handleFinancialStatementsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("buyerInfo.financialStatements", {
          type: "manual",
          message: "Financial Statements devem ser um arquivo PDF.",
        });
        setFinancialStatementsFile(null);
        return;
      }
      setFinancialStatementsFile(selectedFile);
      clearErrors("buyerInfo.financialStatements");
    } else {
      setFinancialStatementsFile(null);
      clearErrors("buyerInfo.financialStatements");
    }
  };


// Lógica de carregamento de dados centralizada
useEffect(() => {
  const fetchUserAndData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await api.getCurrentUserServer();
      setUser(currentUser);

      if (currentUser?.id) {
        const { data, error } = await api.getCustomerFormById(currentUser.id);

        if (error || !data) {
          console.warn("Nenhum dado de cliente encontrado para o usuário logado, assumindo novo formulário.");
        } else {
          // Prepara os dados para o reset do formulário
          const formDataToReset = {
            customerInfo: {
              legalName: data.customer_name || "",
              taxId: data.sales_tax_id || "",
              dunNumber: data.duns_number || "",
              dba: data.dba_number || "",
            },
            instagram: data.instagram || "",
            website: data.website || "",
            brandingMix: (data.branding_mix || []).join(", "),
            apContact: {
              firstName: data.ap_contact_name?.split(" ")[0] || "",
              lastName: data.ap_contact_name?.split(" ")[1] || "",
              email: data.ap_contact_email || "",
              countryCode: data.ap_contact_country_code || "",
              contactNumber: data.ap_contact_number || "",
            },
            buyerInfo: {
              firstName: data.buyer_name?.split(" ")[0] || "",
              lastName: data.buyer_name?.split(" ")[1] || "",
              email: data.buyer_email || "",
              countryCode: data.buyer_country_code || "",
              buyerNumber: data.buyer_number || "",
              terms: data.terms || "",
              currency: data.currency || "",
              estimatedPurchaseAmount: data.estimated_purchase_amount || "",
            },
            joor: data.joor || "",
            billingAddress: typeof data.billing_address === "string" ? JSON.parse(data.billing_address) : data.billing_address || [],
            shippingAddress: typeof data.shipping_address === "string" ? JSON.parse(data.shipping_address) : data.shipping_address || [],
          };

          reset(formDataToReset);

          // Atualiza os estados locais para os campos de endereço dinâmicos
          setbillingAddress(formDataToReset.billingAddress.map((_: unknown, i: number) => i));
          setshippingAddress(formDataToReset.shippingAddress.map((_: unknown, i: number) => i));

          setPreviousFormStatus(data.status || null);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar e popular dados do cliente:", err);
      setError("root.api", { type: "manual", message: "Erro ao carregar dados do formulário." });
    } finally {
      setIsLoading(false);
    }
  };
  fetchUserAndData();
}, [reset, setError]);

// Efeito para sincronizar o passo atual da URL com o estado do componente
useEffect(() => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const stepInUrl = params.get("step");

  if (stepInUrl && !isNaN(parseInt(stepInUrl, 10))) {
    setCurrentStep(parseInt(stepInUrl, 10));
  }
}, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setResaleCertificateError("Please upload a PDF file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setResaleCertificateError(null);
    } else {
      setFile(null);
      setResaleCertificateError("Resale Certificate is required.");
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
      setPosPhotosError(null);
    } else {
      setImageFiles([]);
      setPosPhotosError("POS photos are required.");
    }
  };

 


const onSubmit = async (formData: IFormInputs) => {
  console.log("🧪 termsSelected:", formData.buyerInfo?.terms);

  try {
    setApiError(null);
    setIsUploading(true);

    const userIdToUse = user?.id;
    if (!userIdToUse) {
      setApiError("Error: User ID not available. Please log in again.");
      setIsUploading(false);
      return;
    }

    // Validação de campos de arquivo antes de prosseguir
    if (!file) {
      setResaleCertificateError("Resale Certificate is required.");
      setIsUploading(false);
      return;
    }
    if (imageFiles.length === 0) {
      setPosPhotosError("POS photos are required.");
      setIsUploading(false);
      return;
    }

    const termsSelected = formData.buyerInfo?.terms?.trim().toLowerCase();
    // AQUI: A condição já está correta, verificando se o termo é diferente de "100% prior to ship"
    if (termsSelected && termsSelected !== "100% prior to ship" && !financialStatementsFile) {
      setModalContent({
        title: "Error uploading Financial Statements:",
        description: "Financial Statements are mandatory if terms are not 100% Prior to Ship.",
      });
      setIsModalOpen(true);
      setIsUploading(false);
      return;
    } else if (financialStatementsFile && financialStatementsFile.type !== "application/pdf") {
      setModalContent({
        title: "Error uploading Financial Statements:",
        description: "Financial Statements must be a PDF file.",
      });
      setIsModalOpen(true);
      setIsUploading(false);
      return;
    }


    const { data: customerData, error: fetchError } = await api.getCustomerFormById(userIdToUse);
    if (fetchError || !customerData) {
      setApiError("We couldn't find an existing form for this user.");
      setIsUploading(false);
      return;
    }

    const previousFormStatus = customerData.status;


    let fileUrl: string | null = null;
    if (file) {
      fileUrl = await api.uploadResaleCertificate(file, userIdToUse);
    }

    const photoUrls: string[] = [];
    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const imageUrl = await api.uploadImage(imageFile, userIdToUse);
        photoUrls.push(imageUrl);
      }
    }

    let financialStatementsFileUrl: string | null = null;
    if (financialStatementsFile) {
      financialStatementsFileUrl = await api.uploadFinancialStatements(financialStatementsFile, userIdToUse);
    }

    const termsValue = formData.buyerInfo?.terms === "" ? null : formData.buyerInfo?.terms;
    const currencyValue = formData.buyerInfo?.currency === "" ? null : formData.buyerInfo?.currency;

    let newStatus = "pending";
    if (previousFormStatus === "review requested by the wholesale team") {
      newStatus = "review requested by the wholesale team - customer";
    } else if (previousFormStatus === "review requested by the tax team") {
      newStatus = "review requested by the tax team - customer";
    } else if (previousFormStatus === "review requested by the credit team") {
      newStatus = "review requested by the credit team - customer";
    } else if (previousFormStatus === "review requested by the initial governance team") {
      newStatus = "review requested by the governance initial team - customer";
    } else if (previousFormStatus === "review requested by the governance final team") {
      newStatus = "review requested by the governance final team - customer";
    }


    const payload = {
      user_id: userIdToUse,
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
      status: newStatus,
      photo_urls: photoUrls,
      branding_mix: formData.brandingMix ? formData.brandingMix.split(",").map((s) => s.trim()) : null,
      instagram: formData.instagram || null,
      website: formData.website || null,
      terms: termsValue,
      currency: currencyValue,
      estimated_purchase_amount: formData.buyerInfo?.estimatedPurchaseAmount || null,
      financial_statements: financialStatementsFileUrl,
    };

    await api.submitForm(payload, userIdToUse);

    setModalContent({
      title: "Success!",
      description: "Your form has been submitted successfully!",
    });
    setIsModalOpen(true);

    setTimeout(() => {
      router.push("/");
    }, 3000);

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
      // Validação de campos de arquivo na navegação
      let isValidStep = true;
      if (!file) {
        setResaleCertificateError("Resale Certificate is required.");
        isValidStep = false;
      } else {
        setResaleCertificateError(null);
      }
      if (imageFiles.length === 0) {
        setPosPhotosError("POS photos are required.");
        isValidStep = false;
      } else {
        setPosPhotosError(null);
      }

      fieldsToValidate = ["customerInfo.legalName", "customerInfo.taxId", "customerInfo.dba", "brandingMix", "instagram", "website"];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const isValidForm = await trigger(fieldsToValidate);

      if (!isValidForm || !isValidStep) {
        return;
      }
    } else if (currentStep === 2) {
      billingAddress.forEach((index) => {
        fieldsToValidate.push(`billingAddress.${index}.street`, `billingAddress.${index}.zipCode`, `billingAddress.${index}.city`, `billingAddress.${index}.state`, `billingAddress.${index}.county`, `billingAddress.${index}.country`);
      });
      shippingAddress.forEach((index) => {
        fieldsToValidate.push(`shippingAddress.${index}.street`, `shippingAddress.${index}.zipCode`, `shippingAddress.${index}.city`, `shippingAddress.${index}.state`, `shippingAddress.${index}.county`, `shippingAddress.${index}.country`);
      });
    } else if (currentStep === 3) {
      fieldsToValidate = ["apContact.firstName", "apContact.lastName", "apContact.email", "apContact.countryCode", "apContact.contactNumber"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["buyerInfo.firstName", "buyerInfo.lastName", "buyerInfo.email", "buyerInfo.countryCode", "buyerInfo.buyerNumber", "buyerInfo.terms", "buyerInfo.currency", "buyerInfo.estimatedPurchaseAmount"];
      setStepFourAttemptedValidation(true);
      const termsSelected = getValues("buyerInfo.terms");

      // CORREÇÃO AQUI: Verificamos se um termo foi selecionado e se ele NÃO é "100% Prior to Ship"
      if (termsSelected && termsSelected.toLowerCase() !== "100% prior to ship" && !financialStatementsFile) {
        setError("buyerInfo.financialStatements", {
          type: "required",
          message: "Declarações Financeiras são obrigatórias se os Termos forem selecionados e não forem '100% Prior to Ship'.",
        });
      } else if (financialStatementsFile && financialStatementsFile.type !== "application/pdf") {
        setError("buyerInfo.financialStatements", {
          type: "manual",
          message: "Financial Statements devem ser um arquivo PDF.",
        });
      } else {
        clearErrors("buyerInfo.financialStatements");
      }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const isValid = await trigger(fieldsToValidate);
    if (currentStep === 4 && (errors.buyerInfo?.financialStatements || !isValid)) {
      return;
    }
    if (!isValid) {
      return;
    }
    const newStep = Math.min(currentStep + 1, totalSteps);
    setCurrentStep(newStep);
    router.push(`?step=${newStep}`);
  };

  const prevStep = () => {
    const newStep = Math.max(currentStep - 1, 1);
    setCurrentStep(newStep);
    router.push(`?step=${newStep}`);
  };

  const addShippingAddress = () => {
    setshippingAddress((prev) => [...prev, prev.length]);
  };

  const removeShippingAddress = (indexToRemove: number) => {
    if (shippingAddress.length <= 1) return;
    setshippingAddress((prev) => prev.filter((_, index) => index !== indexToRemove));
    setValue(`shippingAddress.${indexToRemove}`, {} as IFormInputs["shippingAddress"][number]);
  };

  const removeBillingAddress = (indexToRemove: number) => {
    if (billingAddress.length <= 1) return;
    setbillingAddress((prev) => prev.filter((_, index) => index !== indexToRemove));
    setValue(`billingAddress.${indexToRemove}`, {} as IFormInputs["billingAddress"][number]);
  };

  const handleSameAsBilling = () => {
    const currentBillingAddress = getValues("billingAddress.0");
    if (currentBillingAddress) {
      setValue("shippingAddress.0.street", currentBillingAddress.street || "");
      setValue("shippingAddress.0.zipCode", currentBillingAddress.zipCode || "");
      setValue("shippingAddress.0.city", currentBillingAddress.city || "");
      setValue("shippingAddress.0.state", currentBillingAddress.state || "");
      setValue("shippingAddress.0.county", currentBillingAddress.county || "");
      setValue("shippingAddress.0.country", currentBillingAddress.country || "");
      clearErrors("shippingAddress.0.street");
      clearErrors("shippingAddress.0.zipCode");
      clearErrors("shippingAddress.0.city");
      clearErrors("shippingAddress.0.state");
      clearErrors("shippingAddress.0.county");
      clearErrors("shippingAddress.0.country");
    }
    setIsSameAsBilling(true);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <S.ContainerMain>
      <S.FormContainer stepOne={currentStep === 1}>
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

        <form
          onSubmit={hookFormSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (currentStep === 4 && e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          {currentStep === 1 && (
            <S.Section>
              <S.SectionTitle>Customer Information</S.SectionTitle>
              <S.Grid>
                <S.InputGroup>
                  <S.Label htmlFor="legalName">Company Legal Name</S.Label>
                  <S.Input
                    id="legalName"
                    {...register("customerInfo.legalName", { required: "Legal name is required" })}
                    error={!!errors.customerInfo?.legalName}
                  />
                  {errors.customerInfo?.legalName && <S.ErrorMessage>{errors.customerInfo.legalName.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="dba">DBA</S.Label>
                  <S.Input placeholder="Trade name" type="string" id="dba"  {...register("customerInfo.dba", { required: "DBA is required" })}
                    error={!!errors.customerInfo?.dba}
                  />
                  {errors.customerInfo?.dba && <S.ErrorMessage>{errors.customerInfo.dba.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="taxId">Tax ID / VAT #</S.Label>
                  <S.Input
                    type="string"
                    id="taxId"
                    {...register("customerInfo.taxId", { required: "Tax ID is required" })}
                    error={!!errors.customerInfo?.taxId}
                  />
                  {errors.customerInfo?.taxId && <S.ErrorMessage>{errors.customerInfo.taxId.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="dunNumber">D-U-N-S</S.Label>
                  <S.Input
                    id="dunNumber"
                    type="number"
                    {...register("customerInfo.dunNumber",
                      { valueAsNumber: true })}
                    error={!!errors.customerInfo?.dunNumber}
                  />
                  {errors.customerInfo?.dunNumber && <S.ErrorMessage>{errors.customerInfo.dunNumber.message}</S.ErrorMessage>}
                </S.InputGroup>


<S.InputGroup>
  <S.Label htmlFor="instagram">Instagram</S.Label>
  <S.Input
    id="instagram"
    type="text" // permite digitar sem http(s)
    placeholder="instagram.com/yourprofile"
    {...register("instagram", {
      pattern: {
        value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d{1,5})?(\/\S*)?$/,
        message: "Please enter a valid URL",
      },
    })}
    error={!!errors.instagram}
  />
  {errors.instagram && (
    <S.ErrorMessage>
      {errors.instagram.message}
    </S.ErrorMessage>
  )}
</S.InputGroup>

                <S.InputGroup>
  <S.Label htmlFor="website">Website</S.Label>
  <S.Input
    id="website"
    type="text" // permite digitar sem http(s)
    placeholder="yourwebsite.com"
    {...register("website", {
      pattern: {
        value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d{1,5})?(\/\S*)?$/,
        message: "Please enter a valid Website URL",
      },
    })}
    error={!!errors.website}
  />
  {errors.website && (
    <S.ErrorMessage>
      {errors.website.message}
    </S.ErrorMessage>
  )}
</S.InputGroup>

<S.InputGroup>
  <S.Label htmlFor="joor">JOOR profile - if applicable</S.Label>
  <S.Input
    id="joor"
    type="text" // permite digitar sem http(s)
    placeholder="jooraccess.com/yourprofile"
    {...register("joor", {
      pattern: {
        value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d{1,5})?(\/\S*)?$/,
        message: "Please enter a valid URL",
      },
    })}
    error={!!errors.joor}
  />
  {errors.joor && (
    <S.ErrorMessage>{errors.joor.message}</S.ErrorMessage>
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
    {file ? "1 file selected" : "Attach file (PDF)"}
  </S.UploadButton>
  {resaleCertificateError && (
    <S.ErrorMessage>{resaleCertificateError}</S.ErrorMessage>
  )}
</S.FileInputContainer>

   <S.FileInputContainer>
  <S.Label htmlFor="image-upload">Upload POS Photos</S.Label>
  <S.HiddenInput
    id="image-upload"
    type="file"
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

  {/* Preview com texto curto e botão de remover */}
  {imageFiles.length > 0 && (
    <S.FilePreviewContainer>
      {imageFiles.map((_, index) => (
        <S.FilePreview key={index}>
          <span>img-{String(index + 1).padStart(2, "0")}</span>
          <S.RemoveButton
            type="button"
            onClick={() =>
              setImageFiles((prev) => prev.filter((_, i) => i !== index))
            }
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              backgroundColor: "#fff",
              borderRadius: "50%",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            <Trash2 size={14} />
          </S.RemoveButton>
        </S.FilePreview>
      ))}
    </S.FilePreviewContainer>
  )}

  {posPhotosError && (
    <S.ErrorMessage>{posPhotosError}</S.ErrorMessage>
  )}
</S.FileInputContainer>



                  </S.Grid>
              {/* O campo Branding Mix foi movido para fora do S.Grid */}
              <S.InputGroup>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <S.Label style={{ marginBottom: 0 }} htmlFor="brandingMix">
                    Branding Mix
                  </S.Label>
                  <S.InfoButton
                    type="button"
                    title="list all the brands you work with (separate the brands by comma"
                    style={{
                      display: "flex",
                    }}
                  >
                    <Info size={16} />
                  </S.InfoButton>
                </div>
                <S.Input
                  style={{
                    width: "522px", // Ocupa a largura total abaixo do grid
                    height: "200px",
                  }}
                  as="textarea" // Usar textarea para multi-linhas
                  id="brandingMix"
                  {...register("brandingMix", {
                    required: "Brand/Branding Mix is required",
                  })}
                  error={!!errors.brandingMix}
                />
                {errors.brandingMix && (
                  <S.ErrorMessage>
                    {errors.brandingMix.message}
                  </S.ErrorMessage>
                )}
              </S.InputGroup>
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
                    <div key={index} style={{ marginBottom: index < billingAddress.length - 1 ? "1.5rem" : "0", paddingBottom: index < billingAddress.length - 1 ? "1.5rem" : "0", borderBottom: index < billingAddress.length - 1 ? "1px dashed #eee" : "none" }}>
                      <S.AddressHeader>
                        {index > 0 && (<div style={{ fontSize: "0.875rem", color: "#71717a" }}>Billing Address {index + 1}</div>)}
                        {index > 0 && (<S.RemoveButton type="button" onClick={() => removeBillingAddress(index)}><Trash2 size={16} /></S.RemoveButton>)}
                      </S.AddressHeader>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.street`}>Street and Number</S.Label>
                          <S.Input id={`billingAddress.${index}.street`} {...register(`billingAddress.${index}.street`, { required: "Street is required" })} error={!!errors.billingAddress?.[index]?.street} />
                          {errors.billingAddress?.[index]?.street && <S.ErrorMessage>{errors.billingAddress[index].street.message}</S.ErrorMessage>}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.zipCode`}>ZIP Code</S.Label>
                          <S.Input id={`billingAddress.${index}.zipCode`} {...register(`billingAddress.${index}.zipCode`, { required: "ZIP code is required" })} error={!!errors.billingAddress?.[index]?.zipCode} />
                          {errors.billingAddress?.[index]?.zipCode && <S.ErrorMessage>{errors.billingAddress[index].zipCode.message}</S.ErrorMessage>}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.city`}>City</S.Label>
                          <S.Input id={`billingAddress.${index}.city`} {...register(`billingAddress.${index}.city`, { required: "City is required" })} error={!!errors.billingAddress?.[index]?.city} />
                          {errors.billingAddress?.[index]?.city && <S.ErrorMessage>{errors.billingAddress[index].city.message}</S.ErrorMessage>}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.state`}>State</S.Label>
                          <S.Input id={`billingAddress.${index}.state`} {...register(`billingAddress.${index}.state`, { required: "State is required" })} error={!!errors.billingAddress?.[index]?.state} />
                          {errors.billingAddress?.[index]?.state && <S.ErrorMessage>{errors.billingAddress[index].state.message}</S.ErrorMessage>}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.county`}>County</S.Label>
                          <S.Input id={`billingAddress.${index}.county`} {...register(`billingAddress.${index}.county`, { required: "County is required" })} error={!!errors.billingAddress?.[index]?.county} />
                          {errors.billingAddress?.[index]?.county && <S.ErrorMessage>{errors.billingAddress[index].county.message}</S.ErrorMessage>}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`billingAddress.${index}.country`}>Country</S.Label>
                          <S.Input id={`billingAddress.${index}.country`} {...register(`billingAddress.${index}.country`, { required: "Country is required" })} error={!!errors.billingAddress?.[index]?.country} />
                          {errors.billingAddress?.[index]?.country && <S.ErrorMessage>{errors.billingAddress[index].country.message}</S.ErrorMessage>}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                    </div>
                  ))}
                </S.AddressSection>
                <S.AddressSection>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <S.AddressTitle>Shipping Address</S.AddressTitle>
                    <S.Button type="button" onClick={handleSameAsBilling}>Same as Billing Address</S.Button>
                  </div>
                  {shippingAddress.map((index) => (
                    <div key={index} style={{ marginBottom: index < shippingAddress.length - 1 ? "1.5rem" : "0", paddingBottom: index < shippingAddress.length - 1 ? "1.5rem" : "0", borderBottom: index < shippingAddress.length - 1 ? "1px dashed #eee" : "none" }}>
                      <S.AddressHeader>
                        {index > 0 && (<div style={{ fontSize: "0.875rem", color: "#71717a" }}>Shipping Address {index + 1}</div>)}
                        {index > 0 && (<S.RemoveButton type="button" onClick={() => removeShippingAddress(index)}><Trash2 size={16} /></S.RemoveButton>)}
                      </S.AddressHeader>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.street`}>Street and Number</S.Label>
                          <S.Input id={`shippingAddress.${index}.street`} {...register(`shippingAddress.${index}.street`, { required: "Street is required" })} error={!!errors.shippingAddress?.[index]?.street} />
                          {errors.shippingAddress?.[index]?.street && <S.ErrorMessage>{errors.shippingAddress[index].street.message}</S.ErrorMessage>}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.zipCode`}>ZIP Code</S.Label>
                          <S.Input id={`shippingAddress.${index}.zipCode`} {...register(`shippingAddress.${index}.zipCode`, { required: "ZIP code is required" })} error={!!errors.shippingAddress?.[index]?.zipCode} />
                          {errors.shippingAddress?.[index]?.zipCode && <S.ErrorMessage>{errors.shippingAddress[index].zipCode.message}</S.ErrorMessage>}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.city`}>City</S.Label>
                          <S.Input id={`shippingAddress.${index}.city`} {...register(`shippingAddress.${index}.city`, { required: "City is required" })} error={!!errors.shippingAddress?.[index]?.city} />
                          {errors.shippingAddress?.[index]?.city && <S.ErrorMessage>{errors.shippingAddress[index].city.message}</S.ErrorMessage>}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.state`}>State</S.Label>
                          <S.Input id={`shippingAddress.${index}.state`} {...register(`shippingAddress.${index}.state`, { required: "State is required" })} error={!!errors.shippingAddress?.[index]?.state} />
                          {errors.shippingAddress?.[index]?.state && <S.ErrorMessage>{errors.shippingAddress[index].state.message}</S.ErrorMessage>}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                      <S.FieldRowAddress>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.county`}>County</S.Label>
                          <S.Input id={`shippingAddress.${index}.county`} {...register(`shippingAddress.${index}.county`, { required: "County is required" })} error={!!errors.shippingAddress?.[index]?.county} />
                          {errors.shippingAddress?.[index]?.county && <S.ErrorMessage>{errors.shippingAddress[index].county.message}</S.ErrorMessage>}
                        </S.InputGroup>
                        <S.InputGroup>
                          <S.Label htmlFor={`shippingAddress.${index}.country`}>Country</S.Label>
                          <S.Input id={`shippingAddress.${index}.country`} {...register(`shippingAddress.${index}.country`, { required: "Country is required" })} error={!!errors.shippingAddress?.[index]?.country} />
                          {errors.shippingAddress?.[index]?.country && <S.ErrorMessage>{errors.shippingAddress[index].country.message}</S.ErrorMessage>}
                        </S.InputGroup>
                      </S.FieldRowAddress>
                    </div>
                  ))}
                  <S.AddAddressButton type="button" onClick={addShippingAddress}><Plus size={16} /> Add another shipping address</S.AddAddressButton>
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
                  <S.Input id="apFirstName" {...register("apContact.firstName", { required: "First name is required" })} error={!!errors.apContact?.firstName} />
                  {errors.apContact?.firstName && <S.ErrorMessage>{errors.apContact.firstName.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="apLastName">Last name</S.Label>
                  <S.Input id="apLastName" {...register("apContact.lastName", { required: "Last name is required" })} error={!!errors.apContact?.lastName} />
                  {errors.apContact?.lastName && <S.ErrorMessage>{errors.apContact.lastName.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="apEmail">E-mail</S.Label>
                  <S.Input id="apEmail" type="email" placeholder="example@hotmail.com" {...register("apContact.email", { required: "Email is required", pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Please enter a valid email address." } })} error={!!errors.apContact?.email} />
                  {errors.apContact?.email && <S.ErrorMessage>{errors.apContact.email.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.PhoneInputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="apCountryCode">Country Code</S.Label>
                    <S.Input id="apCountryCode" type="number" min={0} {...register("apContact.countryCode", { required: "Code is required", valueAsNumber: true })} error={!!errors.apContact?.countryCode} />
                    {errors.apContact?.countryCode && <S.ErrorMessage>{errors.apContact.countryCode.message}</S.ErrorMessage>}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="apContactNumber">Phone</S.Label>
                    <S.Input id="apContactNumber" type="number" min={0} {...register("apContact.contactNumber", { required: "Contact number is required", valueAsNumber: true })} error={!!errors.apContact?.contactNumber} />
                    {errors.apContact?.contactNumber && <S.ErrorMessage>{errors.apContact.contactNumber.message}</S.ErrorMessage>}
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
                  <S.Label htmlFor="buyerFirstName">First name</S.Label>
                  <S.Input id="buyerFirstName" {...register("buyerInfo.firstName", { required: "First name is required" })} error={!!errors.buyerInfo?.firstName} />
                  {errors.buyerInfo?.firstName && <S.ErrorMessage>{errors.buyerInfo.firstName.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="buyerLastName">Last name</S.Label>
                  <S.Input id="buyerLastName" {...register("buyerInfo.lastName", { required: "Last name is required" })} error={!!errors.buyerInfo?.lastName} />
                  {errors.buyerInfo?.lastName && <S.ErrorMessage>{errors.buyerInfo.lastName.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="buyerEmail">E-mail</S.Label>
                  <S.Input id="buyerEmail" type="email" placeholder="example@hotmail.com" {...register("buyerInfo.email", { required: "Email is required", pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Please enter a valid email address." } })} error={!!errors.buyerInfo?.email} />
                  {errors.buyerInfo?.email && <S.ErrorMessage>{errors.buyerInfo.email.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.PhoneInputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="buyerCountryCode">Country Code</S.Label>
                    <S.Input id="buyerCountryCode" type="number" min={0} {...register("buyerInfo.countryCode", { required: "Code is required", valueAsNumber: true })} error={!!errors.buyerInfo?.countryCode} />
                    {errors.buyerInfo?.countryCode && <S.ErrorMessage>{errors.buyerInfo.countryCode.message}</S.ErrorMessage>}
                  </S.InputGroup>
                  <S.InputGroup>
                    <S.Label htmlFor="buyerNumber">Phone</S.Label>
                    <S.Input type="number" id="buyerNumber" min={0} {...register("buyerInfo.buyerNumber", { required: "Phone number is required", valueAsNumber: true })} error={!!errors.buyerInfo?.buyerNumber} />
                    {errors.buyerInfo?.buyerNumber && <S.ErrorMessage>{errors.buyerInfo.buyerNumber.message}</S.ErrorMessage>}
                  </S.InputGroup>
                </S.PhoneInputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="terms">Terms</S.Label>
                  <S.Input as="select" id="terms" style={{ width: "250px" }} {...register("buyerInfo.terms", { required: "Terms are required", validate: (value) => value !== "" || "Please select terms" })} error={!!errors.buyerInfo?.terms}>
                    {termsOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </S.Input>
                  {errors.buyerInfo?.terms && <S.ErrorMessage>{errors.buyerInfo.terms.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="currency">Currency</S.Label>
                  <S.Input as="select" id="currency" style={{ width: "250px" }} {...register("buyerInfo.currency", { required: "Currency is required", validate: (value) => value !== "" || "Please select a currency" })} error={!!errors.buyerInfo?.currency}>
                    {currencyOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </S.Input>
                  {errors.buyerInfo?.currency && <S.ErrorMessage>{errors.buyerInfo.currency.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="estimatedPurchaseAmount">Estimated Puchase Amount Per Season</S.Label>
                  <S.Input type="number" id="estimatedPurchaseAmount" min={0} step="0.01" {...register("buyerInfo.estimatedPurchaseAmount", { required: "Estimated purchase amount is required", valueAsNumber: true, min: { value: 0, message: "Amount must be positive" } })} error={!!errors.buyerInfo?.estimatedPurchaseAmount} />
                  {errors.buyerInfo?.estimatedPurchaseAmount && <S.ErrorMessage>{errors.buyerInfo.estimatedPurchaseAmount.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.FileInputContainer>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <S.Label htmlFor="financialStatements-upload">Financial Statements</S.Label>
                    <S.InfoButton type="button" title="Most disclosed tax period"><Info size={16} style={{marginBottom: "0.5rem"}}/></S.InfoButton>
                  </div>
                  <S.HiddenInput id="financialStatements-upload" type="file" accept="application/pdf" onChange={handleFinancialStatementsFileChange} />
                  <S.UploadButton htmlFor="financialStatements-upload">
                    <Upload size={16} />
                    {financialStatementsFile ? financialStatementsFile.name : "Attach file (PDF)"}
                  </S.UploadButton>
                  {errors.buyerInfo?.financialStatements && stepFourAttemptedValidation && (<S.ErrorMessage>{errors.buyerInfo.financialStatements.message}</S.ErrorMessage>)}
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
              <S.Button type="button" onClick={prevStep} variant="secondary"><ChevronLeft size={16} /> Previous</S.Button>
            )}
            <S.Button
              type="button"
              onClick={nextStep}
              variant="primary"
              style={{ display: currentStep < totalSteps ? "inline-flex" : "none" }}
            >
              Next <ChevronRight size={16} />
            </S.Button>
            <S.Button
              type="submit"
              variant="primary"
              disabled={isUploading || isLoading}
              style={{ display: currentStep === totalSteps ? "inline-flex" : "none" }}
            >
              {isUploading ? "Submitting..." : "Submit"}
            </S.Button>
          </S.ButtonGroup>
        </form>
      </S.FormContainer>
     {isModalOpen && (
  <S.ModalOverlay>
    <S.ModalContent>
      <S.ModalTitle>
        {modalContent?.title.toLowerCase().includes("error") ? <CircleAlert size={48}  /> : <CircleCheck size={48}  />}
      </S.ModalTitle>
      <S.ModalMessage>{modalContent.description}</S.ModalMessage>

      <S.ModalButton
        onClick={() => {
          setIsModalOpen(false);
          if (!modalContent?.title.toLowerCase().includes("error")) {
            setTimeout(() => {
              router.push("/");
            }, 2000);
          }
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