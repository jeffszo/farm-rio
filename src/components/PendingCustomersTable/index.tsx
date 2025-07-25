"use client"

import React from 'react';
import { useState, useMemo } from "react"
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

  // Filter customers based on selected status
  const filteredCustomers = useMemo(() => {
    if (filterStatus === "all") return customers

    // Garanta que essas strings batem EXATAMENTE com as do banco de dados
    const statusMap = {
      pending: "pending",
      approvedByWholesale: "approved by the wholesale team",
      // CORRIGIDO: Use a string exata do banco de dados para rejeições
      rejectedByWholesale: "rejected by the wholesale team", // <-- Verifique esta string no seu DB
      approvedByCredit: "approved by the credit team",
      // CORRIGIDO: Use a string exata do banco de dados para rejeições
      rejectedByCredit: "rejected by the credit team", // <-- Verifique esta string no seu DB
      approvedByCSC: "approved by the CSC team",
      dataByClient: "data corrected by client", // <-- Esta string deve bater EXATAMENTE com o DB
    }

    // Adicione console.log para depuração
    console.log("Current filterStatus:", filterStatus);
    console.log("Target status from map:", statusMap[filterStatus as keyof typeof statusMap]);
    customers.forEach(customer => {
      if (customer.status === statusMap[filterStatus as keyof typeof statusMap]) {
        console.log("MATCH FOUND for customer:", customer.customer_name, "with status:", customer.status);
      }
    });

    return customers.filter((customer) => customer.status === statusMap[filterStatus as keyof typeof statusMap])
  }, [customers, filterStatus])

  // 🔹 Função para exportar os clientes aprovados para um arquivo Excel
  const exportToExcel = async () => {
    // 🔹 Busca os clientes aprovados no banco de dados
    const customers = await api.getApprovedCustomers()

    // 🔹 Filtra apenas os clientes aprovados pelo CSC (caso o banco tenha inconsistências)
    const approvedCustomers = customers.filter((customer) => customer.status === "finished")

    if (approvedCustomers.length === 0) {
      alert("No customers approved for export!")
      return
    }

    // 🔹 Gera a planilha Excel
    const worksheet = XLSX.utils.json_to_sheet(approvedCustomers)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Customers")

    // 🔹 Converte para Blob e salva o arquivo
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

      {/* 🔹 Exibe a quantidade total de clientes pendentes */}
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
                    <option value="all">All status</option>
                    <option value="pending">Pending</option>
                    <option value="approvedByWholesale">Approved by Wholesale</option>
                    <option value="rejectedByWholesale">Rejected by Wholesale</option>
                    <option value="approvedByCredit">Approved by Credit</option>
                    <option value="rejectedByCredit">Rejected by Credit</option>
                    <option value="approvedByCSC">Approved by CSC</option>
                    <option value="dataByClient">Data corrected by client</option>
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
                      navigator.language, // Usa a linguagem do navegador (ex: 'pt-BR', 'en-US')
                      {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        // hour: '2-digit',
                        // minute: '2-digit',
                        // second: '2-digit',
                        // hour12: false, // Opcional: define formato 24h
                        // timezone: 'America/Sao_Paulo' // NÃO use uma timezone fixa se quer a do navegador
                        // timezoneName: 'short' // Opcional: mostra 'GMT-3' ou 'BRT'
                      }
                    )}
                  </S.TableData>
                  <S.TableData>
                    <S.Button
                      onClick={() => onViewDetails(customer.id)}
                      aria-label={`Ver detalhes de ${customer.customer_name}`}
                    >
                      See details
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
          {/* Mobile filter */}
          <S.MobileFilterContainer>
            <S.FilterLabel>
              <Filter size={16} />
              Filter by status:
            </S.FilterLabel>
            <S.TableFilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="approvedByWholesale">Approved by Wholesale</option>
              <option value="rejectedByWholesale">Rejected by Wholesale</option>
              <option value="approvedByCredit">Approved by Credit</option>
              <option value="rejectedByCredit">Rejected by Credit</option>
              <option value="approvedByCSC">Approved by CSC</option>
              <option value="dataByClient">Data corrected by client</option>
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
                      navigator.language, // Usa a linguagem do navegador (ex: 'pt-BR', 'en-US')
                      {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        // hour: '2-digit',
                        // minute: '2-digit',
                        // second: '2-digit',
                        // hour12: false, // Opcional: define formato 24h
                        // timezone: 'America/Sao_Paulo' // NÃO use uma timezone fixa se quer a do navegador
                        // timezoneName: 'short' // Opcional: mostra 'GMT-3' ou 'BRT'
                      }
                    )}
                  </S.MobileListItemContent>
                  <S.Button
                    onClick={() => onViewDetails(customer.id)}
                    aria-label={`Ver detalhes de ${customer.customer_name}`}
                  >
                    See details
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
    </S.Container>
  )
}