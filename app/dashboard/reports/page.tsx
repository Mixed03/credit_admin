// app/dashboard/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';

const reportData = [
  { month: 'Jan', applications: 40, approved: 24, rejected: 8, pending: 8 },
  { month: 'Feb', applications: 52, approved: 35, rejected: 10, pending: 7 },
  { month: 'Mar', applications: 48, approved: 28, rejected: 12, pending: 8 },
  { month: 'Apr', applications: 61, approved: 42, rejected: 15, pending: 4 },
  { month: 'May', applications: 55, approved: 38, rejected: 12, pending: 5 },
  { month: 'Jun', applications: 67, approved: 45, rejected: 18, pending: 4 },
];

interface Stats {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  totalDisbursed: number;
  averageLoan: number;
  approvalRate: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
          <Download className="w-5 h-5" /> Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Total Applications</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalApplications}</p>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> All time
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Approved Loans</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvedApplications}</p>
          <p className="text-xs text-gray-600 mt-2">{stats.approvalRate}% approval rate</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Funds Disbursed</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{(stats.totalDisbursed / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-gray-600 mt-2">Total amount</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Average Loan</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.averageLoan.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-2">Per applicant</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trends */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Application Trends</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="approved" stroke="#16a34a" strokeWidth={2} />
              <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Application Status Distribution</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="approved" fill="#16a34a" />
              <Bar dataKey="rejected" fill="#ef4444" />
              <Bar dataKey="pending" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Summary Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border-l-4 border-blue-600 pl-4">
            <p className="text-gray-600 text-sm">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
          </div>
          <div className="border-l-4 border-green-600 pl-4">
            <p className="text-gray-600 text-sm">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approvedApplications}</p>
          </div>
          <div className="border-l-4 border-yellow-600 pl-4">
            <p className="text-gray-600 text-sm">Pending Review</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
          </div>
          <div className="border-l-4 border-red-600 pl-4">
            <p className="text-gray-600 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rejectedApplications}</p>
          </div>
        </div>
      </div>
    </div>
  );
}