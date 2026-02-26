// app/api/branches/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Branch } from '@/models/Branch';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const params = await segmentData.params;
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid Branch ID format' },
        { status: 400 }
      );
    }
    
    const branch = await Branch.findById(params.id);
    
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(branch);
  } catch (error: any) {
    console.error('Error fetching branch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const params = await segmentData.params;
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid Branch ID format' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    const branch = await Branch.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });
    
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(branch);
  } catch (error: any) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const params = await segmentData.params;
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid Branch ID format' },
        { status: 400 }
      );
    }
    
    const branch = await Branch.findByIdAndDelete(params.id);
    
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Branch deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { error: 'Failed to delete branch', details: error.message },
      { status: 500 }
    );
  }
}