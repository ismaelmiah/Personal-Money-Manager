import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parse, format, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string) {
  // Map currency to valid ISO 4217 codes
  const currencyCode = currency.toUpperCase(); // Ensure uppercase (e.g., "bdt" → "BDT")

  // Format the amount using Intl.NumberFormat
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode, // Use the valid currency code
  }).format(amount);
}

export function formatDate(createdAt: string): string {
  // Define the date formats to try
  const formats = ["dd/MM/yyyy HH:mm:ss", "yyyy-MM-dd'T'HH:mm:ss.SSSX"]

  // Try parsing the date string with each format
  let parsedDate = null
  for (const fmt of formats) {
    parsedDate = parse(createdAt, fmt, new Date())
    if (isValid(parsedDate)) {
      break
    }
  }

  // Check if the parsed date is valid
  if (!isValid(parsedDate)) {
    console.error("Invalid date:", createdAt)
    return "Invalid Date"
  }

  // Format the parsed date to the desired format
  return format(parsedDate as Date, "dd/MM/yyyy HH:mm:ss")
}
