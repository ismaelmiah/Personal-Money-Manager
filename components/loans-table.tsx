import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getLoans } from "@/lib/google-sheets"
import { formatCurrency, formatDate } from "@/lib/utils"

export async function LoansTable() {
  try {
    const loans = await getLoans()

    if (!loans || loans.length === 0) {
      return (
        <div className="rounded-md border p-4">
          <p className="text-center text-muted-foreground">No loans found. Add your first loan.</p>
        </div>
      )
    }

    return (
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CreatedAt</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.Id}>
                <TableCell>{formatDate(loan.CreatedAt)}</TableCell>
                <TableCell className="max-w-[120px] truncate" title={loan.MemberName}>
                  {loan.MemberName}
                </TableCell>
                <TableCell>
                  <Badge variant={loan.Status === "loan" ? "default" : "secondary"}>
                    {loan.Status === "loan" ? "Loan" : "Return"}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(loan.Amount, loan.Currency)}</TableCell>
                <TableCell className="hidden md:table-cell">{loan.Notes || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  } catch (error) {
    console.error("Error in LoansTable:", error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load loans. Please check your Google Sheets configuration.</AlertDescription>
      </Alert>
    )
  }
}

