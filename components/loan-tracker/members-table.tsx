"use client";

import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useMembers } from "@/hooks/use-members"
import { EditmemberButton } from "../money-manager/edit-member-button"
import { DeletememberButton } from "../money-manager/delete-member-button"
import { PaginatedTable } from "../paginated-table"
import { LoadingCountdown } from "../loading-countdown";
import { useAppMembers } from "@/hooks/use-app-members";

export function MembersTable() {
  const router = useRouter()
    const { members, isLoading, isError, refreshMembers, deleteMember } = useAppMembers()

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load members. Please check your Google Sheets configuration.</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return <LoadingCountdown message="Loading members" isLoading={isLoading} />
  }

  if (!members || members.length === 0) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-center text-muted-foreground">No members found. Add your first member.</p>
      </div>
    )
  }

  const columns = [
    {
      header: "Name",
      accessorKey: (row: any) => row.name,
      className: "font-medium",
      searchable: true,
    },
    {
      header: "Email",
      accessorKey: (row: any) => row.email,
      className: "hidden sm:table-cell truncate max-w-[200px]",
      searchable: true,
    },
    {
      header: "Phone",
      accessorKey: (row: any) => row.phone,
      className: "hidden md:table-cell",
      searchable: true,
    },
    {
      header: "Added On",
      accessorKey: (row: any) => formatDate(row.createdAt),
    },
    {
      header: "Actions",
      accessorKey: (row: any) => (
        <div className="flex space-x-2">
          <EditmemberButton member={row} onSuccess={() => refreshMembers()} />
          <DeletememberButton memberid={row.id} onSuccess={() => refreshMembers()} />
        </div>
      ),
      className: "w-[100px]",
    },
  ]

  return (
    <PaginatedTable
      data={members}
      columns={columns}
      searchPlaceholder="Search members..."
      onRowClick={(row:any) => router.push(`/loan-tracker/members/${row.id}`)}
    />
  )
}