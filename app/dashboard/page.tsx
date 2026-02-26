// app/dashboard/page.tsx - WITH REAL API DATA
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Users, FileText, CheckCircle, 
  XCircle, Clock, DollarSign, AlertCircle 
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('auth_token');

      // Fetch statistics from API
      const statsRes = await fetch('/api/stats', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!statsRes.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent applications (limit to 5, sort by newest)
      const appsRes = await fetch('/api/applications?limit=5', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!appsRes.ok) {
        throw new Error('Failed to fetch recent applications');
      }

      const appsData = await appsRes.json();
      // Sort by createdAt descending (newest first)
      const sortedApps = appsData.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ).slice(0, 5);
      
      setRecentApplications(sortedApps);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900">Error Loading Dashboard</h3>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (!stats) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-4">Dashboard data could not be loaded</p>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to NDTMFI Admin Dashboard</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalApplications || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approval Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.approvalRate !== undefined ? stats.approvalRate.toFixed(1) : '0.0'}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Total Disbursed</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 0,
            }).format(stats.totalDisbursed || 0)} LAK
          </p>
          <p className="text-sm text-gray-600 mt-2">From approved loans</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Average Loan Amount</h3>
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 0,
            }).format(stats.averageLoan || 0)} LAK
          </p>
          <p className="text-sm text-gray-600 mt-2">Across all applications</p>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Under Review</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.underReview || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalApplications > 0 
                  ? ((stats.approved / stats.totalApplications) * 100).toFixed(1)
                  : '0.0'}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
            <p className="text-sm text-gray-600 mt-1">Latest loan applications submitted</p>
          </div>
          <Link
            href="/dashboard/loan-applications"
            className="text-sm text-blue-600 hover:text-blue-700 font-bold"
          >
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No recent applications
                  </td>
                </tr>
              ) : (
                recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{app.fullName}</p>
                        <p className="text-xs text-gray-600">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{app.loanType}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 0,
                      }).format(app.loanAmount)} LAK
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(app.createdAt || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {recentApplications.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <Link
              href="/dashboard/loan-applications"
              className="text-sm text-blue-600 hover:text-blue-700 font-bold"
            >
              View All {stats.totalApplications} Applications →
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/loan-applications/create"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">New Application</p>
              <p className="text-sm text-gray-600">Create loan application</p>
            </div>
          </Link>

          <Link
            href="/dashboard/loan-applications?status=Pending"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-yellow-200 hover:border-yellow-400 transition"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Review Pending</p>
              <p className="text-sm text-gray-600">{stats.pending} awaiting review</p>
            </div>
          </Link>

          <Link
            href="/dashboard/reports"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 transition"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">Analytics & insights</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}