import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ArrowRight, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login } = useApp();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credential.trim()) {
      setError('Please enter your Qatar ID (QID), Technician Username, or Admin Email');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(credential, password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.message || 'Login failed. Please verify credentials.');
      } else {
        if (onSuccess) onSuccess();
      }
    }, 250);
  };

  const handleQuickFill = (cred: string, pwd: string) => {
    setCredential(cred);
    setPassword(pwd);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Q Planet Car Care
        </h1>
        <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
          Qatar Enterprise Auto Detailing, Ceramic Coating &amp; Fleet Management Platform
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/40">
          
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Universal Single Sign-On Portal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The system dynamically determines your access level based on your Qatar ID or enterprise credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qatar ID (QID), Username, or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="e.g. 29463401234 or admin@qplanet.qa"
                  className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Customers: Enter the 11-digit Qatar ID (QID) sent to your WhatsApp
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password / Access Token
                </label>
                <span className="text-[11px] text-slate-400">
                  Sent via WhatsApp for customers
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/30 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating with Qatar Security Service...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Personas Selector */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Explore Demonstration Profiles:
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@qplanet.qa', 'admin123')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/70 rounded-lg text-left text-xs transition-colors group"
              >
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-blue-700">
                    1. Super Admin (Enterprise MD)
                  </span>
                  <p className="text-[11px] text-slate-500">Nasser Al-Kuwari · admin@qplanet.qa</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Fill Admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('tech.fahad', 'tech123')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/70 rounded-lg text-left text-xs transition-colors group"
              >
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-blue-700">
                    2. Floor Master Technician (Floor UI)
                  </span>
                  <p className="text-[11px] text-slate-500">Fahad Al-Marri · tech.fahad</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Fill Tech
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('29463401234', 'QP#911Doha26')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/70 rounded-lg text-left text-xs transition-colors group"
              >
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-blue-700">
                    3. Vehicle Owner (Customer Portal)
                  </span>
                  <p className="text-[11px] text-slate-500">Khalid Al-Sulaiti · QID: 29463401234</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Fill Client
                </span>
              </button>
            </div>
          </div>

          {/* Security note */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Encrypted · ISO 27001 Certified Auto Detailing</span>
          </div>

        </div>
      </div>
    </div>
  );
};
