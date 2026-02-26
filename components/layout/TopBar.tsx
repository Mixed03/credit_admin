'use client';

import { Bell, Search, User, ChevronDown, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TopBar() {
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('admin_user');
    if (user) {
      setAdminUser(JSON.parse(user));
    }
  }, []);

  return (
    <div className="hidden md:block sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-8 py-4.5 z-30">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" /> */}
            <input
              type="text"
              placeholder="Search applications, products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-6 ml-8">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-white">{adminUser?.email.split('@')[0]}</p>
                <p className="text-xs text-gray-400">{adminUser?.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-50">
                <div className="px-4 py-3 border-b border-gray-600">
                  <p className="text-sm font-semibold text-white">{adminUser?.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{adminUser?.role}</p>
                </div>
                <button className="w-full text-left px-4 py-2.5 hover:bg-gray-600 text-gray-300 text-sm font-medium border-b border-gray-600 transition">
                  My Profile
                </button>
                <button className="w-full text-left px-4 py-2.5 hover:bg-gray-600 text-gray-300 text-sm font-medium border-b border-gray-600 transition">
                  Settings
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('auth_token');
                    window.location.href = '/login';
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-900 text-red-400 text-sm font-medium flex items-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}