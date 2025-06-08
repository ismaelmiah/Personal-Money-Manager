import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Ensure your environment variables are typed
// You can add a file like `env.d.ts` for this
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_SHEETS_CLIENT_EMAIL: string;
      GOOGLE_SHEETS_PRIVATE_KEY: string;
      SPREADSHEET_ID: string;
    }
  }
}

// Initialize the authentication client
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'), // Important for Vercel
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth: serviceAccountAuth });
const spreadsheetId = process.env.SPREADSHEET_ID;

// A generic function to get all rows and map them to our types
export async function getRows<T>(sheetName: string): Promise<T[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName, // Assumes the first row is headers
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  const headers = rows[0] as (keyof T)[];
  const data = rows.slice(1).map((row) => {
    const item: Partial<T> = {};
    headers.forEach((header, index) => {
      // Basic type conversion
      const value = row[index];
      // A more robust solution would check schema for number types
      if (!isNaN(Number(value)) && value !== '') {
        item[header] = Number(value) as any;
      } else {
        item[header] = value as any;
      }
    });
    return item as T;
  });

  return data;
}

// A function to append a new row
export async function appendRow(sheetName: string, rowData: object): Promise<void> {
  // First get the headers to ensure order
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z1`,
  });

  const headers = headerResponse.data.values?.[0];
  if (!headers) {
    throw new Error(`Could not find headers in sheet: ${sheetName}`);
  }

  // Map the object data to an array in the correct order
  const values = headers.map(header => rowData[header as keyof typeof rowData] ?? '');

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: sheetName,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
}

// Function to find a row's index based on a condition
// This is a helper for our update function
async function findRowIndex(sheetName: string, predicate: (row: any) => boolean): Promise<number> {
  const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
  });
  const rows = response.data.values;
  if (!rows) return -1;

  // Find the index of the row that matches the predicate. +1 for header, +1 for 1-based index
  const rowIndex = rows.findIndex(predicate);
  return rowIndex !== -1 ? rowIndex + 1 : -1;
}

// Function to update a specific row
export async function updateRow(
sheetName: string,
rowIndex: number,
rowData: object
): Promise<void> {
// First, get the headers to ensure the data order is correct.
const headerResponse = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: `${sheetName}!A1:Z1`,
});
const headers = headerResponse.data.values?.[0];
if (!headers) throw new Error(`Could not find headers in sheet: ${sheetName}`);

// Map the object data to an array in the correct order for the sheet.
const values = headers.map(header => rowData[header as keyof typeof rowData] ?? '');

await sheets.spreadsheets.values.update({
  spreadsheetId,
  // Note: The range targets the specific row.
  range: `${sheetName}!A${rowIndex}:${String.fromCharCode(65 + values.length - 1)}${rowIndex}`,
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [values],
  },
});
}