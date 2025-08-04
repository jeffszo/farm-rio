"use client"

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
  customer_name: string
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

  const filteredCustomers = useMemo(() => {
    if (filterStatus === "all") return customers

    const statusMap = {
      pending: "pending",
      reviewRequestedByWholesale: "review requested by the wholesale team",
      reviewRequestedByTax: "review requested by the tax team",
      reviewRequestedByCredit: "review requested by the credit team",
      reviewRequestedByCSC: "review requested by the csc initial team",
      approvedByWholesale: "approved by the wholesale team",
      // rejectedByWholesale: "rejected by the wholesale team",
      approvedByCredit: "approved by the credit team",
      // Opção de rejectedByCredit removida
      approvedByTax: "approved by the tax team",
      approvedByCSC: "approved by the csc final team",
      finished: "finished",
      // dataByClient: "data corrected by client",
    }

    return customers.filter((customer) => customer.status === statusMap[filterStatus as keyof typeof statusMap])
  }, [customers, filterStatus])

  const handleViewDetails = (id: string) => {
    setLoadingCustomerId(id)
    onViewDetails(id)
  }

  const exportToExcel = async () => {
    const result = await api.getApprovedCustomers()
    // Check if result is an array and has expected properties
    const customers: Customer[] = Array.isArray(result)
      ? result.filter(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            "customer_name" in item &&
            "status" in item &&
            "created_at" in item
        ) as Customer[]
      : []

    const approvedCustomers = customers.filter((customer) => customer.status === "finished")

    if (approvedCustomers.length === 0) {
      alert("No customers approved for export!")
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(approvedCustomers)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Customers")

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    saveAs(data, "approved_customers.xlsx")
  }

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
        Total pending customers: {filterStatus === "all" ? totalCount : filteredCustomers.length}
      </S.TotalCount>

      {!isMobile ? (
        <S.Table>
          <thead>
            <tr>
              <S.TableHeader>Client Name</S.TableHeader>
              <S.TableHeader>
                <S.TableHeaderFilter>
                  Status
                  <S.TableFilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">all status</option>
                    <option value="pending">pending</option>
                    <option value="reviewRequestedByWholesale">review requested by the wholesale team</option>
                    <option value="reviewRequestedByTax">review requested by the tax team</option>
                    <option value="reviewRequestedByCredit">review requested by the credit team</option>
                    <option value="reviewRequestedByCSC">review requested by the csc initial team</option>
                    <option value="approvedByWholesale">approved by the wholesale team</option>
                    {/* <option value="rejectedByWholesale">rejected by the wholesale team</option> */}
                    <option value="approvedByCredit">approved by the credit team</option>
                    <option value="approvedByTax">approved by the tax team</option>
                    <option value="approvedByCSC">approved by the csc final team</option>
                    <option value="finished">finished</option>
                    {/* <option value="dataByClient">data corrected by client</option> */}
                  </S.TableFilterSelect>
                </S.TableHeaderFilter>
              </S.TableHeader>
              <S.TableHeader>Date Created</S.TableHeader>
              <S.TableHeader>Action</S.TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <S.TableRow key={customer.id}>
                  <S.TableData>{customer.customer_name}</S.TableData>
                  <S.TableData>
                    <S.StatusBadge status={customer.status}>{customer.status}</S.StatusBadge>
                  </S.TableData>
                  <S.TableData>
                    {new Date(customer.created_at).toLocaleString(
                      navigator.language,
                      {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      }
                    )}
                  </S.TableData>
                  <S.TableData>
                    <S.Button
                      onClick={() => handleViewDetails(customer.id)}
                      disabled={loadingCustomerId === customer.id}
                      aria-label={`See details of ${customer.customer_name}`}
                    >
                      {loadingCustomerId === customer.id ? 'Loading...' : 'See details'}
                    </S.Button>
                  </S.TableData>
                </S.TableRow>
              ))
            ) : (
              <S.EmptyTableRow>
                <S.EmptyTableData colSpan={4}>
                  <S.EmptyStateMessage>No customers found with the selected filter.</S.EmptyStateMessage>
                </S.EmptyTableData>
              </S.EmptyTableRow>
            )}
          </tbody>
        </S.Table>
      ) : (
        <>
          <S.MobileFilterContainer>
            <S.FilterLabel>
              <Filter size={16} />
              Filter by status:
            </S.FilterLabel>
            <S.TableFilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="reviewRequestedByWholesale">review by wholesale</option>
              <option value="reviewRequestedByTax">review by tax</option>
              <option value="reviewRequestedByCredit">review by credit</option>
              <option value="reviewRequestedByCSC">review by csc initial</option>
              <option value="approvedByWholesale">approved by wholesale</option>
              {/* <option value="rejectedByWholesale">Rejected by wholesale</option> */}
              <option value="approvedByCredit">approved by credit</option>
              <option value="approvedByTax">approved by tax</option>
              <option value="approvedByCSC">approved by csc final</option>
              <option value="finished">finished</option>
              {/* <option value="dataByClient">Data corrected by client</option> */}
            </S.TableFilterSelect>
          </S.MobileFilterContainer>

          <S.MobileList>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <S.MobileListItem key={customer.id}>
                  <S.MobileListItemTitle>{customer.customer_name}</S.MobileListItemTitle>
                  <S.MobileListItemContent>
                    Status: <S.StatusBadge status={customer.status}>{customer.status}</S.StatusBadge>
                  </S.MobileListItemContent>
                  <S.MobileListItemContent>
                    Date: {new Date(customer.created_at).toLocaleString(
                      navigator.language,
                      {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      }
                    )}
                  </S.MobileListItemContent>
                  <S.Button
                    onClick={() => handleViewDetails(customer.id)}
                    disabled={loadingCustomerId === customer.id}
                    aria-label={`See details of ${customer.customer_name}`}
                  >
                    {loadingCustomerId === customer.id ? 'Loading...' : 'See details'}
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