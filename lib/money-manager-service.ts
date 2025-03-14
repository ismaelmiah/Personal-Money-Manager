import { getSpreadsheetData, appendToSpreadsheet, updateSpreadsheetData } from "./loan-tracker-service"

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
  createdAt: string
  notes: string
}

// Get all accounts
export async function getAccounts(): Promise<Account[]> {
  try {
    const data = await getSpreadsheetData("Accounts!A2:E")
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
    const data = await getSpreadsheetData("Categories!A2:D")
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
    const data = await getSpreadsheetData("Transactions!A2:I")
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
      createdAt: String(row[8] || new Date().toISOString()),
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

    await appendToSpreadsheet("Accounts!A2:E", values)

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

    await appendToSpreadsheet("Categories!A2:D", values)

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
        transaction.createdAt,
        transaction.notes || "",
      ],
    ]
    console.log("Adding transaction with values:", values)

    await appendToSpreadsheet("Transactions!A2:J", values)

    // Update account balance
    const accounts = await getAccounts()
    const account = accounts.find((a) => a.id === transaction.accountId)

    if (account) {
      const newbalance = transaction.type === "income" 
        ? account.balance + transaction.amount 
        : account.balance - transaction.amount

      // Find the row index of the account
      const accountData = await getSpreadsheetData("Accounts!A:A")
      const rowIndex = accountData.findIndex((row: any[]) => row[0] === account.id) + 2 // +2 because of header and 0-indexing

      if (rowIndex > 1) {
        await updateSpreadsheetData(`Accounts!C${rowIndex}`, [[newbalance]])
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


// Update account
export async function updateAccount(id: string, account: Omit<Account, "id" | "createdAt">): Promise<Account> {
  try {
    // First, get all accounts to find the row index
    const accounts = await getAccounts()
    const accountIndex = accounts.findIndex((a) => a.id === id)

    if (accountIndex === -1) {
      throw new Error(`Account with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = accountIndex + 2

    // Update the account in the spreadsheet
    const values = [[id, account.name, account.balance, account.currency, accounts[accountIndex].createdAt]]

    await updateSpreadsheetData(`Accounts!A${rowIndex}:E${rowIndex}`, values)

    return {
      id,
      ...account,
      createdAt: accounts[accountIndex].createdAt,
    }
  } catch (error) {
    console.error("Error in updateAccount:", error)
    throw error
  }
}

// Delete account
export async function deleteAccount(id: string): Promise<void> {
  try {
    // First, get all accounts to find the row index
    const accounts = await getAccounts()
    const accountIndex = accounts.findIndex((a) => a.id === id)

    if (accountIndex === -1) {
      throw new Error(`Account with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = accountIndex + 2

    // Delete the account by clearing the row
    await updateSpreadsheetData(`Accounts!A${rowIndex}:E${rowIndex}`, [[""]])
  } catch (error) {
    console.error("Error in deleteAccount:", error)
    throw error
  }
}

// Update category
export async function updateCategory(id: string, category: Omit<Category, "id" | "createdAt">): Promise<Category> {
  try {
    // First, get all categories to find the row index
    const categories = await getCategories()
    const categoryIndex = categories.findIndex((c) => c.id === id)

    if (categoryIndex === -1) {
      throw new Error(`Category with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = categoryIndex + 2

    // Update the category in the spreadsheet
    const values = [[id, category.name, category.type, categories[categoryIndex].createdAt]]
    await updateSpreadsheetData(`Categories!A${rowIndex}:D${rowIndex}`, values)

    return {
      id,
      ...category,
      createdAt: categories[categoryIndex].createdAt,
    }
  } catch (error) {
    console.error("Error in updateCategory:", error)
    throw error
  }
}

// Delete category
export async function deleteCategory(id: string): Promise<void> {
  try {
    // First, get all categories to find the row index
    const categories = await getCategories()
    const categoryIndex = categories.findIndex((c) => c.id === id)

    if (categoryIndex === -1) {
      throw new Error(`Category with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = categoryIndex + 2

    // Delete the category by clearing the row
    await updateSpreadsheetData(`MoneyManager_Categories!A${rowIndex}:D${rowIndex}`, [[""]])
  } catch (error) {
    console.error("Error in deleteCategory:", error)
    throw error
  }
}

// Update transaction
export async function updateTransaction(id: string, transaction: Omit<Transaction, "id">): Promise<Transaction> {
  try {
    // First, get all transactions to find the row index
    const transactions = await getTransactions()
    const transactionIndex = transactions.findIndex((t) => t.id === id)

    if (transactionIndex === -1) {
      throw new Error(`Transaction with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = transactionIndex + 2

    // Get the old transaction to calculate account balance adjustment
    const oldTransaction = transactions[transactionIndex]

    // Update the transaction in the spreadsheet
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
        transaction.createdAt,
        transaction.notes || "",
      ],
    ]
    await updateSpreadsheetData(`Transactions!A${rowIndex}:J${rowIndex}`, values)

    // Update account balance if the account or amount or type has changed
    if (
      oldTransaction.accountId !== transaction.accountId ||
      oldTransaction.amount !== transaction.amount ||
      oldTransaction.type !== transaction.type
    ) {
      // Get accounts
      const accounts = await getAccounts()

      // If the account has changed, update both old and new account balances
      if (oldTransaction.accountId !== transaction.accountId) {
        // Update old account balance
        const oldAccount = accounts.find((a) => a.id === oldTransaction.accountId)
        if (oldAccount) {
          const oldAccountNewbalance =
            oldTransaction.type === "income"
              ? oldAccount.balance - oldTransaction.amount
              : oldAccount.balance + oldTransaction.amount

          const oldAccountIndex = accounts.findIndex((a) => a.id === oldTransaction.accountId)
          const oldAccountRowIndex = oldAccountIndex + 2
          await updateSpreadsheetData(`Accounts!C${oldAccountRowIndex}`, [[oldAccountNewbalance]])
        }

        // Update new account balance
        const newAccount = accounts.find((a) => a.id === transaction.accountId)
        if (newAccount) {
          const newAccountNewbalance =
            transaction.type === "income"
              ? newAccount.balance + transaction.amount
              : newAccount.balance - transaction.amount

          const newAccountIndex = accounts.findIndex((a) => a.id === transaction.accountId)
          const newAccountRowIndex = newAccountIndex + 2
          await updateSpreadsheetData(`MoneyManager_Accounts!C${newAccountRowIndex}`, [[newAccountNewbalance]])
        }
      } else if (
        // If only amount or type has changed, update the current account balance
        oldTransaction.amount !== transaction.amount ||
        oldTransaction.type !== transaction.type
      ) {
        const account = accounts.find((a) => a.id === transaction.accountId)
        if (account) {
          // Calculate the balance adjustment
          let balanceAdjustment = 0

          // Remove the effect of the old transaction
          if (oldTransaction.type === "income") {
            balanceAdjustment -= oldTransaction.amount
          } else {
            balanceAdjustment += oldTransaction.amount
          }

          // Add the effect of the new transaction
          if (transaction.type === "income") {
            balanceAdjustment += transaction.amount
          } else {
            balanceAdjustment -= transaction.amount
          }

          // Update the account balance
          const newbalance = account.balance + balanceAdjustment
          const accountIndex = accounts.findIndex((a) => a.id === transaction.accountId)
          const accountRowIndex = accountIndex + 2
          await updateSpreadsheetData(`MoneyManager_Accounts!C${accountRowIndex}`, [[newbalance]])
        }
      }
    }

    return {
      id,
      ...transaction,
    }
  } catch (error) {
    console.error("Error in updateTransaction:", error)
    throw error
  }
}

// Delete transaction
export async function deleteTransaction(id: string): Promise<void> {
  try {
    // First, get all transactions to find the row index
    const transactions = await getTransactions()
    const transactionIndex = transactions.findIndex((t) => t.id === id)

    if (transactionIndex === -1) {
      throw new Error(`Transaction with ID ${id} not found`)
    }

    // Get the transaction to adjust account balance
    const transaction = transactions[transactionIndex]

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = transactionIndex + 2

    // Delete the transaction by clearing the row
    await updateSpreadsheetData(`MoneyManager_Transactions!A${rowIndex}:J${rowIndex}`, [[""]])

    // Update account balance
    const accounts = await getAccounts()
    const account = accounts.find((a) => a.id === transaction.accountId)

    if (account) {
      // Calculate the new balance
      const newbalance = transaction.type === "income" 
      ? account.balance - transaction.amount 
      : account.balance + transaction.amount

      // Update the account balance
      const accountIndex = accounts.findIndex((a) => a.id === transaction.accountId)
      const accountRowIndex = accountIndex + 2
      await updateSpreadsheetData(`MoneyManager_Accounts!C${accountRowIndex}`, [[newbalance]])
    }
  } catch (error) {
    console.error("Error in deleteTransaction:", error)
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
      categoryname: category.name,
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
    const createdAt = new Date(transaction.createdAt)
    const monthYear = `${createdAt.toLocaleString("default", { month: "short" })} ${createdAt.getFullYear()}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 }
    }

    if (transaction.type === "income") {
      monthlyData[monthYear].income += transaction.amount
    } else {
      monthlyData[monthYear].expense += transaction.amount
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

