// app/api/applications/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LoanApplication } from '@/models/LoanApplication';
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
        { error: 'Invalid Application ID format' },
        { status: 400 }
      );
    }
    
    const application = await LoanApplication.findById(params.id);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(application);
  } catch (error: any) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application', details: error.message },
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
        { error: 'Invalid Application ID format' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    const application = await LoanApplication.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(application);
  } catch (error: any) {
    console.error('Error updating application:', error);
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
        { error: 'Invalid Application ID format' },
        { status: 400 }
      );
    }
    
    const application = await LoanApplication.findByIdAndDelete(params.id);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application', details: error.message },
      { status: 500 }
    );
  }
}