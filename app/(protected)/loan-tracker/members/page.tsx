import { Suspense } from "react"
import { MembersTable } from "@/components/loan-tracker/members-table";
import { AddmemberButton } from "@/components/loan-tracker/add-member-button"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function membersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Members</h2>
        <AddmemberButton />
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <MembersTable />
      </Suspense>
    </div>
  )
}

