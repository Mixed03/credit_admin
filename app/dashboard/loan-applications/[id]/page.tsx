// app/dashboard/loan-applications/[id]/page.tsx - WITH DOCUMENT VIEWER
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Trash2, FileText, User, DollarSign, Calendar, Briefcase, AlertCircle, CheckCircle, Clock, XCircle, Download, Eye, File, Image as ImageIcon } from 'lucide-react';

interface Application {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  idNumber: string;
  address: string;
  loanProductId?: string;
  loanType: string;
  loanAmount: number;
  tenure: number;
  purpose: string;
  status: string;
  employment: string;
  income: number;
  businessName?: string;
  yearsInBusiness?: number;
  employees?: number;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

interface LoanProduct {
  _id: string;
  name: string;
  interestRate: number;
  description: string;
}

interface DocumentData {
  _id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  category: string;
  description?: string;
  status: string;
  verified: boolean;
  createdAt: string;
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const applicationId = unwrappedParams.id;
  
  const [application, setApplication] = useState<Application | null>(null);
  const [product, setProduct] = useState<LoanProduct | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/applications/${applicationId}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Application not found');
        }
        throw new Error('Failed to fetch application');
      }

      const data = await response.json();
      setApplication(data);
      setNewStatus(data.status);

      // Fetch loan product if productId exists
      if (data.loanProductId) {
        fetchLoanProduct(data.loanProductId);
      }

      // Fetch documents
      fetchDocuments();
    } catch (err: any) {
      console.error('Error fetching application:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const productData = await response.json();
        setProduct(productData);
      }
    } catch (err) {
      console.error('Error fetching loan product:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(
        `/api/upload?relatedTo=Application&relatedId=${applicationId}&status=Active`,
        {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      );

      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!application || newStatus === application.status) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedApp = await response.json();
      setApplication(updatedApp);
      alert('Status updated successfully!');
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      alert('Application deleted successfully');
      router.push('/dashboard/loan-applications');
    } catch (err: any) {
      console.error('Error deleting application:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDocumentDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/upload/${docId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Refresh documents list
      fetchDocuments();
      alert('Document deleted successfully');
    } catch (err: any) {
      console.error('Error deleting document:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-600" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else {
      return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Under Review':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateMonthlyPayment = () => {
    if (!application) return 0;
    
    const principal = application.loanAmount;
    const interestRate = product?.interestRate || 10;
    const monthlyRate = (interestRate / 100) / 12;
    const numPayments = application.tenure;
    
    if (monthlyRate === 0) {
      return principal / numPayments;
    }
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return monthlyPayment;
  };

  const calculateTotalPayment = () => {
    if (!application) return 0;
    return calculateMonthlyPayment() * application.tenure;
  };

  const calculateTotalInterest = () => {
    if (!application) return 0;
    return calculateTotalPayment() - application.loanAmount;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading application details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900">Error Loading Application</h3>
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

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Application Not Found</h3>
          <p className="text-gray-600 mb-4">The requested application could not be found.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600 mt-1">Application ID: {application._id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-bold transition flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(application.status)}
            <div>
              <h3 className="text-sm text-gray-600">Current Status</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(application.status)}`}>
                {application.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === application.status}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-bold text-gray-900">{application.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-bold text-gray-900">{application.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-bold text-gray-900">{application.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-bold text-gray-900">
                  {new Date(application.dob).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-bold text-gray-900">{application.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID Number</p>
                <p className="font-bold text-gray-900">{application.idNumber}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-bold text-gray-900">{application.address}</p>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Loan Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Loan Type</p>
                <p className="font-bold text-gray-900">{application.loanType}</p>
                {product && (
                  <p className="text-xs text-gray-600 mt-1">{product.description}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Loan Amount</p>
                <p className="font-bold text-gray-900 text-lg">
                  {new Intl.NumberFormat('en-US').format(application.loanAmount)} LAK
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tenure</p>
                <p className="font-bold text-gray-900">{application.tenure} months</p>
              </div>
              {product && (
                <div>
                  <p className="text-sm text-gray-600">Interest Rate</p>
                  <p className="font-bold text-gray-900">{product.interestRate}% per year</p>
                </div>
              )}
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Purpose</p>
                <p className="font-bold text-gray-900">{application.purpose}</p>
              </div>
            </div>

            {/* Payment Calculations */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Payment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">Monthly Payment</p>
                  <p className="text-xl font-bold text-blue-900">
                    {new Intl.NumberFormat('en-US').format(Math.round(calculateMonthlyPayment()))} LAK
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-700">Total Interest</p>
                  <p className="text-xl font-bold text-green-900">
                    {new Intl.NumberFormat('en-US').format(Math.round(calculateTotalInterest()))} LAK
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-700">Total Repayment</p>
                  <p className="text-xl font-bold text-purple-900">
                    {new Intl.NumberFormat('en-US').format(Math.round(calculateTotalPayment()))} LAK
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Employment Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Employment Status</p>
                <p className="font-bold text-gray-900">{application.employment}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="font-bold text-gray-900">
                  {new Intl.NumberFormat('en-US').format(application.income)} LAK
                </p>
              </div>
              {application.businessName && (
                <div>
                  <p className="text-sm text-gray-600">Business Name</p>
                  <p className="font-bold text-gray-900">{application.businessName}</p>
                </div>
              )}
              {application.yearsInBusiness !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Years in Business</p>
                  <p className="font-bold text-gray-900">{application.yearsInBusiness} years</p>
                </div>
              )}
              {application.employees !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Number of Employees</p>
                  <p className="font-bold text-gray-900">{application.employees}</p>
                </div>
              )}
            </div>

            {/* Debt-to-Income Ratio */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-700">Debt-to-Income Ratio</p>
                <p className="text-xl font-bold text-yellow-900">
                  {((calculateMonthlyPayment() / application.income) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Monthly payment as percentage of income
                </p>
              </div>
            </div>
          </div>
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
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="font-bold text-gray-900">
                  {new Date(application.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-bold text-gray-900">
                  {new Date(application.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Processing Time</p>
                <p className="font-bold text-gray-900">
                  {Math.ceil((new Date(application.updatedAt).getTime() - new Date(application.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Loan-to-Income</span>
                <span className="font-bold text-gray-900">
                  {((application.loanAmount / (application.income * 12)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly DTI</span>
                <span className="font-bold text-gray-900">
                  {((calculateMonthlyPayment() / application.income) * 100).toFixed(1)}%
                </span>
              </div>
              {product && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interest Rate</span>
                  <span className="font-bold text-gray-900">{product.interestRate}%</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tenure</span>
                <span className="font-bold text-gray-900">{application.tenure}mo</span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">Documents</h2>
              </div>
              {documents.length > 0 && (
                <span className="text-sm text-gray-600">
                  {documents.length} file{documents.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loadingDocuments ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <div className="flex-shrink-0">
                      {getFileIcon(doc.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {doc.originalName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {doc.category}
                        </span>
                        {doc.verified && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">✓ Verified</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View document"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={doc.fileUrl}
                        download={doc.originalName}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDocumentDelete(doc._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No documents uploaded</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 font-bold transition text-sm">
                Download Application
              </button>
              <button className="w-full px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 font-bold transition text-sm">
                Send Email
              </button>
              <button className="w-full px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 font-bold transition text-sm">
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}