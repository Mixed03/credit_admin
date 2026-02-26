// app/dashboard/loan-products/[id]/page.tsx - PRODUCT DETAIL PAGE
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Trash2, DollarSign, Calendar, Percent, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Product {
    _id: string;
    name: string;
    description: string;
    minAmount: number;
    maxAmount: number;
    minTenure: number;
    maxTenure: number;
    interestRate?: number;
    minInterest?: number;
    maxInterest?: number;
    status: string;
    processingFee?: number;
    latePaymentFee?: number;
    eligibilityCriteria?: string[];
    requiredDocuments?: string[];
    features?: string[];
    terms?: string;
    createdAt: string;
    updatedAt: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params Promise for Next.js 16
    const unwrappedParams = use(params);
    const productId = unwrappedParams.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('auth_token');

            const response = await fetch(`/api/products/${productId}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Product not found');
                }
                throw new Error('Failed to fetch product');
            }

            const data = await response.json();
            setProduct(data);
        } catch (err: any) {
            console.error('Error fetching product:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!product) return;

        if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeleting(true);
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            alert('Product deleted successfully');
            router.push('/dashboard/loan-products');
        } catch (err: any) {
            console.error('Error deleting product:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setDeleting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'Inactive':
                return <XCircle className="w-5 h-5 text-gray-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Inactive':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading product details...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-bold text-red-900">Error Loading Product</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No Data State
    if (!product) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h3>
                    <p className="text-gray-600 mb-4">The requested product could not be found.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-gray-600 mt-1">Loan Product Details</p>
                    </div>
                </div>
                {/* <div className="flex items-center gap-3">
                    <Link
                        href={`/dashboard/loan-products/${productId}/edit`}
                        className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 font-bold transition flex items-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-bold transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div> */}
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    {getStatusIcon(product.status)}
                    <div>
                        <h3 className="text-sm text-gray-600">Current Status</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(product.status)}`}>
                            {product.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                        <p className="text-gray-700 leading-relaxed">
                            {product.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Loan Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <h2 className="text-xl font-bold text-gray-900">Loan Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Loan Amount Range</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {product.minAmount.toLocaleString()} - {product.maxAmount.toLocaleString()} LAK
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Min: {product.minAmount.toLocaleString()} | Max: {product.maxAmount.toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tenure Range</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {product.minTenure} - {product.maxTenure} months
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {product.minTenure} to {product.maxTenure} months repayment period
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {product.interestRate
                                        ? `${product.interestRate}%`
                                        : `${product.minInterest}% - ${product.maxInterest}%`}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">Annual percentage rate</p>
                            </div>

                            {product.processingFee !== undefined && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Processing Fee</p>
                                    <p className="text-2xl font-bold text-gray-900">{product.processingFee}%</p>
                                    <p className="text-xs text-gray-600 mt-1">One-time processing fee</p>
                                </div>
                            )}

                            {product.latePaymentFee !== undefined && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Late Payment Fee</p>
                                    <p className="text-2xl font-bold text-gray-900">{product.latePaymentFee}%</p>
                                    <p className="text-xs text-gray-600 mt-1">Per month overdue</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Example Calculation */}
                    {/* <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                        <h3 className="font-bold text-blue-900 mb-3">Example Loan Calculation</h3>
                        <p className="text-sm text-blue-700 mb-4">
                            Based on average values for this product
                        </p>

                        {(() => {
                            const avgAmount = (product.minAmount + product.maxAmount) / 2;
                            const avgTenure = (product.minTenure + product.maxTenure) / 2;
                            const rate = product.interestRate || ((product.minInterest || 0) + (product.maxInterest || 0)) / 2;
                            const monthlyRate = (rate / 100) / 12;
                            const monthlyPayment = avgAmount * (monthlyRate * Math.pow(1 + monthlyRate, avgTenure)) / (Math.pow(1 + monthlyRate, avgTenure) - 1);
                            const totalPayment = monthlyPayment * avgTenure;
                            const totalInterest = totalPayment - avgAmount;

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Monthly Payment</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {Math.round(monthlyPayment).toLocaleString()} LAK
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Total Interest</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {Math.round(totalInterest).toLocaleString()} LAK
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Total Repayment</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {Math.round(totalPayment).toLocaleString()} LAK
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}
                        <p className="text-xs text-blue-700 mt-3">
                            * Based on loan amount of {((product.minAmount + product.maxAmount) / 2).toLocaleString()} LAK for {((product.minTenure + product.maxTenure) / 2)} months
                        </p>
                    </div> */}

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
                            <ul className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Terms and Conditions */}
                    {product.terms && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Terms and Conditions</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {product.terms}
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-bold text-gray-900">Timeline</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Created</p>
                                <p className="font-bold text-gray-900">
                                    {new Date(product.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Last Updated</p>
                                <p className="font-bold text-gray-900">
                                    {new Date(product.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Max Loan</span>
                                <span className="font-bold text-gray-900">
                                    {product.maxAmount.toLocaleString()} LAK
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Max Tenure</span>
                                <span className="font-bold text-gray-900">{product.maxTenure} mo</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Interest Rate</span>
                                <span className="font-bold text-gray-900">
                                    {product.interestRate
                                        ? `${product.interestRate}%`
                                        : `${product.minInterest}%-${product.maxInterest}%`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Status</span>
                                <span className={`text-sm font-bold ${product.status === 'Active' ? 'text-green-600' : 'text-gray-600'}`}>
                                    {product.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility Criteria */}
                    {product.eligibilityCriteria && product.eligibilityCriteria.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Eligibility</h2>
                            <ul className="space-y-2">
                                {product.eligibilityCriteria.map((criteria, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{criteria}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Required Documents */}
                    {product.requiredDocuments && product.requiredDocuments.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Required Documents</h2>
                            <ul className="space-y-2">
                                {product.requiredDocuments.map((doc, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></div>
                                        <span className="text-gray-700">{doc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="font-bold text-green-900 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link
                                href={`/dashboard/loan-products/${productId}/edit`}
                                className="w-full px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 font-bold transition text-sm block text-center"
                            >
                                Edit Product
                            </Link>
                            <Link
                                href="/dashboard/loan-applications/create"
                                className="w-full px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 font-bold transition text-sm block text-center"
                            >
                                Create Application
                            </Link>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 font-bold transition text-sm disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete Product'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}