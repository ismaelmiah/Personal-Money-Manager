import { NextResponse } from "next/server"
import { getTransactions, updateTransaction, deleteTransaction } from "@/lib/money-manager-service"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    const transactions = await getTransactions()
    const transaction = transactions.find((t) => t.id === id)

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    const body = await request.json()
    const { accountId, accountName, amount, currency, type, categoryId, categoryName, createdAt, notes } = body

    if (!accountId || !amount || !categoryId || !createdAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedTransaction = await updateTransaction(id, {
      accountId,
      accountName,
      amount: Number.parseFloat(amount),
      currency,
      type,
      categoryId,
      categoryName,
      createdAt,
      notes: notes || "",
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    await deleteTransaction(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}

