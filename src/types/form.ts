export interface IFormInputs {
  customerInfo?: {
    legalName?: string
    taxId?: string
    dunNumber?: string
    dba?: string
  }
  billingAddress?: Array<{
    street?: string
    zipCode?: string
    city?: string
    state?: string
    county?: string
    country?: string
  }>
  shippingAddress?: Array<{
    street?: string
    zipCode?: string
    city?: string
    state?: string
    county?: string
    country?: string
  }>
  apContact?: {
    firstName?: string
    lastName?: string
    email?: string
    countryCode?: string
    contactNumber?: string
  }
  buyerInfo?: {
    firstName?: string
    lastName?: string
    email?: string
    countryCode?: string
    buyerNumber?: string
  }
}
