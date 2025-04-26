import { NextResponse } from 'next/server';
import { getRows, appendRow, updateRow } from '../../lib/sheets';
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
    };
    
    await appendRow('Ledger', ledgerData);
    
    // Return the complete object so the client can update its cache
    return NextResponse.json(newLedger, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating ledger' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: Ledger = await request.json();
    const allLedgers = await getRows<Ledger>('Ledger');
    const rowIndex = allLedgers.findIndex(l => l.Id === body.Id);
    if (rowIndex === -1) {
      return NextResponse.json({ message: "Ledger not found" }, { status: 404 });
    }
    // Convert Ledger to plain object with string keys
    const ledgerData = {
      ...body,
      Id: body.Id,
      MemberName: body.MemberName,
      Amount: body.Amount,
      Currency: body.Currency,
      Type: body.Type,
      CreatedAt: body.CreatedAt
    };
    await updateRow('Ledger', rowIndex + 2, ledgerData);
    return NextResponse.json(body, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error updating ledger" }, { status: 500 });
  }
}