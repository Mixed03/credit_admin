// app/dashboard/jobs/[id]/edit/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Calendar } from 'lucide-react';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    level: 'Entry Level',
    location: '',
    department: 'General',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    salary: '',
    employmentType: 'Full-time',
    openings: '1',
    status: 'Open',
    deadline: '',
    contactEmail: 'hr@company.com',
    contactPhone: '',
  });

  useEffect(() => {
    loadJobData();
  }, [params.id]);

  const loadJobData = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job');
      }
      
      const job = await response.json();
      
      if (job) {
        // Map database fields to form fields
        setFormData({
          role: job.title || '',
          level: job.experienceLevel || 'Entry Level',
          location: job.location || '',
          department: job.department || 'General',
          description: job.description || '',
          requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements || '',
          responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : job.responsibilities || '',
          benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits || '',
          salary: job.salaryMin && job.salaryMax 
            ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.salaryCurrency}`
            : '',
          employmentType: job.type || 'Full-time',
          openings: (job.openings || 1).toString(),
          status: job.status === 'Active' ? 'Open' : job.status || 'Open',
          deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
          contactEmail: job.contactEmail || 'hr@company.com',
          contactPhone: job.contactPhone || '',
        });
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
    
    // Validate deadline is in the future
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        alert('Application deadline must be in the future');
        return;
      }
    }
    
    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Parse salary range if provided
      let salaryMin, salaryMax;
      if (formData.salary) {
        const salaryMatch = formData.salary.match(/(\d[\d,]*)\s*-\s*(\d[\d,]*)/);
        if (salaryMatch) {
          salaryMin = parseInt(salaryMatch[1].replace(/,/g, ''));
          salaryMax = parseInt(salaryMatch[2].replace(/,/g, ''));
        }
      }

      // Map form fields to database fields
      const updateData = {
        title: formData.role,
        department: formData.department,
        experienceLevel: formData.level,
        location: formData.location,
        description: formData.description,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
        benefits: formData.benefits.split('\n').filter(b => b.trim()),
        salaryMin,
        salaryMax,
        salaryCurrency: 'LAK',
        type: formData.employmentType,
        openings: parseInt(formData.openings) || 1,
        status: formData.status === 'Open' ? 'Active' : formData.status === 'Closed' ? 'Closed' : 'Inactive',
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
      };
      
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update job');
      }
      
      alert('Job posting updated successfully!');
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job posting');
    } finally {
      setSaving(false);
    }
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = () => {
    if (!formData.deadline) return null;
    const deadline = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDeadline = getDaysUntilDeadline();

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

      {/* Deadline Warning Banner */}
      {daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900">Application Deadline Approaching</h3>
            <p className="text-sm text-amber-700 mt-1">
              Only {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} left for candidates to apply. 
              Consider extending the deadline if you need more applicants.
            </p>
          </div>
        </div>
      )}

      {daysUntilDeadline !== null && daysUntilDeadline <= 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900">Application Deadline Passed</h3>
            <p className="text-sm text-red-700 mt-1">
              The deadline for this position has passed. Update the deadline or close the posting.
            </p>
          </div>
        </div>
      )}

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
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Executive">Executive</option>
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

          {/* Department */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Department *
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="e.g., Finance, Operations, IT"
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
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
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

          {/* Number of Openings */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Number of Openings *
            </label>
            <input
              type="number"
              name="openings"
              value={formData.openings}
              onChange={handleChange}
              min="1"
              max="99"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">How many positions are available</p>
          </div>

          {/* Application Deadline */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Application Deadline *
              </span>
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Setting a deadline creates urgency and encourages candidates to apply promptly
            </p>
            {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
              <p className="text-xs text-blue-600 mt-1 font-medium">
                📅 {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} remaining for applications
              </p>
            )}
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

          {/* Benefits */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Benefits & Perks
            </label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="List benefits (one per line)&#10;e.g., Health insurance&#10;Competitive salary&#10;Annual bonus"
            />
            <p className="text-xs text-gray-500 mt-1">Enter each benefit on a new line</p>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="e.g., hr@company.com"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="text"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 020 5512 3456"
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