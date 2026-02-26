// app/dashboard/loan-applications/create/page.tsx - WITH DOCUMENT UPLOAD
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, AlertCircle, FileText, File, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface LoanProduct {
  _id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  interestRate: number;
  status: string;
}

interface SelectedFile {
  file: File;
  category: string;
}

export default function CreateApplicationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Loan Products State
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    idNumber: '',
    address: '',
    
    // Loan Details
    loanProductId: '',
    loanType: '',
    loanAmount: '',
    tenure: '',
    purpose: '',
    status: 'Pending',
    
    // Employment Information
    employment: '',
    income: '',
    businessName: '',
    yearsInBusiness: '',
    employees: '',
  });
  
  // Document Upload State
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [documentCategory, setDocumentCategory] = useState('ID Document');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ uploaded: 0, total: 0 });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch loan products on mount
  useEffect(() => {
    fetchLoanProducts();
  }, []);

  const fetchLoanProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/products?status=Active', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loan products');
      }

      const products = await response.json();
      setLoanProducts(products);
      
      // Auto-select first product if available
      if (products.length > 0) {
        handleProductSelect(products[0]);
      }
    } catch (err: any) {
      console.error('Error fetching loan products:', err);
      setError('Failed to load loan products. Please refresh the page.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductSelect = (product: LoanProduct) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      loanProductId: product._id,
      loanType: product.name,
      loanAmount: '',
      tenure: '',
    }));
    setValidationError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError(null);
  };

  // File Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addFiles(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files) {
      addFiles(Array.from(files));
    }
  };

  const addFiles = (files: File[]) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const validFiles: SelectedFile[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 10MB)`);
        return;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} has an unsupported file type`);
        return;
      }

      validFiles.push({
        file,
        category: documentCategory,
      });
    });

    if (errors.length > 0) {
      alert('Some files were not added:\n' + errors.join('\n'));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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

  const uploadDocuments = async (applicationId: string): Promise<{
    success: boolean;
    uploaded: number;
    total?: number;
    errors?: string[];
  }> => {
    if (selectedFiles.length === 0) {
      return { success: true, uploaded: 0 };
    }

    setUploadProgress({ uploaded: 0, total: selectedFiles.length });

    let uploadedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const { file, category } = selectedFiles[i];

      try {
        const formData = new FormData();
        formData.append('files', file);
        formData.append('relatedTo', 'Application');
        formData.append('relatedId', applicationId);
        formData.append('category', category);
        formData.append('description', `Document for loan application ${applicationId}`);

        const token = localStorage.getItem('auth_token');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        uploadedCount++;
        setUploadProgress({ uploaded: uploadedCount, total: selectedFiles.length });
      } catch (err: any) {
        console.error(`Error uploading ${file.name}:`, err);
        errors.push(`${file.name}: ${err.message}`);
      }
    }

    return {
      success: uploadedCount > 0,
      uploaded: uploadedCount,
      total: selectedFiles.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  };

  const validateForm = () => {
    // Check required fields
    const requiredFields = [
      'fullName', 'email', 'phone', 'dob', 'gender', 'idNumber', 'address',
      'loanProductId', 'loanAmount', 'tenure', 'purpose',
      'employment', 'income'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setValidationError(`Please fill in all required fields`);
        return false;
      }
    }

    // Validate loan amount against product limits
    if (selectedProduct) {
      const amount = parseFloat(formData.loanAmount);
      if (amount < selectedProduct.minAmount || amount > selectedProduct.maxAmount) {
        setValidationError(
          `Loan amount must be between ${selectedProduct.minAmount.toLocaleString()} and ${selectedProduct.maxAmount.toLocaleString()} LAK for ${selectedProduct.name}`
        );
        return false;
      }

      // Validate tenure against product limits
      const tenure = parseInt(formData.tenure);
      if (tenure < selectedProduct.minTenure || tenure > selectedProduct.maxTenure) {
        setValidationError(
          `Tenure must be between ${selectedProduct.minTenure} and ${selectedProduct.maxTenure} months for ${selectedProduct.name}`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');

      // Transform data for API
      const applicationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dob: new Date(formData.dob),
        gender: formData.gender,
        idNumber: formData.idNumber,
        address: formData.address,
        loanProductId: formData.loanProductId,
        loanType: formData.loanType,
        loanAmount: parseFloat(formData.loanAmount),
        tenure: parseInt(formData.tenure),
        purpose: formData.purpose,
        status: formData.status,
        employment: formData.employment,
        income: parseFloat(formData.income),
        ...(formData.businessName && { businessName: formData.businessName }),
        ...(formData.yearsInBusiness && { yearsInBusiness: parseInt(formData.yearsInBusiness) }),
        ...(formData.employees && { employees: parseInt(formData.employees) }),
      };

      // Create application
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create application');
      }

      const createdApplication = await response.json();
      
      // Upload documents if any
      let uploadResult: { success: boolean; uploaded: number; total?: number; errors?: string[] } = { 
        success: true, 
        uploaded: 0 
      };
      if (selectedFiles.length > 0) {
        uploadResult = await uploadDocuments(createdApplication._id);
      }

      // Show success message
      if (uploadResult.uploaded > 0) {
        alert(`Application created successfully with ${uploadResult.uploaded} document(s)!`);
      } else {
        alert('Application created successfully!');
      }

      // Show upload errors if any
      if (uploadResult.errors && uploadResult.errors.length > 0) {
        console.warn('Some documents failed to upload:', uploadResult.errors);
      }

      router.push('/dashboard/loan-applications');
      
    } catch (err: any) {
      console.error('Error creating application:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setUploadProgress({ uploaded: 0, total: 0 });
    }
  };

  // Generate tenure options based on selected product
  const getTenureOptions = () => {
    if (!selectedProduct) return [];
    
    const options = [];
    for (let i = selectedProduct.minTenure; i <= selectedProduct.maxTenure; i += 6) {
      options.push(i);
    }
    // Always include max tenure
    if (!options.includes(selectedProduct.maxTenure)) {
      options.push(selectedProduct.maxTenure);
    }
    return options.sort((a, b) => a - b);
  };

  if (loadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading loan products...</p>
      </div>
    );
  }

  if (loanProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-yellow-900">No Active Loan Products</h3>
              <p className="text-yellow-700 mt-1">
                You need to create and activate loan products before creating applications.
              </p>
              <button
                onClick={() => router.push('/dashboard/loan-products')}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-bold"
              >
                Go to Loan Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Loan Application</h1>
          <p className="text-gray-600 mt-1">Create a new loan application</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Validation Error Display */}
      {validationError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-700">{validationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+856 20 ..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="National ID number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full address"
              />
            </div>
          </div>
        </div>

        {/* Loan Details - Based on Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Loan Details</h2>
          
          {/* Loan Product Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Select Loan Product <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {loanProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleProductSelect(product)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedProduct?._id === product._id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-bold text-gray-900 ml-1">
                            {product.minAmount.toLocaleString()} - {product.maxAmount.toLocaleString()} LAK
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tenure:</span>
                          <span className="font-bold text-gray-900 ml-1">
                            {product.minTenure} - {product.maxTenure} months
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Interest:</span>
                          <span className="font-bold text-gray-900 ml-1">
                            {product.interestRate}% per year
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedProduct?._id === product._id && (
                      <div className="ml-4">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loan Amount and Tenure */}
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Loan Amount (LAK) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  required
                  min={selectedProduct.minAmount}
                  max={selectedProduct.maxAmount}
                  step="100000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`${selectedProduct.minAmount.toLocaleString()} - ${selectedProduct.maxAmount.toLocaleString()}`}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Min: {selectedProduct.minAmount.toLocaleString()} LAK | 
                  Max: {selectedProduct.maxAmount.toLocaleString()} LAK
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tenure (Months) <span className="text-red-500">*</span>
                </label>
                <select
                  name="tenure"
                  value={formData.tenure}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select tenure</option>
                  {getTenureOptions().map(months => (
                    <option key={months} value={months}>
                      {months} months
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  Available: {selectedProduct.minTenure} - {selectedProduct.maxTenure} months
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Purpose of Loan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe how you will use this loan..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Application Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Employment Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Employment Status <span className="text-red-500">*</span>
              </label>
              <select
                name="employment"
                value={formData.employment}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select employment status</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Employed">Employed</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Farmer">Farmer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Monthly Income (LAK) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="income"
                value={formData.income}
                onChange={handleChange}
                required
                min="0"
                step="100000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Monthly income in LAK"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Business Name (if applicable)
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Business name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Years in Business
              </label>
              <input
                type="number"
                name="yearsInBusiness"
                value={formData.yearsInBusiness}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Years"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Number of Employees
              </label>
              <input
                type="number"
                name="employees"
                value={formData.employees}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of employees"
              />
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Supporting Documents</h2>
          
          <div className="space-y-4">
            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                className="hidden"
              />
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-gray-600" />
                </div>
                <p className="font-bold text-gray-900 mb-1">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Supported: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition"
                >
                  Select Files
                </button>
              </div>
            </div>

            {/* Document Category Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Document Category (for next upload)
              </label>
              <select
                value={documentCategory}
                onChange={(e) => setDocumentCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ID Document">ID Document</option>
                <option value="Income Proof">Income Proof</option>
                <option value="Bank Statement">Bank Statement</option>
                <option value="Business License">Business License</option>
                <option value="Tax Document">Tax Document</option>
                <option value="Property Document">Property Document</option>
                <option value="Photo">Photo</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">
                  Selected Files ({selectedFiles.length})
                </h3>
                <div className="space-y-2">
                  {selectedFiles.map((fileData, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getFileIcon(fileData.file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {fileData.file.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{formatFileSize(fileData.file.size)}</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {fileData.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress.total > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-blue-900">
                    Uploading Documents...
                  </span>
                  <span className="text-sm text-blue-700">
                    {uploadProgress.uploaded} / {uploadProgress.total}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(uploadProgress.uploaded / uploadProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* File Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-bold text-gray-900 mb-2">Required Documents:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Valid government-issued ID (passport, ID card, or driver's license)</li>
                <li>• Proof of income (salary slips, bank statements, or tax returns)</li>
                <li>• Proof of address (utility bill or rental agreement)</li>
                <li>• Business license (for business loans)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedProduct}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Application...</span>
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}