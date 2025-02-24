"use client"

import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import * as S from "./styles"
import { api } from "../../lib/supabaseApi"
import type { IFormInputs } from "../../types/form"
import { useRouter } from "next/navigation"

export default function OnboardingForm() {
  const { register, handleSubmit, formState: { errors }, trigger } = useForm<IFormInputs>();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const [isWholesaleTeam, setIsWholesaleTeam] = useState(false);
  const [isCreditTeam, setIsCreditTeam] = useState(false);

  // ✅ Buscar o usuário e o status do formulário corretamente
  useEffect(() => {
    const fetchUserAndStatus = async () => {
      try {
        setIsLoading(true);
        const currentUser = await api.getCurrentUser();

        if (!currentUser) {
          console.error("Usuário não autenticado.");
          return;
        }

        setUser(currentUser);

        // Buscar o status do formulário
        const formData = await api.getFormStatus(currentUser.id);
        setFormStatus(formData?.status || null);
      } catch (error) {
        console.error("Erro ao buscar status do formulário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndStatus();
  }, []);

  const onSubmit = async (formData: any) => {
    try {
      setApiError(null);
  
      const user = await api.getCurrentUser();
      if (!user || !user.id) {
        console.error("Usuário não autenticado.");
        setApiError("Sua sessão expirou. Faça login novamente.");
        return;
      }
  
      console.log("Usuário autenticado:", user);
  
      await api.submitForm(formData, user.id);
      alert("Formulário enviado com sucesso!");
  
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      console.error("Erro ao enviar o formulário:", error.message);
      setApiError(error.message || "Erro ao enviar o formulário. Tente novamente.");
    }
  };



  // 🔥 **Evita erro de hidratação: só renderiza depois do carregamento**
  if (isLoading) {
    return <p>Loading...</p>;
  }

  // 🔥 **Se o usuário já enviou o formulário, mostra apenas o status**
  if (user?.userType === "cliente" && formStatus) {
    return (
      <S.FormContainer>
        <S.FormHeader>
          <S.FormTitle>Request status</S.FormTitle>
          <S.FormSubtitle>
          {formStatus === "pending" && <div>Your submission is under review.</div>}

{formStatus === "approved by the wholesale team" && (
  <div>
    Your form has already been <strong>approved by the wholesale team</strong>. 
    Please wait for feedback from the credit and CSC teams.
  </div>
)}

{formStatus === "approved by the credit team" && (
  <div>
    Your form has already been <strong> approved by the  wholesale and credit team</strong>. 
    All that's missing is a response from the CSC team!
  </div>
)}

{formStatus === "approved" && <div>Your form has been <strong>approvedy all teams! </strong> </div>}

{formStatus === "rejected" && <div>Your form has been <strong>rejected</strong>.</div>}

          </S.FormSubtitle>
        </S.FormHeader>
      </S.FormContainer>
    );
  }


  // ✅ Criado `nextStep` corretamente
  const nextStep = async () => {
    const isValid = await trigger();
    if (!isValid) return;
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  // ✅ Criado `prevStep` corretamente
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };


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

      <form onSubmit={handleSubmit(onSubmit)}>
      {currentStep === 1 && (
          <S.Section>
            <S.SectionTitle>Customer Information</S.SectionTitle>
            <S.Grid>
              <S.InputGroup>
                <S.Label htmlFor="legalName">Legal Name</S.Label>
                <S.Input
                  id="legalName"
                  {...register("customerInfo.legalName", { required: "Legal name is required" })}
                  $error={!!errors.customerInfo?.legalName}
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
                  {...register("customerInfo.taxId", { required: "Tax ID is required" })}
                  $error={!!errors.customerInfo?.taxId}
                />
                {errors.customerInfo?.taxId && <S.ErrorMessage>{errors.customerInfo.taxId.message}</S.ErrorMessage>}
              </S.InputGroup>
              <S.InputGroup>
                <S.Label htmlFor="resaleCertNumber">Resale Certificate Number</S.Label>
                <S.Input
                  id="resaleCertNumber"
                  type="number"
                  {...register("customerInfo.resaleCertNumber", {
                    required: "Resale Certificate Number is required",
                    valueAsNumber: true,
                    validate: (value) => 
                      isNaN(value) ? "Resale Certificate Number must be a valid number": true,
                  })}
                  $error={!!errors.customerInfo?.resaleCertNumber}
                />
                {errors.customerInfo?.resaleCertNumber && (
                  <S.ErrorMessage>{errors.customerInfo.resaleCertNumber.message}</S.ErrorMessage>
                )}
              </S.InputGroup>
                      <S.InputGroup>
          <S.Label htmlFor="dunNumber">D-U-N-S Number</S.Label>
          <S.Input
            id="dunNumber"
            type="number"
            {...register("customerInfo.dunNumber", {
              required: "D-U-N-S number is required",
              valueAsNumber: true, // Converte automaticamente para número
              validate: (value) =>
                isNaN(value) ? "D-U-N-S number must be a valid number": true,
            })}
            $error={!!errors.customerInfo?.dunNumber}
          />
          {errors.customerInfo?.dunNumber && (
            <S.ErrorMessage>{errors.customerInfo.dunNumber.message}</S.ErrorMessage>
          )}
        </S.InputGroup>
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
                    {...register("billingAddress.street", { required: "Street is required" })}
                    $error={!!errors.billingAddress?.street}
                  />
                  {errors.billingAddress?.street && (
                    <S.ErrorMessage>{errors.billingAddress.street.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="billingZipCode">ZIP Code</S.Label>
                  <S.Input
                    id="billingZipCode"
                    {...register("billingAddress.zipCode", { required: "ZIP code is required" })}
                    $error={!!errors.billingAddress?.zipCode}
                  />
                  {errors.billingAddress?.zipCode && (
                    <S.ErrorMessage>{errors.billingAddress.zipCode.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="billingCity">City</S.Label>
                  <S.Input
                    id="billingCity"
                    {...register("billingAddress.city", { required: "City is required" })}
                    $error={!!errors.billingAddress?.city}
                  />
                  {errors.billingAddress?.city && <S.ErrorMessage>{errors.billingAddress.city.message}</S.ErrorMessage>}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="billingState">State</S.Label>
                  <S.Input
                    id="billingState"
                    {...register("billingAddress.state", { required: "State is required" })}
                    $error={!!errors.billingAddress?.state}
                  />
                  {errors.billingAddress?.state && (
                    <S.ErrorMessage>{errors.billingAddress.state.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="billingCounty">County</S.Label>
                  <S.Input
                    id="billingCounty"
                    {...register("billingAddress.county", { required: "County is required" })}
                    $error={!!errors.billingAddress?.county}
                  />
                  {errors.billingAddress?.county && (
                    <S.ErrorMessage>{errors.billingAddress.county.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="billingCountry">Country</S.Label>
                  <S.Input
                    id="billingCountry"
                    {...register("billingAddress.country", { required: "Country is required" })}
                    $error={!!errors.billingAddress?.country}
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
                    {...register("shippingAddress.street", { required: "Street is required" })}
                    $error={!!errors.shippingAddress?.street}
                  />
                  {errors.shippingAddress?.street && (
                    <S.ErrorMessage>{errors.shippingAddress.street.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="shippingZipCode">ZIP Code</S.Label>
                  <S.Input
                    id="shippingZipCode"
                    {...register("shippingAddress.zipCode", { required: "ZIP code is required" })}
                    $error={!!errors.shippingAddress?.zipCode}
                  />
                  {errors.shippingAddress?.zipCode && (
                    <S.ErrorMessage>{errors.shippingAddress.zipCode.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="shippingCity">City</S.Label>
                  <S.Input
                    id="shippingCity"
                    {...register("shippingAddress.city", { required: "City is required" })}
                    $error={!!errors.shippingAddress?.city}
                  />
                  {errors.shippingAddress?.city && (
                    <S.ErrorMessage>{errors.shippingAddress.city.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="shippingState">State</S.Label>
                  <S.Input
                    id="shippingState"
                    {...register("shippingAddress.state", { required: "State is required" })}
                    $error={!!errors.shippingAddress?.state}
                  />
                  {errors.shippingAddress?.state && (
                    <S.ErrorMessage>{errors.shippingAddress.state.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="shippingCounty">County</S.Label>
                  <S.Input
                    id="shippingCounty"
                    {...register("shippingAddress.county", { required: "County is required" })}
                    $error={!!errors.shippingAddress?.county}
                  />
                  {errors.shippingAddress?.county && (
                    <S.ErrorMessage>{errors.shippingAddress.county.message}</S.ErrorMessage>
                  )}
                </S.InputGroup>
                <S.InputGroup>
                  <S.Label htmlFor="shippingCountry">Country</S.Label>
                  <S.Input
                    id="shippingCountry"
                    {...register("shippingAddress.country", { required: "Country is required" })}
                    $error={!!errors.shippingAddress?.country}
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
                  {...register("apContact.firstName", { required: "First name is required" })}
                  $error={!!errors.apContact?.firstName}
                />
                {errors.apContact?.firstName && <S.ErrorMessage>{errors.apContact.firstName.message}</S.ErrorMessage>}
              </S.InputGroup>
              <S.InputGroup>
                <S.Label htmlFor="apLastName">AP Contact Last Name</S.Label>
                <S.Input
                  id="apLastName"
                  {...register("apContact.lastName", { required: "Last name is required" })}
                  $error={!!errors.apContact?.lastName}
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
                  $error={!!errors.apContact?.email}
                />
                {errors.apContact?.email && <S.ErrorMessage>{errors.apContact.email.message}</S.ErrorMessage>}
              </S.InputGroup>
              <S.InputGroup>
                <S.Label htmlFor="apCountryCode">AP Contact Country Code</S.Label>
                <S.Input
                  id="apCountryCode"
                  {...register("apContact.countryCode", { required: "Country code is required" })}
                  $error={!!errors.apContact?.countryCode}
                />
                {errors.apContact?.countryCode && (
                  <S.ErrorMessage>{errors.apContact.countryCode.message}</S.ErrorMessage>
                )}
              </S.InputGroup>
              <S.InputGroup>
                <S.Label htmlFor="apContactNumber">AP Contact Number</S.Label>
                <S.Input
                  id="apContactNumber"
                  {...register("apContact.contactNumber", { required: "Contact number is required" })}
                  $error={!!errors.apContact?.contactNumber}
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
                  {...register("buyerInfo.firstName", { required: "First name is required" })}
                  $error={!!errors.buyerInfo?.firstName}
                />
                {errors.buyerInfo?.firstName && <S.ErrorMessage>{errors.buyerInfo.firstName.message}</S.ErrorMessage>}
              </S.InputGroup>
              <S.InputGroup>
                <S.Label htmlFor="buyerLastName">Buyer Last Name</S.Label>
                <S.Input
                  id="buyerLastName"
                  {...register("buyerInfo.lastName", { required: "Last name is required" })}
                  $error={!!errors.buyerInfo?.lastName}
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
                  $error={!!errors.buyerInfo?.email}
                />
                {errors.buyerInfo?.email && <S.ErrorMessage>{errors.buyerInfo.email.message}</S.ErrorMessage>}
              </S.InputGroup>
              <S.InputGroup>
                <S.Label htmlFor="buyerNumber">Buyer Number</S.Label>
                <S.Input
                  id="buyerNumber"
                  {...register("buyerInfo.buyerNumber", { required: "Buyer number is required" })}
                  $error={!!errors.buyerInfo?.buyerNumber}
                />
                {errors.buyerInfo?.buyerNumber && (
                  <S.ErrorMessage>{errors.buyerInfo.buyerNumber.message}</S.ErrorMessage>
                )}
              </S.InputGroup>
              <S.InputGroup>
                <S.Label htmlFor="buyerCountryCode">Buyer Country Code</S.Label>
                <S.Input
                  id="buyerCountryCode"
                  {...register("buyerInfo.countryCode", { required: "Country code is required" })}
                  $error={!!errors.buyerInfo?.countryCode}
                />
                {errors.buyerInfo?.countryCode && (
                  <S.ErrorMessage>{errors.buyerInfo.countryCode.message}</S.ErrorMessage>
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
              Previous
            </S.Button>
          )}
          {currentStep < totalSteps ? (
            <S.Button type="button" onClick={nextStep} variant="primary">
              Next
            </S.Button>
          ) : (
            <S.Button type="submit" variant="primary">
              Submit
            </S.Button>
          )}
        </S.ButtonGroup>
      </form>
    </S.FormContainer>
  </S.ContainerMain>
  )
}

