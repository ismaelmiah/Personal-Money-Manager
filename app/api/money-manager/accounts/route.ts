import { NextResponse } from "next/server"
import { addAccount, getAccounts } from "@/lib/money-manager-service"

export async function GET() {
  try {
    const accounts = await getAccounts()
    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, balance, Currency } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const newAccount = await addAccount({
      name,
      balance: Number.parseFloat(balance) || 0,
      Currency: Currency || "BDT",
    })
    return NextResponse.json(newAccount, { status: 201 })
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}

