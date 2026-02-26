// app/api/leadership/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Leadership } from '@/models/Leadership';

// GET all leadership members
export async function GET() {
  try {
    await dbConnect();
    const leadership = await Leadership.find({ status: 'Active' }).sort({ order: 1 });
    return NextResponse.json(leadership);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leadership' },
      { status: 500 }
    );
  }
}

// POST new leadership member
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const leadership = new Leadership(data);
    await leadership.save();

    return NextResponse.json(leadership, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}