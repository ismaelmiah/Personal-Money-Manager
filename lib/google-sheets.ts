import { google } from "googleapis"
import { JWT } from "google-auth-library"

// Types
export type Member = {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
}

export type Loan = {
  id: string
  memberId: string
  memberName: string
  amount: number
  currency: string
  type: "loan" | "return"
  date: string
  notes: string
}

export type Currency = "BDT" | "USD" | "GBP"

// Initialize Google Sheets client with better error handling
const initializeGoogleSheetsClient = () => {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      throw new Error("Missing required Google Sheets credentials")
    }

    const client = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    return google.sheets({ version: "v4", auth: client })
  } catch (error) {
    console.error("Error initializing Google Sheets client:", error)
    throw error
  }
}

// Get spreadsheet data with improved error handling and logging
export async function getSpreadsheetData(range: string) {
  try {
    console.log(`Fetching data from range: ${range}`)
    const sheets = initializeGoogleSheetsClient()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    })

    console.log(`Raw response data:`, response.data)

    if (!response.data.values) {
      console.log(`No values found in range: ${range}`)
      return []
    }

    return response.data.values
  } catch (error) {
    console.error("Error fetching spreadsheet data:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }
    throw new Error(
      `Failed to fetch data from Google Sheets: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

// Append data to spreadsheet with improved error handling
export async function appendToSpreadsheet(range: string, values: any[][]) {
  try {
    console.log(`Appending data to range: ${range}`, values)
    const sheets = initializeGoogleSheetsClient()

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    })

    console.log("Append response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error appending to spreadsheet:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }
    throw error
  }
}

// Update data in spreadsheet
export async function updateSpreadsheetData(range: string, values: any[][]) {
  try {
    const sheets = initializeGoogleSheetsClient()
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    })

    return response.data
  } catch (error) {
    console.error("Error updating spreadsheet:", error)
    throw new Error("Failed to update data in Google Sheets")
  }
}

// Get all members with improved error handling
export async function getMembers(): Promise<Member[]> {
  try {
    const data = await getSpreadsheetData("Members!A2:E")
    console.log("Raw members data:", data)

    return data.map((row: any[]) => ({
      id: String(row[0] || ""),
      name: String(row[1] || ""),
      email: String(row[2] || ""),
      phone: String(row[3] || ""),
      createdAt: String(row[4] || new Date().toISOString()),
    }))
  } catch (error) {
    console.error("Error in getMembers:", error)
    return []
  }
}

// Get all loans with improved error handling
export async function getLoans(): Promise<Loan[]> {
  try {
    const data = await getSpreadsheetData("Loans!A2:H")
    console.log("Raw loans data:", data)

    return data.map((row: any[]) => ({
      id: String(row[0] || ""),
      memberId: String(row[1] || ""),
      memberName: String(row[2] || ""),
      amount: typeof row[3] === "number" ? row[3] : Number.parseFloat(row[3]) || 0,
      currency: String(row[4] || "BDT"),
      type: row[5] === "loan" || row[5] === "return" ? row[5] : "loan",
      date: String(row[6] || new Date().toISOString()),
      notes: String(row[7] || ""),
    }))
  } catch (error) {
    console.error("Error in getLoans:", error)
    return []
  }
}

// Add new member with improved error handling
export async function addMember(member: Omit<Member, "id" | "createdAt">): Promise<Member> {
  try {
    const id = `M${Date.now()}`
    const createdAt = new Date().toISOString()

    const values = [[id, member.name, member.email || "", member.phone || "", createdAt]]
    console.log("Adding member with values:", values)

    await appendToSpreadsheet("Members!A2:E", values)

    return {
      id,
      ...member,
      createdAt,
    }
  } catch (error) {
    console.error("Error in addMember:", error)
    throw error
  }
}

// Add new loan with improved error handling
export async function addLoan(loan: Omit<Loan, "id">): Promise<Loan> {
  try {
    const id = `L${Date.now()}`

    const values = [
      [id, loan.memberId, loan.memberName, loan.amount, loan.currency, loan.type, loan.date, loan.notes || ""],
    ]
    console.log("Adding loan with values:", values)

    await appendToSpreadsheet("Loans!A2:H", values)

    return {
      id,
      ...loan,
    }
  } catch (error) {
    console.error("Error in addLoan:", error)
    throw error
  }
}

// Get statistics
export async function getStatistics() {
  const loans = await getLoans()

  // Total loans and returns by member
  const memberStats = loans.reduce(
    (
      acc: Record<
        string,
        {
          memberId: string
          memberName: string
          totalLoaned: Record<Currency, number>
          totalReturned: Record<Currency, number>
        }
      >,
      loan,
    ) => {
      if (!acc[loan.memberId]) {
        acc[loan.memberId] = {
          memberId: loan.memberId,
          memberName: loan.memberName,
          totalLoaned: { BDT: 0, USD: 0, GBP: 0 },
          totalReturned: { BDT: 0, USD: 0, GBP: 0 },
        }
      }

      if (loan.type === "loan") {
        acc[loan.memberId].totalLoaned[loan.currency as Currency] += loan.amount
      } else {
        acc[loan.memberId].totalReturned[loan.currency as Currency] += loan.amount
      }

      return acc
    },
    {},
  )

  // Total by currency
  const currencyStats = loans.reduce(
    (
      acc: Record<
        Currency,
        {
          totalLoaned: number
          totalReturned: number
        }
      >,
      loan,
    ) => {
      const currency = loan.currency as Currency

      if (!acc[currency]) {
        acc[currency] = {
          totalLoaned: 0,
          totalReturned: 0,
        }
      }

      if (loan.type === "loan") {
        acc[currency].totalLoaned += loan.amount
      } else {
        acc[currency].totalReturned += loan.amount
      }

      return acc
    },
    {
      BDT: { totalLoaned: 0, totalReturned: 0 },
      USD: { totalLoaned: 0, totalReturned: 0 },
      GBP: { totalLoaned: 0, totalReturned: 0 },
    },
  )

  return {
    memberStats: Object.values(memberStats),
    currencyStats,
  }
}

