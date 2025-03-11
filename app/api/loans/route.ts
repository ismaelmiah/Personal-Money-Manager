import { NextResponse } from "next/server"
import {  getLoans, updateLoan, deleteLoan } from "@/lib/loan-tracker-service"


export async function GET() {
  try {
    const loans = await getLoans()
    console.log("loans GET: ", loans)
    return NextResponse.json(loans)
  } catch (error) {
    console.error("Error fetching loans:", error)
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { MemberId, MemberName, Amount, Currency, Status, CreatedAt, Notes } = body

    if (!MemberId || !Amount || !Currency || !Status || !CreatedAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedLoan = await updateLoan(params.id, {
      MemberId,
      MemberName,
      Amount: Number.parseFloat(Amount),
      Currency,
      Status,
      CreatedAt,
      Notes: Notes || "",
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
