// app/dashboard/loan-products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  minInterest: number;
  maxInterest: number;
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter((p) => p._id !== id));
        alert('Product deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Products</h1>
          <p className="text-gray-600 mt-1">Manage loan products and their details</p>
        </div>
        <Link
          href="/dashboard/loan-products/create"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          style={{ color: '#ffffff' }}
        >
          <Plus className="w-5 h-5" style={{ color: '#ffffff' }} />
          <span style={{ color: '#ffffff' }}>New Product</span>
        </Link>
      </div>

      {/* Search */}
      {/* <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div> */}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-600">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-600">No products found</div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
              <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full inline-block mb-4 ${product.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                  }`}
              >
                {product.status}
              </span>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p><strong>Amount:</strong> {product.minAmount.toLocaleString()} - {product.maxAmount.toLocaleString()}</p>
                <p><strong>Tenure:</strong> {product.minTenure} - {product.maxTenure} months</p>
                <p><strong>Interest:</strong> {product.minInterest}% - {product.maxInterest}%</p>
              </div>

              <div className="flex gap-2 border-t border-gray-200 pt-4">
                <Link
                    href={`/dashboard/loan-products/${product._id}`}
                    className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1.5 text-sm font-bold"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Link>
                <Link
                  href={`/dashboard/loan-products/${product._id}/edit`}
                  className="flex-1 p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(product._id)}
                  disabled={deleting === product._id}
                  className="flex-1 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
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