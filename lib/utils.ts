import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parse, format } from "date-fns"

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
  // Parse the date string using date-fns
  const parsedDate = parse(createdAt, "dd/MM/yyyy HH:mm:ss", new Date())

  // Format the parsed date to the desired format
  return format(parsedDate, "dd/MM/yyyy HH:mm:ss")
}
