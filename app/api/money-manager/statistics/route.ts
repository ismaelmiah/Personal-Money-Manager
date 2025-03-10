import { NextResponse } from "next/server"
import { getMoneyManagerStatistics } from "@/lib/money-manager-service"

export async function GET() {
  try {
    const statistics = await getMoneyManagerStatistics()
    return NextResponse.json(statistics)
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}

