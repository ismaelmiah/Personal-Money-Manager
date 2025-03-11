import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getMembers } from "@/lib/loan-tracker-service"
import { formatDate } from "@/lib/utils"

export async function MembersTable() {
  try {
    const members = await getMembers()
console.log("members", members)
    if (!members || members.length === 0) {
      return (
        <div className="rounded-md border p-4">
          <p className="text-center text-muted-foreground">No members found. Add your first member.</p>
        </div>
      )
    }

    return (
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead>Added On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.Id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">
                  <Link href={`/members/${member.Id}`} className="block w-full">
                    {member.Name}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Link href={`/members/${member.Id}`} className="block w-full truncate max-w-[200px]">
                    {member.Email || "—"}
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Link href={`/members/${member.Id}`} className="block w-full">
                    {member.Phone || "—"}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/members/${member.Id}`} className="block w-full">
                    {member.CreatedAt}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  } catch (error) {
    console.error("Error in MembersTable:", error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load members. Please check your Google Sheets configuration.</AlertDescription>
      </Alert>
    )
  }
}

