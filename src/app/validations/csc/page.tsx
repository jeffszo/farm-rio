"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getApprovedCustomers } from "@/lib/supabase/queries"
import { api } from "@/lib/supabase/index"
import PendingCustomersTable from "../../../components/PendingCustomersTable"
import TableSkeleton from "@/components/TableSkeleton"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { Download } from "lucide-react"
import { Container, Header, Title, ExportButton } from "./styles"

export default function WholesaleValidationsPage() {
  const [customers, setCustomers] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const router = useRouter()

  const exportToExcel = async () => {
    // 🔹 Busca os clientes aprovados junto com as validações
    const approvedCustomers = await getApprovedCustomersWithValidations();
  
    if (approvedCustomers.length === 0) {
      alert("Nenhum cliente aprovado para exportar!");
      return;
    }
  
    // 🔹 Formata os dados para a planilha
    const formattedData = approvedCustomers.map((customer) => ({
      "Client Name": customer.customer_name,
      "Status": customer.status,
      "Date Created": new Date(customer.created_at).toLocaleString(),
      "Credit": customer.validations?.credit || "N/A",
      "Discount": customer.validations?.discount || "N/A",
      "Invoicing Company": customer.validations?.invoicing_company || "N/A",
      "Warehouse": customer.validations?.warehouse || "N/A",
      "Currency": customer.validations?.currency || "N/A",
      "Terms": customer.validations?.terms || "N/A",
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Customers");
  
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, "approved_customers.xlsx");
  };
  

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        setLoading(true)
        const { data, error, count } = await api.getPendingCSCValidations(currentPage, itemsPerPage)
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

  if (loading) return <TableSkeleton />
  if (error) return <p>Error: {error}</p>

  return (


      <PendingCustomersTable
        customers={customers}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        onViewDetails={(id) => router.push(`/validations/csc/${id}`)}
      />
    
  )
}

