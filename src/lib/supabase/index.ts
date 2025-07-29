import * as auth from "./auth"
import * as forms from "./forms"
import * as validations from "./validations"
import * as queries from "./queries"
import * as storage from "./storage"
import { supabase } from "./client"
import type { AuthAPI } from "../../types/api"

// Create a class that implements the AuthAPI interface
class SupabaseAPI implements AuthAPI {
  // Auth methods
  signUp = auth.signUp
  signIn = auth.signIn
  signOut = auth.signOut
  getCurrentUser = auth.getCurrentUser
  getCurrentUserClient = auth.getCurrentUserClient

  // Form methods
  submitForm = forms.submitForm
  getFormStatus = forms.getFormStatus
  getCustomerFormById = forms.getCustomerFormById
  updateForm = forms.updateForm

  // Validation methods
  validateTaxCustomer = validations.validateTaxCustomer
  validateWholesaleCustomer = validations.validateWholesaleCustomer
  validateCreditCustomer = validations.validateCreditCustomer
  validateCSCInitialCustomer = validations.validateCSCInitialCustomer
  validateCSCFinalCustomer = validations.validateCSCFinalCustomer
  reviewCustomer = validations.reviewCustomer

  // Query methods
  getPendingWholesaleValidations = queries.getPendingWholesaleValidations
  getPendingCreditValidations = queries.getPendingCreditValidations
  getInvoicingCompanies = queries.getInvoicingCompanies
  getWarehousesByCompany = queries.getWarehousesByCompany
  getApprovedCustomers = queries.getApprovedCustomers
  getCustomerValidationDetails = queries.getCustomerValidationDetails
  getPendingTaxValidations = queries.getPendingTaxValidations
  getPendingCSCValidations = queries.getPendingCSCValidations
  getCustomerFormById  = queries.getCustomerFormById 
  resetFormStatus = queries.resetFormStatus
  
  

  uploadResaleCertificate = storage.uploadResaleCertificate
  uploadImage = storage.uploadImage
  uploadFinancialStatements = storage.uploadFinancialStatements

  // update DUNS
  updateDunsNumber = queries.updateDunsNumber
}

// Export the API instance
export const api = new SupabaseAPI()

// Also export the raw supabase client for direct access if needed
export { supabase }

