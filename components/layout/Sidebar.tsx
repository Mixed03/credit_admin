'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Package,
  MapPin,
  Briefcase,
  Users,
  HelpCircle,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Applications',
      href: '/dashboard/loan-applications',
      // badge: 12,
    },
    {
      icon: <Info className="w-5 h-5" />,
      label: 'About Us',
      href: '/dashboard/about',
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Loan Products',
      href: '/dashboard/loan-products',
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'FAQ Management',
      href: '/dashboard/faq',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Branches',
      href: '/dashboard/branches',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Compliance',
      href: '/dashboard/compliance',
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: 'Job Postings',
      href: '/dashboard/jobs',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Staff Users',
      href: '/dashboard/users',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Reports',
      href: '/dashboard/reports',
    },
  ];

  const isActive = (href: string) => pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-700">
        <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm">NDTMFI</p>
            <p className="text-xs text-gray-400">Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Main Menu</p>
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition duration-200 group ${isActive(item.href)
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}>
                {item.icon}
              </div>
              <span className={`font-medium ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Settings & Logout */}
      <div className="px-3 py-6 border-t border-gray-700 space-y-2">
        <Link
          href="/dashboard/settings"
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 group ${isActive('/dashboard/settings')
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
              : 'text-gray-300 hover:bg-gray-700'
            }`}
        >
          <Settings className={`w-5 h-5 ${isActive('/dashboard/settings') ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`} />
          <span className={`font-medium ${isActive('/dashboard/settings') ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>Settings</span>
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-950 transition duration-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed left-0 top-0 h-screen border-r border-gray-700 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header with Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-4 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-white">NDTMFI</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-700 rounded-lg transition"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30 top-16">
          <div className="absolute left-0 top-16 w-64 bg-gradient-to-b from-gray-900 to-gray-800 h-[calc(100vh-64px)] border-r border-gray-700 flex flex-col z-40">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}