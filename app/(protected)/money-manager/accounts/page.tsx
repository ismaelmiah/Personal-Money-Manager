import { Suspense } from "react"
import { AccountsTable } from "@/components/money-manager/accounts-table"
import { AddAccountButton } from "@/components/money-manager/add-account-button"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function AccountsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
        <AddAccountButton />
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <AccountsTable />
      </Suspense>
    </div>
  )
}

