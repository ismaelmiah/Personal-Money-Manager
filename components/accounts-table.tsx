import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { getAccounts } from "@/lib/money-manager-service"
import { formatCurrency, formatDate } from "@/lib/utils"

export async function AccountsTable() {
  try {
    const accounts = await getAccounts()

    if (!accounts || accounts.length === 0) {
      return (
        <div className="rounded-md border p-4">
          <p className="text-center text-muted-foreground">No accounts found. Add your first account.</p>
        </div>
      )
    }

    return (
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>name</TableHead>
              <TableHead>balance</TableHead>
              <TableHead className="hidden md:table-cell">currency</TableHead>
              <TableHead className="hidden md:table-cell">Created On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell className={account.balance >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(account.balance, account.currency)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{account.currency}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(account.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  } catch (error) {
    console.error("Error in AccountsTable:", error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load accounts. Please check your Google Sheets configuration.</AlertDescription>
      </Alert>
    )
  }
}

