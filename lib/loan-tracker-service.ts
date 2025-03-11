import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { id } from "date-fns/locale"

// Types
export type Member = {
  Id: string
  Name: string
  Phone: string
  Email: string
  CreatedAt: string
}

export type Loan = {
  Id: string
  MemberId: string
  MemberName: string
  Amount: number
  Currency: string
  Status: "Loan" | "Return"
  CreatedAt: string
  Notes: string
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

    //console.log(`Raw response data:`, response.data)

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
    const data = await getSpreadsheetData("Members!A2:G")

    return data.map((row: any[]) => ({
      Id: String(row[0] || ""),
      Name: String(row[1] || ""),
      Phone: String(row[2] || ""),
      Email: String(row[3] || ""),
      CreatedAt: String(row[6] || new Date().toISOString()),
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
    //console.log("Raw loans data:", data)

    return data.map((row: any[]) => ({
      Id: String(row[0] || ""),
      MemberId: String(row[1] || ""),
      MemberName: String(row[2] || ""),
      Status: row[3] === "Loan" || row[3] === "Return" ? row[3] : "Loan",
      Currency: String(row[4] || "BDT"),
      Amount: typeof row[5] === "number" ? row[5] : Number.parseFloat(row[5]) || 0,
      CreatedAt: String(row[6] || new Date().toISOString()),
      Notes: String(row[7] || ""),
    }))
  } catch (error) {
    console.error("Error in getLoans:", error)
    return []
  }
}

// Update loan
export async function updateLoan(id: string, loan: Omit<Loan, "Id">): Promise<Loan> {
  try {
    // First, get all loans to find the row index
    const loans = await getLoans()
    const loanIndex = loans.findIndex((l) => l.Id === id)

    if (loanIndex === -1) {
      throw new Error(`Loan with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = loanIndex + 2

    // Update the loan in the spreadsheet
    const values = [
      [id, loan.MemberId, loan.MemberName, loan.Amount, loan.Currency, loan.Status, loan.CreatedAt, loan.Notes || ""],
    ]
    const Id = id;
    
    await updateSpreadsheetData(`Loans!A${rowIndex}:H${rowIndex}`, values)

    return {
      Id,
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
    const loanIndex = loans.findIndex((l) => l.Id === id)

    if (loanIndex === -1) {
      throw new Error(`Loan with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = loanIndex + 2

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
export async function addMember(member: Omit<Member, "Id" | "CreatedAt">): Promise<Member> {
  try {
    const Id = `M${Date.now()}`
    const CreatedAt = new Date().toISOString()

    const values = [[Id, member.Name, member.Email || "", member.Phone || "", CreatedAt]]
    console.log("Adding member with values:", values)

    await appendToSpreadsheet("Members!A2:E", values)

    return {
      Id,
      ...member,
      CreatedAt,
    }
  } catch (error) {
    console.error("Error in addMember:", error)
    throw error
  }
}

// Add new loan with improved error handling
export async function addLoan(loan: Omit<Loan, "Id">): Promise<Loan> {
  try {
    const Id = `L${Date.now()}`

    const values = [
      [Id, loan.MemberId, loan.MemberName, loan.Amount, loan.Currency, loan.Status, loan.CreatedAt, loan.Notes || ""],
    ]
    console.log("Adding loan with values:", values)

    await appendToSpreadsheet("Loans!A2:H", values)

    return {
      Id,
      ...loan,
    }
  } catch (error) {
    console.error("Error in addLoan:", error)
    throw error
  }
}


// Update member
export async function updateMember(id: string, member: Omit<Member, "Id" | "CreatedAt">): Promise<Member> {
  try {
    // First, get all members to find the row index
    const members = await getMembers()
    const memberIndex = members.findIndex((m) => m.Id === id)

    if (memberIndex === -1) {
      throw new Error(`Member with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = memberIndex + 2

    // Update the member in the spreadsheet
    const values = [[id, member.Name, member.Email || "", member.Phone || "", members[memberIndex].CreatedAt]]
    await updateSpreadsheetData(`Members!A${rowIndex}:E${rowIndex}`, values)
    const Id = id;

    return {
      Id,
      ...member,
      CreatedAt: members[memberIndex].CreatedAt,
    }
  } catch (error) {
    console.error("Error in updateMember:", error)
    throw error
  }
}

// Delete member
export async function deleteMember(id: string): Promise<void> {
  try {
    // First, get all members to find the row index
    const members = await getMembers()
    const memberIndex = members.findIndex((m) => m.Id === id)

    if (memberIndex === -1) {
      throw new Error(`Member with ID ${id} not found`)
    }

    // Calculate the row in the spreadsheet (add 2 for header row and 0-indexing)
    const rowIndex = memberIndex + 2

    // Delete the member by clearing the row
    await updateSpreadsheetData(`Members!A${rowIndex}:E${rowIndex}`, [[""]])

    // Note: This doesn't actually delete the row, just clears it
    // For a proper delete, you would need to use the batchUpdate method with deleteRange
    // But that's more complex and requires different permissions
  } catch (error) {
    console.error("Error in deleteMember:", error)
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
          MemberId: string
          MemberName: string
          totalLoaned: Record<Currency, number>
          totalReturned: Record<Currency, number>
        }
      >,
      loan,
    ) => {
      if (!acc[loan.MemberId]) {
        acc[loan.MemberId] = {
          MemberId: loan.MemberId,
          MemberName: loan.MemberName,
          totalLoaned: { BDT: 0, USD: 0, GBP: 0 },
          totalReturned: { BDT: 0, USD: 0, GBP: 0 },
        }
      }

      if (loan.Status === "Loan") {
        acc[loan.MemberId].totalLoaned[loan.Currency as Currency] += loan.Amount
      } else {
        acc[loan.MemberId].totalReturned[loan.Currency as Currency] += loan.Amount
      }

      return acc
    },
    {},
  )

  // Total by Currency
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
      const Currency = loan.Currency as Currency

      if (!acc[Currency]) {
        acc[Currency] = {
          totalLoaned: 0,
          totalReturned: 0,
        }
      }

      if (loan.Status === "Loan") {
        acc[Currency].totalLoaned += loan.Amount
      } else {
        acc[Currency].totalReturned += loan.Amount
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

