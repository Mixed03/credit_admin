// app/dashboard/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Calendar } from 'lucide-react';

interface ApplicationReport {
  summary: {
    totalApplications: number;
    statusBreakdown: {
      Pending: number;
      'Under Review': number;
      Approved: number;
      Rejected: number;
    };
    approvalRate: string;
    rejectionRate: string;
    avgProcessingTime: number;
  };
  trends: {
    monthly: Array<{
      month: string;
      total: number;
      approved: number;
      rejected: number;
      pending: number;
      underReview: number;
    }>;
  };
  breakdown: {
    loanType: any;
    approvalRateByType: any;
    avgLoanByStatus: any;
  };
  funnel: any;
}

interface FinancialReport {
  summary: {
    totalDisbursed: number;
    totalRequested: number;
    totalLoans: number;
    avgLoanAmount: number;
    projectedRevenue: number;
  };
  trends: {
    monthly: Array<{
      month: string;
      amount: number;
      count: number;
      avgAmount: number;
    }>;
  };
  breakdown: any;
  portfolio: any;
  performance: any;
}

export default function ReportsPage() {
  const [applicationReport, setApplicationReport] = useState<ApplicationReport | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const queryString = params.toString();
      
      // Fetch both reports in parallel
      const [appResponse, finResponse] = await Promise.all([
        fetch(`/api/reports/applications${queryString ? `?${queryString}` : ''}`),
        fetch(`/api/reports/financial${queryString ? `?${queryString}` : ''}`),
      ]);

      const appData = await appResponse.json();
      const finData = await finResponse.json();

      setApplicationReport(appData);
      setFinancialReport(finData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyDateFilter = () => {
    fetchReports();
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    setTimeout(() => fetchReports(), 0);
  };

  const exportToCSV = () => {
    if (!applicationReport || !financialReport) {
      console.error('No data available to export');
      return;
    }

    // Prepare CSV data
    const dateRangeStr = dateRange.startDate || dateRange.endDate 
      ? `${dateRange.startDate || 'All'} to ${dateRange.endDate || 'All'}`
      : 'All time';
    
    let csv = `Application Report - Generated: ${new Date().toLocaleString()}\n`;
    csv += `Date Range: ${dateRangeStr}\n\n`;
    
    // Summary Statistics
    csv += `SUMMARY STATISTICS\n`;
    csv += `Metric,Value\n`;
    csv += `Total Applications,${applicationReport.summary.totalApplications}\n`;
    csv += `Approved,${applicationReport.summary.statusBreakdown.Approved}\n`;
    csv += `Pending,${applicationReport.summary.statusBreakdown.Pending}\n`;
    csv += `Under Review,${applicationReport.summary.statusBreakdown['Under Review']}\n`;
    csv += `Rejected,${applicationReport.summary.statusBreakdown.Rejected}\n`;
    csv += `Approval Rate,${applicationReport.summary.approvalRate}%\n`;
    csv += `Rejection Rate,${applicationReport.summary.rejectionRate}%\n`;
    csv += `Avg Processing Time,${applicationReport.summary.avgProcessingTime} days\n`;
    csv += `\n`;
    
    // Financial Summary
    csv += `FINANCIAL SUMMARY\n`;
    csv += `Metric,Value\n`;
    csv += `Total Disbursed,${financialReport.summary.totalDisbursed}\n`;
    csv += `Total Requested,${financialReport.summary.totalRequested}\n`;
    csv += `Total Loans,${financialReport.summary.totalLoans}\n`;
    csv += `Average Loan Amount,${financialReport.summary.avgLoanAmount}\n`;
    csv += `Projected Revenue,${financialReport.summary.projectedRevenue}\n`;
    csv += `\n`;
    
    // Monthly Trends
    csv += `MONTHLY TRENDS\n`;
    csv += `Month,Total Applications,Approved,Rejected,Pending,Under Review,Disbursed Amount,Loan Count\n`;
    applicationReport.trends.monthly.forEach((month, index) => {
      const finMonth = financialReport.trends.monthly[index];
      csv += `${month.month},${month.total},${month.approved},${month.rejected},${month.pending},${month.underReview},${finMonth?.amount || 0},${finMonth?.count || 0}\n`;
    });
    csv += `\n`;
    
    // Loan Type Breakdown
    csv += `LOAN TYPE BREAKDOWN\n`;
    csv += `Loan Type,Applications,Approved,Approval Rate\n`;
    Object.entries(applicationReport.breakdown.loanType).forEach(([type, count]) => {
      const approvalData = applicationReport.breakdown.approvalRateByType[type];
      csv += `${type},${count},${approvalData?.approved || 0},${approvalData?.rate || 0}%\n`;
    });
    
    // Create and download CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = async () => {
    if (!applicationReport || !financialReport) {
      console.error('No data available to export');
      return;
    }

    // Dynamically import xlsx library
    const XLSX = await import('xlsx');
    
    const dateRangeStr = dateRange.startDate || dateRange.endDate 
      ? `${dateRange.startDate || 'All'} to ${dateRange.endDate || 'All'}`
      : 'All time';
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ['Application Report'],
      ['Generated:', new Date().toLocaleString()],
      ['Date Range:', dateRangeStr],
      [],
      ['SUMMARY STATISTICS'],
      ['Metric', 'Value'],
      ['Total Applications', applicationReport.summary.totalApplications],
      ['Approved', applicationReport.summary.statusBreakdown.Approved],
      ['Pending', applicationReport.summary.statusBreakdown.Pending],
      ['Under Review', applicationReport.summary.statusBreakdown['Under Review']],
      ['Rejected', applicationReport.summary.statusBreakdown.Rejected],
      ['Approval Rate', `${applicationReport.summary.approvalRate}%`],
      ['Rejection Rate', `${applicationReport.summary.rejectionRate}%`],
      ['Avg Processing Time', `${applicationReport.summary.avgProcessingTime} days`],
      [],
      ['FINANCIAL SUMMARY'],
      ['Metric', 'Value'],
      ['Total Disbursed', financialReport.summary.totalDisbursed],
      ['Total Requested', financialReport.summary.totalRequested],
      ['Total Loans', financialReport.summary.totalLoans],
      ['Average Loan Amount', financialReport.summary.avgLoanAmount],
      ['Projected Revenue', financialReport.summary.projectedRevenue],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    
    // Monthly Trends Sheet
    const trendsData = [
      ['Month', 'Total Applications', 'Approved', 'Rejected', 'Pending', 'Under Review', 'Disbursed Amount', 'Loan Count'],
      ...applicationReport.trends.monthly.map((month, index) => {
        const finMonth = financialReport.trends.monthly[index];
        return [
          month.month,
          month.total,
          month.approved,
          month.rejected,
          month.pending,
          month.underReview,
          finMonth?.amount || 0,
          finMonth?.count || 0
        ];
      })
    ];
    const wsTrends = XLSX.utils.aoa_to_sheet(trendsData);
    XLSX.utils.book_append_sheet(wb, wsTrends, 'Monthly Trends');
    
    // Loan Type Breakdown Sheet
    const loanTypeData = [
      ['Loan Type', 'Applications', 'Approved', 'Approval Rate'],
      ...Object.entries(applicationReport.breakdown.loanType).map(([type, count]) => {
        const approvalData = applicationReport.breakdown.approvalRateByType[type];
        return [
          type,
          count,
          approvalData?.approved || 0,
          `${approvalData?.rate || 0}%`
        ];
      })
    ];
    const wsLoanType = XLSX.utils.aoa_to_sheet(loanTypeData);
    XLSX.utils.book_append_sheet(wb, wsLoanType, 'Loan Types');
    
    // Portfolio Sheet
    const portfolioData = [
      ['Portfolio Statistics'],
      ['Metric', 'Value'],
      ['Total Loans', financialReport.portfolio.totalLoans],
      ['Total Value', financialReport.portfolio.totalValue],
      ['Average Loan Size', financialReport.portfolio.avgLoanSize],
      ['Largest Loan', financialReport.portfolio.largestLoan],
      ['Smallest Loan', financialReport.portfolio.smallestLoan],
    ];
    const wsPortfolio = XLSX.utils.aoa_to_sheet(portfolioData);
    XLSX.utils.book_append_sheet(wb, wsPortfolio, 'Portfolio');
    
    // Generate and download Excel file
    XLSX.writeFile(wb, `report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading || !applicationReport || !financialReport) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  // TypeScript now knows these are not null after the return above
  const appReport = applicationReport;
  const finReport = financialReport;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="border-0 focus:ring-0 text-sm"
              placeholder="Start Date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="border-0 focus:ring-0 text-sm"
              placeholder="End Date"
            />
          </div>
          <button
            onClick={applyDateFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Apply
          </button>
          {(dateRange.startDate || dateRange.endDate) && (
            <button
              onClick={clearDateFilter}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200"
            >
              Clear
            </button>
          )}
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" /> Export CSV
          </button>
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" /> Export Excel
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Total Applications</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {appReport.summary.totalApplications}
          </p>
          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 
            {dateRange.startDate || dateRange.endDate ? 'Selected period' : 'All time'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Approved Loans</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {appReport.summary.statusBreakdown.Approved}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {appReport.summary.approvalRate}% approval rate
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Funds Disbursed</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {(finReport.summary.totalDisbursed / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-600 mt-2">Total amount</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Average Loan</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {finReport.summary.avgLoanAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 mt-2">Per applicant</p>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Avg Processing Time</p>
          <p className="text-2xl font-bold text-indigo-600 mt-2">
            {appReport.summary.avgProcessingTime} days
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {appReport.summary.statusBreakdown.Pending + 
             appReport.summary.statusBreakdown['Under Review']}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Rejection Rate</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {appReport.summary.rejectionRate}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Projected Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {(finReport.summary.projectedRevenue / 1000000).toFixed(2)}M
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trends */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Application Trends</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={appReport.trends.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Total"
              />
              <Line 
                type="monotone" 
                dataKey="approved" 
                stroke="#16a34a" 
                strokeWidth={2}
                name="Approved"
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Rejected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Application Status Distribution</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={appReport.trends.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="approved" fill="#16a34a" name="Approved" />
              <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              <Bar dataKey="underReview" fill="#8b5cf6" name="Under Review" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Trends */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Disbursement Trends</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={finReport.trends.monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value: any, name: string) => {
                if (name === 'Amount') {
                  return `₭${(value / 1000000).toFixed(2)}M`;
                }
                return value;
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="amount" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Amount"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="count" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Count"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Summary Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border-l-4 border-blue-600 pl-4">
            <p className="text-gray-600 text-sm">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900">
              {appReport.summary.totalApplications}
            </p>
          </div>
          <div className="border-l-4 border-green-600 pl-4">
            <p className="text-gray-600 text-sm">Approved</p>
            <p className="text-2xl font-bold text-gray-900">
              {appReport.summary.statusBreakdown.Approved}
            </p>
          </div>
          <div className="border-l-4 border-yellow-600 pl-4">
            <p className="text-gray-600 text-sm">Pending Review</p>
            <p className="text-2xl font-bold text-gray-900">
              {appReport.summary.statusBreakdown.Pending}
            </p>
          </div>
          <div className="border-l-4 border-red-600 pl-4">
            <p className="text-gray-600 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">
              {appReport.summary.statusBreakdown.Rejected}
            </p>
          </div>
        </div>
      </div>

      {/* Loan Type Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Loan Type Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(appReport.breakdown.loanType).map(([type, count]: [string, any]) => (
            <div key={type} className="border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-medium">{type}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{count}</p>
              {appReport.breakdown.approvalRateByType[type] && (
                <p className="text-xs text-gray-600 mt-2">
                  {appReport.breakdown.approvalRateByType[type].rate}% approval rate
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Statistics */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600 text-sm">Total Loans</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {finReport.portfolio.totalLoans}
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-gray-600 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {(finReport.portfolio.totalValue / 1000000).toFixed(2)}M
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-gray-600 text-sm">Avg Loan Size</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {finReport.portfolio.avgLoanSize.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-gray-600 text-sm">Largest Loan</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              {(finReport.portfolio.largestLoan / 1000000).toFixed(2)}M
            </p>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-gray-600 text-sm">Smallest Loan</p>
            <p className="text-2xl font-bold text-indigo-600 mt-2">
              {(finReport.portfolio.smallestLoan / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}