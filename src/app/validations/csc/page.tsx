"use client";
import React from 'react';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/supabase/index";
import PendingCustomersTable from "../../../components/PendingCustomersTable";
import TableSkeleton from "../../../components/TableSkeleton";

interface Customer {
  id: string;
  name: string;
  email: string;
  customer_name: string;
  status: string;
  created_at: string;
}

export default function Page() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  // const [filterStatus, setFilterStatus] = useState<"all" | "approvedByCredit" | "approvedByCSC">("all");


  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        setLoading(true);
        const { data, error, count } = await api.getPendingCSCValidations(currentPage, itemsPerPage);
        if (error) throw new Error(error.message);

        setCustomers(data as Customer[]);
        setTotalCount(count || 0);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCustomers();
  }, [currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading) return <TableSkeleton />;
  if (error) return <p>Error: {error}</p>;

  return (
  


    
      <PendingCustomersTable
      customers={customers}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
      onViewDetails={(id) => router.push(`/validations/csc/${id}`)}
    />
    
    

  );
}
