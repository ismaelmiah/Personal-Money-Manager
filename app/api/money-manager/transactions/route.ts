import { NextResponse } from "next/server"
import { getTransactions,  updateTransaction, deleteTransaction } from "@/lib/money-manager-service"

export async function GET() {
  try {
    const transactions = await getTransactions()
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { AccountId, AccountName, amount, Currency, Status, CategoryId, CategoryName, CreatedAt, notes } = body

    if (!AccountId || !amount || !CategoryId || !CreatedAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedTransaction = await updateTransaction(params.id, {
      AccountId,
      AccountName,
      Amount: Number.parseFloat(amount),
      Currency,
      Status,
      CategoryId,
      CategoryName,
      CreatedAt,
      Notes: notes || "",
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteTransaction(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}

