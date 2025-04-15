import { NextResponse } from 'next/server';
import { getRows, appendRow } from '../../lib/sheets';
import { Ledger } from '../../types';

// Type for the data coming from the client form (doesn't include server-generated fields)
type NewLedgerPayload = Omit<Ledger, 'Id'>;

export async function GET() {
  try {
    const ledgers = await getRows<Ledger>('Ledger');
    return NextResponse.json(ledgers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching ledgers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: NewLedgerPayload = await request.json();
    
    const newLedger: Ledger = {
      ...body,
      Id: `L${Date.now()}`, // Generate ID on the server
    };
    
    // Convert Ledger to plain object for appendRow
    const ledgerData = {
      ...newLedger,
      CreatedAt: newLedger.CreatedAt // Ensure date is properly serialized
    };
    
    await appendRow('Ledger', ledgerData);
    
    // Return the complete object so the client can update its cache
    return NextResponse.json(newLedger, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating ledger' }, { status: 500 });
  }
}