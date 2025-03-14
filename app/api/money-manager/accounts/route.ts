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
    const { name, balance, currency } = body

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const newAccount = await addAccount({
      name,
      balance: Number.parseFloat(balance) || 0,
      currency: currency || "BDT",
    })
    return NextResponse.json(newAccount, { status: 201 })
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
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

