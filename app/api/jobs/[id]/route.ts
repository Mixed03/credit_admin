// app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Job } from '@/models/Job';
import mongoose from 'mongoose';

// GET single job
export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const params = await segmentData.params;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid Job ID format' },
        { status: 400 }
      );
    }

    const job = await Job.findById(params.id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job', details: error.message },
      { status: 500 }
    );
  }
}

// UPDATE job
export async function PUT(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const params = await segmentData.params;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid Job ID format' },
        { status: 400 }
      );
    }

    const data = await request.json();

    const job = await Job.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// DELETE job
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const params = await segmentData.params;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid Job ID format' },
        { status: 400 }
      );
    }

    const job = await Job.findByIdAndDelete(params.id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job', details: error.message },
      { status: 500 }
    );
  }
}