// app/api/faq/[id]/route.ts
// Next.js 16 Compatible Version
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { FAQ } from '@/models/FAQ';
import mongoose from 'mongoose';

// GET single FAQ
export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Await params in Next.js 15+
    const params = await segmentData.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid FAQ ID format' },
        { status: 400 }
      );
    }
    
    const faq = await FAQ.findById(params.id);
    
    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    // Increment views
    faq.views += 1;
    await faq.save();
    
    return NextResponse.json(faq);
  } catch (error: any) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ', details: error.message },
      { status: 500 }
    );
  }
}

// UPDATE FAQ
export async function PUT(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Await params in Next.js 15+
    const params = await segmentData.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid FAQ ID format' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    const faq = await FAQ.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(faq);
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// DELETE FAQ
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Await params in Next.js 15+
    const params = await segmentData.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid FAQ ID format' },
        { status: 400 }
      );
    }
    
    const faq = await FAQ.findByIdAndDelete(params.id);
    
    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'FAQ deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ', details: error.message },
      { status: 500 }
    );
  }
}