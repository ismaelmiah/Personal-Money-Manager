"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { CalendarIcon, FilterX } from "lucide-react"
import type { Loan } from "@/lib/loan-tracker-service"

export function MemberTransactionsTable({ memberId }: { memberId: string }) {
  const [loans, setLoans] = useState<Loan[]>([])
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Fetch loans for this member
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch("/api/loan-tracker/loans")
        const allLoans = await response.json()
        const memberLoans = allLoans.filter((loan: Loan) => loan.memberId === memberId)

        // Sort by createdAt (newest first)
        memberLoans.sort((a: Loan, b: Loan) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setLoans(memberLoans)
        setFilteredLoans(memberLoans)
      } catch (error) {
        console.error("Error fetching loans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [memberId])

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...loans]

    // Filter by status
    if (typeFilter !== "all") {
      filtered = filtered.filter((loan) => loan.status === typeFilter)
    }

    // Filter by createdAt range
    if (dateRange.from) {
      filtered = filtered.filter((loan) => new Date(loan.createdAt) >= dateRange.from!)
    }

    if (dateRange.to) {
      // Add one day to include the end createdAt
      const endDate = new Date(dateRange.to)
      endDate.setDate(endDate.getDate() + 1)
      filtered = filtered.filter((loan) => new Date(loan.createdAt) < endDate)
    }

    setFilteredLoans(filtered)
  }, [typeFilter, dateRange, loans])

  // Reset filters
  const resetFilters = () => {
    setTypeFilter("all")
    setDateRange({})
  }

  if (loading) {
    return <div className="text-center p-4">Loading transactions...</div>
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="loan">Loans Only</SelectItem>
              <SelectItem value="return">Returns Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && !dateRange.to && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {formatDate(dateRange.from.toISOString())} - {formatDate(dateRange.to.toISOString())}
                    </>
                  ) : (
                    formatDate(dateRange.from.toISOString())
                  )
                ) : (
                  "createdAt range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                onSelect={setDateRange}
                initialFocus
                required
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button variant="ghost" size="icon" onClick={resetFilters}>
          <FilterX className="h-4 w-4" />
        </Button>
      </div>

      {filteredLoans.length === 0 ? (
        <div className="text-center p-4 border rounded-md">No transactions found with the selected filters.</div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>createdAt</TableHead>
                <TableHead>status</TableHead>
                <TableHead>amount</TableHead>
                <TableHead>notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{formatDate(loan.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={loan.status === "Loan" ? "danger" : "success"}>
                      {loan.status === "Loan" ? "Loan" : "Return"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(loan.amount, loan.currency)}</TableCell>
                  <TableCell>{loan.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

