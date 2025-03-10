import { NextResponse } from "next/server"
import { getStatistics } from "@/lib/loan-tracker-service"

export async function GET() {
  try {
    const statistics = await getStatistics()
    return NextResponse.json(statistics)
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}

