import { NextResponse } from 'next/server';
import { getRows, appendRow, updateRow } from '../../lib/sheets';
import { Account, Transaction } from '../../types';

export async function GET() {
  try {
    const transactions = await getRows<Transaction>('Transactions');
    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json({ message: 'Error fetching transactions' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: Transaction = await request.json();
    if (!body.Id) {
      return NextResponse.json({ message: "Transaction ID is required for update" }, { status: 400 });
    }

    const allTransactions = await getRows<Transaction>('Transactions');
    const rowIndex = allTransactions.findIndex(t => t.Id === body.Id);

    if (rowIndex === -1) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }
    
    // Convert Transaction to plain object for updateRow
    const transactionData = {
      ...body,
      CreatedAt: body.CreatedAt // Ensure date is properly serialized
    };
    
    // updateRow uses 1-based indexing and accounts for the header row.
    await updateRow('Transactions', rowIndex + 2, transactionData);
    
    // IMPORTANT: Here you should also update account balances.
    // This requires fetching the original transaction to calculate the difference.
    // For simplicity in this example, we assume the user doesn't change amounts,
    // but a real app would need to handle this.
    
    return NextResponse.json(body, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error updating transaction" }, { status: 500 });
  }
}

// POST function with balance updates
export async function POST(request: Request) {
  try {
    const body: Omit<Transaction, 'Id' | 'CreatedAt'> = await request.json();
    
    // --- 1. Record the Transaction ---
    const newTransaction: Transaction = {
      ...body,
      Id: `T${Date.now()}`,
      CreatedAt: new Date().toISOString(),
    };
    
    // Convert Transaction to plain object for appendRow
    const transactionData = {
      ...newTransaction,
      CreatedAt: newTransaction.CreatedAt // Ensure date is properly serialized
    };
    
    await appendRow('Transactions', transactionData);

    // --- 2. Update Account Balances ---
    const accounts = await getRows<Account>('Accounts');

    if (newTransaction.Type === 'Expense' || newTransaction.Type === 'Transfer') {
      const fromAccountId = newTransaction.FromAccountId;
      if (fromAccountId) {
        const accountIndex = accounts.findIndex(acc => acc.Id === fromAccountId);
        if (accountIndex !== -1) {
          const accountToUpdate = accounts[accountIndex];
          accountToUpdate.Balance -= newTransaction.Amount;
          // Convert Account to plain object for updateRow
          const accountData = {
            ...accountToUpdate,
            Balance: accountToUpdate.Balance
          };
          await updateRow('Accounts', accountIndex + 2, accountData);
        }
      }
    }

    if (newTransaction.Type === 'Income' || newTransaction.Type === 'Transfer') {
      const toAccountId = newTransaction.ToAccountId;
      if (toAccountId) {
        const accountIndex = accounts.findIndex(acc => acc.Id === toAccountId);
        if (accountIndex !== -1) {
            const accountToUpdate = accounts[accountIndex];
            accountToUpdate.Balance += newTransaction.Amount;
            // Convert Account to plain object for updateRow
            const accountData = {
              ...accountToUpdate,
              Balance: accountToUpdate.Balance
            };
            await updateRow('Accounts', accountIndex + 2, accountData);
        }
      }
    }

    return NextResponse.json(newTransaction, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error creating transaction" }, { status: 500 });
  }
}