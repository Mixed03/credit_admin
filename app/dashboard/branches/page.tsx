// app/dashboard/branches/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Branch {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  status: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/branches');
      const data = await response.json();
      setBranches(data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/branches/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBranches(branches.filter((b) => b._id !== id));
        alert('Branch deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      alert('Failed to delete branch');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Branch Locations</h1>
        <Link 
          href="/dashboard/branches/create" 
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          style={{ color: '#ffffff' }}
        >
          <Plus className="w-5 h-5" style={{ color: '#ffffff' }} /> 
          <span style={{ color: '#ffffff' }}>Add Branch</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-600">Loading...</div>
        ) : branches.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-600">No branches found</div>
        ) : (
          branches.map((branch) => (
            <div key={branch._id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{branch.name}</h3>
                    <p className="text-sm text-gray-600">{branch.city}</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                  {branch.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p><strong>Address:</strong> {branch.address}</p>
                <p><strong>Phone:</strong> {branch.phone}</p>
                <p><strong>Email:</strong> {branch.email}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/branches/${branch._id}/edit`}
                  className="flex-1 p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(branch._id)}
                  disabled={deleting === branch._id}
                  className="flex-1 p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}