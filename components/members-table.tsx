import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/router"
import { useMembers } from "@/hooks/use-members"
import { EditMemberButton } from "./money-manager/edit-member-button"
import { DeleteMemberButton } from "./money-manager/delete-member-button"
import { PaginatedTable } from "./paginated-table"

export async function MembersTable() {
  const router = useRouter()
  const { members, isLoading, isError, mutate } = useMembers()

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
      accessorKey: "name",
      className: "font-medium",
      searchable: true,
    },
    {
      header: "Email",
      accessorKey: "email",
      className: "hidden sm:table-cell truncate max-w-[200px]",
      searchable: true,
    },
    {
      header: "Phone",
      accessorKey: "phone",
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
          <EditMemberButton member={row} onSuccess={() => mutate()} />
          <DeleteMemberButton memberId={row.id} onSuccess={() => mutate()} />
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