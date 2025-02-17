"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/supabaseApi";
import * as S from "./styles";
import { useMediaQuery } from "react-responsive";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

interface Customer {
  id: string;
  customer_name: string;
  status: string;
  created_at: string;
}

export default function ValidationsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 🔥 Máximo de clientes por página
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        setLoading(true);
        const { data, error, count } = await api.getPendingValidations (currentPage, itemsPerPage);
        if (error) throw new Error(error.message);

        setCustomers(data);
        setTotalCount(count || 0);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCustomers();
  }, [currentPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading) return <S.Message>Carregando...</S.Message>;
  if (error) return <S.Message>Erro: {error}</S.Message>;

  return (
    <S.Container>
      <S.TitleWrapper>
        <Users size={24} />
        <S.Title>Pending customers</S.Title>
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
                        onClick={() => router.push(`/validations/wholesale/${customer.id}`)}
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
                    Data: {new Date(customer.created_at).toLocaleString()}
                  </S.MobileListItemContent>
                  <S.Button
                    onClick={() => router.push(`/validations/${customer.id}`)}
                    aria-label={`Ver detalhes de ${customer.customer_name}`}
                  >
                    Ver detalhes
                  </S.Button>
                </S.MobileListItem>
              ))}
            </S.MobileList>
          )}
          
          {/* 🔹 PAGINAÇÃO */}
          <S.Pagination>
            <S.PageButton
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
              Previous
            </S.PageButton>
            <S.PageInfo>
            Page {currentPage} of {Math.max(1, totalPages)}
            </S.PageInfo>
            <S.PageButton
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
            >
              Next
              <ChevronRight size={16} />
            </S.PageButton>
          </S.Pagination>
        </>
      )}
    </S.Container>
  );
}
