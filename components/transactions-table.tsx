"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { CalendarIcon, FilterX, Search } from "lucide-react"
import type { Transaction } from "@/lib/money-manager-service"

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [accountFilter, setAccountFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })
  const [categories, setCategories] = useState<{ Id: string; name: string }[]>([])
  const [accounts, setAccounts] = useState<{ Id: string; name: string }[]>([])

  // Fetch transactions, categories, and accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transactionsResponse = await fetch("/api/money-manager/transactions")
        const transactionsData = await transactionsResponse.json()

        // Sort by CreatedAt (newest first)
        transactionsData.sort(
          (a: Transaction, b: Transaction) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime(),
        )

        setTransactions(transactionsData)
        setFilteredTransactions(transactionsData)

        // Fetch categories
        const categoriesResponse = await fetch("/api/money-manager/categories")
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.map((cat: any) => ({ Id: cat.Id, name: cat.name })))

        // Fetch accounts
        const accountsResponse = await fetch("/api/money-manager/accounts")
        const accountsData = await accountsResponse.json()
        setAccounts(accountsData.map((acc: any) => ({ Id: acc.Id, name: acc.name })))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...transactions]

    // Filter by Status
    if (typeFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.Status === typeFilter)
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.CategoryId === categoryFilter)
    }

    // Filter by account
    if (accountFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.AccountId === accountFilter)
    }

    // Filter by search query (search in Notes and category name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (transaction) =>
          transaction.Notes.toLowerCase().includes(query) || transaction.CategoryName.toLowerCase().includes(query),
      )
    }

    // Filter by CreatedAt range
    if (dateRange.from) {
      filtered = filtered.filter((transaction) => new Date(transaction.CreatedAt) >= dateRange.from!)
    }

    if (dateRange.to) {
      // Add one day to include the end CreatedAt
      const endDate = new Date(dateRange.to)
      endDate.setDate(endDate.getDate() + 1)
      filtered = filtered.filter((transaction) => new Date(transaction.CreatedAt) < endDate)
    }

    setFilteredTransactions(filtered)
  }, [typeFilter, categoryFilter, accountFilter, searchQuery, dateRange, transactions])

  // Reset filters
  const resetFilters = () => {
    setTypeFilter("all")
    setCategoryFilter("all")
    setAccountFilter("all")
    setSearchQuery("")
    setDateRange({ from: undefined, to: undefined })
  }

  if (loading) {
    return <div className="text-center p-4">Loading transactions...</div>
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="expense">Expenses Only</SelectItem>
                <SelectItem value="income">Income Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.Id} value={category.Id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.Id} value={account.Id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search in Notes or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
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
                  selected={dateRange}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button variant="ghost" size="icon" onClick={resetFilters}>
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center p-4 border rounded-md">No transactions found with the selected filters.</div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CreatedAt</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.Id}>
                  <TableCell>{formatDate(transaction.CreatedAt)}</TableCell>
                  <TableCell>{transaction.CategoryName}</TableCell>
                  <TableCell>{transaction.AccountName}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.Status === "expense" ? "danger" : "success"}>
                      {transaction.Status === "expense" ? "Expense" : "Income"}
                    </Badge>
                  </TableCell>
                  <TableCell className={transaction.Status === "expense" ? "text-red-600" : "text-green-600"}>
                    {formatCurrency(transaction.Amount, transaction.Currency)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={transaction.Notes}>
                    {transaction.Notes || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

