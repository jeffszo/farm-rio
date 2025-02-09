// export Interfaces for form data (unchanged)
export interface ICustomerInfo {
  legalName: string
  dba: string
  taxId: string
  resaleCertNumber: string
  dunNumber: string
}

export interface IAddress {
  street: string
  zipCode: string
  city: string
  state: string
  county: string
  country: string
}

export interface IShippingInfo extends IAddress {
  freightForwarder: string
  shippingAccountNumber: string
}

export interface IAPContact {
  firstName: string
  lastName: string
  email: string
  countryCode: string
  contactNumber: string
}

export interface IBuyerInfo {
  firstName: string
  lastName: string
  email: string
  buyerNumber: string
  countryCode: string
}

export interface ITermsConditions {
  warehouse: string
  invoicingCompany: string
  currency: string
  terms: string
  discount: string
  credit: string
}

export interface IFormInputs {
  customerInfo: ICustomerInfo
  billingAddress: IAddress
  shippingAddress: IShippingInfo
  apContact: IAPContact
  buyerInfo: IBuyerInfo
  wholesaleTerms?: ITermsConditions
  creditTerms?: ITermsConditions
}