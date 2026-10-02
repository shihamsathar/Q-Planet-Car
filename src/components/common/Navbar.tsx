import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  UserCircle, 
  LogOut, 
  Code2, 
  ChevronDown, 
  Check, 
  LayoutDashboard,
  Wrench,
  FileText,
  Send,
  Camera,
  ClipboardList,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  Receipt,
  Car
} from 'lucide-react';
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
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus when tapping outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsPersonaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const getNavLinks = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'floor', label: 'Floor Grid', icon: Wrench },
        { id: 'jobs', label: 'Job Cards', icon: FileText },
        { id: 'completed', label: 'Completed', icon: Send },
        { id: 'branches', label: 'Branches', icon: Building2 },
      ];
    }
    if (currentUser.role === 'TECHNICIAN') {
      return [
        { id: 'queue', label: 'Assigned', icon: ClipboardList },
        { id: 'intake', label: 'Inspection', icon: Camera },
        { id: 'completion', label: 'Complete', icon: CheckCircle2 },
      ];
    }
    // CUSTOMER
    return [
      { id: 'status', label: 'Status', icon: Clock },
      { id: 'comparison', label: 'Before/After', icon: Sparkles },
      { id: 'blueprint', label: 'Damage Map', icon: ShieldAlert },
      { id: 'invoice', label: 'Tax Invoice', icon: Receipt },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (navLinks.length > 0) setActiveTab(navLinks[0].id);
              }}
              className="text-base sm:text-lg font-extrabold tracking-tight text-slate-950 flex items-center gap-1.5 py-1"
            >
              <span>Q Planet</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block mb-1" />
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-0.5">
                Auto Care
              </span>
            </a>
          </div>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[36px] flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/90'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0" ref={menuRef}>
            
            {/* Architecture Specs & API Button */}
            <button
              type="button"
              onClick={onOpenArchitectureDocs}
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors min-h-[38px] cursor-pointer"
              title="Inspect Database Schema and REST API"
            >
              <Code2 className="w-4 h-4 text-blue-600" />
              <span className="hidden xl:inline">System Specs</span>
            </button>

            {/* Desktop Branch Switcher (for Admin) */}
            {currentUser && currentUser.role === 'ADMIN' && (
              <div className="relative hidden lg:block">
                <select
                  value={currentBranchId}
                  onChange={(e) => setCurrentBranchId(e.target.value)}
                  className="h-9 pl-2.5 pr-7 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="ALL">All Branches (Global)</option>
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

            {/* Persona Switcher Button (Click/Tap Toggled for Mobile) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs transition-colors min-h-[38px] cursor-pointer"
                aria-expanded={isPersonaMenuOpen}
                aria-label="Switch Role Menu"
              >
                <UserCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {currentUser ? currentUser.name : 'Switch Role'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                  {currentUser?.role || 'Guest'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPersonaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Tap/Click Persona Dropdown (Touch-First on Mobile & Desktop) */}
              {isPersonaMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-16px)] sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-2 border-b border-slate-100 mb-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Signed In As</p>
                    <p className="font-extrabold text-slate-900 text-sm truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Qatar ID: {currentUser?.qid || 'N/A'} · {currentUser?.role}
                    </p>
                  </div>

                  {/* Mobile Branch Selector for Admins */}
                  {currentUser?.role === 'ADMIN' && (
                    <div className="px-2 pb-2 mb-2 border-b border-slate-100 lg:hidden">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Active Branch Filter:
                      </label>
                      <select
                        value={currentBranchId}
                        onChange={(e) => setCurrentBranchId(e.target.value)}
                        className="w-full h-9 px-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      >
                        <option value="ALL">All Branches (Global)</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <p className="px-2 pt-1 pb-1 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Switch Test Persona:
                  </p>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        switchPersona('ADMIN');
                        setIsPersonaMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 active:bg-blue-50 transition-colors min-h-[44px] cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">1. Super Admin (MD)</span>
                        <span className="text-[11px] text-slate-500">Nasser Al-Kuwari · admin@qplanet.qa</span>
                      </div>
                      {currentUser?.role === 'ADMIN' && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        switchPersona('TECHNICIAN');
                        setIsPersonaMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 active:bg-blue-50 transition-colors min-h-[44px] cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">2. Floor Master Tech</span>
                        <span className="text-[11px] text-slate-500">Fahad Al-Marri · tech.fahad</span>
                      </div>
                      {currentUser?.role === 'TECHNICIAN' && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        switchPersona('CUSTOMER');
                        setIsPersonaMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 active:bg-blue-50 transition-colors min-h-[44px] cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">3. Customer (Client Portal)</span>
                        <span className="text-[11px] text-slate-500">Khalid Al-Sulaiti · QID: 29463401234</span>
                      </div>
                      {currentUser?.role === 'CUSTOMER' && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPersonaMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 p-2 text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-xl text-left font-bold min-h-[44px] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out to Login Portal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct 1-Tap Logout on Mobile */}
            <button
              type="button"
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 active:bg-rose-50 rounded-lg min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors cursor-pointer"
              title="Log Out to Universal Login Portal"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Mobile Horizontal Sub-Tab Scroller */}
        <div className="md:hidden flex items-center overflow-x-auto px-3 py-1.5 border-t border-slate-100 gap-1.5 bg-slate-50/90 scrollbar-none">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[36px] cursor-pointer ${
                  isActive
                    ? 'text-blue-600 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <link.icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Fixed Mobile Bottom Navigation Bar */}
      {currentUser && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
          <div className="grid grid-flow-col auto-cols-fr items-center h-14">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => setActiveTab(link.id)}
                  className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[48px] rounded-lg cursor-pointer ${
                    isActive
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-500 hover:text-slate-900 active:scale-95'
                  }`}
                >
                  <link.icon className={`w-5 h-5 ${isActive ? 'text-blue-600 stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'}`} />
                  <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[68px]">
                    {link.label}
                  </span>
                  {isActive && <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
