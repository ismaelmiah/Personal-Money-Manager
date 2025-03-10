import { getSpreadsheetData, appendToSpreadsheet, updateSpreadsheetData } from "./loan-tracker-service"

// Types
export type Account = {
  Id: string
  Name: string
  Balance: number
  Currency: string
  CreatedAt: string
}

export type Category = {
  Id: string
  Name: string
  Status: "expense" | "income"
  CreatedAt: string
}

export type Transaction = {
  Id: string
  AccountId: string
  AccountName: string
  Amount: number
  Currency: string
  Status: "expense" | "income"
  CategoryId: string
  CategoryName: string
  CreatedAt: string
  Notes: string
}

// Get all accounts
export async function getAccounts(): Promise<Account[]> {
  try {
    const data = await getSpreadsheetData("Accounts!A2:E")
    console.log("Raw accounts data:", data)

    return data.map((row: any[]) => ({
      Id: String(row[0] || ""),
      Name: String(row[1] || ""),
      Balance: typeof row[2] === "number" ? row[2] : Number.parseFloat(row[2]) || 0,
      Currency: String(row[3] || "BDT"),
      CreatedAt: String(row[4] || new Date().toISOString()),
    }))
  } catch (error) {
    console.error("Error in getAccounts:", error)
    return []
  }
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const data = await getSpreadsheetData("Categories!A2:D")
    console.log("Raw categories data:", data)

    return data.map((row: any[]) => ({
      Id: String(row[0] || ""),
      Name: String(row[1] || ""),
      Status: row[2] === "expense" || row[2] === "income" ? row[2] : "expense",
      CreatedAt: String(row[3] || new Date().toISOString()),
    }))
  } catch (error) {
    console.error("Error in getCategories:", error)
    return []
  }
}

// Get all transactions
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const data = await getSpreadsheetData("Transactions!A2:I")
    console.log("Raw transactions data:", data)

    return data.map((row: any[]) => ({
      Id: String(row[0] || ""),
      AccountId: String(row[1] || ""),
      AccountName: String(row[2] || ""),
      Amount: typeof row[3] === "number" ? row[3] : Number.parseFloat(row[3]) || 0,
      Currency: String(row[4] || "BDT"),
      Status: row[5] === "expense" || row[5] === "income" ? row[5] : "expense",
      CategoryId: String(row[6] || ""),
      CategoryName: String(row[7] || ""),
      CreatedAt: String(row[8] || new Date().toISOString()),
      Notes: String(row[9] || ""),
    }))
  } catch (error) {
    console.error("Error in getTransactions:", error)
    return []
  }
}

// Add new account
export async function addAccount(account: Omit<Account, "Id" | "CreatedAt">): Promise<Account> {
  try {
    const Id = `A${Date.now()}`
    const CreatedAt = new Date().toISOString()

    const values = [[Id, account.Name, account.Balance, account.Currency, CreatedAt]]
    console.log("Adding account with values:", values)

    await appendToSpreadsheet("Accounts!A2:E", values)

    return {
      Id,
      ...account,
      CreatedAt,
    }
  } catch (error) {
    console.error("Error in addAccount:", error)
    throw error
  }
}

// Add new category
export async function addCategory(category: Omit<Category, "Id" | "CreatedAt">): Promise<Category> {
  try {
    const Id = `C${Date.now()}`
    const CreatedAt = new Date().toISOString()

    const values = [[Id, category.Name, category.Status, CreatedAt]]
    console.log("Adding category with values:", values)

    await appendToSpreadsheet("Categories!A2:D", values)

    return {
      Id,
      ...category,
      CreatedAt,
    }
  } catch (error) {
    console.error("Error in addCategory:", error)
    throw error
  }
}

// Add new transaction
export async function addTransaction(transaction: Omit<Transaction, "Id">): Promise<Transaction> {
  try {
    const Id = `T${Date.now()}`

    const values = [
      [
        Id,
        transaction.AccountId,
        transaction.AccountName,
        transaction.Amount,
        transaction.Currency,
        transaction.Status,
        transaction.CategoryId,
        transaction.CategoryName,
        transaction.CreatedAt,
        transaction.Notes || "",
      ],
    ]
    console.log("Adding transaction with values:", values)

    await appendToSpreadsheet("Transactions!A2:J", values)

    // Update account balance
    const accounts = await getAccounts()
    const account = accounts.find((a) => a.Id === transaction.AccountId)

    if (account) {
      const newBalance =
        transaction.Status === "income" ? account.Balance + transaction.Amount : account.Balance - transaction.Amount

      // Find the row index of the account
      const accountData = await getSpreadsheetData("Accounts!A:A")
      const rowIndex = accountData.findIndex((row: any[]) => row[0] === account.Id) + 2 // +2 because of header and 0-indexing

      if (rowIndex > 1) {
        await updateSpreadsheetData(`Accounts!C${rowIndex}`, [[newBalance]])
      }
    }

    return {
      Id,
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
  const totalIncome = transactions.filter((t) => t.Status === "income").reduce((sum, t) => sum + t.Amount, 0)

  const totalExpense = transactions.filter((t) => t.Status === "expense").reduce((sum, t) => sum + t.Amount, 0)

  // Transactions by category
  const categoryStats = categories.map((category) => {
    const categoryTransactions = transactions.filter((t) => t.CategoryId === category.Id)
    const total = categoryTransactions.reduce((sum, t) => sum + t.Amount, 0)

    return {
      categoryId: category.Id,
      categoryName: category.Name,
      categoryType: category.Status,
      total,
      count: categoryTransactions.length,
    }
  })

  // Transactions by account
  const accountStats = accounts.map((account) => {
    const accountTransactions = transactions.filter((t) => t.AccountId === account.Id)
    const income = accountTransactions.filter((t) => t.Status === "income").reduce((sum, t) => sum + t.Amount, 0)

    const expense = accountTransactions.filter((t) => t.Status === "expense").reduce((sum, t) => sum + t.Amount, 0)

    return {
      accountId: account.Id,
      accountName: account.Name,
      balance: account.Balance,
      currency: account.Currency,
      income,
      expense,
      transactionCount: accountTransactions.length,
    }
  })

  // Monthly statistics
  const monthlyData: Record<string, { income: number; expense: number }> = {}

  transactions.forEach((transaction) => {
    const createdAt = new Date(transaction.CreatedAt)
    const monthYear = `${createdAt.toLocaleString("default", { month: "short" })} ${createdAt.getFullYear()}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 }
    }

    if (transaction.Status === "income") {
      monthlyData[monthYear].income += transaction.Amount
    } else {
      monthlyData[monthYear].expense += transaction.Amount
    }
  })

  // Convert to array and sort by createdAt
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

