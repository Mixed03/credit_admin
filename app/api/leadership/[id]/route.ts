// app/api/leadership/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Leadership } from '@/models/Leadership';
import cloudinary from '@/lib/cloudinary';

// GET single leadership member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const leadership = await Leadership.findById(id);

    if (!leadership) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(leadership);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    );
  }
}

// UPDATE leadership member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await request.json();

    const leadership = await Leadership.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!leadership) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(leadership);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// DELETE leadership member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const leadership = await Leadership.findById(id);

    if (!leadership) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if exists
    if (leadership.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(leadership.imagePublicId);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
      }
    }

    await Leadership.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}