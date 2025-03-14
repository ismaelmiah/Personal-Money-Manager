"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { formatcurrency, formatDate, cn } from "@/lib/utils"
import { CalendarIcon, FilterX, Search } from "lucide-react"
import type { Transaction } from "@/lib/money-manager-service"

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [accountFilter, setAccountFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])

  // Fetch transactions, categories, and accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transactionsResponse = await fetch("/api/money-manager/transactions")
        const transactionsData = await transactionsResponse.json()

        // Sort by createdAt (newest first)
        transactionsData.sort(
          (a: Transaction, b: Transaction) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

        setTransactions(transactionsData)
        setFilteredTransactions(transactionsData)

        // Fetch categories
        const categoriesResponse = await fetch("/api/money-manager/categories")
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.map((cat: any) => ({ id: cat.id, name: cat.name })))

        // Fetch accounts
        const accountsResponse = await fetch("/api/money-manager/accounts")
        const accountsData = await accountsResponse.json()
        setAccounts(accountsData.map((acc: any) => ({ id: acc.id, name: acc.name })))
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

    // Filter by status
    if (typeFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === typeFilter)
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.categoryId === categoryFilter)
    }

    // Filter by account
    if (accountFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.accountId === accountFilter)
    }

    // Filter by search query (search in notes and category name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (transaction) =>
          transaction.notes.toLowerCase().includes(query) || transaction.categoryName.toLowerCase().includes(query),
      )
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter((transaction) => new Date(transaction.createdAt) >= dateRange.from!)
    }

    if (dateRange.to) {
      // Add one day to include the end date
      const endDate = new Date(dateRange.to)
      endDate.setDate(endDate.getDate() + 1)
      filtered = filtered.filter((transaction) => new Date(transaction.createdAt) < endDate)
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
                <SelectValue placeholder="Filter by status" />
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
                  <SelectItem key={category.id} value={category.id}>
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
                  <SelectItem key={account.id} value={account.id}>
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
                placeholder="Search in notes or category..."
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
                    "Date range"
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
                <TableHead>createdAt</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>status</TableHead>
                <TableHead>amount</TableHead>
                <TableHead className="hidden md:table-cell">notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  <TableCell>{transaction.categoryName}</TableCell>
                  <TableCell>{transaction.accountName}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "expense" ? "danger" : "success"}>
                      {transaction.type === "expense" ? "Expense" : "Income"}
                    </Badge>
                  </TableCell>
                  <TableCell className={transaction.type === "expense" ? "text-red-600" : "text-green-600"}>
                    {formatcurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={transaction.notes}>
                    {transaction.notes || "—"}
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

