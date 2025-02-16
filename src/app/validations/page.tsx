"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "../../lib/supabaseApi"
import * as S from "./styles"

interface Customer {
  id: string
  customer_name: string
  status: string
  created_at: string
}

export default function ValidationsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const router = useRouter()

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        setLoading(true)
        const { data, error, count } = await api.getPendingCustomers(currentPage, itemsPerPage)
        if (error) throw new Error(error.message)

        setCustomers(data)
        setTotalCount(count || 0)
      } catch (err) {
        console.error("Error fetching customers:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchPendingCustomers()
  }, [currentPage, itemsPerPage])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading) return <S.Message>Carregando...</S.Message>
  if (error) return <S.Message>Erro: {error}</S.Message>

  return (
    <S.Container>
      <S.Title>Clientes Pendentes</S.Title>
      {customers.length === 0 ? (
        <S.Message>Nenhum cliente pendente.</S.Message>
      ) : (
        <>
          <S.Message>Total de clientes pendentes: {totalCount}</S.Message>
          <S.Table>
            <thead>
              <tr>
                <S.TableHeader>Nome do Cliente</S.TableHeader>
                <S.TableHeader>Status</S.TableHeader>
                <S.TableHeader>Data de Criação</S.TableHeader>
                <S.TableHeader>Ação</S.TableHeader>
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
                      onClick={() => router.push(`/validations/${customer.id}`)}
                      aria-label={`Ver detalhes de ${customer.customer_name}`}
                    >
                      Ver detalhes
                    </S.Button>
                  </S.TableData>
                </S.TableRow>
              ))}
            </tbody>
          </S.Table>
          <S.Pagination>
            <S.PageButton
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              Anterior
            </S.PageButton>
            <S.PageInfo>
              Página {currentPage} de {totalPages}
            </S.PageInfo>
            <S.PageButton
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
            >
              Próxima
            </S.PageButton>
          </S.Pagination>
        </>
      )}
    </S.Container>
  )
}

