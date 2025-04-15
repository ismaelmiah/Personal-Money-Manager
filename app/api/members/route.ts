import { NextResponse } from 'next/server';
import { getRows, appendRow, updateRow } from '../../lib/sheets';
import { Member } from '../../types';

// Type for the data from the client form
// These fields are calculated on the server or default to 0
type NewMemberPayload = Omit<Member, 'Id' | 'Number of Loans' | 'Current Loan' | 'Total Returned'>;

export async function GET() {
  try {
    const members = await getRows<Member>('Member');
    // Sort by name for a better default view
    const sortedMembers = members.sort((a, b) => a.Name.localeCompare(b.Name));
    return NextResponse.json(sortedMembers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: NewMemberPayload = await request.json();
    
    const newMember: Member = {
      ...body,
      Id: `M${Date.now()}`, // e.g., M_t4b-1xYz
      CreatedAt: body.CreatedAt,
      'Number of Loans': 0,
      'Current Loan': 0,
      'Total Returned': 0,
    };
    
    // Convert Member to plain object for appendRow
    const memberData = {
      ...newMember,
      CreatedAt: newMember.CreatedAt // Ensure date is properly serialized
    };
    
    await appendRow('Member', memberData);
    
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating member' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: Member = await request.json();
    const allMembers = await getRows<Member>('Member');
    const rowIndex = allMembers.findIndex(m => m.Id === body.Id);
    if (rowIndex === -1) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }
    // Convert Member to plain object with string keys
    const memberData = {
      ...body,
      Id: body.Id,
      Name: body.Name,
      Phone: body.Phone,
      Email: body.Email,
      Relationship: body.Relationship,
      'Number of Loans': body['Number of Loans'],
      'Current Loan': body['Current Loan'],
      'Total Returned': body['Total Returned'],
      CreatedAt: body.CreatedAt
    };
    await updateRow('Member', rowIndex + 2, memberData);
    return NextResponse.json(body, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error updating member" }, { status: 500 });
  }
}