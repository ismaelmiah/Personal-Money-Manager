"use client";

import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { usemembers } from "@/hooks/use-members"
import { EditmemberButton } from "../money-manager/edit-member-button"
import { DeletememberButton } from "../money-manager/delete-member-button"
import { PaginatedTable } from "../paginated-table"

export function MembersTable() {
  const router = useRouter()
  const { members, isLoading, isError, mutate } = usemembers()

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load members. Please check your Google Sheets configuration.</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
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
          <EditmemberButton member={row} onSuccess={() => mutate()} />
          <DeletememberButton memberid={row.id} onSuccess={() => mutate()} />
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