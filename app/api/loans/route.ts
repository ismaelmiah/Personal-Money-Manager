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
    const { MemberId, MemberName, Amount, Currency, Status, CreatedAt, Notes } = body

    if (!MemberId || !Amount || !Currency || !Status || !CreatedAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newLoan = await addLoan({
      MemberId,
      MemberName,
      Amount: Number.parseFloat(Amount),
      Currency,
      Status,
      CreatedAt,
      Notes: Notes || "",
    })

    return NextResponse.json(newLoan, { status: 201 })
  } catch (error) {
    console.error("Error creating loan:", error)
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 })
  }
}

