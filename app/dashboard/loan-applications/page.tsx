// app/dashboard/loan-applications/page.tsx - WITH REAL API DATA
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Trash2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');

      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/applications?${params.toString()}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(id);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete application');
      }

      // Remove from local state
      setApplications(applications.filter(app => app._id !== id));
      alert('Application deleted successfully');
    } catch (err: any) {
      console.error('Error deleting application:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Applications</h1>
          <p className="text-gray-600 mt-1">Manage and review all loan applications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchApplications}
            className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            href="/dashboard/loan-applications/create"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
            style={{ color: '#ffffff' }}
          >
            <Plus className="w-5 h-5" style={{ color: '#ffffff' }} />
            <span style={{ color: '#ffffff' }}>New Application</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                <input
                  type="text"
                  placeholder="Search by name, email, or loan type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Filter className="w-5 h-5" /> Apply Filters
          </button>
        </form>
      </div>

      {/* Stats Summary */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'Approved').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Under Review</p>
            <p className="text-2xl font-bold text-blue-600">
              {applications.filter(a => a.status === 'Under Review').length}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900">Error Loading Applications</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={fetchApplications}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Applications Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Loan Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Search className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-900 font-bold mb-1">No applications found</p>
                        <p className="text-gray-500 text-sm">
                          {searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by creating a new application'}
                        </p>
                        {searchQuery || statusFilter !== 'all' ? (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('all');
                            }}
                            className="mt-3 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-bold"
                          >
                            Clear Filters
                          </button>
                        ) : (
                          <Link
                            href="/dashboard/loan-applications/create"
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm"
                          >
                            Create Application
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{app.fullName}</p>
                          <p className="text-sm text-gray-600">{app.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{app.loanType}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 0,
                        }).format(app.loanAmount)} LAK
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-800' :
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/loan-applications/${app._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(app._id)}
                            disabled={deleting === app._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete Application"
                          >
                            {deleting === app._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}