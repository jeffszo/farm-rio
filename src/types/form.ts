// types/form.ts
export interface AddressInput {
    street: string;
    zipCode: string;
    city: string;
    state: string;
    county: string;
    country: string;
}

export interface CustomerInfo {
    legalName: string;
    taxId: string;
    dunNumber: string;
    dba?: string | null;
}

export interface ApContactInfo {
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    contactNumber: string;
}

export interface BuyerInfo {
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    buyerNumber: string;
}

export interface IFormInputs {
    customerInfo: CustomerInfo;
    billingAddress: AddressInput[]; // AGORA É UM ARRAY DE AddressInput
    shippingAddress: AddressInput[]; // AGORA É UM ARRAY DE AddressInput
    apContact: ApContactInfo;
    buyerInfo: BuyerInfo;
    // Não é necessário resale_certificate aqui, pois é um File ou string de URL
    // e é tratado separadamente no onSubmit.
}