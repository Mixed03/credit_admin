// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LoanApplication } from '@/models/LoanApplication';
import { LoanProduct } from '@/models/LoanProduct';
import { Branch } from '@/models/Branch';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';

    if (!q || q.length < 2) {
      return NextResponse.json({
        applications: [],
        products: [],
        branches: [],
      });
    }

    const searchRegex = { $regex: q, $options: 'i' };

    const [applications, products, branches] = await Promise.all([
      LoanApplication.find({
        $or: [
          { fullName: searchRegex },
          { email: searchRegex },
          { loanType: searchRegex },
        ],
      }).limit(5),
      LoanProduct.find({ name: searchRegex }).limit(5),
      Branch.find({
        $or: [
          { name: searchRegex },
          { city: searchRegex },
          { address: searchRegex },
        ],
      }).limit(5),
    ]);

    return NextResponse.json({
      applications,
      products,
      branches,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}