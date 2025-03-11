import { NextResponse } from "next/server"
import { getLoans, updateLoan, deleteLoan } from "@/lib/google-sheets"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const loans = await getLoans()
    const loan = loans.find((l) => l.id === params.id)

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    return NextResponse.json(loan)
  } catch (error) {
    console.error("Error fetching loan:", error)
    return NextResponse.json({ error: "Failed to fetch loan" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { memberId, memberName, amount, currency, type, date, notes } = body

    if (!memberId || !amount || !currency || !type || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedLoan = await updateLoan(params.id, {
      memberId,
      memberName,
      amount: Number.parseFloat(amount),
      currency,
      type,
      date,
      notes: notes || "",
    })

    return NextResponse.json(updatedLoan)
  } catch (error) {
    console.error("Error updating loan:", error)
    return NextResponse.json({ error: "Failed to update loan" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteLoan(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting loan:", error)
    return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 })
  }
}

