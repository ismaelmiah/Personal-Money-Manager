import { NextResponse } from "next/server"
import { addTransaction, getTransactions } from "@/lib/money-manager"

export async function GET() {
  try {
    const transactions = await getTransactions()
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accountId, accountName, amount, currency, type, categoryId, categoryName, date, notes } = body

    if (!accountId || !amount || !categoryId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newTransaction = await addTransaction({
      accountId,
      accountName,
      amount: Number.parseFloat(amount),
      currency,
      type,
      categoryId,
      categoryName,
      date,
      notes: notes || "",
    })

    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}

