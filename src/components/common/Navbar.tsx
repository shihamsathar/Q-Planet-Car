import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, UserCircle, LogOut, Code2, ChevronDown, Check } from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenArchitectureDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenArchitectureDocs,
}) => {
  const { currentUser, currentBranchId, setCurrentBranchId, branches, switchPersona, logout } = useApp();

  const getNavLinks = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') {
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'floor', label: 'Workshop Floor' },
        { id: 'jobs', label: 'Job Cards' },
        { id: 'completed', label: 'Completed Queue' },
        { id: 'branches', label: 'Branches & Users' },
      ];
    }
    if (currentUser.role === 'TECHNICIAN') {
      return [
        { id: 'queue', label: 'Assigned Jobs' },
        { id: 'intake', label: 'Intake Inspection' },
        { id: 'history', label: 'Completed Jobs' },
      ];
    }
    // CUSTOMER
    return [
      { id: 'status', label: 'Vehicle Status' },
      { id: 'inspection', label: 'Damage Blueprint' },
      { id: 'gallery', label: 'Before & After' },
      { id: 'invoice', label: 'Tax Invoice' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (navLinks.length > 0) setActiveTab(navLinks[0].id);
            }}
            className="text-lg font-extrabold tracking-tight text-slate-950 flex items-center gap-1.5"
          >
            <span>Q Planet</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block mb-1" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">
              Auto Care
            </span>
          </a>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions & controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Architecture Specs & API Button */}
          <button
            type="button"
            onClick={onOpenArchitectureDocs}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
            title="Inspect Database Schema, REST API endpoints, and Technical Architecture"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden lg:inline">System Architecture</span>
          </button>

          {/* Branch Switcher (for Admin/Tech) */}
          {currentUser && currentUser.role === 'ADMIN' && (
            <div className="relative hidden sm:block">
              <select
                value={currentBranchId}
                onChange={(e) => setCurrentBranchId(e.target.value)}
                className="h-8 pl-2.5 pr-7 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="ALL">All Branches (Qatar Global)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          )}

          {/* Persona Quick-Switch dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs transition-colors"
            >
              <UserCircle className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline max-w-[110px] truncate">
                {currentUser ? currentUser.name : 'Switch Role'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                {currentUser?.role || 'Guest'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            <div className="hidden group-hover:block absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Active Persona</p>
                <p className="font-bold text-slate-900 truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">QID: {currentUser?.qid || 'N/A'}</p>
              </div>

              <p className="px-2 pt-1 pb-0.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Switch Test Role
              </p>

              <button
                type="button"
                onClick={() => switchPersona('ADMIN')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-50 text-slate-700"
              >
                <div>
                  <span className="font-semibold block">Super Admin</span>
                  <span className="text-[10px] text-slate-400">Nasser Al-Kuwari (MD)</span>
                </div>
                {currentUser?.role === 'ADMIN' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => switchPersona('TECHNICIAN')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-50 text-slate-700"
              >
                <div>
                  <span className="font-semibold block">Floor Master Technician</span>
                  <span className="text-[10px] text-slate-400">Fahad Al-Marri</span>
                </div>
                {currentUser?.role === 'TECHNICIAN' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => switchPersona('CUSTOMER')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-50 text-slate-700"
              >
                <div>
                  <span className="font-semibold block">Customer (Porsche Owner)</span>
                  <span className="text-[10px] text-slate-400">Khalid Al-Sulaiti (QID: 29463401234)</span>
                </div>
                {currentUser?.role === 'CUSTOMER' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>

              <div className="mt-1 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out / Universal Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1 bg-slate-50/50">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => setActiveTab(link.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-blue-600 bg-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
