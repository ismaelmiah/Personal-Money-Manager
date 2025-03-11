import { NextResponse } from "next/server"
import { getTransactions, updateTransaction, deleteTransaction } from "@/lib/money-manager-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const transactions = await getTransactions()
    const transaction = transactions.find((t) => t.Id === params.id)

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { AccountId, AccountName, Amount, Currency, Status, CategoryId, CategoryName, CreatedAt, Notes } = body

    if (!AccountId || !Amount || !CategoryId || !CreatedAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedTransaction = await updateTransaction(params.id, {
      AccountId,
      AccountName,
      Amount: Number.parseFloat(Amount),
      Currency,
      Status,
      CategoryId,
      CategoryName,
      CreatedAt,
      Notes: Notes || "",
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

