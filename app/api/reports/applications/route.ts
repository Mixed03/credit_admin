// app/api/reports/applications/route.ts
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

    // Get all applications for the period
    const applications = await LoanApplication.find(dateFilter).sort({ createdAt: 1 });

    // Calculate statistics
    const totalApplications = applications.length;
    const statusBreakdown = {
      Pending: applications.filter(app => app.status === 'Pending').length,
      'Under Review': applications.filter(app => app.status === 'Under Review').length,
      Approved: applications.filter(app => app.status === 'Approved').length,
      Rejected: applications.filter(app => app.status === 'Rejected').length,
    };

    // Calculate loan type breakdown
    const loanTypeBreakdown: any = {};
    applications.forEach(app => {
      if (!loanTypeBreakdown[app.loanType]) {
        loanTypeBreakdown[app.loanType] = 0;
      }
      loanTypeBreakdown[app.loanType]++;
    });

    // Calculate monthly trends (last 12 months)
    const monthlyTrends = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthApps = applications.filter(app => {
        const appDate = new Date(app.createdAt);
        return appDate >= month && appDate < nextMonth;
      });

      monthlyTrends.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        total: monthApps.length,
        approved: monthApps.filter(app => app.status === 'Approved').length,
        rejected: monthApps.filter(app => app.status === 'Rejected').length,
        pending: monthApps.filter(app => app.status === 'Pending').length,
        underReview: monthApps.filter(app => app.status === 'Under Review').length,
      });
    }

    // Calculate approval funnel
    const approvalFunnel = {
      submitted: totalApplications,
      underReview: statusBreakdown['Under Review'],
      approved: statusBreakdown.Approved,
      rejected: statusBreakdown.Rejected,
      pending: statusBreakdown.Pending,
    };

    // Calculate average processing time (for approved/rejected)
    const processedApps = applications.filter(
      app => app.status === 'Approved' || app.status === 'Rejected'
    );
    
    let avgProcessingTime = 0;
    if (processedApps.length > 0) {
      const totalDays = processedApps.reduce((sum, app) => {
        const created = new Date(app.createdAt);
        const updated = new Date(app.updatedAt);
        const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgProcessingTime = Math.round(totalDays / processedApps.length);
    }

    // Calculate approval rate by loan type
    const approvalRateByType: any = {};
    Object.keys(loanTypeBreakdown).forEach(type => {
      const typeApps = applications.filter(app => app.loanType === type);
      const approved = typeApps.filter(app => app.status === 'Approved').length;
      approvalRateByType[type] = {
        total: typeApps.length,
        approved,
        rate: typeApps.length > 0 ? ((approved / typeApps.length) * 100).toFixed(1) : 0,
      };
    });

    // Calculate average loan amount by status
    const avgLoanByStatus: any = {};
    Object.keys(statusBreakdown).forEach(status => {
      const statusApps = applications.filter(app => app.status === status);
      if (statusApps.length > 0) {
        const totalAmount = statusApps.reduce((sum, app) => sum + app.loanAmount, 0);
        avgLoanByStatus[status] = Math.round(totalAmount / statusApps.length);
      } else {
        avgLoanByStatus[status] = 0;
      }
    });

    const report = {
      summary: {
        totalApplications,
        statusBreakdown,
        approvalRate: totalApplications > 0 
          ? ((statusBreakdown.Approved / totalApplications) * 100).toFixed(1)
          : 0,
        rejectionRate: totalApplications > 0
          ? ((statusBreakdown.Rejected / totalApplications) * 100).toFixed(1)
          : 0,
        avgProcessingTime,
      },
      trends: {
        monthly: monthlyTrends,
      },
      breakdown: {
        loanType: loanTypeBreakdown,
        approvalRateByType,
        avgLoanByStatus,
      },
      funnel: approvalFunnel,
    };

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error generating application report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}