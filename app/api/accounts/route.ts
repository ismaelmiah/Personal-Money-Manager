import { NextResponse } from 'next/server';
import { getRows, appendRow } from '../../lib/sheets';
import { Account } from '../../types';

// Type for the form data from the client
type NewAccountPayload = Omit<Account, 'Id' | 'CreatedAt'>;

export async function GET() {
  try {
    const accounts = await getRows<Account>('Accounts');
    // Sort by name for a consistent view
    const sortedAccounts = accounts.sort((a, b) => a.Name.localeCompare(b.Name));
    return NextResponse.json(sortedAccounts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching accounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: NewAccountPayload = await request.json();
    
    const newAccount: Account = {
      ...body,
      Id: `A${Date.now()}`,
      CreatedAt: new Date().toISOString(),
    };
    
    // Convert Account to plain object for appendRow
    const accountData = {
      ...newAccount,
      CreatedAt: newAccount.CreatedAt // Ensure date is properly serialized
    };
    
    await appendRow('Accounts', accountData);
    
    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating account' }, { status: 500 });
  }
}