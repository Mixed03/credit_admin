// app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Job } from '@/models/Job';

// GET all jobs
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    // Build query
    let query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query
    let jobsQuery = Job.find(query).sort({ createdAt: -1 });

    if (limit) {
      jobsQuery = jobsQuery.limit(parseInt(limit));
    }

    const jobs = await jobsQuery;

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error.message },
      { status: 500 }
    );
  }
}

// CREATE new job
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.department || !data.location) {
      return NextResponse.json(
        { error: 'Missing required fields: title, department, location' },
        { status: 400 }
      );
    }

    const job = await Job.create(data);

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}