// app/api/about/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { About } from '@/models/About';

// GET all about sections
export async function GET() {
  try {
    await dbConnect();
    const about = await About.find({ status: 'Active' }).sort({ section: 1, order: 1 });
    return NextResponse.json(about);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch about sections' },
      { status: 500 }
    );
  }
}

// POST new about section
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const about = new About(data);
    await about.save();

    return NextResponse.json(about, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}