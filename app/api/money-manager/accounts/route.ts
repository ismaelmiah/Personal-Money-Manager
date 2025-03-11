import { NextResponse } from "next/server"
import { addAccount, getAccounts, updateAccount, deleteAccount } from "@/lib/money-manager-service"

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
    const { Name, Balance, Currency } = body

    if (!Name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const newAccount = await addAccount({
      Name,
      Balance: Number.parseFloat(Balance) || 0,
      Currency: Currency || "BDT",
    })
    return NextResponse.json(newAccount, { status: 201 })
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { Name, Balance, Currency } = body

    if (!Name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const updatedAccount = await updateAccount(params.id, {
      Name,
      Balance: Number.parseFloat(Balance) || 0,
      Currency: Currency || "BDT",
    })

    return NextResponse.json(updatedAccount)
  } catch (error) {
    console.error("Error updating account:", error)
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteAccount(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}

