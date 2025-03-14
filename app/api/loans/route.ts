import { NextResponse } from "next/server"
import {  getLoans, updateLoan, deleteLoan } from "@/lib/loan-tracker-service"


export async function GET() {
  try {
    const loans = await getLoans()
    return NextResponse.json(loans)
  } catch (error) {
    console.error("Error fetching loans:", error)
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    const body = await request.json()
    const { memberid, membername, amount, currency, status, createdAt, notes } = body

    if (!memberid || !amount || !currency || !status || !createdAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedLoan = await updateLoan(id, {
      memberid,
      membername,
      amount: Number.parseFloat(amount),
      currency,
      status,
      createdAt,
      notes: notes || "",
    })

    return NextResponse.json(updatedLoan)
  } catch (error) {
    console.error("Error updating loan:", error)
    return NextResponse.json({ error: "Failed to update loan" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    await deleteLoan(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting loan:", error)
    return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 })
  }
}
