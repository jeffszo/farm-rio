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
    // Novos campos adicionados
    terms: string; // Ex: 'Net 30', 'COD', etc.
    currency: string; // Ex: 'USD', 'EUR', 'BRL'
    estimatedPurchaseAmount: number; // Valor numérico
}

export interface IFormInputs {
    customerInfo: CustomerInfo;
    billingAddress: AddressInput[];
    shippingAddress: AddressInput[];
    apContact: ApContactInfo;
    buyerInfo: BuyerInfo;
    photoUrls?: string[];
    brandingMix?: string;
    instagram?: string;
    website?: string;
}