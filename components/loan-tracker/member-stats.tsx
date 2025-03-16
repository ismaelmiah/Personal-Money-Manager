import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStatistics } from "@/lib/loan-tracker-service"
import { formatCurrency } from "@/lib/utils"

export async function MemberStats() {
  const { memberStats } = await getStatistics()

  return (
    <div className="rounded-md border overflow-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>member</TableHead>
            <TableHead>Loaned (BDT)</TableHead>
            <TableHead>Returned (BDT)</TableHead>
            <TableHead>balance (BDT)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberStats.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No data available.
              </TableCell>
            </TableRow>
          ) : (
            memberStats.map((stat) => (
              <TableRow key={stat.memberid}>
                <TableCell className="font-medium">{stat.membername}</TableCell>
                <TableCell>{formatCurrency(stat.totalLoaned.BDT, "BDT")}</TableCell>
                <TableCell>{formatCurrency(stat.totalReturned.BDT, "BDT")}</TableCell>
                <TableCell
                  className={stat.totalLoaned.BDT - stat.totalReturned.BDT > 0 ? "text-red-500" : "text-green-500"}
                >
                  {formatCurrency(stat.totalLoaned.BDT - stat.totalReturned.BDT, "BDT")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

