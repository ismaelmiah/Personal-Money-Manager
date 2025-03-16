import { NextResponse } from "next/server"
import { addmember, getmembers } from "@/lib/loan-tracker-service"

export async function GET() {
  try {
    const members = await getmembers()
    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const newmember = await addmember({ name, email, phone })
    return NextResponse.json(newmember, { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}

