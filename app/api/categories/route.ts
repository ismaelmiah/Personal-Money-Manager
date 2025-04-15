import { NextResponse } from 'next/server';
import { getRows, appendRow } from '../../lib/sheets';
import { Category } from '../../types';
import { nanoid } from 'nanoid';

// Type for the form data from the client
type NewCategoryPayload = Omit<Category, 'Id' | 'CreatedAt'>;

export async function GET() {
  try {
    const categories = await getRows<Category>('Categories');
    // Sort by name for a consistent view
    const sortedCategories = categories.sort((a, b) => a.Name.localeCompare(b.Name));
    return NextResponse.json(sortedCategories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: NewCategoryPayload = await request.json();
    
    const newCategory: Category = {
      ...body,
      Id: `C${nanoid(8)}`, // e.g., C_a1b-2c3d
      CreatedAt: new Date().toISOString(),
    };
    
    // Convert Category to plain object for appendRow
    const categoryData = {
      ...newCategory,
      CreatedAt: newCategory.CreatedAt // Ensure date is properly serialized
    };
    
    await appendRow('Categories', categoryData);
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating category' }, { status: 500 });
  }
}