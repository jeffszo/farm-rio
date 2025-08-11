'use client'

import React, { useState, useMemo } from "react"
import { Users, ChevronLeft, ChevronRight, Download, Filter } from "lucide-react"
import * as S from "./styles"
import { useMediaQuery } from "react-responsive"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { usePathname } from "next/navigation"
import { api } from "../../lib/supabase/index"

interface Customer {
  id: string
  dba_number: string
  customer_name: string
  currency: string
  status: string
  created_at: string
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
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loadingCustomerId, setLoadingCustomerId] = useState<string | null>(null)
  const isWholesaleRoute = pathname?.includes("/validations/wholesale")
  const isTaxRoute = pathname?.includes("/validations/tax")
  const isCreditRoute = pathname?.includes("/validations/credit")
  const [filterCurrency, setFilterCurrency] = useState<string>("all")

  const filteredCustomers = useMemo(() => {
    let filtered = customers

    if (filterStatus !== "all") {
      const statusMap = {
        pending: "pending",
        reviewRequestedByWholesale: "review requested by the wholesale team",
        reviewRequestedByTax: "review requested by the tax team",
        reviewRequestedByCredit: "review requested by the credit team",
        reviewRequestedByCSC: "review requested by the csc initial team",
        approvedByWholesale: "approved by the wholesale team",
        approvedByCredit: "approved by the credit team",
        approvedByTax: "approved by the tax team",
        approvedByCSCInitial: "approved by the csc initial team",
        approvedByCSCFinal: "approved by the csc final team",
        finished: "finished",
        eviewRequestedByTaxCustomer: "review requested by the tax team - customer",
        reviewRequestedByWholesaleCustomer: "review requested by the wholesale team - customer",
        reviewRequestedByCreditCustomer: "review requested by the credit team - customer",
        reviewRequestedByCSCInitialCustomer: "review requested by the csc initial team - customer",
        reviewRequestedByCSCFinalCustomer: "review requested by the csc final team - customer",
      }
      filtered = filtered.filter(
        (customer) => customer.status === statusMap[filterStatus as keyof typeof statusMap]
      )
    }

    if (filterCurrency !== "all") {
      filtered = filtered.filter(
        (customer) => customer.currency === filterCurrency
      )
    }

    return filtered
  }, [customers, filterStatus, filterCurrency])

  const handleViewDetails = (id: string) => {
    setLoadingCustomerId(id)
    onViewDetails(id)
  }

  const exportToExcel = async () => {
    const result = await api.getApprovedCustomers();
    console.log('Dados da API:', result);

    const customers = Array.isArray(result)
      ? result.filter(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            "customer_name" in item &&
            "status" in item &&
            "created_at" in item
        )
      : [];

    const approvedCustomers = customers.filter(
      (customer) => customer.status.trim().toLowerCase() === "finished"
    );

    if (approvedCustomers.length === 0) {
      console.warn("No customers approved for export!");
      return;
    }

    const processedCustomers = approvedCustomers.map(customer => {
      const newCustomer: Record<string, unknown> = { ...customer };

      try {
        const shippingAddresses = JSON.parse(newCustomer.shipping_address as string);
        delete newCustomer.shipping_address;
        if (Array.isArray(shippingAddresses)) {
          shippingAddresses.forEach((address, index) => {
            if (address && Object.keys(address).length > 0) {
              const fullAddress = [
                address.street,
                address.city,
                address.state,
                address.zipCode,
                address.country
              ].filter(Boolean).join(', ');
              newCustomer[`shipping_address_${index + 1}`] = fullAddress;
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse shipping_address JSON:", e);
        newCustomer.shipping_address = newCustomer.shipping_address;
      }

      try {
        const billingAddresses = JSON.parse(newCustomer.billing_address as string);
        delete newCustomer.billing_address;
        if (Array.isArray(billingAddresses)) {
          billingAddresses.forEach((address, index) => {
            if (address && Object.keys(address).length > 0) {
              const fullAddress = [
                address.street,
                address.city,
                address.state,
                address.zipCode,
                address.country
              ].filter(Boolean).join(', ');
              newCustomer[`billing_address_${index + 1}`] = fullAddress;
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse billing_address JSON:", e);
        newCustomer.billing_address = newCustomer.billing_address;
      }
      
      return newCustomer;
    });

    const worksheet = XLSX.utils.json_to_sheet(processedCustomers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Customers");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, "approved_customers.xlsx");
  };

  return (
    <S.Container>
      <S.TitleWrapper>
        <S.TitleContainer>
          <Users size={24} />
          <S.Title>Pending customers</S.Title>
        </S.TitleContainer>

        {isCSCValidationsRoute && (
          <S.ExportButton onClick={exportToExcel}>
            <Download size={16} />
            Export Excel
          </S.ExportButton>
        )}
      </S.TitleWrapper>

      <S.TotalCount>
        Total pending customers: {filterStatus === "all" && filterCurrency === "all"
          ? totalCount
          : filteredCustomers.length}
      </S.TotalCount>

      {/* FILTROS ACIMA DA TABELA - desktop */}
      {!isMobile && (
        <S.FiltersContainer>
          <S.FilterLabel>
            Currency:
            <S.TableFilterSelect
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
            >
              <option value="all">All currencies</option>
              {[...new Set(customers.map((c) => c.currency))].map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </S.TableFilterSelect>
          </S.FilterLabel>

          <S.FilterLabel>
            Status:
            <S.TableFilterSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">all status</option>
              {isWholesaleRoute ? (
                <>
                  <option value="pending">pending</option>
                  <option value="reviewRequestedByWholesaleCustomer">
                    review requested by the wholesale team - customer
                  </option>
                  <option value="reviewRequestedByTaxCustomer">
                    review requested by the tax team - customer
                  </option>
                  <option value="approvedByTax">approved by the tax team</option>
                  <option value="reviewRequestedByCreditCustomer">
                    review requested by the credit team - customer
                  </option>
                  <option value="finished">finished</option>
                  <option value="approvedByCredit">approved by the credit team</option>
                </>
              ) : isTaxRoute ? (
                <>
                  <option value="reviewRequestedByTaxCustomer">
                    review requested by the tax team - customer
                  </option>
                  <option value="approvedByTax">approved by the tax team</option>
                </>
              ) : isCreditRoute ? (
                <>
                  <option value="approvedByTax">approved by the tax team</option>
                  <option value="reviewRequestedByCreditCustomer">
                    review requested by the credit team - customer
                  </option>
                </>
              ) : (
                <>
                  <option value="approvedByWholesale">
                    approved by the wholesale team
                  </option>
                  <option value="approvedByCredit">approved by the credit team</option>
                  <option value="reviewRequestedByCSCInitialCustomer">
                    review requested by the csc initial team - customer
                  </option>
                  <option value="reviewRequestedByCSCFinalCustomer">
                    review requested by the csc final team - customer
                  </option>
                  <option value="finished">finished</option>
                </>
              )}
            </S.TableFilterSelect>
          </S.FilterLabel>
        </S.FiltersContainer>
      )}

      {!isMobile ? (
        <S.Table>
          <thead>
            <tr>
              <S.TableHeader>DBA</S.TableHeader>
              <S.TableHeader>Legal Name</S.TableHeader>
              <S.TableHeader>Currency</S.TableHeader>
              <S.TableHeader>Status</S.TableHeader>
              <S.TableHeader>Date Created</S.TableHeader>
              <S.TableHeader>Action</S.TableHeader>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <S.TableRow key={customer.id}>
                  <S.TableData>{customer.dba_number}</S.TableData>
                  <S.TableData>{customer.customer_name}</S.TableData>
                  <S.TableData>{customer.currency}</S.TableData>
                  <S.TableData>
                    <S.StatusBadge status={customer.status}>
                      {customer.status}
                    </S.StatusBadge>
                  </S.TableData>
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
                <S.EmptyTableData colSpan={6}>
                  <S.EmptyStateMessage>
                    No customers found with the selected filter.
                  </S.EmptyStateMessage>
                </S.EmptyTableData>
              </S.EmptyTableRow>
            )}
          </tbody>
        </S.Table>
      ) : (
        <>
          {/* mobile filters e lista continuam iguais */}
          <S.MobileFilterContainer>
            <S.FilterLabel>
              <Filter size={16} />
              Filter by currency:
            </S.FilterLabel>
            <S.TableFilterSelect
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
            >
              <option value="all">All currencies</option>
              {[...new Set(customers.map((c) => c.currency))].map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </S.TableFilterSelect>
          </S.MobileFilterContainer>

          <S.MobileFilterContainer>
            <S.FilterLabel>
              <Filter size={16} />
              Filter by status:
            </S.FilterLabel>
            <S.TableFilterSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">all status</option>
              {isWholesaleRoute ? (
                <>
                  <option value="pending">pending</option>
                  <option value="reviewRequestedByWholesaleCustomer">
                    review requested by the wholesale team - customer
                  </option>
                </>
              ) : isTaxRoute ? (
                <>
                  <option value="reviewRequestedByTaxCustomer">
                    review requested by the tax team - customer
                  </option>
                  <option value="approvedByTax">approved by the tax team</option>
                </>
              ) : isCreditRoute ? (
                <>
                  <option value="approvedByTax">approved by the tax team</option>
                  <option value="reviewRequestedByCreditCustomer">
                    review requested by the credit team - customer
                  </option>
                </>
              ) : (
                <>
                  <option value="approvedByWholesale">
                    approved by the wholesale team
                  </option>
                  <option value="approvedByCredit">approved by the credit team</option>
                  <option value="reviewRequestedByCSCInitialCustomer">
                    review requested by the csc initial team - customer
                  </option>
                  <option value="reviewRequestedByCSCFinalCustomer">
                    review requested by the csc final team - customer
                  </option>
                  <option value="finished">finished</option>
                </>
              )}
            </S.TableFilterSelect>
          </S.MobileFilterContainer>

          <S.MobileList>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <S.MobileListItem key={customer.id}>
                  <S.MobileListItemTitle>{customer.customer_name}</S.MobileListItemTitle>
                  <S.MobileListItemContent>
                    DBA: {customer.dba_number}
                  </S.MobileListItemContent>
                  <S.MobileListItemContent>
                    Currency: {customer.currency}
                  </S.MobileListItemContent>
                  <S.MobileListItemContent>
                    Status:{" "}
                    <S.StatusBadge status={customer.status}>
                      {customer.status}
                    </S.StatusBadge>
                  </S.MobileListItemContent>
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
                <S.EmptyStateMessage>
                  No customers found with the selected filter.
                </S.EmptyStateMessage>
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
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={16} />
        </S.PageButton>
      </S.Pagination>
    </S.Container>
  )
}
