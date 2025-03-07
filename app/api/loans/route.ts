import { NextResponse } from "next/server"
import { addLoan, getLoans } from "@/lib/google-sheets"

export async function GET() {
  try {
    const loans = await getLoans()
    return NextResponse.json(loans)
  } catch (error) {
    console.error("Error fetching loans:", error)
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberId, memberName, amount, currency, type, date, notes } = body

    if (!memberId || !amount || !currency || !type || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newLoan = await addLoan({
      memberId,
      memberName,
      amount: Number.parseFloat(amount),
      currency,
      type,
      date,
      notes: notes || "",
    })

    return NextResponse.json(newLoan, { status: 201 })
  } catch (error) {
    console.error("Error creating loan:", error)
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 })
  }
}

