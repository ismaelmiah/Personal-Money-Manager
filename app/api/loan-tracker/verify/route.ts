import { NextResponse } from "next/server"
import { getSpreadsheetData } from "@/lib/loan-tracker-service"

export async function GET() {
  try {
    // Try to fetch a small range to verify connection
    const testData = await getSpreadsheetData("A1:A1")

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Google Sheets",
      testData,
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

