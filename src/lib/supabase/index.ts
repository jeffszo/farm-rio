import * as auth from "./auth"
import * as forms from "./forms"
import * as validations from "./validations"
import * as queries from "./queries"
import * as storage from "./storage"
import type { AuthAPI, User } from "../../types/api"
import { supabaseServerClient } from "./client"

// Create a class that implements the AuthAPI interface
class SupabaseAPI implements AuthAPI {
  // Implementation for getCurrentUser
  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabaseServerClient.auth.getUser()
    if (error || !data?.user) return null
    // Map supabase user to your User type if needed
    return {
      id: data.user.id,
      email: data.user.email ?? "",
      name: data.user.user_metadata?.name ?? "",
      userType: data.user.user_metadata?.userType ?? "",
      // Add other fields as needed
    }
  }

  // Auth methods
  signUp = auth.signUp
  signIn = auth.signIn
  signOut = auth.signOut
  getCurrentUserServer = auth.getCurrentUserServer

  // Form methods
  submitForm = forms.submitForm
  getFormStatus = forms.getFormStatus
  updateForm = forms.updateForm

  // Validation methods
  validateTaxCustomer = validations.validateTaxCustomer
  validateWholesaleCustomer = validations.validateWholesaleCustomer
  validateCreditCustomer = validations.validateCreditCustomer
  validateCSCInitialCustomer = validations.validateCSCInitialCustomer
  validateCSCFinalCustomer = validations.validateCSCFinalCustomer
  requestReview = validations.requestReview 

  // Query methods
  getPendingWholesaleValidations = queries.getPendingWholesaleValidations
  getPendingCreditValidations = queries.getPendingCreditValidations
  getInvoicingCompanies = queries.getInvoicingCompanies
  getWarehousesByCompany = queries.getWarehousesByCompany
  getApprovedCustomers = queries.getApprovedCustomers
  getCustomerValidationDetails = queries.getCustomerValidationDetails
  getPendingTaxValidations = queries.getPendingTaxValidations
  getPendingCSCValidations = queries.getPendingCSCValidations
  getCustomerFormById   = queries.getCustomerFormById
  getFeedbackTeams = queries.getFeedbackTeams  
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
export { supabaseServerClient }
