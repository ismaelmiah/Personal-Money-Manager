import { NextResponse } from "next/server"
import { getAccounts, updateAccount, deleteAccount } from "@/lib/money-manager-service"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    const accounts = await getAccounts()
    const account = accounts.find((a) => a.id === id)

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error fetching account:", error)
    return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    const body = await request.json()
    const { name, balance, currency } = body

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const updatedAccount = await updateAccount(id, {
      name,
      balance: Number.parseFloat(balance) || 0,
      currency: currency || "BDT",
    })

    return NextResponse.json(updatedAccount)
  } catch (error) {
    console.error("Error updating account:", error)
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    await deleteAccount(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}

