"use client"

import { Users, ChevronLeft, ChevronRight } from "lucide-react"
import * as S from "./styles"
import { useMediaQuery } from "react-responsive"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

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

  // 🔹 Função para exportar os clientes aprovados para um arquivo Excel
  const exportToExcel = () => {
    if (customers.length === 0) {
      alert("Nenhum cliente aprovado para exportar!")
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(customers)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Customers")

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    saveAs(data, "approved_customers.xlsx")
  }

  return (
    <S.Container>
      <S.TitleWrapper>
        <Users size={24} />
        <S.Title>Pending customers</S.Title>
        <S.ExportButton onClick={exportToExcel}>Exportar Excel</S.ExportButton>
      </S.TitleWrapper>

      {/* 🔹 Exibe a quantidade total de clientes pendentes */}
      <S.TotalCount>Total pending customers: {totalCount}</S.TotalCount>

      {customers.length === 0 ? (
        <S.Message>No pending customers.</S.Message>
      ) : (
        <>
          {!isMobile ? (
            <S.Table>
              <thead>
                <tr>
                  <S.TableHeader>Client Name</S.TableHeader>
                  <S.TableHeader>Status</S.TableHeader>
                  <S.TableHeader>Date Created</S.TableHeader>
                  <S.TableHeader>Action</S.TableHeader>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <S.TableRow key={customer.id}>
                    <S.TableData>{customer.customer_name}</S.TableData>
                    <S.TableData>{customer.status}</S.TableData>
                    <S.TableData>{new Date(customer.created_at).toLocaleString()}</S.TableData>
                    <S.TableData>
                      <S.Button
                        onClick={() => onViewDetails(customer.id)}
                        aria-label={`Ver detalhes de ${customer.customer_name}`}
                      >
                        See details
                      </S.Button>
                    </S.TableData>
                  </S.TableRow>
                ))}
              </tbody>
            </S.Table>
          ) : (
            <S.MobileList>
              {customers.map((customer) => (
                <S.MobileListItem key={customer.id}>
                  <S.MobileListItemTitle>{customer.customer_name}</S.MobileListItemTitle>
                  <S.MobileListItemContent>Status: {customer.status}</S.MobileListItemContent>
                  <S.MobileListItemContent>
                    Date: {new Date(customer.created_at).toLocaleString()}
                  </S.MobileListItemContent>
                  <S.Button
                    onClick={() => onViewDetails(customer.id)}
                    aria-label={`Ver detalhes de ${customer.customer_name}`}
                  >
                    See details
                  </S.Button>
                </S.MobileListItem>
              ))}
            </S.MobileList>
          )}

          {/* 🔹 PAGINAÇÃO */}
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
        </>
      )}
    </S.Container>
  )
}
