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

export function MemberTransactionsTable({ MemberId }: { MemberId: string }) {
  const [loans, setLoans] = useState<Loan[]>([])
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Fetch loans for this member
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch("/api/loans")
        const allLoans = await response.json()
        const memberLoans = allLoans.filter((loan: Loan) => loan.MemberId === MemberId)

        // Sort by CreatedAt (newest first)
        memberLoans.sort((a: Loan, b: Loan) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())

        setLoans(memberLoans)
        setFilteredLoans(memberLoans)
      } catch (error) {
        console.error("Error fetching loans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [MemberId])

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...loans]

    // Filter by Status
    if (typeFilter !== "all") {
      filtered = filtered.filter((loan) => loan.Status === typeFilter)
    }

    // Filter by CreatedAt range
    if (dateRange.from) {
      filtered = filtered.filter((loan) => new Date(loan.CreatedAt) >= dateRange.from!)
    }

    if (dateRange.to) {
      // Add one day to include the end CreatedAt
      const endDate = new Date(dateRange.to)
      endDate.setDate(endDate.getDate() + 1)
      filtered = filtered.filter((loan) => new Date(loan.CreatedAt) < endDate)
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
              <SelectValue placeholder="Filter by Status" />
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
                  "CreatedAt range"
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
                <TableHead>CreatedAt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.Id}>
                  <TableCell>{formatDate(loan.CreatedAt)}</TableCell>
                  <TableCell>
                    <Badge variant={loan.Status === "Loan" ? "danger" : "success"}>
                      {loan.Status === "Loan" ? "Loan" : "Return"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(loan.Amount, loan.Currency)}</TableCell>
                  <TableCell>{loan.Notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

