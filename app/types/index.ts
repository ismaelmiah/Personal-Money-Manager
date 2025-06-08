// ========= Ledger Platform Types =========

export type LedgerType = 'Loan' | 'Return';

export interface Ledger {
  Id: string; // e.g., L1678886400000
  MemberId: string;
  MemberName: string;
  Type: LedgerType;
  Amount: number;
  Currency: string;
  'Equivalent to BDT': number; // Note: property name with spaces needs quotes
  CreatedAt: string;
  Notes?: string;
}

export interface Member {
  Id: string;
  Name: string;
  Phone?: string;
  Email?: string;
  Relationship?: string;
  'Number of Loans': number;
  'Current Loan': number;
  'Total Returned': number;
  CreatedAt: string;
}

// ========= Expenses Platform Types =========

export type TransactionType = 'Income' | 'Expense' | 'Transfer';
export type CategoryType = 'Income' | 'Expense';

export interface Account {
  Id: string;
  Name: string;
  Balance: number;
  Savings: number;
  Currency: string;
  CreatedAt: string;
}

export interface Category {
  Id: string;
  Name: string;
  Type: CategoryType;
  Budget?: number;
  CreatedAt: string;
}

// Using the enhanced schema for Transactions
export interface Transaction {
  Id: string;
  Amount: number;
  Currency: string;
  Type: TransactionType;
  CategoryId?: string; // Optional because Transfers don't have one
  FromAccountId?: string; // Optional because pure Income doesn't have a 'from'
  ToAccountId?: string; // Optional because pure Expense doesn't have a 'to'
  CreatedAt: string;
  Notes?: string;
}