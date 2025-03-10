import { NextResponse } from "next/server"
import { addMember, getMembers } from "@/lib/loan-tracker-service"

export async function GET() {
  try {
    const members = await getMembers()
    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { Name, Email, Phone } = body

    if (!Name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const newMember = await addMember({ Name, Email, Phone })
    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}

