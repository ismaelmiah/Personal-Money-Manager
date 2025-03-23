"use client"

import { LoansTable } from "@/components/loan-tracker/loans-table"
import { AddLoanButton } from "@/components/loan-tracker/add-loan-button"

export default function LoansPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Loans</h2>
        <AddLoanButton />
      </div>
      <LoansTable />
    </div>
  )
}

