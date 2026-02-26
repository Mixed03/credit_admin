import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ status: 'Connected to MongoDB!' });
  } catch (error) {
    return NextResponse.json(
      { status: 'Failed to connect to MongoDB' },
      { status: 500 }
    );
  }
}