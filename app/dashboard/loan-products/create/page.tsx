// app/dashboard/loan-products/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minAmount: '',
    maxAmount: '',
    minTenure: '',
    maxTenure: '',
    minInterest: '',
    maxInterest: '',
    processingFee: '',
    status: 'Active',
    features: '',
    eligibility: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Convert features and eligibility from comma-separated to arrays
      const payload = {
        ...formData,
        minAmount: parseFloat(formData.minAmount),
        maxAmount: parseFloat(formData.maxAmount),
        minTenure: parseInt(formData.minTenure),
        maxTenure: parseInt(formData.maxTenure),
        minInterest: parseFloat(formData.minInterest),
        maxInterest: parseFloat(formData.maxInterest),
        processingFee: parseFloat(formData.processingFee),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        eligibility: formData.eligibility.split(',').map(e => e.trim()).filter(e => e),
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Product created successfully!');
        router.push('/dashboard/loan-products');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create product'}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-200 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Loan Product</h1>
          <p className="text-gray-600 mt-1">Add a new loan product to the system</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Min Amount */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Minimum Amount *
            </label>
            <input
              type="number"
              name="minAmount"
              value={formData.minAmount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Maximum Amount *
            </label>
            <input
              type="number"
              name="maxAmount"
              value={formData.maxAmount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Min Tenure */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Minimum Tenure (months) *
            </label>
            <input
              type="number"
              name="minTenure"
              value={formData.minTenure}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Max Tenure */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Maximum Tenure (months) *
            </label>
            <input
              type="number"
              name="maxTenure"
              value={formData.maxTenure}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Min Interest */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Minimum Interest (%) *
            </label>
            <input
              type="number"
              step="0.01"
              name="minInterest"
              value={formData.minInterest}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Max Interest */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Maximum Interest (%) *
            </label>
            <input
              type="number"
              step="0.01"
              name="maxInterest"
              value={formData.maxInterest}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Processing Fee */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Processing Fee (%) *
            </label>
            <input
              type="number"
              step="0.01"
              name="processingFee"
              value={formData.processingFee}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Features */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Features (comma-separated)
            </label>
            <input
              type="text"
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="Quick approval, Flexible repayment, No collateral"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">Separate each feature with a comma</p>
          </div>

          {/* Eligibility */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Eligibility Requirements (comma-separated)
            </label>
            <input
              type="text"
              name="eligibility"
              value={formData.eligibility}
              onChange={handleChange}
              placeholder="Valid ID, Proof of income, Business registration"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">Separate each requirement with a comma</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}