// app/dashboard/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import Link from 'next/link';

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter((u) => u._id !== id));
        alert('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Staff Users</h1>
        <Link
          href="/dashboard/users/create"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          style={{ color: '#ffffff' }}
        >
          <Plus className="w-5 h-5" style={{ color: '#ffffff' }} />
          <span style={{ color: '#ffffff' }}>Add User</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 font-bold text-gray-900">{user.name}</td>
                  <td className="px-6 py-3 text-gray-700">{user.email}</td>
                  <td className="px-6 py-3 text-gray-700 capitalize">{user.role}</td>
                  <td className="px-6 py-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                        <Link
                          href={`/dashboard/users/${user._id}/edit`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={deleting === user._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
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
  );
}