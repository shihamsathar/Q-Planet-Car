import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { LoginView } from './components/auth/LoginView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { ArchitectureDocsModal } from './components/docs/ArchitectureDocsModal';
import { UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Automatically sync tab when user role changes or logs in
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'ADMIN') {
      setActiveTab('overview');
    } else if (currentUser.role === 'TECHNICIAN') {
      setActiveTab('queue');
    } else if (currentUser.role === 'CUSTOMER') {
      setActiveTab('status');
    }
  }, [currentUser?.role, currentUser?.id]);

  const handleLoginSuccess = (role: UserRole) => {
    if (role === 'ADMIN') setActiveTab('overview');
    else if (role === 'TECHNICIAN') setActiveTab('queue');
    else if (role === 'CUSTOMER') setActiveTab('status');
  };

  // If not logged in, display mobile-friendly universal login portal
  if (!currentUser) {
    return (
      <>
        <LoginView onSuccess={handleLoginSuccess} />
        <ArchitectureDocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* 3-Zone Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenArchitectureDocs={() => setIsDocsOpen(true)}
      />

      {/* Main View Area with Mobile Bottom Nav Clearance */}
      <main className="flex-1 pb-24 md:pb-8">
        {currentUser.role === 'ADMIN' && (
          <AdminDashboard activeSubTab={activeTab} />
        )}
        {currentUser.role === 'TECHNICIAN' && (
          <TechnicianDashboard activeSubTab={activeTab} />
        )}
        {currentUser.role === 'CUSTOMER' && (
          <CustomerPortal activeSubTab={activeTab} />
        )}
      </main>

      {/* Clean Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 mt-12 mb-16 md:mb-0 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-900 tracking-tight">Q PLANET</span>
            <span className="text-slate-300">·</span>
            <span>Car Care &amp; Auto Detailing SaaS</span>
            <span className="text-slate-300">·</span>
            <span>State of Qatar</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsDocsOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
            >
              Database Schema &amp; REST APIs
            </button>
            <span className="text-slate-300">·</span>
            <span>CR: 104928/01</span>
            <span className="text-slate-300">·</span>
            <span>ISO 9001:2015 Detailing Certified</span>
          </div>
        </div>
      </footer>

      {/* Technical Architecture & Database Schema Modal */}
      <ArchitectureDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
