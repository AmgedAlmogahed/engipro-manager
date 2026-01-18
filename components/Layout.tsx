import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Users,
  FileText,
  Bell,
  Search,
  Plus,
  Globe,
  CheckSquare,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

export const Layout: React.FC = () => {
  const { language, toggleLanguage, direction } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir={direction}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative inset-y-0 ${direction === 'rtl' ? 'right-0' : 'left-0'} z-50
          w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 
          transition-transform duration-300 ease-in-out border-e border-slate-800
          ${sidebarOpen ? 'translate-x-0' : (direction === 'rtl' ? 'translate-x-full' : '-translate-x-full')}
          md:translate-x-0
          ${!sidebarOpen ? 'md:w-0 md:overflow-hidden md:border-0' : 'md:w-64'}
        `}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">EngiPro</span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={closeSidebar}
            className="md:hidden p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label={language === 'ar' ? 'لوحة التحكم' : 'Dashboard'} onClick={closeSidebar} />
          <NavItem to="/my-tasks" icon={<CheckSquare size={20} />} label={language === 'ar' ? 'مهامي' : 'My Tasks'} onClick={closeSidebar} />
          <NavItem to="/projects" icon={<FolderKanban size={20} />} label={language === 'ar' ? 'المشاريع' : 'Projects'} onClick={closeSidebar} />
          <NavItem to="/authority" icon={<FileText size={20} />} label={language === 'ar' ? 'التراخيص' : 'Authority Tracking'} onClick={closeSidebar} />
          <NavItem to="/team" icon={<Users size={20} />} label={language === 'ar' ? 'الفريق والموارد' : 'Team & Resources'} onClick={closeSidebar} />
          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Admin</p>
            <NavItem to="/roles" icon={<ShieldCheck size={20} />} label={language === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions'} onClick={closeSidebar} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src={CURRENT_USER.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-600" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{CURRENT_USER.name}</p>
              <p className="text-xs text-slate-400 truncate">{CURRENT_USER.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarOpen ? (language === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (language === 'ar' ? 'فتح القائمة' : 'Open menu')}
            >
              <Menu size={22} />
            </button>

            <div className="relative flex-1 text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pr-3 pointer-events-none">
                <Search size={18} />
              </div>
              <input
                name="search"
                id="search"
                className="block w-full h-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm text-start bg-gray-50 rounded-md"
                placeholder={language === 'ar' ? "بحث..." : "Search..."}
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full flex items-center"
              title="Switch Language"
            >
              <Globe size={20} />
              <span className="text-xs font-bold ms-1 uppercase">{language}</span>
            </button>

            <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
              <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              <Bell size={20} />
            </button>
            <NavLink to="/projects/new" className="hidden sm:flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
              {language === 'ar' ? 'مشروع جديد' : 'New Project'}
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <span className="mr-3 rtl:ml-3 rtl:mr-0">{icon}</span>
      {label}
    </NavLink>
  );
};