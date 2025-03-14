import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStatistics } from "@/lib/loan-tracker-service"
import { formatcurrency } from "@/lib/utils"

export async function MemberStats() {
  const { memberStats } = await getStatistics()

  return (
    <div className="rounded-md border">
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
                <TableCell>{formatcurrency(stat.totalLoaned.BDT, "BDT")}</TableCell>
                <TableCell>{formatcurrency(stat.totalReturned.BDT, "BDT")}</TableCell>
                <TableCell
                  className={stat.totalLoaned.BDT - stat.totalReturned.BDT > 0 ? "text-red-500" : "text-green-500"}
                >
                  {formatcurrency(stat.totalLoaned.BDT - stat.totalReturned.BDT, "BDT")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

