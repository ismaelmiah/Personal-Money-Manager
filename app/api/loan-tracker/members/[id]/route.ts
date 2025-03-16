import { NextResponse } from "next/server"
import { getmembers, updatemember, deletemember } from "@/lib/loan-tracker-service"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    const members = await getmembers()
    const member = members.find((m) => m.id === id)

    if (!member) {
      return NextResponse.json({ error: "member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    const body = await request.json()
    const { name, email, phone } = body

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const updatedmember = await updatemember(id, { name, email, phone })
    return NextResponse.json(updatedmember)
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await the params Promise
    await deletemember(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}

