// app/api/faq/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { FAQ } from '@/models/FAQ';

// GET all FAQs
export async function GET() {
  try {
    await dbConnect();
    const faqs = await FAQ.find({ status: 'Active' }).sort({ views: -1 });
    return NextResponse.json(faqs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST new FAQ
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const faq = new FAQ(data);
    await faq.save();

    return NextResponse.json(faq, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}