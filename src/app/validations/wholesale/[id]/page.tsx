"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/supabase/index";
import { CircleCheck } from "lucide-react";
import * as S from "./styles";
import {
  User,
  MapPin,
  Mail,
  Building2,
  Warehouse,
  CreditCard,
  Calendar,
  DollarSign,
  Percent,
  Pencil,
  Check,
  X,
} from "lucide-react";

// Interface definition for a single address (AddressDetail)
interface AddressDetail {
  street?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  county?: string;
  country?: string;
  // Add other address properties if they exist
  // Add possible variations of key names that might come from the backend
  street_name?: string; // Example of variation
  address_city?: string; // Example of variation
  state_province?: string; // Example of variation
  zip_code?: string; // Example of variation
  postal_code?: string; // Example of variation
  address_county?: string; // Example of variation
  suburb?: string; // Example of variation
  address_country?: string; // Example of variation
}

// Updated CustomerForm interface to reflect that addresses are arrays of objects
interface CustomerForm {
  id: string;
  customer_name: string;
  sales_tax_id: string;
  duns_number: string;
  dba_number: string;
  resale_certificate: string;
  billing_address: AddressDetail[]; // Updated to AddressDetail[]
  shipping_address: AddressDetail[]; // Updated to AddressDetail[]
  ap_contact_name: string;
  ap_contact_email: string;
  buyer_name: string;
  buyer_email: string;
  status: string;
  created_at: string;
  atacado_invoicing_company?: string;
  atacado_warehouse?: string;
  atacado_currency?: string;
  atacado_terms?: string;
  atacado_credit?: number;
  atacado_discount?: number;
}

type WholesaleTerms = {
  wholesale_invoicing_company: string;
  wholesale_warehouse: string;
  wholesale_currency: string;
  wholesale_terms: string;
  wholesale_credit: number;
  wholesale_discount: number;
};

const INVOICING_COMPANIES = [
  "Plantage Rio Inc - United States",
  "Soma Brands International - European Union",
  "Soma Brands UK Limited - United Kingdom",
  "Soma Brands France - France",
];

const CURRENCIES = ["USD", "EUR", "GBP"];

const PAYMENT_TERMS = [
  "100% Prior Ship",
  "Net 45 Days",
  "Net 30 Days",
  "Net 90 Days",
  "Net 15 Days",
];

// Helper function to format an address object into a single string
const formatAddress = (address: AddressDetail): string => {
  const parts = [];

  // Check for defined keys in the interface and also common variations
  // Based on your console.log, keys are in camelCase.
  const street = address.street || address.street_name || '';
  const city = address.city || address.address_city || '';
  const state = address.state || address.state_province || '';
  const zipCode = address.zipCode || address.zip_code || address.postal_code || '';
  const county = address.county || address.address_county || address.suburb || '';
  const country = address.country || address.address_country || '';

  if (street) parts.push(street);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  if (county) parts.push(county);
  if (country) parts.push(country);

  return parts.join(', ') || 'Not provided';
};

export default function ValidationDetailsPage() {
  const { id } = useParams();
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const router = useRouter();
  const [newDuns, setNewDuns] = useState("");
  const [editingDuns, setEditingDuns] = useState(false);
  const [savingDuns, setSavingDuns] = useState(false);

  useEffect(() => {
    if (customerForm?.duns_number) {
      setNewDuns(customerForm.duns_number);
    }
  }, [customerForm]);

  const [terms, setTerms] = useState<WholesaleTerms>({
    wholesale_invoicing_company: "",
    wholesale_warehouse: "",
    wholesale_currency: "",
    wholesale_terms: "",
    wholesale_credit: 0,
    wholesale_discount: 0,
  });

  const [warehouses, setWarehouses] = useState<string[]>([]);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getCustomerFormById(id as string);
        console.log("ID received:", id);
        console.log("RAW form data (before processing):", data);

        if (!data) throw new Error("Form not found.");

        // Function to process and ensure address data are arrays of objects
        const processAddressArray = (addrData: unknown): AddressDetail[] => {
          if (!addrData) return []; // Return empty array if no data

          // If it's a single JSON string (scenario from your console.log)
          if (typeof addrData === 'string') {
              try {
                  const parsed = JSON.parse(addrData);
                  // If the parsed JSON is an array, return it; otherwise, wrap the object in an array
                  return Array.isArray(parsed) ? parsed : [parsed];
              } catch (e) {
                  console.error("Error parsing address string JSON:", e);
                  return []; // Return empty array in case of parsing error
              }
          }
          // If it's already an array, iterate over it to ensure all items are objects
          if (Array.isArray(addrData)) {
              return addrData.map(item => {
                  if (typeof item === 'string') {
                      try {
                          return JSON.parse(item);
                      } catch (e) {
                          console.error("Error parsing address item in array:", e);
                          return {}; // Return empty object if an item fails parsing
                      }
                  }
                  return item; // Item is already an object
              });
          }
          // If it's a single object (not a string and not an array), wrap it in an array
          return [addrData];
        };

        const processedData: CustomerForm = {
          ...data,
          // Apply the processing function for billing_address and shipping_address
          billing_address: processAddressArray(data.billing_address),
          shipping_address: processAddressArray(data.shipping_address),
        };

        setCustomerForm(processedData);
        // Log processed address data for debugging
        console.log("Processed Billing Addresses (after parse):", processedData.billing_address);
        console.log("Processed Shipping Addresses (after parse):", processedData.shipping_address);

      } catch (err) {
        console.error("Error fetching customer details:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomerDetails();
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchUser = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        if (!currentUser) return;
        // setUser({ email: currentUser.email, role: currentUser.userType });
      } catch (err) {
        console.error("Error getting user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!terms.wholesale_invoicing_company) {
        setWarehouses([]);
        return;
      }

      try {
        const warehouses = await api.getWarehousesByCompany(
          terms.wholesale_invoicing_company
        );
        setWarehouses(
          warehouses.map((warehouse: { name: string }) => warehouse.name)
        );
      } catch (err) {
        console.error("Error fetching warehouses:", err);
        setWarehouses([]);
      }
    };

    fetchWarehouses();
  }, [terms.wholesale_invoicing_company]);

  const handleTermChange = (
    field: keyof WholesaleTerms,
    value: string | number
  ) => {
    if (field === "wholesale_credit" || field === "wholesale_discount") {
      const numericValue = value === "" ? 0 : Number(value);

      if (isNaN(numericValue)) return;

      setTerms((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setTerms((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleApproval = async (approved: boolean) => {
    console.log("Starting handleApproval. approved =", approved);

    // 🚫 REMOVED: authenticated user check

    try {
      setLoading(true);
      console.log("Loading true");

      if (approved) {
        // Specific validations for approval
        const requiredFields: (keyof WholesaleTerms)[] = [
          "wholesale_invoicing_company",
          "wholesale_warehouse",
          "wholesale_currency",
          "wholesale_terms",
        ];
        const missingFields = requiredFields.filter((field) => !terms[field]);
        if (missingFields.length > 0) {
          throw new Error(
            `⚠️ Please fill in all required fields: ${missingFields.join(", ")}`
          );
        }
        if (terms.wholesale_credit < 0 || terms.wholesale_discount < 0) {
          throw new Error("⚠️ Credit limit and discount must be non-negative!");
        }
      }

      console.log("Calling validateWholesaleCustomer");
      await api.validateWholesaleCustomer(id as string, approved, {
        wholesale_invoicing_company: terms.wholesale_invoicing_company,
        wholesale_warehouse: terms.wholesale_warehouse,
        wholesale_currency: terms.wholesale_currency,
        wholesale_terms: terms.wholesale_terms,
        wholesale_credit: terms.wholesale_credit,
        wholesale_discount: terms.wholesale_discount,
      });

      console.log("Validation completed successfully");

      if (customerForm) {
        setCustomerForm({
          ...customerForm,
          status: approved ? "approved" : "rejected",
        });
      }

      setModalContent({
        title: "Success!",
        description: approved
          ? "Client approved! Forwarded to the credit team."
          : "Customer rejected!",
      });
      setShowModal(true);
      console.log("Success modal displayed");
    } catch (err) {
      console.error("Error validating customer:", err);
      setModalContent({
        title: "Error!",
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDuns = async () => {
    try {
      setSavingDuns(true);
      await api.updateDunsNumber(id as string, newDuns);

      // Update the local state to reflect the change
      if (customerForm) {
        setCustomerForm({
          ...customerForm,
          duns_number: newDuns,
        });
      }

      setEditingDuns(false);
    } catch (error) {
      console.error("Error updating DUNS number:", error);
      // Optionally show an error message to the user
    } finally {
      setSavingDuns(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original value and exit edit mode
    if (customerForm) {
      setNewDuns(customerForm.duns_number || "");
    }
    setEditingDuns(false);
  };

  const closeModal = () => {
    setShowModal(false);
    router.push("/validations/wholesale");
  };

  if (loading) return <S.Message>Loading...</S.Message>;
  if (error) return <S.Message>Error: {error}</S.Message>;
  if (!customerForm) return <S.Message>Form not found.</S.Message>;

  return (
    <S.ContainerMain>
      <S.Container>
        <S.Header>
          <S.Title>Customer Details</S.Title>
          <S.StatusBadge status={customerForm.status}>
            {customerForm.status}
          </S.StatusBadge>
        </S.Header>
        <S.FormDetails>
          <S.FormSection>
            <S.SectionTitle>
              <User size={16} /> Customer Information
            </S.SectionTitle>
            <S.FormRow>
              <strong>Name:</strong> {customerForm.customer_name}
            </S.FormRow>
            <S.FormRow>
              <strong>Tax ID:</strong> {customerForm.sales_tax_id}
            </S.FormRow>
            <S.FormRow>
              <strong>DBA:</strong> {customerForm.dba_number || "Not provided"}
            </S.FormRow>
            <S.FormRow className="flex items-center">
              <strong>D-U-N-S:</strong>{" "}
              {editingDuns ? (
                <S.InlineEditWrapper>
                  <S.SmallInput
                    type="text"
                    value={newDuns}
                    onChange={(e) => setNewDuns(e.target.value)}
                    disabled={savingDuns}
                    autoFocus
                  />
                  <S.ContainerCheck>
                    <S.CheckButton
                      onClick={handleSaveDuns}
                      disabled={savingDuns}
                      title="Save"
                    >
                      <Check size={16} />
                    </S.CheckButton>
                    <S.CancelButton
                      onClick={handleCancelEdit}
                      disabled={savingDuns}
                      title="Cancel"
                    >
                      <X size={16} />
                    </S.CancelButton>
                  </S.ContainerCheck>
                </S.InlineEditWrapper>
              ) : (
                <span className="flex items-center ml-1">
                  {customerForm.duns_number || "Not provided"}
                  <S.EditIcon onClick={() => setEditingDuns(true)}>
                    <Pencil size={16} />
                  </S.EditIcon>
                </span>
              )}
            </S.FormRow>
            <S.FormRow>
              <strong>Resale Certificate:</strong>{" "}
              {customerForm.resale_certificate ? (
                <a
                  href={customerForm.resale_certificate}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View PDF
                </a>
              ) : (
                "Not sent"
              )}
            </S.FormRow>
          </S.FormSection>
          <S.FormSection>
            <S.SectionTitle>
              <MapPin size={16} /> Addresses
            </S.SectionTitle>
            <S.FormRow>
              <strong>Billing Addresses:</strong>
              {customerForm.billing_address && customerForm.billing_address.length > 0 ? (
                customerForm.billing_address.map((address, index) => (
                  <S.AddressBlock key={index}>
                    <S.AddressTitle>Address {index + 1}</S.AddressTitle>
                    <div>{formatAddress(address)}</div>
                  </S.AddressBlock>
                ))
              ) : (
                <div>No billing addresses provided.</div>
              )}
            </S.FormRow>
            <S.FormRow>
              <strong>Shipping Addresses:</strong>
              {customerForm.shipping_address && customerForm.shipping_address.length > 0 ? (
                customerForm.shipping_address.map((address, index) => (
                  <S.AddressBlock key={index}>
                    <S.AddressTitle>Address {index + 1}</S.AddressTitle>
                    <div>{formatAddress(address)}</div>
                  </S.AddressBlock>
                ))
              ) : (
                <div>No shipping addresses provided.</div>
              )}
            </S.FormRow>
          </S.FormSection>
          <S.FormSection>
            <S.SectionTitle>
              <Mail size={16} /> Contacts
            </S.SectionTitle>
            <S.FormRow>
              <strong>AP Contact:</strong> {customerForm.ap_contact_name}
            </S.FormRow>
            <S.FormRow>
              <strong>AP Email:</strong> {customerForm.ap_contact_email}
            </S.FormRow>
            <S.FormRow>
              <strong>Buyer:</strong> {customerForm.buyer_name}
            </S.FormRow>
            <S.FormRow>
              <strong>Buyer Email:</strong> {customerForm.buyer_email}
            </S.FormRow>
          </S.FormSection>
        </S.FormDetails>

        <S.TermsContainer>
          <S.TermsTitle>Validation Terms (Wholesale Team)</S.TermsTitle>
          <S.TermsGrid>
            <S.TermsSection>
              <label>
                <Building2 size={16} /> Invoicing Company
              </label>
              <S.Select
                value={terms.wholesale_invoicing_company}
                onChange={(e) =>
                  handleTermChange(
                    "wholesale_invoicing_company",
                    e.target.value
                  )
                }
              >
                <option value="">Select company</option>
                {INVOICING_COMPANIES.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </S.Select>
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <Warehouse size={16} /> Warehouse
              </label>
              <S.Select
                value={terms.wholesale_warehouse}
                onChange={(e) =>
                  handleTermChange("wholesale_warehouse", e.target.value)
                }
                disabled={!terms.wholesale_invoicing_company}
              >
                <option value="">Select warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </S.Select>
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <CreditCard size={16} /> Currency
              </label>
              <S.Select
                value={terms.wholesale_currency}
                onChange={(e) =>
                  handleTermChange("wholesale_currency", e.target.value)
                }
              >
                <option value="">Select currency</option>
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </S.Select>
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <Calendar size={16} /> Payment Terms
              </label>
              <S.Select
                value={terms.wholesale_terms}
                onChange={(e) =>
                  handleTermChange("wholesale_terms", e.target.value)
                }
              >
                <option value="">Select terms</option>
                {PAYMENT_TERMS.map((term, index) => (
                  <option key={`${term}-${index}`} value={term}>
                    {term}
                  </option>
                ))}
              </S.Select>
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <DollarSign size={16} /> Credit Limit
              </label>
              <S.NumericInput
                value={terms.wholesale_credit}
                onChange={(e) =>
                  handleTermChange("wholesale_credit", e.target.value)
                }
                min="0"
                step="0.01"
              />
            </S.TermsSection>

            <S.TermsSection>
              <label>
                <Percent size={16} /> Discount
              </label>
              <S.NumericInput
                value={terms.wholesale_discount}
                onChange={(e) =>
                  handleTermChange("wholesale_discount", e.target.value)
                }
                min="0"
                max="100"
                step="0.1"
              />
            </S.TermsSection>
          </S.TermsGrid>
        </S.TermsContainer>

        <S.ButtonContainer>
          <S.Button onClick={() => handleApproval(false)} variant="secondary">
            Reject
          </S.Button>

          <S.Button
            variant="primary"
            onClick={() => {
              console.log("Click detected!")
              handleApproval(true)
            }}
          >
            Approve
          </S.Button>
        </S.ButtonContainer>


        {showModal && (
          <S.Modal>
            <S.ModalContent>
              <S.ModalTitle>
                <CircleCheck size={48} />
              </S.ModalTitle>
              <S.ModalDescription>
                {modalContent.description}
              </S.ModalDescription>
              <S.ModalButton onClick={closeModal}>Ok</S.ModalButton>
            </S.ModalContent>
          </S.Modal>
        )}
      </S.Container>
    </S.ContainerMain>
  );
}