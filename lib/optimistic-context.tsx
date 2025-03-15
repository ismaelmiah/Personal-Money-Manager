"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { Loan, Member } from "@/lib/loan-tracker-service"
import type { Account, Category, Transaction } from "@/lib/money-manager-service"

type OptimisticData = {
  loans: Loan[]
  members: Member[]
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
}

type OptimisticContextType = {
  data: OptimisticData
  setOptimisticLoans: (loans: Loan[]) => void
  setOptimisticMembers: (members: Member[]) => void
  setOptimisticAccounts: (accounts: Account[]) => void
  setOptimisticCategories: (categories: Category[]) => void
  setOptimisticTransactions: (transactions: Transaction[]) => void
  addOptimisticLoan: (loan: Loan) => void
  updateOptimisticLoan: (loan: Loan) => void
  deleteOptimisticLoan: (id: string) => void
  addOptimisticMember: (member: Member) => void
  updateOptimisticMember: (member: Member) => void
  deleteOptimisticMember: (id: string) => void
  addOptimisticAccount: (account: Account) => void
  updateOptimisticAccount: (account: Account) => void
  deleteOptimisticAccount: (id: string) => void
  addOptimisticCategory: (category: Category) => void
  updateOptimisticCategory: (category: Category) => void
  deleteOptimisticCategory: (id: string) => void
  addOptimisticTransaction: (transaction: Transaction) => void
  updateOptimisticTransaction: (transaction: Transaction) => void
  deleteOptimisticTransaction: (id: string) => void
}

const OptimisticContext = createContext<OptimisticContextType | null>(null)

export function OptimisticProvider({ children }: { children: React.ReactNode }) {
  const [optimisticData, setOptimisticData] = useState<OptimisticData>({
    loans: [],
    members: [],
    accounts: [],
    categories: [],
    transactions: [],
  })

  const setOptimisticLoans = useCallback((loans: Loan[]) => {
    setOptimisticData((prev) => ({ ...prev, loans }))
  }, [])

  const setOptimisticMembers = useCallback((members: Member[]) => {
    setOptimisticData((prev) => ({ ...prev, members }))
  }, [])

  const setOptimisticAccounts = useCallback((accounts: Account[]) => {
    setOptimisticData((prev) => ({ ...prev, accounts }))
  }, [])

  const setOptimisticCategories = useCallback((categories: Category[]) => {
    setOptimisticData((prev) => ({ ...prev, categories }))
  }, [])

  const setOptimisticTransactions = useCallback((transactions: Transaction[]) => {
    setOptimisticData((prev) => ({ ...prev, transactions }))
  }, [])

  // Loan operations
  const addOptimisticLoan = useCallback((loan: Loan) => {
    setOptimisticData((prev) => ({
      ...prev,
      loans: [...prev.loans, loan],
    }))
  }, [])

  const updateOptimisticLoan = useCallback((loan: Loan) => {
    setOptimisticData((prev) => ({
      ...prev,
      loans: prev.loans.map((l) => (l.id === loan.id ? loan : l)),
    }))
  }, [])

  const deleteOptimisticLoan = useCallback((id: string) => {
    setOptimisticData((prev) => ({
      ...prev,
      loans: prev.loans.filter((l) => l.id !== id),
    }))
  }, [])

  // Member operations
  const addOptimisticMember = useCallback((member: Member) => {
    setOptimisticData((prev) => ({
      ...prev,
      members: [...prev.members, member],
    }))
  }, [])

  const updateOptimisticMember = useCallback((member: Member) => {
    setOptimisticData((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === member.id ? member : m)),
    }))
  }, [])

  const deleteOptimisticMember = useCallback((id: string) => {
    setOptimisticData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }))
  }, [])

  // Account operations
  const addOptimisticAccount = useCallback((account: Account) => {
    setOptimisticData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, account],
    }))
  }, [])

  const updateOptimisticAccount = useCallback((account: Account) => {
    setOptimisticData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === account.id ? account : a)),
    }))
  }, [])

  const deleteOptimisticAccount = useCallback((id: string) => {
    setOptimisticData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== id),
    }))
  }, [])

  // Category operations
  const addOptimisticCategory = useCallback((category: Category) => {
    setOptimisticData((prev) => ({
      ...prev,
      categories: [...prev.categories, category],
    }))
  }, [])

  const updateOptimisticCategory = useCallback((category: Category) => {
    setOptimisticData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === category.id ? category : c)),
    }))
  }, [])

  const deleteOptimisticCategory = useCallback((id: string) => {
    setOptimisticData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }))
  }, [])

  // Transaction operations
  const addOptimisticTransaction = useCallback((transaction: Transaction) => {
    setOptimisticData((prev) => ({
      ...prev,
      transactions: [...prev.transactions, transaction],
    }))
  }, [])

  const updateOptimisticTransaction = useCallback((transaction: Transaction) => {
    setOptimisticData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === transaction.id ? transaction : t)),
    }))
  }, [])

  const deleteOptimisticTransaction = useCallback((id: string) => {
    setOptimisticData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }))
  }, [])

  return (
    <OptimisticContext.Provider
      value={{
        data: optimisticData,
        setOptimisticLoans,
        setOptimisticMembers,
        setOptimisticAccounts,
        setOptimisticCategories,
        setOptimisticTransactions,
        addOptimisticLoan,
        updateOptimisticLoan,
        deleteOptimisticLoan,
        addOptimisticMember,
        updateOptimisticMember,
        deleteOptimisticMember,
        addOptimisticAccount,
        updateOptimisticAccount,
        deleteOptimisticAccount,
        addOptimisticCategory,
        updateOptimisticCategory,
        deleteOptimisticCategory,
        addOptimisticTransaction,
        updateOptimisticTransaction,
        deleteOptimisticTransaction,
      }}
    >
      {children}
    </OptimisticContext.Provider>
  )
}

export function useOptimistic() {
  const context = useContext(OptimisticContext)
  if (!context) {
    throw new Error("useOptimistic must be used within an OptimisticProvider")
  }
  return context
}

