import { NextResponse } from "next/server"
import { getAccounts, updateAccount, deleteAccount } from "@/lib/money-manager-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const accounts = await getAccounts()
    const account = accounts.find((a) => a.Id === params.id)

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error fetching account:", error)
    return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 })
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

