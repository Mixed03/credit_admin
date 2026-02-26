// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LoanApplication } from '@/models/LoanApplication';

export async function GET() {
  try {
    await dbConnect();

    // Get statistics
    const totalApplications = await LoanApplication.countDocuments();
    const approvedApplications = await LoanApplication.countDocuments({
      status: 'Approved',
    });
    const pendingApplications = await LoanApplication.countDocuments({
      status: 'Pending',
    });
    const rejectedApplications = await LoanApplication.countDocuments({
      status: 'Rejected',
    });

    // Calculate total funds disbursed
    const disbursedData = await LoanApplication.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$loanAmount' } } },
    ]);

    const totalDisbursed = disbursedData[0]?.total || 0;

    // Get average loan amount
    const averageData = await LoanApplication.aggregate([
      { $group: { _id: null, average: { $avg: '$loanAmount' } } },
    ]);

    const averageLoan = averageData[0]?.average || 0;

    return NextResponse.json({
      totalApplications,
      approvedApplications,
      pendingApplications,
      rejectedApplications,
      totalDisbursed,
      averageLoan: Math.round(averageLoan),
      approvalRate: totalApplications > 0 
        ? Math.round((approvedApplications / totalApplications) * 100) 
        : 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}