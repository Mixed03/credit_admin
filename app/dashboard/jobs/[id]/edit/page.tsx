// app/dashboard/jobs/[id]/edit/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

// Mock data for demonstration
const mockJobs: any = {
  '1': { id: 1, role: 'Loan Officer', level: 'Mid-Level', location: 'Vientiane', description: 'Process and evaluate loan applications from potential borrowers. Conduct financial analysis and risk assessment.', requirements: 'Bachelor degree in Finance or related field. 2+ years experience in banking or microfinance. Strong analytical skills.', responsibilities: 'Review loan applications. Conduct client interviews. Perform credit analysis. Prepare loan documentation. Monitor loan portfolio.', salary: '5,000,000 - 8,000,000 LAK', employmentType: 'Full-Time', status: 'Open' },
  '2': { id: 2, role: 'Field Officer', level: 'Entry-Level', location: 'Multiple', description: 'Conduct field visits to assess client businesses and ensure loan compliance.', requirements: 'High school diploma or equivalent. Good communication skills. Motorcycle license required.', responsibilities: 'Visit client locations. Document business operations. Collect repayments. Report to loan officers.', salary: '4,000,000 - 6,000,000 LAK', employmentType: 'Full-Time', status: 'Open' },
  '3': { id: 3, role: 'Finance Analyst', level: 'Mid-Level', location: 'Vientiane', description: 'Analyze financial data and prepare reports for management decision making.', requirements: 'Bachelor degree in Finance or Accounting. Strong Excel skills. 3+ years experience.', responsibilities: 'Financial data analysis. Report preparation. Budget monitoring. Risk assessment.', salary: '6,000,000 - 10,000,000 LAK', employmentType: 'Full-Time', status: 'Closed' },
};

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    level: 'Entry-Level',
    location: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salary: '',
    employmentType: 'Full-Time',
    status: 'Open',
  });

  useEffect(() => {
    loadJobData();
  }, [params.id]);

  const loadJobData = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const job = mockJobs[params.id as string];
      if (job) {
        setFormData({
          role: job.role || '',
          level: job.level || 'Entry-Level',
          location: job.location || '',
          description: job.description || '',
          requirements: job.requirements || '',
          responsibilities: job.responsibilities || '',
          salary: job.salary || '',
          employmentType: job.employmentType || 'Full-Time',
          status: job.status || 'Open',
        });
      } else {
        alert('Job not found');
        router.push('/dashboard/jobs');
      }
    } catch (error) {
      console.error('Error loading job:', error);
      alert('Failed to load job data');
      router.push('/dashboard/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Job posting updated successfully!');
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job posting');
    } finally {
      setSaving(false);
    }
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading job data...</p>
        </div>
      </div>
    );
  }

  // Only render form after data is loaded
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Job Posting</h1>
          <p className="text-gray-600 mt-1">Update job posting details</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Job Title / Role *
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Experience Level *
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Entry-Level">Entry-Level</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Management">Management</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Employment Type *
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Salary Range
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 5,000,000 - 8,000,000 LAK"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Responsibilities */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Key Responsibilities *
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Requirements */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Requirements & Qualifications *
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={4}
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
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
            </select>
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
            disabled={saving}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}