// app/dashboard/jobs/page.tsx
'use client';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Briefcase, Calendar, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      alert('Job deleted successfully!');
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get deadline badge styling
  const getDeadlineBadge = (deadline: string) => {
    const daysLeft = getDaysUntilDeadline(deadline);
    
    if (daysLeft < 0) {
      return {
        text: 'Expired',
        className: 'bg-red-100 text-red-700 border border-red-200',
        showWarning: false
      };
    } else if (daysLeft === 0) {
      return {
        text: 'Today!',
        className: 'bg-red-100 text-red-700 border border-red-200 animate-pulse',
        showWarning: true
      };
    } else if (daysLeft === 1) {
      return {
        text: 'Tomorrow',
        className: 'bg-orange-100 text-orange-700 border border-orange-200',
        showWarning: true
      };
    } else if (daysLeft <= 3) {
      return {
        text: `${daysLeft} days`,
        className: 'bg-orange-100 text-orange-700 border border-orange-200',
        showWarning: true
      };
    } else if (daysLeft <= 7) {
      return {
        text: `${daysLeft} days`,
        className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        showWarning: false
      };
    } else {
      return {
        text: `${daysLeft} days`,
        className: 'bg-green-100 text-green-700 border border-green-200',
        showWarning: false
      };
    }
  };

  // Count urgent deadlines
  const urgentJobs = jobs.filter(job => {
    if (!job.deadline) return false;
    const days = getDaysUntilDeadline(job.deadline);
    return (job.status === 'Active' || job.status === 'Open') && days <= 3 && days >= 0;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          {urgentJobs > 0 && (
            <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {urgentJobs} posting{urgentJobs !== 1 ? 's' : ''} with urgent deadline{urgentJobs !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/jobs/create"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          style={{ color: '#ffffff' }}
        >
          <Plus className="w-5 h-5" style={{ color: '#ffffff' }} />
          <span style={{ color: '#ffffff' }}>Post Job</span>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No job postings yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first job posting</p>
          <Link
            href="/dashboard/jobs/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium text-white"
            style={{ color: '#ffffff' }}
          >
            <Plus className="w-5 h-5" style={{ color: '#ffffff' }} />
            <span style={{ color: '#ffffff' }}>Create Job Posting</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Position</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Level</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Location</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Applicants</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Deadline</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const deadlineBadge = job.deadline ? getDeadlineBadge(job.deadline) : null;
                const displayStatus = job.status === 'Active' ? 'Open' : job.status;
                
                return (
                  <tr key={job._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{job.title}</span>
                        {deadlineBadge?.showWarning && (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{job.experienceLevel}</td>
                    <td className="px-6 py-3 text-gray-700">{job.location}</td>
                    <td className="px-6 py-3 text-gray-900 font-bold">{job.applicants || 0}</td>
                    <td className="px-6 py-3">
                      {job.deadline && deadlineBadge ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600">
                              {new Date(job.deadline).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${deadlineBadge.className}`}>
                              {deadlineBadge.text}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No deadline</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        displayStatus === 'Open' || displayStatus === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/jobs/${job._id}/edit`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(job._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Deadline Legend */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Deadline Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">
              Today/Expired
            </span>
            <span className="text-xs text-gray-600">Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700 border border-orange-200">
              1-3 days
            </span>
            <span className="text-xs text-gray-600">Very Soon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
              4-7 days
            </span>
            <span className="text-xs text-gray-600">Soon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
              8+ days
            </span>
            <span className="text-xs text-gray-600">Plenty of Time</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-600">Needs Attention</span>
          </div>
        </div>
      </div>
    </div>
  );
}