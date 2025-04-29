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

  // Form methods
  submitForm = forms.submitForm
  getFormStatus = forms.getFormStatus
  getCustomerFormById = forms.getCustomerFormById

  // Validation methods
  validateCustomer = validations.validateCustomer
  validateWholesaleCustomer = validations.validateWholesaleCustomer
  validateCreditCustomer = validations.validateCreditCustomer
  validateCSCCustomer = validations.validateCSCCustomer
  finishCustomer = validations.finishCustomer

  // Query methods
  getPendingValidations = queries.getPendingValidations
  getPendingCreditValidations = queries.getPendingCreditValidations
  getPendingCSCValidations = queries.getPendingCSCValidations
  getInvoicingCompanies = queries.getInvoicingCompanies
  getWarehousesByCompany = queries.getWarehousesByCompany
  getApprovedCustomers = queries.getApprovedCustomers
  getCustomerValidationDetails = queries.getCustomerValidationDetails
  

  uploadResaleCertificate = storage.uploadResaleCertificate

  // update DUNS
  updateDunsNumber = queries.updateDunsNumber
}

// Export the API instance
export const api = new SupabaseAPI()

// Also export the raw supabase client for direct access if needed
export { supabase }

