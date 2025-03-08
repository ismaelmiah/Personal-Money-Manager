import { getSpreadsheetData, appendToSpreadsheet, updateSpreadsheetData } from "./google-sheets"

// Types
export type Account = {
  id: string
  name: string
  balance: number
  currency: string
  createdAt: string
}

export type Category = {
  id: string
  name: string
  type: "expense" | "income"
  createdAt: string
}

export type Transaction = {
  id: string
  accountId: string
  accountName: string
  amount: number
  currency: string
  type: "expense" | "income"
  categoryId: string
  categoryName: string
  date: string
  notes: string
}

// Get all accounts
export async function getAccounts(): Promise<Account[]> {
  try {
    const data = await getSpreadsheetData("MoneyManager_Accounts!A2:E")
    console.log("Raw accounts data:", data)

    return data.map((row: any[]) => ({
      id: String(row[0] || ""),
      name: String(row[1] || ""),
      balance: typeof row[2] === "number" ? row[2] : Number.parseFloat(row[2]) || 0,
      currency: String(row[3] || "BDT"),
      createdAt: String(row[4] || new Date().toISOString()),
    }))
  } catch (error) {
    console.error("Error in getAccounts:", error)
    return []
  }
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const data = await getSpreadsheetData("MoneyManager_Categories!A2:D")
    console.log("Raw categories data:", data)

    return data.map((row: any[]) => ({
      id: String(row[0] || ""),
      name: String(row[1] || ""),
      type: row[2] === "expense" || row[2] === "income" ? row[2] : "expense",
      createdAt: String(row[3] || new Date().toISOString()),
    }))
  } catch (error) {
    console.error("Error in getCategories:", error)
    return []
  }
}

// Get all transactions
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const data = await getSpreadsheetData("MoneyManager_Transactions!A2:I")
    console.log("Raw transactions data:", data)

    return data.map((row: any[]) => ({
      id: String(row[0] || ""),
      accountId: String(row[1] || ""),
      accountName: String(row[2] || ""),
      amount: typeof row[3] === "number" ? row[3] : Number.parseFloat(row[3]) || 0,
      currency: String(row[4] || "BDT"),
      type: row[5] === "expense" || row[5] === "income" ? row[5] : "expense",
      categoryId: String(row[6] || ""),
      categoryName: String(row[7] || ""),
      date: String(row[8] || new Date().toISOString()),
      notes: String(row[9] || ""),
    }))
  } catch (error) {
    console.error("Error in getTransactions:", error)
    return []
  }
}

// Add new account
export async function addAccount(account: Omit<Account, "id" | "createdAt">): Promise<Account> {
  try {
    const id = `A${Date.now()}`
    const createdAt = new Date().toISOString()

    const values = [[id, account.name, account.balance, account.currency, createdAt]]
    console.log("Adding account with values:", values)

    await appendToSpreadsheet("MoneyManager_Accounts!A2:E", values)

    return {
      id,
      ...account,
      createdAt,
    }
  } catch (error) {
    console.error("Error in addAccount:", error)
    throw error
  }
}

// Add new category
export async function addCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category> {
  try {
    const id = `C${Date.now()}`
    const createdAt = new Date().toISOString()

    const values = [[id, category.name, category.type, createdAt]]
    console.log("Adding category with values:", values)

    await appendToSpreadsheet("MoneyManager_Categories!A2:D", values)

    return {
      id,
      ...category,
      createdAt,
    }
  } catch (error) {
    console.error("Error in addCategory:", error)
    throw error
  }
}

// Add new transaction
export async function addTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction> {
  try {
    const id = `T${Date.now()}`

    const values = [
      [
        id,
        transaction.accountId,
        transaction.accountName,
        transaction.amount,
        transaction.currency,
        transaction.type,
        transaction.categoryId,
        transaction.categoryName,
        transaction.date,
        transaction.notes || "",
      ],
    ]
    console.log("Adding transaction with values:", values)

    await appendToSpreadsheet("MoneyManager_Transactions!A2:J", values)

    // Update account balance
    const accounts = await getAccounts()
    const account = accounts.find((a) => a.id === transaction.accountId)

    if (account) {
      const newBalance =
        transaction.type === "income" ? account.balance + transaction.amount : account.balance - transaction.amount

      // Find the row index of the account
      const accountData = await getSpreadsheetData("MoneyManager_Accounts!A:A")
      const rowIndex = accountData.findIndex((row: any[]) => row[0] === account.id) + 2 // +2 because of header and 0-indexing

      if (rowIndex > 1) {
        await updateSpreadsheetData(`MoneyManager_Accounts!C${rowIndex}`, [[newBalance]])
      }
    }

    return {
      id,
      ...transaction,
    }
  } catch (error) {
    console.error("Error in addTransaction:", error)
    throw error
  }
}

// Get statistics
export async function getMoneyManagerStatistics() {
  const transactions = await getTransactions()
  const accounts = await getAccounts()
  const categories = await getCategories()

  // Total income and expenses
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  // Transactions by category
  const categoryStats = categories.map((category) => {
    const categoryTransactions = transactions.filter((t) => t.categoryId === category.id)
    const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)

    return {
      categoryId: category.id,
      categoryName: category.name,
      categoryType: category.type,
      total,
      count: categoryTransactions.length,
    }
  })

  // Transactions by account
  const accountStats = accounts.map((account) => {
    const accountTransactions = transactions.filter((t) => t.accountId === account.id)
    const income = accountTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expense = accountTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    return {
      accountId: account.id,
      accountName: account.name,
      balance: account.balance,
      currency: account.currency,
      income,
      expense,
      transactionCount: accountTransactions.length,
    }
  })

  // Monthly statistics
  const monthlyData: Record<string, { income: number; expense: number }> = {}

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 }
    }

    if (transaction.type === "income") {
      monthlyData[monthYear].income += transaction.amount
    } else {
      monthlyData[monthYear].expense += transaction.amount
    }
  })

  // Convert to array and sort by date
  const monthlyStats = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      ...data,
    }))
    .sort((a, b) => {
      const [monthA, yearA] = a.month.split(" ")
      const [monthB, yearB] = b.month.split(" ")
      return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime()
    })

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categoryStats,
    accountStats,
    monthlyStats,
  }
}

