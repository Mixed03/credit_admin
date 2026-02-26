// app/dashboard/about/page.tsx (MERGED)
'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, User } from 'lucide-react';
import Image from 'next/image';

interface AboutSection {
  _id: string;
  section: string;
  title: string;
  content: string;
  order: number;
  status: string;
}

interface LeadershipMember {
  _id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  imageUrl: string;
  imagePublicId: string;
  order: number;
  status: string;
}

export default function AboutManagementPage() {
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingLeader, setEditingLeader] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddLeader, setShowAddLeader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [sectionForm, setSectionForm] = useState({
    section: 'story',
    title: '',
    content: '',
    order: 0,
  });

  const [leaderForm, setLeaderForm] = useState({
    name: '',
    role: '',
    department: '',
    bio: '',
    imageUrl: '',
    imagePublicId: '',
    order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch about sections
      const aboutRes = await fetch('/api/about');
      const aboutData = await aboutRes.json();
      setAboutSections(Array.isArray(aboutData) ? aboutData : []);

      // Fetch leadership
      const leaderRes = await fetch('/api/leadership');
      const leaderData = await leaderRes.json();
      setLeadership(Array.isArray(leaderData) ? leaderData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      setLeaderForm({
        ...leaderForm,
        imageUrl: data.url,
        imagePublicId: data.publicId,
      });

      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // About Section Handlers
  const handleSaveSection = async () => {
    try {
      if (!sectionForm.title || !sectionForm.content) {
        alert('Please fill in all required fields');
        return;
      }

      const method = editingSection ? 'PUT' : 'POST';
      const url = editingSection ? `/api/about/${editingSection}` : '/api/about';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionForm),
      });

      if (response.ok) {
        alert('Section saved successfully!');
        setShowAddSection(false);
        setEditingSection(null);
        setSectionForm({ section: 'story', title: '', content: '', order: 0 });
        fetchData();
      }
    } catch (error) {
      alert('Failed to save section');
    }
  };

  const handleEditSection = (section: AboutSection) => {
    setEditingSection(section._id);
    setSectionForm({
      section: section.section,
      title: section.title,
      content: section.content,
      order: section.order,
    });
    setShowAddSection(true);
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const response = await fetch(`/api/about/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Section deleted successfully!');
        fetchData();
      }
    } catch (error) {
      alert('Failed to delete section');
    }
  };

  // Leadership Handlers
  const handleSaveLeader = async () => {
    try {
      if (!leaderForm.name || !leaderForm.role || !leaderForm.department) {
        alert('Please fill in all required fields');
        return;
      }

      const method = editingLeader ? 'PUT' : 'POST';
      const url = editingLeader ? `/api/leadership/${editingLeader}` : '/api/leadership';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaderForm),
      });

      if (response.ok) {
        alert('Leader saved successfully!');
        setShowAddLeader(false);
        setEditingLeader(null);
        setLeaderForm({ 
          name: '', 
          role: '', 
          department: '', 
          bio: '', 
          imageUrl: '',
          imagePublicId: '',
          order: 0 
        });
        setImagePreview('');
        fetchData();
      }
    } catch (error) {
      alert('Failed to save leader');
    }
  };

  const handleEditLeader = (leader: LeadershipMember) => {
    setEditingLeader(leader._id);
    setLeaderForm({
      name: leader.name,
      role: leader.role,
      department: leader.department,
      bio: leader.bio,
      imageUrl: leader.imageUrl || '',
      imagePublicId: leader.imagePublicId || '',
      order: leader.order,
    });
    setImagePreview(leader.imageUrl || '');
    setShowAddLeader(true);
  };

  const handleDeleteLeader = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member? The profile image will also be deleted.')) return;

    try {
      const response = await fetch(`/api/leadership/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Member deleted successfully!');
        fetchData();
      }
    } catch (error) {
      alert('Failed to delete member');
    }
  };

  const handleCancelEdit = () => {
    setShowAddLeader(false);
    setEditingLeader(null);
    setLeaderForm({ 
      name: '', 
      role: '', 
      department: '', 
      bio: '', 
      imageUrl: '',
      imagePublicId: '',
      order: 0 
    });
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">About Us Management</h1>
        <p className="text-gray-600 mt-1">Manage company information and leadership team</p>
      </div>

      {/* About Sections */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">About Sections</h2>
          <button
            onClick={() => {
              setShowAddSection(true);
              setEditingSection(null);
              setSectionForm({ section: 'story', title: '', content: '', order: 0 });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Section
          </button>
        </div>

        {/* Add/Edit Section Form */}
        {showAddSection && (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </h3>
              <button
                onClick={() => {
                  setShowAddSection(false);
                  setEditingSection(null);
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Section Type</label>
                <select
                  value={sectionForm.section}
                  onChange={(e) => setSectionForm({ ...sectionForm, section: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="story">Our Story</option>
                  <option value="vision">Vision</option>
                  <option value="mission">Mission</option>
                  <option value="values">Core Values</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Title</label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Section title"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Content</label>
                <textarea
                  value={sectionForm.content}
                  onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder="Section content"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Display Order</label>
                <input
                  type="number"
                  value={sectionForm.order}
                  onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSaveSection}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> Save Section
              </button>
            </div>
          </div>
        )}

        {/* Sections List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aboutSections.map((section) => (
            <div key={section._id} className="bg-white border border-gray-300 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {section.section.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-lg mt-2">{section.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSection(section)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 text-sm line-clamp-3">{section.content}</p>
              <p className="text-xs text-gray-500 mt-2">Order: {section.order}</p>
            </div>
          ))}
        </div>

        {aboutSections.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No about sections yet</p>
            <button
              onClick={() => setShowAddSection(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
            >
              Add First Section
            </button>
          </div>
        )}
      </section>

      {/* Leadership Team */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Leadership Team</h2>
          <button
            onClick={() => {
              setShowAddLeader(true);
              setEditingLeader(null);
              setLeaderForm({ 
                name: '', 
                role: '', 
                department: '', 
                bio: '', 
                imageUrl: '',
                imagePublicId: '',
                order: 0 
              });
              setImagePreview('');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Member
          </button>
        </div>

        {/* Add/Edit Leader Form */}
        {showAddLeader && (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {editingLeader ? 'Edit Leadership Member' : 'Add New Leadership Member'}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image Upload */}
              <div>
                <label className="block font-bold mb-2">Profile Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imagePreview || leaderForm.imageUrl ? (
                    <div className="space-y-4">
                      <div className="relative w-40 h-40 mx-auto">
                        <Image
                          src={imagePreview || leaderForm.imageUrl}
                          alt="Preview"
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-blue-600 font-bold hover:underline disabled:opacity-50"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                      >
                        <Upload className="w-5 h-5" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG or GIF (Max 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Name *</label>
                  <input
                    type="text"
                    value={leaderForm.name}
                    onChange={(e) => setLeaderForm({ ...leaderForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Role/Position *</label>
                  <input
                    type="text"
                    value={leaderForm.role}
                    onChange={(e) => setLeaderForm({ ...leaderForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Executive Director"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Department *</label>
                  <input
                    type="text"
                    value={leaderForm.department}
                    onChange={(e) => setLeaderForm({ ...leaderForm, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Operations"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Display Order</label>
                  <input
                    type="number"
                    value={leaderForm.order}
                    onChange={(e) => setLeaderForm({ ...leaderForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bio - Full Width */}
            <div className="mt-4">
              <label className="block font-bold mb-2">Biography (Optional)</label>
              <textarea
                value={leaderForm.bio}
                onChange={(e) => setLeaderForm({ ...leaderForm, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Brief biography..."
              />
            </div>

            {/* Save Button */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveLeader}
                disabled={uploading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {uploading ? 'Uploading...' : 'Save Member'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-6 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Leadership Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leadership.map((leader) => (
            <div key={leader._id} className="bg-white border border-gray-300 rounded-lg p-6 text-center hover:shadow-lg transition">
              {/* Profile Image */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                {leader.imageUrl ? (
                  <Image
                    src={leader.imageUrl}
                    alt={leader.name}
                    fill
                    className="object-cover rounded-full border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 className="font-bold text-lg">{leader.name}</h3>
              <p className="text-blue-600 font-semibold text-sm mb-1">{leader.role}</p>
              <p className="text-gray-600 text-sm mb-4">{leader.department}</p>
              
              {leader.bio && (
                <p className="text-gray-700 text-xs mb-4 line-clamp-2">{leader.bio}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-center pt-4 border-t">
                <button
                  onClick={() => handleEditLeader(leader)}
                  className="flex-1 p-2 text-green-600 hover:bg-green-50 rounded flex items-center justify-center gap-1 font-bold"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteLeader(leader._id)}
                  className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded flex items-center justify-center gap-1 font-bold"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>

              {/* Order Badge */}
              <div className="mt-3">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                  Order: {leader.order}
                </span>
              </div>
            </div>
          ))}
        </div>

        {leadership.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No leadership members yet</p>
            <button
              onClick={() => setShowAddLeader(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
            >
              Add First Member
            </button>
          </div>
        )}
      </section>
    </div>
  );
}