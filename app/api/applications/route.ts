// app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LoanApplication } from '@/models/LoanApplication';

// GET all applications
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const limit = url.searchParams.get('limit');

    let query: any = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    let dbQuery = LoanApplication.find(query).sort({ createdAt: -1 });
    
    if (limit) {
      dbQuery = dbQuery.limit(parseInt(limit));
    } else {
      dbQuery = dbQuery.limit(100);
    }

    const applications = await dbQuery;

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error.message },
      { status: 500 }
    );
  }
}

// POST new application
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const application = new LoanApplication(data);
    await application.save();

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}