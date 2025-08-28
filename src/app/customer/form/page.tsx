// page.tsx
"use client";
import React from "react";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as S from "./styles";
import type { IFormInputs, AddressInput, Agent } from "../../../types/form";
import { createClient } from "@/lib/supabase/client";
import CountrySelect from "@/_components/CountrySelect";



import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  CircleCheck,
  Plus,
  Trash2,
  Info,
  CircleAlert,
  CircleX,
} from "lucide-react";
import { api } from "../../../lib/supabase/index";

const supabase = createClient();
// Opções para os selects (adicione/ajuste conforme suas telas de validação)
const termsOptions = [
  { value: "", label: "Select terms" },
  { value: "100% Prior to Ship", label: "100% Prior to Ship" },
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
];

const countryOptions = [
  // { value: "AF", label: "Afghanistan" },
  // { value: "AL", label: "Albania" },
  // { value: "DZ", label: "Algeria" },
  // { value: "AD", label: "Andorra" },
  // { value: "AO", label: "Angola" },
  // { value: "AG", label: "Antigua and Barbuda" },
  // { value: "AR", label: "Argentina" },
  // { value: "AM", label: "Armenia" },
  // { value: "AU", label: "Australia" },
  // { value: "AT", label: "Austria" },
  // { value: "AZ", label: "Azerbaijan" },
  // { value: "BS", label: "Bahamas" },
  // { value: "BH", label: "Bahrain" },
  // { value: "BD", label: "Bangladesh" },
  // { value: "BB", label: "Barbados" },
  // { value: "BY", label: "Belarus" },
  // { value: "BE", label: "Belgium" },
  // { value: "BZ", label: "Belize" },
  // { value: "BJ", "label": "Benin" },
  // { value: "BT", label: "Bhutan" },
  // { value: "BO", label: "Bolivia" },
  // { value: "BA", label: "Bosnia and Herzegovina" },
  // { value: "BW", label: "Botswana" },
  { value: "BR", label: "Brazil" },
  // { value: "BN", label: "Brunei Darussalam" },
  // { value: "BG", label: "Bulgaria" },
  // { value: "BF", label: "Burkina Faso" },
  // { value: "BI", label: "Burundi" },
  // { value: "CV", label: "Cabo Verde" },
  // { value: "KH", label: "Cambodia" },
  // { value: "CM", label: "Cameroon" },
  // { value: "CA", label: "Canada" },
  // { value: "CF", label: "Central African Republic" },
  // { value: "TD", label: "Chad" },
  // { value: "CL", label: "Chile" },
  // { value: "CN", label: "China" },
  // { value: "CO", label: "Colombia" },
  // { value: "KM", label: "Comoros" },
  // { value: "CG", label: "Congo" },
  // { value: "CD", label: "Congo, Democratic" },
  // { value: "CR", label: "Costa Rica" },
  // { value: "HR", label: "Croatia" },
  // { value: "CU", label: "Cuba" },
  // { value: "CY", label: "Cyprus" },
  // { value: "CZ", label: "Czech Republic" },
  // { value: "DK", label: "Denmark" },
  // { value: "DJ", label: "Djibouti" },
  // { value: "DM", label: "Dominica" },
  // { value: "DO", label: "Dominican Republic" },
  // { value: "EC", label: "Ecuador" },
  // { value: "EG", label: "Egypt" },
  // { value: "SV", label: "El Salvador" },
  // { value: "GQ", label: "Equatorial Guinea" },
  // { value: "ER", label: "Eritrea" },
  // { value: "EE", label: "Estonia" },
  // { value: "ET", label: "Ethiopia" },
  // { value: "FJ", label: "Fiji" },
  // { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  // { value: "GA", label: "Gabon" },
  // { value: "GM", label: "Gambia" },
  // { value: "GE", label: "Georgia" },
  // { value: "DE", label: "Germany" },
  // { value: "GH", label: "Ghana" },
  // { value: "GR", label: "Greece" },
  // { value: "GD", label: "Grenada" },
  // { value: "GT", label: "Guatemala" },
  // { value: "GN", label: "Guinea" },
  // { value: "GW", label: "Guinea-Bissau" },
  // { value: "GY", label: "Guyana" },
  // { value: "HT", label: "Haiti" },
  // { value: "HN", label: "Honduras" },
  // { value: "HU", label: "Hungary" },
  // { value: "IS", label: "Iceland" },
  // { value: "IN", label: "India" },
  // { value: "ID", label: "Indonesia" },
  // { value: "IR", label: "Iran" },
  // { value: "IQ", label: "Iraq" },
  // { value: "IE", label: "Ireland" },
  // { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" },
  // { value: "JM", label: "Jamaica" },
  // { value: "JP", label: "Japan" },
  // { value: "JO", label: "Jordan" },
  // { value: "KZ", label: "Kazakhstan" },
  // { value: "KE", label: "Kenya" },
  // { value: "KI", label: "Kiribati" },
  // { value: "KP", label: "Korea, Democratic People's Republic of" },
  // { value: "KR", label: "Korea, Republic of" },
  // { value: "KW", label: "Kuwait" },
  // { value: "KG", label: "Kyrgyzstan" },
  // { value: "LA", label: "Laos" },
  // { value: "LV", label: "Latvia" },
  // { value: "LB", label: "Lebanon" },
  // { value: "LS", label: "Lesotho" },
  // { value: "LR", label: "Liberia" },
  // { value: "LY", label: "Libya" },
  // { value: "LI", label: "Liechtenstein" },
  // { value: "LT", label: "Lithuania" },
  // { value: "LU", label: "Luxembourg" },
  // { value: "MK", label: "North Macedonia" },
  // { value: "MG", label: "Madagascar" },
  // { value: "MW", label: "Malawi" },
  // { value: "MY", label: "Malaysia" },
  // { value: "MV", label: "Maldives" },
  // { value: "ML", label: "Mali" },
  // { value: "MT", label: "Malta" },
  // { value: "MH", label: "Marshall Islands" },
  // { value: "MR", label: "Mauritania" },
  // { value: "MU", label: "Mauritius" },
  // { value: "MX", label: "Mexico" },
  // { value: "FM", label: "Micronesia, Federated States of" },
  // { value: "MD", label: "Moldova, Republic of" },
  // { value: "MC", label: "Monaco" },
  // { value: "MN", label: "Mongolia" },
  // { value: "ME", label: "Montenegro" },
  // { value: "MA", label: "Morocco" },
  // { value: "MZ", label: "Mozambique" },
  // { value: "MM", label: "Myanmar" },
  // { value: "NA", label: "Namibia" },
  // { value: "NR", label: "Nauru" },
  // { value: "NP", label: "Nepal" },
  // { value: "NL", label: "Netherlands" },
  // { value: "NZ", label: "New Zealand" },
  // { value: "NI", label: "Nicaragua" },
  // { value: "NE", label: "Niger" },
  // { value: "NG", label: "Nigeria" },
  // { value: "NO", label: "Norway" },
  // { value: "OM", label: "Oman" },
  // { value: "PK", label: "Pakistan" },
  // { value: "PW", label: "Palau" },
  // { value: "PS", label: "Palestine, State of" },
  // { value: "PA", label: "Panama" },
  // { value: "PG", label: "Papua New Guinea" },
  // { value: "PY", label: "Paraguay" },
  // { value: "PE", label: "Peru" },
  // { value: "PH", label: "Philippines" },
  // { value: "PL", label: "Poland" },
  // { value: "PT", label: "Portugal" },
  // { value: "QA", label: "Qatar" },
  // { value: "RO", label: "Romania" },
  // { value: "RU", label: "Russian Federation" },
  // { value: "RW", label: "Rwanda" },
  // { value: "KN", label: "Saint Kitts and Nevis" },
  // { value: "LC", label: "Saint Lucia" },
  // { value: "VC", label: "Saint Vincent and the Grenadines" },
  // { value: "WS", label: "Samoa" },
  // { value: "SM", label: "San Marino" },
  // { value: "ST", label: "Sao Tome and Principe" },
  // { value: "SA", label: "Saudi Arabia" },
  // { value: "SN", label: "Senegal" },
  // { value: "RS", label: "Serbia" },
  // { value: "SC", label: "Seychelles" },
  // { value: "SL", label: "Sierra Leone" },
  // { value: "SG", label: "Singapore" },
  // { value: "SK", label: "Slovakia" },
  // { value: "SI", label: "Slovenia" },
  // { value: "SB", label: "Solomon Islands" },
  // { value: "SO", label: "Somalia" },
  // { value: "ZA", label: "South Africa" },
  // { value: "SS", label: "South Sudan" },
  { value: "ES", label: "Spain" },
  // { value: "LK", label: "Sri Lanka" },
  // { value: "SD", label: "Sudan" },
  // { value: "SR", label: "Suriname" },
  // { value: "SE", label: "Sweden" },
  // { value: "CH", label: "Switzerland" },
  // { value: "SY", label: "Syrian Arab Republic" },
  // { value: "TJ", label: "Tajikistan" },
  // { value: "TZ", label: "Tanzania" },
  // { value: "TH", label: "Thailand" },
  // { value: "TL", label: "Timor-Leste" },
  // { value: "TG", label: "Togo" },
  // { value: "TO", label: "Tonga" },
  // { value: "TT", label: "Trinidad and Tobago" },
  // { value: "TN", label: "Tunisia" },
  // { value: "TR", label: "Turkey" },
  // { value: "TM", label: "Turkmenistan" },
  // { value: "TV", label: "Tuvalu" },
  // { value: "UG", label: "Uganda" },
  // { value: "UA", label: "Ukraine" },
  // { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  // { value: "UY", label: "Uruguay" },
  // { value: "UZ", label: "Uzbekistan" },
  // { value: "VU", label: "Vanuatu" },
  // { value: "VE", label: "Venezuela" },
  // { value: "VN", label: "Viet Nam" },
  // { value: "YE", label: "Yemen" },
  // { value: "ZM", label: "Zambia" },
  // { value: "ZW", label: "Zimbabwe" },
];

const currencyOptions = [
  { value: "", label: "Select currency" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

export default function OnboardingForm() {
  const [file, setFile] = useState<File | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [financialStatementsFile, setFinancialStatementsFile] =
    useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [shippingAddress, setshippingAddress] = useState<number[]>([0]);
  const [, setIsSameAsBilling] = useState(false);
  const [billingAddress, setbillingAddress] = useState<number[]>([0]);
  const [currentStep, setCurrentStep] = useState(1);
  
  const totalSteps = 4;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<{ id: string; userType?: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [apiError, setApiError] = useState<string | null>(null);

  // Novos estados para erros específicos de campos de arquivo
  const [resaleCertificateError, setResaleCertificateError] = useState<
    string | null
  >(null);
  const [posPhotosError, setPosPhotosError] = useState<string | null>(null);

  // New states for dynamic modal content
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalIcon, setModalIcon] = useState<React.ElementType | null>(null);

  const router = useRouter();

  const [stepFourAttemptedValidation, setStepFourAttemptedValidation] =
    useState(false);

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch,
    clearErrors,
    control,
    setError,
  } = useForm<IFormInputs>({
    mode: "onChange",
    defaultValues: {
      billingAddress: [{} as AddressInput],
      shippingAddress: [{} as AddressInput],
      buyerInfo: {
        firstName: "",
        lastName: "",
        email: "",
        countryCode: "",
        buyerNumber: "",
        terms: "",
        currency: "",
        estimatedPurchaseAmount: undefined,
        financialStatements: undefined,
      },
    },
  });

  const selectedCountry = watch("customerInfo.country");

  const handleFinancialStatementsFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("buyerInfo.financialStatements", {
          type: "manual",
          message: "Financial Statements must be a PDF file.",
        });
        setFinancialStatementsFile(null);
        console.log("Invalid Financial Statements file: not a PDF.");
        return;
      }
      setFinancialStatementsFile(selectedFile);
      clearErrors("buyerInfo.financialStatements");
      setApiError(null);
      console.log("Financial Statements file selected:", selectedFile.name);
    } else {
      setFinancialStatementsFile(null);
      clearErrors("buyerInfo.financialStatements");
      setApiError(null);
      console.log("No Financial Statements file selected.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await api.getCurrentUserServer();
      setUser(currentUser);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
  const fetchAgents = async () => {
    const { data, error } = await supabase.from("agents").select("*");
    if (!error) setAgents(data);
  };
  fetchAgents();
}, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Please upload a PDF file.");
        setFile(null);
        console.log("Invalid Resale Certificate file: not a PDF.");
        return;
      }
      setFile(selectedFile);
      setResaleCertificateError(null); // Limpa o erro quando um arquivo válido é selecionado
      console.log("Resale Certificate file selected:", selectedFile.name);
    } else {
      setFile(null);
      console.log("No Resale Certificate file selected.");
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
      setPosPhotosError(null); // Limpa o erro quando um arquivo é selecionado
      console.log(
        "Images selected:",
        files.map((f) => f.name)
      );
    } else {
      console.log("No images selected.");
    }
  };

  const onSubmit = async (formData: IFormInputs) => {
    console.log("Submit button clicked. Starting onSubmit function.");

 
    // Validação manual para o Resale Certificate e POS Photos
    if (!file) {
      setModalTitle("Validation Error");
      setModalMessage("Resale Certificate is required.");
      setModalIcon(() => CircleX);
      setIsModalOpen(true);
      setIsUploading(false);
      setResaleCertificateError("Resale Certificate is required.");
      return;
    } else {
      setResaleCertificateError(null);
    }
    if (imageFiles.length === 0) {
      setModalTitle("Validation Error");
      setModalMessage("At least one POS photo is required.");
      setModalIcon(() => CircleX);
      setIsModalOpen(true);
      setIsUploading(false);
      setPosPhotosError("At least one POS photo is required.");
      return;
    } else {
      setPosPhotosError(null);
    }

    console.log("📥 Form submission started.");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    console.log("🔐 Supabase session data:", sessionData);
    console.log("🧾 Access Token:", sessionData?.session?.access_token);
    if (sessionError) {
      console.error("⚠️ Error getting session:", sessionError.message);
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log("👤 Supabase user data:", userData?.user);
    if (userError) {
      console.error("⚠️ Error getting user:", userError.message);
    }

    setApiError(null);
    setModalTitle("");
    setModalMessage("");
    setModalIcon(null);
    setIsModalOpen(false);

    const termsSelected = getValues("buyerInfo.terms");
    let financialStatementsError = false;
    let specificErrorMessage = "";

    if (
      termsSelected &&
      termsSelected !== "100% Prior to Ship" &&
      !financialStatementsFile
    ) {
      specificErrorMessage =
        "Financial Statements are required if terms are not 100% Prior to Ship.";
      setError("buyerInfo.financialStatements", {
        type: "required",
        message: specificErrorMessage,
      });
      financialStatementsError = true;
    } else if (
      financialStatementsFile &&
      financialStatementsFile.type !== "application/pdf"
    ) {
      specificErrorMessage = "Financial Statements must be a PDF file.";
      setError("buyerInfo.financialStatements", {
        type: "manual",
        message: specificErrorMessage,
      });
      financialStatementsError = true;
    } else {
      clearErrors("buyerInfo.financialStatements");
    }

    const allFieldsValid = await trigger([
      "buyerInfo.firstName",
      "buyerInfo.lastName",
      "buyerInfo.email",
      "buyerInfo.countryCode",
      "buyerInfo.buyerNumber",
      "buyerInfo.terms",
      "buyerInfo.currency",
      "buyerInfo.estimatedPurchaseAmount",
      "buyerInfo.financialStatements",
    ]);

    if (
      !allFieldsValid ||
      financialStatementsError ||
      Object.keys(errors).length > 0
    ) {
      console.log("Final form submission validation failed. Errors:", errors);
      let displayMessage = "";
      if (financialStatementsError && specificErrorMessage) {
        displayMessage = specificErrorMessage;
      } else {
        const firstErrorMessage = Object.values(errors).find(
          (e: unknown) => typeof e === "object" && e !== null && "message" in e
        )?.message;

        if (firstErrorMessage) {
          displayMessage = firstErrorMessage;
        } else {
          displayMessage = "Please fill in all required fields correctly.";
        }
      }

      setModalTitle("Submission failed!");
      setModalMessage(displayMessage);
      setModalIcon(() => CircleX);
      setIsModalOpen(true);

      setIsUploading(false);
      return;
    }

    try {
      setApiError(null);
      setIsUploading(true);
      console.log("isUploading set to true.");

      let {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        console.log("🔁 Buscando currentUser dentro do onSubmit...");
        const apiUser = await api.getCurrentUserServer();
        if (apiUser && apiUser.id) {
          currentUser = {
            id: apiUser.id,
            app_metadata: {},
            user_metadata: {},
            aud: "",
            created_at: "",
            email: "",
            phone: "",
            confirmation_sent_at: "",
            recovery_sent_at: "",
            email_change_sent_at: "",
            last_sign_in_at: "",
            role: "",
            updated_at: "",
            identities: [],
            factors: [],
            invited_at: "",
            action_link: "",
            email_confirmed_at: "",
            phone_confirmed_at: "",
            is_anonymous: false,
          };
        }
      }

      if (!currentUser || !currentUser.id) {
        console.error("⚠️ Usuário não autenticado no momento do submit.");
        setModalTitle("Authentication Error");
        setModalMessage(
          "Your session has expired or you are not logged in. Please log in again."
        );
        setModalIcon(() => CircleX);
        setIsModalOpen(true);
        setIsUploading(false);

        setTimeout(() => {
          router.push("/");
        }, 2);

        return;
      }

      console.log("Current user ID:", currentUser.id);

      console.log("Data received in form (formData):", formData);

      let fileUrl: string | null = null;
      if (file) {
        try {
          console.log("Attempting to upload resale certificate.");
          fileUrl = await api.uploadResaleCertificate(file, currentUser.id);
          console.log(
            "Resale certificate file uploaded successfully:",
            fileUrl
          );
        } catch (error) {
          console.error("Error uploading resale certificate file:", error);

          setModalTitle("Upload Error");
          setModalMessage(
            error instanceof Error
              ? error.message
              : "Error uploading file. Please try again."
          );
          setModalIcon(() => CircleX);
          setIsModalOpen(true);

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
            console.error(`Error uploading image ${imageFile.name}:`, error);

            setModalTitle("Upload Error");
            setModalMessage(
              error instanceof Error
                ? error.message
                : "Error uploading images. Please try again."
            );
            setModalIcon(() => CircleX);
            setIsModalOpen(true);

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
            "Financial Statements file uploaded successfully:",
            financialStatementsFileUrl
          );
        } catch (error) {
          console.error("Error uploading Financial Statements:", error);

          setModalTitle("Upload Error");
          setModalMessage(
            error instanceof Error
              ? error.message
              : "Error uploading Financial Statements. Please try again."
          );
          setModalIcon(() => CircleX);
          setIsModalOpen(true);

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
        joor: formData.joor || null,
        country: formData.customerInfo?.country || null,
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
        estimated_purchase_amount: formData.buyerInfo?.estimatedPurchaseAmount || null,

        financial_statements: financialStatementsFileUrl,
         category: formData.buyerInfo?.category || null,
         agent_id: formData.customerInfo?.agentId || null,
      };

      console.log("Payload being sent to submitForm:", payload);

      await api.submitForm(payload, currentUser.id);
      console.log("Form submitted successfully via API.");

      try {
        const emailConfirmationPayload = {
          name: formData.buyerInfo?.firstName || "Cliente",
        };
        console.log(
          "Payload de email de confirmação:",
          emailConfirmationPayload
        );

        const emailResponse = await fetch("/api/send/send-form-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailConfirmationPayload),
        });

        if (emailResponse.ok) {
          console.log("E-mail de confirmação enviado com sucesso!");
        } else {
          const errorData = await emailResponse.json();
          console.error("Falha ao enviar e-mail de confirmação:", errorData);
        }
      } catch (emailError) {
        console.error(
          "Erro ao tentar enviar e-mail de confirmação:",
          emailError
        );
      }

      setModalTitle("Success!");
      setModalMessage("Your form has been submitted successfully!");
      setModalIcon(() => CircleCheck);
      setIsModalOpen(true);
      console.log("Modal set to open with success message.");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: unknown) {
      console.error(
        "GENERAL error submitting the form:",
        error instanceof Error ? error.message : String(error)
      );

      setModalIcon(() => CircleX);
      setIsModalOpen(true);
      router.push("/");
    } finally {
      setIsUploading(false);
      console.log("isUploading set to false. End of onSubmit function.");
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: string[] = []; // Always initialized as an array
    const errorsList: string[] = []; // Array para acumular os erros
    setApiError(null);
    setResaleCertificateError(null);
    setPosPhotosError(null);

    if (currentStep === 1) {
      if (!file) {
        errorsList.push("Resale Certificate is required.");
        setResaleCertificateError("Resale Certificate is required.");
      }
      if (imageFiles.length === 0) {
        errorsList.push("POS photos are required");
        setPosPhotosError("POS photos are required");
      }

      fieldsToValidate = [
        "customerInfo.legalName",
        "customerInfo.taxId",
        "customerInfo.dba",
        "customerInfo.country",
        "customerInfo.agentId",
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
        "buyerInfo.category",
      ];
      setStepFourAttemptedValidation(true);

      const termsSelected = getValues("buyerInfo.terms");

      if (
        termsSelected &&
        termsSelected !== "100% Prior to Ship" &&
        !financialStatementsFile
      ) {
        const errorMessage =
          "Financial Statements are required if terms are not 100% Prior to Ship.";
        errorsList.push(errorMessage);
        setError("buyerInfo.financialStatements", {
          type: "required",
          message: errorMessage,
        });
      } else if (
        financialStatementsFile &&
        financialStatementsFile.type !== "application/pdf"
      ) {
        const errorMessage = "Financial Statements must be a PDF file.";
        errorsList.push(errorMessage);
        setError("buyerInfo.financialStatements", {
          type: "manual",
          message: errorMessage,
        });
      } else {
        clearErrors("buyerInfo.financialStatements");
      }
    }

    const isValid = await trigger(
      fieldsToValidate as Parameters<typeof trigger>[0]
    );

    if (!isValid) {
      // Coleta erros do react-hook-form
      Object.values(errors).forEach((error) => {
        if (typeof error === "object" && error !== null && "message" in error) {
          errorsList.push(error.message as string);
        }
      });
    }

    if (errorsList.length > 0) {
      // Join all collected errors into a single string to display as `apiError`
      setApiError(errorsList.join(" | "));
      console.log("Form validation failed for the current step:", errors);
      return;
    }

    console.log("Form validation successful for the current step.");
    setApiError(null);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setApiError(null);
    setResaleCertificateError(null);
    setPosPhotosError(null);
  };

  const addShippingAddress = () => {
    setshippingAddress((prev) => [...prev, prev.length]);
  };

  const removeShippingAddress = (indexToRemove: number) => {
    if (shippingAddress.length <= 1) return;
    setshippingAddress((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setValue(`shippingAddress.${indexToRemove}`, {} as AddressInput);
  };

  const removeBillingAddress = (indexToRemove: number) => {
    if (billingAddress.length <= 1) return;
    setbillingAddress((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setValue(`billingAddress.${indexToRemove}`, {} as AddressInput);
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
      console.log("Shipping address populated based on billing address.");
    } else {
      console.warn("Billing address not found to copy.");
    }
    setIsSameAsBilling(true);
  };

  useEffect(() => {}, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <S.ContainerMain>
      <S.FormContainer stepOne={currentStep === 1}>
        <S.FormHeader>
          <S.FormTitle>Customer Onboarding</S.FormTitle>
          <S.FormSubtitle>
            Please fill out the form to create your account.
          </S.FormSubtitle>
        </S.FormHeader>

        {/* {apiError && <S.ErrorMessage>{apiError}</S.ErrorMessage>} */}

        <S.ProgressBar>
          <S.ProgressFill progress={(currentStep / totalSteps) * 100} />
        </S.ProgressBar>

        <form onSubmit={hookFormSubmit(onSubmit)}>
          {currentStep === 1 && (
            <S.Section>
              <S.SectionTitle>Customer Information</S.SectionTitle>
              <S.Grid>
                <S.InputGroup>
                  <S.Label htmlFor="legalName">Company Legal Name</S.Label>
                  <S.Input
                    id="legalName"
                    {...register("customerInfo.legalName", {
                      required: "Company Legal Name is required",
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
                  <S.Label htmlFor="dba">DBA</S.Label>
                  <S.Input
                    placeholder="Trade name"
                    type="string"
                    id="dba"
                    {...register("customerInfo.dba", {
                      required: "DBA is required",
                    })}
                    error={!!errors.customerInfo?.dba}
                  />
                  {errors.customerInfo?.dba && (
                    <S.ErrorMessage>
                      {errors.customerInfo.dba.message}
                    </S.ErrorMessage>
                  )}
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
                      valueAsNumber: true,
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
  <S.Label htmlFor="customerCountry">Country</S.Label>
  <Controller
    name="customerInfo.country"
    control={control} // do useForm()
    rules={{ required: "Country is required" }}
    render={({ field }) => (
      <CountrySelect
        value={field.value || ""}
        onChange={field.onChange}
        options={countryOptions}
        // error={fieldState?.error?.message}
      />
    )}
  />
  {errors.customerInfo?.country && (
    <S.ErrorMessage>{errors.customerInfo.country.message}</S.ErrorMessage>
  )}
</S.InputGroup>


<S.InputGroup>
  <S.Label htmlFor="customerAgent">Agent</S.Label>
  <S.Input
    as="select"
    id="customerAgent"
    {...register("customerInfo.agentId", {
      required: "Agent is required",
    })}
    error={!!errors.customerInfo?.agentId}
  >
    <option value="" hidden>Select an agent</option>
    {agents
      .filter((agent) => agent.country === selectedCountry) // usa watch aqui
      .map((agent) => (
        <option key={agent.id} value={agent.id}>
          {agent.name}
        </option>
      ))}
  </S.Input>
  {errors.customerInfo?.agentId && (
    <S.ErrorMessage>{errors.customerInfo.agentId.message}</S.ErrorMessage>
  )}
</S.InputGroup>


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

                  {/* Lista de imagens selecionadas com botão de remover */}
                  {imageFiles.length > 0 && (
                    <S.FilePreviewContainer>
                      {imageFiles.map((_, index) => (
                        <S.FilePreview key={index}>
                          <span>img-{String(index + 1).padStart(2, "0")}</span>
                          <S.RemoveButton
                            type="button"
                            onClick={() =>
                              setImageFiles((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
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

  {/* Preview único com nome fake e botão de remover */}
  {file && (
    <S.FilePreviewContainer>
      <S.FilePreview>
        <span>file-01</span>
        <S.RemoveButton
          type="button"
          onClick={() => setFile(null)}
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
    </S.FilePreviewContainer>
  )}

  {resaleCertificateError && (
    <S.ErrorMessage>{resaleCertificateError}</S.ErrorMessage>
  )}
</S.FileInputContainer>






              

                           <S.InputGroup>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    
                  }}
                >
                  <S.Label htmlFor="brandingMix">
                    Branding Mix
                  </S.Label>
                  <S.InfoButton
                    type="button"
                    title="list all the brands you work with (separate the brands by comma"
                    style={{
                      display: "flex",
                      alignItems:"center",
                      marginBottom: "0",
                    }}
                  >
                    <Info size={16} style={{ marginBottom: "0.5rem" }} />
                  </S.InfoButton>
                </div>
                <S.Input
                  style={{
                    width: "426px", // Ocupa a largura total abaixo do grid
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
                  <S.ErrorMessage>{errors.brandingMix.message}</S.ErrorMessage>
                )}
              </S.InputGroup>

                               <S.InputGroup>
                  <S.Label htmlFor="instagram">Instagram</S.Label>
                  <S.Input
                    id="instagram"
                    type="text" // permite digitar sem http(s)
                    placeholder="instagram.com/yourprofile"
                    {...register("instagram", {
                      pattern: {
                        value:
                          /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d{1,5})?(\/\S*)?$/,
                        message: "Please enter a valid URL",
                      },
                    })}
                    error={!!errors.instagram}
                  />
                  {errors.instagram && (
                    <S.ErrorMessage>{errors.instagram.message}</S.ErrorMessage>
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
                        value:
                          /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d{1,5})?(\/\S*)?$/,
                        message: "Please enter a valid Website URL",
                      },
                    })}
                    error={!!errors.website}
                  />
                  {errors.website && (
                    <S.ErrorMessage>{errors.website.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>


               


              

   

                
                 <S.InputGroup  >
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

      
             

  
              </S.Grid>
              {/* O campo Branding Mix foi movido para fora do S.Grid */}
                            
              
              
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
                    <S.Label htmlFor="apContactNumber">Phone</S.Label>
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
                  <S.Label htmlFor="buyerFirstName">First name</S.Label>
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
                  <S.Label htmlFor="buyerLastName">Last name</S.Label>
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
                  <S.Label htmlFor="buyerEmail">E-mail</S.Label>
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
                    <S.Label htmlFor="buyerCountryCode">Country Code</S.Label>
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
                    <S.Label htmlFor="buyerNumber">Phone</S.Label>
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
  <S.Label htmlFor="category">Category</S.Label>
  <S.Input
    as="select"
    id="category"
    {...register("buyerInfo.category", {
      required: "Category is required",
    })}
    error={!!errors.buyerInfo?.category}
  >
    <option value="">Select a category</option>
    <option value="Apparel">Apparel</option>
    <option value="Swim">Swim</option>
    <option value="Shoes">Shoes</option>
    <option value="Handbags">Handbags</option>
    <option value="Accessories">Accessories</option>
    <option value="Others">Others</option>    
  </S.Input>
  {errors.buyerInfo?.category && (
    <S.ErrorMessage>{errors.buyerInfo.category.message}</S.ErrorMessage>
  )}
</S.InputGroup>


                <S.InputGroup>
                  <S.Label htmlFor="currency">Currency</S.Label>
                  <S.Input
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
                  {" "}
                  <S.Label htmlFor="estimatedPurchaseAmount">
                    {" "}
                    Estimated Purchase Amount Per Season{" "}
                  </S.Label>{" "}
                  <S.Input
                    as="select"
                    id="estimatedPurchaseAmount"
                    {...register("buyerInfo.estimatedPurchaseAmount", {
                      required: "Estimated purchase amount is required",
                    })}
                    error={!!errors.buyerInfo?.estimatedPurchaseAmount}
                  >
                    {" "}
                    <option value="">&nbsp;&nbsp;Select range</option>{" "}
                    <option value="6000-10000">&nbsp;&nbsp;6,000 – 10,000</option>
                    <option value="11000-20000">11,000 – 20,000</option>{" "}
                    <option value="21000-30000">21,000 – 30,000</option>{" "}
                    <option value="31000-40000">31,000 – 40,000</option>{" "}
                    <option value="41000-50000">41,000 – 50,000</option>{" "}
                    <option value="51000-60000">51,000 – 60,000</option>{" "}
                    <option value="61000-70000">61,000 – 70,000</option>{" "}
                    <option value="71000-80000">71,000 – 80,000</option>{" "}
                    <option value="81000-90000">81,000 – 90,000</option>{" "}
                    <option value="91000-100000">91,000 – 100,000</option>{" "}
                    <option value="over100000">Over 100,000</option>{" "}
                  </S.Input>{" "}
                  {errors.buyerInfo?.estimatedPurchaseAmount && (
                    <S.ErrorMessage>
                      {" "}
                      {errors.buyerInfo.estimatedPurchaseAmount.message}{" "}
                    </S.ErrorMessage>
                  )}{" "}
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
      <Info size={16} style={{ marginBottom: "0.5rem" }} />
    </S.InfoButton>
  </div>

  <S.HiddenInput
    id="financialStatements-upload"
    type="file"
    accept="application/pdf"
    {...register("buyerInfo.financialStatements")}
    onChange={handleFinancialStatementsFileChange}
  />

  <S.UploadButton htmlFor="financialStatements-upload">
    <Upload size={16} />
    {financialStatementsFile ? "1 file selected" : "Attach file (PDF)"}
  </S.UploadButton>

  {/* Preview com label fixo e botão de remover */}
  {financialStatementsFile && (
    <S.FilePreviewContainer>
      <S.FilePreview>
        <span>file-01</span>
        <S.RemoveButton
          type="button"
          onClick={() => setFinancialStatementsFile(null)}
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
    </S.FilePreviewContainer>
  )}

  {errors.buyerInfo?.financialStatements && stepFourAttemptedValidation && (
    <S.ErrorMessage>
      {errors.buyerInfo.financialStatements.message}
    </S.ErrorMessage>
  )}
</S.FileInputContainer>

              </S.Grid>

              <S.AlertMessage>
                ALL ACCOUNTS START WITH 100% PRIOR TO SHIPMENT PAYMENTS <br />
                You may request alternative payment terms, which will be subject
                to FARM Rio discretionary approval
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
              {modalTitle === "Success!" ? (
                <CircleCheck size={48} />
              ) : (
                <CircleAlert size={48} />
              )}
            </S.ModalTitle>
            <S.ModalMessage>{modalMessage}</S.ModalMessage>
            <S.ModalButton
              onClick={() => {
                setIsModalOpen(false);
                if (modalTitle === "Success!") {
                  setTimeout(() => {
                    router.push("/");
                  });
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
