// app/dashboard/compliance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Shield, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

const complianceItems = [
  {
    title: 'License & Registration',
    status: 'Compliant',
    description: 'Bank of Lao PDR License NDTMFI-2023-001',
    icon: Shield,
  },
  {
    title: 'Anti-Money Laundering',
    status: 'Compliant',
    description: 'AML/CFT Standards Compliant',
    icon: FileText,
  },
  {
    title: 'Data Protection',
    status: 'Compliant',
    description: 'Customer data protection policies in place',
    icon: Shield,
  },
  {
    title: 'Financial Reporting',
    status: 'Compliant',
    description: 'Quarterly audited reports submitted',
    icon: FileText,
  },
];

const documents = [
  { name: 'License Certificate', date: '2024-01-15', size: '2.4 MB' },
  { name: 'Annual Report 2024', date: '2024-11-20', size: '5.8 MB' },
  { name: 'Transparency Report Q4', date: '2024-11-01', size: '1.2 MB' },
  { name: 'Risk Disclosure', date: '2024-10-15', size: '0.8 MB' },
];

export default function CompliancePage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationsStats();
  }, []);

  const fetchApplicationsStats = async () => {
    try {
      const response = await fetch('/api/applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Compliance Management</h1>

      {/* Compliance Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <Icon className="w-6 h-6 text-blue-600" />
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-600 mb-3">{item.description}</p>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                {item.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Compliance Documents */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Compliance Documents</h2>
        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-bold text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-600">{doc.date} • {doc.size}</p>
                </div>
              </div>
              <button className="p-2 text-blue-600 hover:bg-white rounded transition">
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Application Statistics */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-900">Compliance Status</p>
            <p className="text-sm text-blue-700 mt-1">
              All compliance requirements are being met. Total applications in system: {applications.length}. Next audit scheduled for Q1 2025.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}