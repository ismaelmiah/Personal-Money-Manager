import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { id } from "date-fns/locale"
import { parse } from "date-fns";

// Types
export type Member = {
  id: string
  name: string
  phone: string
  email: string
  createdAt: string
}

export type Loan = {
  id: string
  memberId: string
  memberName: string
  amount: number
  currency: Currency
  status: "Loan" | "Return"
  createdAt: string
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
    
    console.log(`${new Date().toLocaleTimeString()} Fetching data from range: ${range}`);
    const sheets = initializeGoogleSheetsClient()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    })

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
export async function getmembers(): Promise<Member[]> {
  try {
    const data = await getSpreadsheetData("members!A2:G")

    return data.map((row: any[]) => ({
      id: String(row[0] || ""),
      name: String(row[1] || ""),
      phone: String(row[2] || ""),
      email: String(row[3] || ""),
      createdAt: String(row[6] || new Date().toISOString()),
    }))
  } catch (error) {
    console.error("Error in getmembers:", error)
    return []
  }
}

// Get all loans with improved error handling
export async function getLoans(): Promise<Loan[]> {
  try {
    const data = await getSpreadsheetData("Loans!A2:H");

    const loans = data.map((row: any[]) => ({
      id: String(row[0] || ""),
      memberId: String(row[1] || ""),
      memberName: String(row[2] || ""),
      status: row[3] === "Loan" || row[3] === "Return" ? row[3] : "Loan",
      currency: (row[4] as Currency) || "BDT",
      amount: typeof row[5] === "number" ? row[5] : Number.parseFloat(row[5]) || 0,
      createdAt: String(row[6] || new Date().toISOString()),
      notes: String(row[7] || ""),
    }));

    // Parse and sort loans by createdAt in descending order
    loans.sort((a, b) => {
      const dateA = parse(a.createdAt, "dd/MM/yyyy HH:mm:ss", new Date());
      const dateB = parse(b.createdAt, "dd/MM/yyyy HH:mm:ss", new Date());
      return dateB.getTime() - dateA.getTime();
    });

    return loans;
  } catch (error) {
    console.error("Error in getLoans:", error);
    return [];
  }
}

// Update loan
export async function updateLoan(id: string, loan: Omit<Loan, "id">): Promise<Loan> {
  try {
    // First, get all loans to find the row index
    const loans = await getLoans()
    const loanIndex = loans.findIndex((l) => l.id === id)

    if (loanIndex === -1) {
      throw new Error(`Loan with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = loanIndex + 2

    // Update the loan in the spreadsheet
    const values = [
      [id, loan.memberId, loan.memberName, loan.amount, loan.currency, loan.status, loan.createdAt, loan.notes || ""],
    ]
    
    await updateSpreadsheetData(`Loans!A${rowIndex}:H${rowIndex}`, values)

    return {
      id,
      ...loan,
    }
  } catch (error) {
    console.error("Error in updateLoan:", error)
    throw error
  }
}

// Delete loan
export async function deleteLoan(id: string): Promise<void> {
  try {
    // First, get all loans to find the row index
    const loans = await getLoans()
    const loanIndex = loans.findIndex((l) => l.id === id)

    if (loanIndex === -1) {
      throw new Error(`Loan with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = loanIndex + 2

    console.log(`Deleting loan with ID ${id} at row index ${rowIndex}`)
    // Delete the loan by clearing the row
    await updateSpreadsheetData(`Loans!A${rowIndex}:H${rowIndex}`, [[""]])

    // Note: This doesn't actually delete the row, just clears it
    // For a proper delete, you would need to use the batchUpdate method with deleteRange
    // But that's more complex and requires different permissions
  } catch (error) {
    console.error("Error in deleteLoan:", error)
    throw error
  }
}


// Add new member with improved error handling
export async function addmember(member: Omit<Member, "id" | "createdAt">): Promise<Member> {
  try {
    const id = `M${Date.now()}`
    const createdAt = new Date().toISOString()

    const values = [[id, member.name, member.email || "", member.phone || "", createdAt]]
    console.log("Adding member with values:", values)

    await appendToSpreadsheet("members!A2:E", values)

    return {
      id,
      ...member,
      createdAt,
    }
  } catch (error) {
    console.error("Error in addmember:", error)
    throw error
  }
}

// Add new loan with improved error handling
export async function addLoan(loan: Omit<Loan, "id">): Promise<Loan> {
  try {
    const id = `L${Date.now()}`

    const values = [
      [id, loan.memberId, loan.memberName, loan.status, loan.currency, loan.amount, loan.createdAt, loan.notes || ""],
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


// Update member
export async function updatemember(id: string, member: Omit<Member, "id" | "createdAt">): Promise<Member> {
  try {
    // First, get all members to find the row index
    const members = await getmembers()
    const memberIndex = members.findIndex((m) => m.id === id)

    if (memberIndex === -1) {
      throw new Error(`member with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = memberIndex + 2

    // Update the member in the spreadsheet
    const values = [[id, member.name, member.email || "", member.phone || "", members[memberIndex].createdAt]]
    await updateSpreadsheetData(`members!A${rowIndex}:E${rowIndex}`, values)

    return {
      id,
      ...member,
      createdAt: members[memberIndex].createdAt,
    }
  } catch (error) {
    console.error("Error in updatemember:", error)
    throw error
  }
}

// Delete member
export async function deletemember(id: string): Promise<void> {
  try {
    // First, get all members to find the row index
    const members = await getmembers()
    const memberIndex = members.findIndex((m) => m.id === id)

    if (memberIndex === -1) {
      throw new Error(`member with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = memberIndex + 2

    // Delete the member by clearing the row
    await updateSpreadsheetData(`members!A${rowIndex}:E${rowIndex}`, [[""]])

    // Note: This doesn't actually delete the row, just clears it
    // For a proper delete, you would need to use the batchUpdate method with deleteRange
    // But that's more complex and requires different permissions
  } catch (error) {
    console.error("Error in deletemember:", error)
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

      if (loan.status === "Loan") {
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

      if (loan.status === "Loan") {
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

