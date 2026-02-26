// app/api/reports/financial/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LoanApplication } from '@/models/LoanApplication';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Get all applications
    const applications = await LoanApplication.find(dateFilter);

    // Get approved applications (disbursed)
    const approvedApplications = applications.filter(app => app.status === 'Approved');
    
    // Calculate total disbursed
    const totalDisbursed = approvedApplications.reduce((sum, app) => sum + app.loanAmount, 0);
    
    // Calculate total requested
    const totalRequested = applications.reduce((sum, app) => sum + app.loanAmount, 0);

    // Calculate monthly disbursement trends (last 12 months)
    const monthlyDisbursement = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthApps = approvedApplications.filter(app => {
        const appDate = new Date(app.createdAt);
        return appDate >= month && appDate < nextMonth;
      });

      const monthlyAmount = monthApps.reduce((sum, app) => sum + app.loanAmount, 0);

      monthlyDisbursement.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthlyAmount,
        count: monthApps.length,
        avgAmount: monthApps.length > 0 ? Math.round(monthlyAmount / monthApps.length) : 0,
      });
    }

    // Calculate disbursement by loan type
    const disbursementByType: any = {};
    approvedApplications.forEach(app => {
      if (!disbursementByType[app.loanType]) {
        disbursementByType[app.loanType] = {
          amount: 0,
          count: 0,
        };
      }
      disbursementByType[app.loanType].amount += app.loanAmount;
      disbursementByType[app.loanType].count += 1;
    });

    // Add average to each type
    Object.keys(disbursementByType).forEach(type => {
      const data = disbursementByType[type];
      data.avgAmount = Math.round(data.amount / data.count);
    });

    // Calculate portfolio statistics
    const portfolioStats = {
      totalLoans: approvedApplications.length,
      totalValue: totalDisbursed,
      avgLoanSize: approvedApplications.length > 0 
        ? Math.round(totalDisbursed / approvedApplications.length)
        : 0,
      largestLoan: approvedApplications.length > 0
        ? Math.max(...approvedApplications.map(app => app.loanAmount))
        : 0,
      smallestLoan: approvedApplications.length > 0
        ? Math.min(...approvedApplications.map(app => app.loanAmount))
        : 0,
    };

    // Calculate loan size distribution
    const sizeRanges = [
      { range: '0-5M', min: 0, max: 5000000, count: 0, amount: 0 },
      { range: '5M-10M', min: 5000000, max: 10000000, count: 0, amount: 0 },
      { range: '10M-20M', min: 10000000, max: 20000000, count: 0, amount: 0 },
      { range: '20M+', min: 20000000, max: Infinity, count: 0, amount: 0 },
    ];

    approvedApplications.forEach(app => {
      for (const range of sizeRanges) {
        if (app.loanAmount >= range.min && app.loanAmount < range.max) {
          range.count++;
          range.amount += app.loanAmount;
          break;
        }
      }
    });

    // Calculate revenue projection (assuming 10% average interest)
    const interestRate = 0.10; // 10% - this should come from loan product settings
    const projectedRevenue = totalDisbursed * interestRate;

    // Calculate performance metrics
    const performanceMetrics = {
      disbursementRate: applications.length > 0
        ? ((approvedApplications.length / applications.length) * 100).toFixed(1)
        : 0,
      avgDisbursementTime: 0, // Could calculate from approval to disbursement
      totalRequested,
      totalDisbursed,
      disbursementRatio: totalRequested > 0
        ? ((totalDisbursed / totalRequested) * 100).toFixed(1)
        : 0,
    };

    const report = {
      summary: {
        totalDisbursed,
        totalRequested,
        totalLoans: approvedApplications.length,
        avgLoanAmount: portfolioStats.avgLoanSize,
        projectedRevenue,
      },
      trends: {
        monthly: monthlyDisbursement,
      },
      breakdown: {
        byLoanType: disbursementByType,
        bySizeRange: sizeRanges,
      },
      portfolio: portfolioStats,
      performance: performanceMetrics,
    };

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error generating financial report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}