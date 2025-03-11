import { NextResponse } from "next/server"
import { getMembers, updateMember, deleteMember } from "@/lib/loan-tracker-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const members = await getMembers()
    const member = members.find((m) => m.Id === params.id)

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { Name, Email, Phone } = body

    if (!Name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const updatedMember = await updateMember(params.id, { Name, Email, Phone })
    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteMember(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}

