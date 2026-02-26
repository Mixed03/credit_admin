'use client';
import Link from 'next/link';

import { Plus, Edit2, Trash2, Briefcase } from 'lucide-react';

const jobs = [
  { id: 1, role: 'Loan Officer', level: 'Mid-Level', location: 'Vientiane', applicants: 8, status: 'Open' },
  { id: 2, role: 'Field Officer', level: 'Entry-Level', location: 'Multiple', applicants: 12, status: 'Open' },
  { id: 3, role: 'Finance Analyst', level: 'Mid-Level', location: 'Vientiane', applicants: 5, status: 'Closed' },
];

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
        <Link
          href="/dashboard/jobs/create"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          style={{ color: '#ffffff' }}
        >
          <Plus className="w-5 h-5" style={{ color: '#ffffff' }} />
          <span style={{ color: '#ffffff' }}>Post Job</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Position</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Level</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Location</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Applicants</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3 font-bold text-gray-900">{job.role}</td>
                <td className="px-6 py-3 text-gray-700">{job.level}</td>
                <td className="px-6 py-3 text-gray-700">{job.location}</td>
                <td className="px-6 py-3 text-gray-900 font-bold">{job.applicants}</td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/jobs/${job.id}/edit`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}