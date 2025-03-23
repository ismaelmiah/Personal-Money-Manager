"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Loan, Member } from "@/lib/loan-tracker-service"
import type { Account, Category, Transaction } from "@/lib/money-manager-service"
import { useToast } from "@/components/ui/use-toast"

// Define the shape of our application data
interface AppData {
  loans: Loan[]
  members: Member[]
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  statistics: {
    memberStats: any[]
    currencyStats: any
  }
  moneyManagerStatistics: {
    totalIncome: number
    totalExpense: number
    balance: number
    categoryStats: any[]
    accountStats: any[]
    monthlyStats: any[]
  }
  isLoading: boolean
  isError: boolean
  lastFetched: Date | null
}

// Define the shape of our context
interface DataContextType extends AppData {
  refreshData: () => Promise<void>
  refreshLoans: () => Promise<void>
  refreshMembers: () => Promise<void>
  refreshAccounts: () => Promise<void>
  refreshCategories: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshStatistics: () => Promise<void>
  refreshMoneyManagerStatistics: () => Promise<void>

  // CRUD operations for loans
  addLoan: (loan: Omit<Loan, "id">) => Promise<Loan>
  updateLoan: (loan: Loan) => Promise<Loan>
  deleteLoan: (id: string) => Promise<void>

  // CRUD operations for members
  addMember: (member: Omit<Member, "id" | "createdAt">) => Promise<Member>
  updateMember: (id: string, member: Omit<Member, "id" | "createdAt">) => Promise<Member>
  deleteMember: (id: string) => Promise<void>

  // CRUD operations for accounts
  addAccount: (account: Omit<Account, "id" | "createdAt">) => Promise<Account>
  updateAccount: (id: string, account: Omit<Account, "id" | "createdAt">) => Promise<Account>
  deleteAccount: (id: string) => Promise<void>

  // CRUD operations for categories
  addCategory: (category: Omit<Category, "id" | "createdAt">) => Promise<Category>
  updateCategory: (id: string, category: Omit<Category, "id" | "createdAt">) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>

  // CRUD operations for transactions
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<Transaction>
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => Promise<Transaction>
  deleteTransaction: (id: string) => Promise<void>
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined)

// Initial state
const initialState: AppData = {
  loans: [],
  members: [],
  accounts: [],
  categories: [],
  transactions: [],
  statistics: {
    memberStats: [],
    currencyStats: {},
  },
  moneyManagerStatistics: {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryStats: [],
    accountStats: [],
    monthlyStats: [],
  },
  isLoading: true,
  isError: false,
  lastFetched: null,
}

// Cache expiration time (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialState)
  const { toast } = useToast()

  // Function to check if cache is expired
  const isCacheExpired = useCallback(() => {
    if (!data.lastFetched) return true
    return Date.now() - data.lastFetched.getTime() > CACHE_EXPIRATION
  }, [data.lastFetched])

  // Fetch all data at once
  const refreshData = useCallback(async () => {
    if (!isCacheExpired() && data.loans.length > 0) {
      return // Use cached data if available and not expired
    }

    setData((prev) => ({ ...prev, isLoading: true, isError: false }))

    try {
      // Fetch all data in parallel
      const [
        loansResponse,
        membersResponse,
        statisticsResponse,
        accountsResponse,
        categoriesResponse,
        transactionsResponse,
        moneyManagerStatisticsResponse,
      ] = await Promise.all([
        fetch("/api/loan-tracker/loans"),
        fetch("/api/loan-tracker/members"),
        fetch("/api/loan-tracker/statistics"),
        fetch("/api/money-manager/accounts"),
        fetch("/api/money-manager/categories"),
        fetch("/api/money-manager/transactions"),
        fetch("/api/money-manager/statistics"),
      ])

      // Check if all responses are OK
      if (
        !loansResponse.ok ||
        !membersResponse.ok ||
        !accountsResponse.ok ||
        !categoriesResponse.ok ||
        !transactionsResponse.ok ||
        !statisticsResponse.ok ||
        !moneyManagerStatisticsResponse.ok
      ) {
        throw new Error("Failed to fetch data")
      }

      // Parse all responses
      const [loans, members, statistics, accounts, categories, transactions, moneyManagerStatistics] =
        await Promise.all([
          loansResponse.json(),
          membersResponse.json(),
          statisticsResponse.json(),
          accountsResponse.json(),
          categoriesResponse.json(),
          transactionsResponse.json(),
          moneyManagerStatisticsResponse.json(),
        ])

      // Update state with all data
      setData({
        loans,
        members,
        statistics,
        accounts,
        categories,
        transactions,
        moneyManagerStatistics,
        isLoading: false,
        isError: false,
        lastFetched: new Date(),
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      setData((prev) => ({ ...prev, isLoading: false, isError: true }))
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      })
    }
  }, [data.loans.length, isCacheExpired, toast])

  // Individual refresh functions for specific data types
  const refreshLoans = useCallback(async () => {
    try {
      const response = await fetch("/api/loan-tracker/loans")
      if (!response.ok) throw new Error("Failed to fetch loans")
      const loans = await response.json()
      setData((prev) => ({ ...prev, loans, lastFetched: new Date() }))
    } catch (error) {
      console.error("Error fetching loans:", error)
      toast({
        title: "Error",
        description: "Failed to fetch loans. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const refreshMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/loan-tracker/members")
      if (!response.ok) throw new Error("Failed to fetch members")
      const members = await response.json()
      setData((prev) => ({ ...prev, members, lastFetched: new Date() }))
    } catch (error) {
      console.error("Error fetching members:", error)
      toast({
        title: "Error",
        description: "Failed to fetch members. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const refreshAccounts = useCallback(async () => {
    try {
      const response = await fetch("/api/money-manager/accounts")
      if (!response.ok) throw new Error("Failed to fetch accounts")
      const accounts = await response.json()
      setData((prev) => ({ ...prev, accounts, lastFetched: new Date() }))
    } catch (error) {
      console.error("Error fetching accounts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch accounts. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const refreshCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/money-manager/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const categories = await response.json()
      setData((prev) => ({ ...prev, categories, lastFetched: new Date() }))
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch categories. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const refreshTransactions = useCallback(async () => {
    try {
      const response = await fetch("/api/money-manager/transactions")
      if (!response.ok) throw new Error("Failed to fetch transactions")
      const transactions = await response.json()
      setData((prev) => ({ ...prev, transactions, lastFetched: new Date() }))
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const refreshStatistics = useCallback(async () => {
    try {
      const response = await fetch("/api/loan-tracker/statistics")
      if (!response.ok) throw new Error("Failed to fetch statistics")
      const statistics = await response.json()
      setData((prev) => ({ ...prev, statistics, lastFetched: new Date() }))
    } catch (error) {
      console.error("Error fetching statistics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch statistics. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const refreshMoneyManagerStatistics = useCallback(async () => {
    try {
      const response = await fetch("/api/money-manager/statistics")
      if (!response.ok) throw new Error("Failed to fetch money manager statistics")
      const moneyManagerStatistics = await response.json()
      setData((prev) => ({ ...prev, moneyManagerStatistics, lastFetched: new Date() }))
    } catch (error) {
      console.error("Error fetching money manager statistics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch money manager statistics. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  // CRUD operations for loans
  const addLoan = useCallback(
    async (loanData: Omit<Loan, "id">) => {
      try {
        // Generate a temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`
        const tempLoan = { id: tempId, ...loanData } as Loan

        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          loans: [...prev.loans, tempLoan],
        }))

        // Make the API call
        const response = await fetch("/api/loan-tracker/loans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loanData),
        })

        if (!response.ok) throw new Error("Failed to add loan")

        const newLoan = await response.json()

        // Update the cache with the actual data from the server
        setData((prev) => ({
          ...prev,
          loans: prev.loans.map((loan) => (loan.id === tempId ? newLoan : loan)),
        }))

        // Refresh statistics since they're affected by loan changes
        await refreshStatistics()

        toast({
          title: "Success",
          description: "Loan added successfully",
        })

        return newLoan
      } catch (error) {
        console.error("Error adding loan:", error)
        toast({
          title: "Error",
          description: "Failed to add loan. Please try again.",
          variant: "destructive",
        })
        // Refresh data to ensure consistency
        await refreshLoans()
        throw error
      }
    },
    [refreshLoans, refreshStatistics, toast],
  )

  const updateLoan = useCallback(
    async (loan: Loan) => {
        // Store the original loan for rollback
        const originalLoans = [...data.loans]

      try {
        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          loans: prev.loans.map((l) => (l.id === loan.id ? loan : l)),
        }))

        // Make the API call
        const response = await fetch(`/api/loan-tracker/loans/${loan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loan),
        })

        if (!response.ok) throw new Error("Failed to update loan")

        const updatedLoan = await response.json()

        // Refresh statistics since they're affected by loan changes
        await refreshStatistics()

        toast({
          title: "Success",
          description: "Loan updated successfully",
        })

        return updatedLoan
      } catch (error) {
        console.error("Error updating loan:", error)
        // Rollback to original state
        setData((prev) => ({
          ...prev,
          loans: [...originalLoans],
        }))
        toast({
          title: "Error",
          description: "Failed to update loan. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [data.loans, refreshStatistics, toast],
  )

  const deleteLoan = useCallback(
    async (id: string) => {
        // Store the original loans for rollback
        const originalLoans = [...data.loans]

      try {
        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          loans: prev.loans.filter((loan) => loan.id !== id),
        }))

        // Make the API call
        const response = await fetch(`/api/loan-tracker/loans/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete loan")

        // Refresh statistics since they're affected by loan changes
        await refreshStatistics()

        toast({
          title: "Success",
          description: "Loan deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting loan:", error)
        // Rollback to original state
        setData((prev) => ({
          ...prev,
          loans: [...originalLoans],
        }))
        toast({
          title: "Error",
          description: "Failed to delete loan. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [data.loans, refreshStatistics, toast],
  )

  // CRUD operations for members
  const addMember = useCallback(
    async (memberData: Omit<Member, "id" | "createdAt">) => {
      try {
        // Generate a temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`
        const tempCreatedAt = new Date().toISOString()
        const tempMember = { id: tempId, createdAt: tempCreatedAt, ...memberData } as Member

        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          members: [...prev.members, tempMember],
        }))

        // Make the API call
        const response = await fetch("/api/loan-tracker/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        })

        if (!response.ok) throw new Error("Failed to add member")

        const newMember = await response.json()

        // Update the cache with the actual data from the server
        setData((prev) => ({
          ...prev,
          members: prev.members.map((member) => (member.id === tempId ? newMember : member)),
        }))

        toast({
          title: "Success",
          description: "Member added successfully",
        })

        return newMember
      } catch (error) {
        console.error("Error adding member:", error)
        toast({
          title: "Error",
          description: "Failed to add member. Please try again.",
          variant: "destructive",
        })
        // Refresh data to ensure consistency
        await refreshMembers()
        throw error
      }
    },
    [refreshMembers, toast],
  )

  const updateMember = useCallback(
    async (id: string, memberData: Omit<Member, "id" | "createdAt">) => {
      try {
        // Find the member to update
        const memberToUpdate = data.members.find((m) => m.id === id)
        if (!memberToUpdate) throw new Error("Member not found")

        // Create updated member object
        const updatedMember = { ...memberToUpdate, ...memberData }

        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          members: prev.members.map((m) => (m.id === id ? updatedMember : m)),
        }))

        // Make the API call
        const response = await fetch(`/api/loan-tracker/members/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        })

        if (!response.ok) throw new Error("Failed to update member")

        const serverMember = await response.json()

        // Update loans that reference this member (to update the name)
        if (memberData.name !== memberToUpdate.name) {
          setData((prev) => ({
            ...prev,
            loans: prev.loans.map((loan) => (loan.memberId === id ? { ...loan, memberName: memberData.name } : loan)),
          }))
        }

        toast({
          title: "Success",
          description: "Member updated successfully",
        })

        return serverMember
      } catch (error) {
        console.error("Error updating member:", error)
        // Refresh data to ensure consistency
        await refreshMembers()
        toast({
          title: "Error",
          description: "Failed to update member. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [data.members, refreshMembers, toast],
  )

  const deleteMember = useCallback(
    async (id: string) => {
        // Store original data for rollback
        const originalMembers = [...data.members]
        const originalLoans = [...data.loans]

      try {
        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          members: prev.members.filter((member) => member.id !== id),
          // Also filter out loans associated with this member
          loans: prev.loans.filter((loan) => loan.memberId !== id),
        }))

        // Make the API call
        const response = await fetch(`/api/money-manager/members/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete member")

        // Refresh statistics since they're affected by member changes
        await refreshStatistics()

        toast({
          title: "Success",
          description: "Member deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting member:", error)
        // Rollback to original state
        setData((prev) => ({
          ...prev,
          members: [...originalMembers],
          loans: [...originalLoans],
        }))
        toast({
          title: "Error",
          description: "Failed to delete member. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [data.loans, data.members, refreshStatistics, toast],
  )

  // CRUD operations for accounts
  const addAccount = useCallback(
    async (accountData: Omit<Account, "id" | "createdAt">) => {
      try {
        // Generate a temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`
        const tempCreatedAt = new Date().toISOString()
        const tempAccount = { id: tempId, createdAt: tempCreatedAt, ...accountData } as Account

        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          accounts: [...prev.accounts, tempAccount],
        }))

        // Make the API call
        const response = await fetch("/api/money-manager/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(accountData),
        })

        if (!response.ok) throw new Error("Failed to add account")

        const newAccount = await response.json()

        // Update the cache with the actual data from the server
        setData((prev) => ({
          ...prev,
          accounts: prev.accounts.map((account) => (account.id === tempId ? newAccount : account)),
        }))

        // Refresh money manager statistics
        await refreshMoneyManagerStatistics()

        toast({
          title: "Success",
          description: "Account added successfully",
        })

        return newAccount
      } catch (error) {
        console.error("Error adding account:", error)
        toast({
          title: "Error",
          description: "Failed to add account. Please try again.",
          variant: "destructive",
        })
        // Refresh data to ensure consistency
        await refreshAccounts()
        throw error
      }
    },
    [refreshAccounts, refreshMoneyManagerStatistics, toast],
  )

  const updateAccount = useCallback(
    async (id: string, accountData: Omit<Account, "id" | "createdAt">) => {
      try {
        // Find the account to update
        const accountToUpdate = data.accounts.find((a) => a.id === id)
        if (!accountToUpdate) throw new Error("Account not found")

        // Create updated account object
        const updatedAccount = { ...accountToUpdate, ...accountData }

        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          accounts: prev.accounts.map((a) => (a.id === id ? updatedAccount : a)),
        }))

        // Make the API call
        const response = await fetch(`/api/money-manager/accounts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(accountData),
        })

        if (!response.ok) throw new Error("Failed to update account")

        const serverAccount = await response.json()

        // Update transactions that reference this account (to update the name)
        if (accountData.name !== accountToUpdate.name) {
          setData((prev) => ({
            ...prev,
            transactions: prev.transactions.map((transaction) =>
              transaction.accountId === id ? { ...transaction, accountName: accountData.name } : transaction,
            ),
          }))
        }

        // Refresh money manager statistics
        await refreshMoneyManagerStatistics()

        toast({
          title: "Success",
          description: "Account updated successfully",
        })

        return serverAccount
      } catch (error) {
        console.error("Error updating account:", error)
        // Refresh data to ensure consistency
        await refreshAccounts()
        toast({
          title: "Error",
          description: "Failed to update account. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [data.accounts, refreshAccounts, refreshMoneyManagerStatistics, toast],
  )

  const deleteAccount = useCallback(
    async (id: string) => {
        // Store original data for rollback
        const originalAccounts = [...data.accounts]
        const originalTransactions = [...data.transactions]

      try {
        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          accounts: prev.accounts.filter((account) => account.id !== id),
          // Also filter out transactions associated with this account
          transactions: prev.transactions.filter((transaction) => transaction.accountId !== id),
        }))

        // Make the API call
        const response = await fetch(`/api/money-manager/accounts/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete account")

        // Refresh money manager statistics
        await refreshMoneyManagerStatistics()

        toast({
          title: "Success",
          description: "Account deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting account:", error)
        // Rollback to original state
        setData((prev) => ({
          ...prev,
          accounts: [...originalAccounts],
          transactions: [...originalTransactions],
        }))
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [data.accounts, data.transactions, refreshMoneyManagerStatistics, toast],
  )

  // CRUD operations for categories
  const addCategory = useCallback(
    async (categoryData: Omit<Category, "id" | "createdAt">) => {
      try {
        // Generate a temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`
        const tempCreatedAt = new Date().toISOString()
        const tempCategory = { id: tempId, createdAt: tempCreatedAt, ...categoryData } as Category

        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          categories: [...prev.categories, tempCategory],
        }))

        // Make the API call
        const response = await fetch("/api/money-manager/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        })

        if (!response.ok) throw new Error("Failed to add category")

        const newCategory = await response.json()

        // Update the cache with the actual data from the server
        setData((prev) => ({
          ...prev,
          categories: prev.categories.map((category) => (category.id === tempId ? newCategory : category)),
        }))

        toast({
          title: "Success",
          description: "Category added successfully",
        })

        return newCategory
      } catch (error) {
        console.error("Error adding category:", error)
        toast({
          title: "Error",
          description: "Failed to add category. Please try again.",
          variant: "destructive",
        })
        // Refresh data to ensure consistency
        await refreshCategories()
        throw error
      }
    },
    [refreshCategories, toast],
  )

  const updateCategory = useCallback(
    async (id: string, categoryData: Omit<Category, "id" | "createdAt">) => {
      try {
        // Find the category to update
        const categoryToUpdate = data.categories.find((c) => c.id === id)
        if (!categoryToUpdate) throw new Error("Category not found")

        // Create updated category object
        const updatedCategory = { ...categoryToUpdate, ...categoryData }

        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          categories: prev.categories.map((c) => (c.id === id ? updatedCategory : c)),
        }))

        // Make the API call
        const response = await fetch(`/api/money-manager/categories/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        })

        if (!response.ok) throw new Error("Failed to update category")

        const serverCategory = await response.json()

        // Update transactions that reference this category (to update the name)
        if (categoryData.name !== categoryToUpdate.name) {
          setData((prev) => ({
            ...prev,
            transactions: prev.transactions.map((transaction) =>
              transaction.categoryId === id ? { ...transaction, categoryName: categoryData.name } : transaction,
            ),
          }))
        }

        toast({
          title: "Success",
          description: "Category updated successfully",
        })

        return serverCategory
      } catch (error) {
        console.error("Error updating category:", error)
        // Refresh data to ensure consistency
        await refreshCategories()
        toast({
          title: "Error",
          description: "Failed to update category. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [data.categories, refreshCategories, toast],
  )

  const deleteCategory = useCallback(
    async (id: string) => {
        // Store original data for rollback
        const originalCategories = [...data.categories]
        const originalTransactions = [...data.transactions]

      try {
        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          categories: prev.categories.filter((category) => category.id !== id),
          // Also filter out transactions associated with this category
          transactions: prev.transactions.filter((transaction) => transaction.categoryId !== id),
        }))

        // Make the API call
        const response = await fetch(`/api/money-manager/categories/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete category")

        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting category:", error)
        // Rollback to original state
        setData((prev) => ({
          ...prev,
          categories: [...originalCategories],
          transactions: [...originalTransactions],
        }))
        toast({
          title: "Error",
          description: "Failed to delete category. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [data.categories, data.transactions, toast],
  )

  // CRUD operations for transactions
  const addTransaction = useCallback(
    async (transactionData: Omit<Transaction, "id">) => {
      try {
        // Generate a temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`
        const tempTransaction = { id: tempId, ...transactionData } as Transaction

        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          transactions: [...prev.transactions, tempTransaction],
        }))

        // Make the API call
        const response = await fetch("/api/money-manager/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        })

        if (!response.ok) throw new Error("Failed to add transaction")

        const newTransaction = await response.json()

        // Update the cache with the actual data from the server
        setData((prev) => ({
          ...prev,
          transactions: prev.transactions.map((transaction) =>
            transaction.id === tempId ? newTransaction : transaction,
          ),
        }))

        // Refresh money manager statistics and accounts (since balances change)
        await Promise.all([refreshMoneyManagerStatistics(), refreshAccounts()])

        toast({
          title: "Success",
          description: "Transaction added successfully",
        })

        return newTransaction
      } catch (error) {
        console.error("Error adding transaction:", error)
        toast({
          title: "Error",
          description: "Failed to add transaction. Please try again.",
          variant: "destructive",
        })
        // Refresh data to ensure consistency
        await refreshTransactions()
        throw error
      }
    },
    [refreshAccounts, refreshMoneyManagerStatistics, refreshTransactions, toast],
  )

  const updateTransaction = useCallback(
    async (id: string, transactionData: Omit<Transaction, "id">) => {
      try {
        // Find the transaction to update
        const transactionToUpdate = data.transactions.find((t) => t.id === id)
        if (!transactionToUpdate) throw new Error("Transaction not found")

        // Create updated transaction object
        const updatedTransaction = { ...transactionToUpdate, ...transactionData, id }

        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          transactions: prev.transactions.map((t) => (t.id === id ? updatedTransaction : t)),
        }))

        // Make the API call
        const response = await fetch(`/api/money-manager/transactions/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        })

        if (!response.ok) throw new Error("Failed to update transaction")

        const serverTransaction = await response.json()

        // Refresh money manager statistics and accounts (since balances change)
        await Promise.all([refreshMoneyManagerStatistics(), refreshAccounts()])

        toast({
          title: "Success",
          description: "Transaction updated successfully",
        })

        return serverTransaction
      } catch (error) {
        console.error("Error updating transaction:", error)
        // Refresh data to ensure consistency
        await refreshTransactions()
        toast({
          title: "Error",
          description: "Failed to update transaction. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [data.transactions, refreshAccounts, refreshMoneyManagerStatistics, refreshTransactions, toast],
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
        // Store original data for rollback
        const originalTransactions = [...data.transactions]

      try {
        // Optimistically update the UI
        setData((prev) => ({
          ...prev,
          transactions: prev.transactions.filter((transaction) => transaction.id !== id),
        }))

        // Make the API call
        const response = await fetch(`/api/money-manager/transactions/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete transaction")

        // Refresh money manager statistics and accounts (since balances change)
        await Promise.all([refreshMoneyManagerStatistics(), refreshAccounts()])

        toast({
          title: "Success",
          description: "Transaction deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting transaction:", error)
        // Rollback to original state
        setData((prev) => ({
          ...prev,
          transactions: [...originalTransactions],
        }))
        toast({
          title: "Error",
          description: "Failed to delete transaction. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [data.transactions, refreshAccounts, refreshMoneyManagerStatistics, toast],
  )

  // Fetch data on initial load
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Provide all data and operations to children
  return (
    <DataContext.Provider
      value={{
        ...data,
        refreshData,
        refreshLoans,
        refreshMembers,
        refreshAccounts,
        refreshCategories,
        refreshTransactions,
        refreshStatistics,
        refreshMoneyManagerStatistics,
        addLoan,
        updateLoan,
        deleteLoan,
        addMember,
        updateMember,
        deleteMember,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// Custom hook to use the data context
export function useAppData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useAppData must be used within a DataProvider")
  }
  return context
}

