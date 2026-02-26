import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Branch } from '@/models/Branch';

// GET all branches
export async function GET() {
  try {
    await dbConnect();
    const branches = await Branch.find();
    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}

// POST new branch
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const branch = new Branch(data);
    await branch.save();

    return NextResponse.json(branch, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}