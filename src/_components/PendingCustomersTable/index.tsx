"use client"

import { useState, useMemo } from "react"
import { Users, ChevronLeft, ChevronRight, Download, Filter } from "lucide-react"
import * as S from "./styles"
import { useMediaQuery } from "react-responsive"
import * as XLSX from "xlsx"
import { usePathname } from "next/navigation"
import { api } from "../../lib/supabase/index"

interface Customer {
  id: string
  customer_name: string
  status: string
  created_at: string
  currency: string
  dba_number: string
}

interface Props {
  customers: Customer[]
  totalCount: number
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
  onViewDetails: (id: string) => void
}

export default function PendingCustomersTable({
  customers,
  totalCount,
  currentPage,
  totalPages,
  setCurrentPage,
  onViewDetails,
}: Props) {
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const pathname = usePathname()
  const isCSCValidationsRoute = pathname?.includes("/validations/csc")
  const isWholesaleRoute = pathname?.includes("/validations/wholesale")
  const isTaxRoute = pathname?.includes("/validations/tax")
  const isCreditRoute = pathname?.includes("/validations/credit")

  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCurrency, setFilterCurrency] = useState<string>("ALL")
  const [loadingCustomerId, setLoadingCustomerId] = useState<string | null>(null)

  const uniqueCurrencies = useMemo(() => {
    const currencies = new Set(customers.map((c) => c.currency))
    return ["ALL", ...Array.from(currencies)]
  }, [customers])

  const filteredCustomers = useMemo(() => {
    let filtered = customers

    const statusMap = {
      pending: "pending",
      reviewRequestedByWholesale: "review requested by the wholesale team",
      reviewRequestedByTax: "review requested by the tax team",
      reviewRequestedByCredit: "review requested by the credit team",
      reviewRequestedByCSC: "review requested by the csc initial team",
      approvedByWholesale: "approved by the wholesale team",
      approvedByCredit: "approved by the credit team",
      approvedByTax: "approved by the tax team",
      approvedByCSC: "approved by the csc final team",
      approvedByCSCInitial: "approved by the csc initial team",
      finished: "finished",
      reviewRequestedByTaxCustomer: "review requested by the tax team - customer",
      reviewRequestedByWholesaleCustomer: "review requested by the wholesale team - customer",
      reviewRequestedByCreditCustomer: "review requested by the credit team - customer",
      reviewRequestedByCSCInitialCustomer: "review requested by the csc initial team - customer",
      reviewRequestedByCSCFinalCustomer: "review requested by the csc final team - customer",
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((customer) => customer.status === statusMap[filterStatus as keyof typeof statusMap])
    }

    if (filterCurrency !== "ALL") {
      filtered = filtered.filter((customer) => customer.currency === filterCurrency)
    }

    return filtered
  }, [customers, filterStatus, filterCurrency])

  const handleViewDetails = (id: string) => {
    setLoadingCustomerId(id)
    onViewDetails(id)
  }

  const downloadFile = (data: Blob, filename: string) => {
    const url = window.URL.createObjectURL(data)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const exportToExcel = async () => {
    try {
      const result = await api.getApprovedCustomers()
      console.log("Dados da API:", result)

      const customers = Array.isArray(result)
        ? result.filter(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              "id" in item &&
              "customer_name" in item &&
              "status" in item &&
              "created_at" in item,
          )
        : []

      const approvedCustomers = customers.filter((customer) => customer.status.trim().toLowerCase() === "finished")

      if (approvedCustomers.length === 0) {
        console.warn("No customers approved for export!")
        alert("No approved customers found for export.")
        return
      }

      const processedCustomers = approvedCustomers.map((customer) => {
        const newCustomer: Record<string, unknown> = { ...customer }

        try {
          const shippingAddresses = JSON.parse(newCustomer.shipping_address as string)
          delete newCustomer.shipping_address
          if (Array.isArray(shippingAddresses)) {
            shippingAddresses.forEach((address, index) => {
              if (address && Object.keys(address).length > 0) {
                const fullAddress = [address.street, address.city, address.state, address.zipCode, address.country]
                  .filter(Boolean)
                  .join(", ")
                newCustomer[`shipping_address_${index + 1}`] = fullAddress
              }
            })
          }
        } catch (e) {
          console.error("Failed to parse shipping_address JSON:", e)
          newCustomer.shipping_address = newCustomer.shipping_address
        }

        try {
          const billingAddresses = JSON.parse(newCustomer.billing_address as string)
          delete newCustomer.billing_address
          if (Array.isArray(billingAddresses)) {
            billingAddresses.forEach((address, index) => {
              if (address && Object.keys(address).length > 0) {
                const fullAddress = [address.street, address.city, address.state, address.zipCode, address.country]
                  .filter(Boolean)
                  .join(", ")
                newCustomer[`billing_address_${index + 1}`] = fullAddress
              }
            })
          }
        } catch (e) {
          console.error("Failed to parse billing_address JSON:", e)
          newCustomer.billing_address = newCustomer.billing_address
        }

        return newCustomer
      })

      const worksheet = XLSX.utils.json_to_sheet(processedCustomers)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Customers")

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      downloadFile(data, "approved_customers.xlsx")
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      alert("Error exporting data to Excel. Please try again.")
    }
  }

  return (
    <S.Container>
      <S.TitleWrapper>
        <S.TitleContainer>
          <Users size={24} />
          <S.Title>Customers</S.Title>
        </S.TitleContainer>


      </S.TitleWrapper>

      {!isMobile ? (
        <>
          <S.TableFilterContainer>
            <S.FilterGroup>
              <S.FilterTitle>
                <Filter size={16} />
                Filter by status:
              </S.FilterTitle>
              <S.TableFilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All status</option>
                {isWholesaleRoute ? (
                  <>
                    <option value="pending">Pending</option>
                    <option value="reviewRequestedByWholesaleCustomer">
                      Review requested by the wholesale team - customer
                    </option>
                  </>
                ) : isTaxRoute ? (
                  <>
                    <option value="reviewRequestedByTaxCustomer">Review requested by the tax team - customer</option>
                    <option value="approvedByCSCInitial">Approved by the csc initial team</option>
                  </>
                ) : isCreditRoute ? (
                  <>
                    <option value="approvedByTax">Approved by the tax team</option>

                    <option value="reviewRequestedByCreditCustomer">
                      Review requested by the credit team - customer
                    </option>
                  </>
                ) : (
                  <>
                    <option value="finished">Finished</option>
                    <option value="approvedByWholesale">Approved by the wholesale team</option>
                    <option value="approvedByCredit">Approved by the credit team</option>
                    <option value="reviewRequestedByCSCInitialCustomer">
                      Review requested by the csc initial team - customer
                    </option>
                    <option value="reviewRequestedByCSCFinalCustomer">
                      Review requested by the csc final team - customer
                    </option>
                  </>
                )}
              </S.TableFilterSelect>
            </S.FilterGroup>

            <S.FilterGroup>
              <S.FilterTitle>
                <Filter size={16} />
                Filter by currency:
              </S.FilterTitle>
              <S.TableFilterSelect value={filterCurrency} onChange={(e) => setFilterCurrency(e.target.value)}>
                {uniqueCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </S.TableFilterSelect>
            </S.FilterGroup>

                      <S.TotalClientsInfo>Total Clients: {totalCount}</S.TotalClientsInfo>
                              <S.ButtonAndTotalClientsWrapper>
          {isCSCValidationsRoute && (
            <S.Button onClick={exportToExcel}>
              <Download size={16} />
              Export Excel
            </S.Button>
          )}
        </S.ButtonAndTotalClientsWrapper>

          </S.TableFilterContainer>

          <S.TableScrollContainer>
            <S.Table>
              <thead>
                <tr>
                  <S.TableHeader>Status</S.TableHeader>
                  <S.TableHeader>DBA</S.TableHeader>
                  <S.TableHeader>Legal Name</S.TableHeader>
                  <S.TableHeader>Currency</S.TableHeader>
                  <S.TableHeader>Date Created</S.TableHeader>
                  <S.TableHeader>Action</S.TableHeader>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <S.TableRow key={customer.id}>
                      <S.TableData>
                        <S.StatusBadge status={customer.status}>{customer.status}</S.StatusBadge>
                      </S.TableData>
                      <S.TableData>{customer.dba_number}</S.TableData>
                      <S.TableData>{customer.customer_name}</S.TableData>
                      <S.TableData>{customer.currency}</S.TableData>
                      <S.TableData>
                        {new Date(customer.created_at).toLocaleString(navigator.language, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </S.TableData>
                      <S.TableData>
                        <S.Button
                          onClick={() => handleViewDetails(customer.id)}
                          disabled={loadingCustomerId === customer.id}
                          aria-label={`See details of ${customer.customer_name}`}
                        >
                          {loadingCustomerId === customer.id ? "Loading..." : "See details"}
                        </S.Button>
                      </S.TableData>
                    </S.TableRow>
                  ))
                ) : (
                  <S.EmptyTableRow>
                    <S.EmptyTableData colSpan={7}>
                      <S.EmptyStateMessage>No customers found with the selected filter.</S.EmptyStateMessage>
                    </S.EmptyTableData>
                  </S.EmptyTableRow>
                )}
              </tbody>
            </S.Table>
          </S.TableScrollContainer>
        </>
      ) : (
        <>
          <S.MobileFilterContainer>
            <S.FilterGroup>
              <S.FilterLabel>
                <Filter size={16} />
                Filter by status:
              </S.FilterLabel>
              <S.TableFilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All status</option>
                {isWholesaleRoute ? (
                  <>
                    <option value="pending">Pending</option>
                    <option value="reviewRequestedByWholesaleCustomer">
                      Review requested by the wholesale team - customer
                    </option>
                  </>
                ) : isTaxRoute ? (
                  <>
                    <option value="reviewRequestedByTaxCustomer">Review requested by the tax team - customer</option>
                    <option value="approvedByCSCInitial">Approved by the csc initial team</option>
                  </>
                ) : isCreditRoute ? (
                  <>
                    <option value="approvedByTax">Approved by the tax team</option>

                    <option value="reviewRequestedByCreditCustomer">
                      Review requested by the credit team - customer
                    </option>
                  </>
                ) : (
                  <>
                    <option value="finished">Finished</option>
                    <option value="approvedByWholesale">Approved by the wholesale team</option>
                    <option value="approvedByCredit">Approved by the credit team</option>
                    <option value="reviewRequestedByCSCInitialCustomer">
                      Review requested by the csc initial team - customer
                    </option>
                    <option value="reviewRequestedByCSCFinalCustomer">
                      Review requested by the csc final team - customer
                    </option>
                  </>
                )}
              </S.TableFilterSelect>
            </S.FilterGroup>
            <S.FilterGroup>
              <S.FilterLabel>
                <Filter size={16} />
                Filter by currency:
              </S.FilterLabel>
              <S.TableFilterSelect value={filterCurrency} onChange={(e) => setFilterCurrency(e.target.value)}>
                {uniqueCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </S.TableFilterSelect>
            </S.FilterGroup>
          </S.MobileFilterContainer>

          <S.MobileList>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <S.MobileListItem key={customer.id}>
                  <S.MobileListItemTitle>{customer.customer_name}</S.MobileListItemTitle>
                  <S.MobileListItemContent>
                    Status: <S.StatusBadge status={customer.status}>{customer.status}</S.StatusBadge>
                  </S.MobileListItemContent>
                  <S.MobileListItemContent>Currency: {customer.currency}</S.MobileListItemContent>
                  <S.MobileListItemContent>DBA: {customer.dba_number}</S.MobileListItemContent>
                  <S.MobileListItemContent>
                    Date:{" "}
                    {new Date(customer.created_at).toLocaleString(navigator.language, {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </S.MobileListItemContent>
                  <S.Button
                    onClick={() => handleViewDetails(customer.id)}
                    disabled={loadingCustomerId === customer.id}
                    aria-label={`See details of ${customer.customer_name}`}
                  >
                    {loadingCustomerId === customer.id ? "Loading..." : "See details"}
                  </S.Button>
                </S.MobileListItem>
              ))
            ) : (
              <S.EmptyMobileState>
                <S.EmptyStateMessage>No customers found with the selected filter.</S.EmptyStateMessage>
              </S.EmptyMobileState>
            )}
          </S.MobileList>
        </>
      )}

      <S.Pagination>
        <S.PageButton
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          Previous
        </S.PageButton>
        <S.PageInfo>
          Page {currentPage} of {Math.max(1, totalPages)}
        </S.PageInfo>
        <S.PageButton
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={totalPages <= 1 || currentPage === totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={16} />
        </S.PageButton>
      </S.Pagination>
    </S.Container>
  );
}