// app/dashboard/faq/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  status: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/faq');
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/faq/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFaqs(faqs.filter((f) => f._id !== id));
        alert('FAQ deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
        <Link 
          href="/dashboard/faq/create" 
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          style={{ color: '#ffffff' }}
        >
          <Plus className="w-5 h-5" style={{ color: '#ffffff' }} /> 
          <span style={{ color: '#ffffff' }}>Add FAQ</span>
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No FAQs found</div>
        ) : (
          faqs.map((faq) => (
            <div key={faq._id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">{faq.question}</h3>
                  </div>
                  <p className="text-gray-700 ml-8 mb-2">{faq.answer}</p>
                  <div className="flex items-center gap-4 ml-8 text-sm text-gray-500">
                    <span>Category: {faq.category}</span>
                    <span>Views: {faq.views}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                      {faq.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/faq/${faq._id}/edit`}
                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(faq._id)}
                    disabled={deleting === faq._id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}