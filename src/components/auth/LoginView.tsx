import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ArrowRight, Lock, User, Sparkles, Check, KeyRound, Eye, EyeOff, Zap, Car, Wrench, ShieldAlert } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginViewProps {
  onSuccess?: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login } = useApp();
  const [credential, setCredential] = useState('admin@qplanet.qa');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('ADMIN');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const rolePresets = [
    {
      role: 'ADMIN' as UserRole,
      label: 'Super Admin',
      sublabel: 'Enterprise MD',
      icon: ShieldAlert,
      cred: 'admin@qplanet.qa',
      pwd: 'admin123',
      name: 'Nasser Al-Kuwari',
      hint: 'admin@qplanet.qa (All Qatar Branches)',
    },
    {
      role: 'TECHNICIAN' as UserRole,
      label: 'Floor Tech',
      sublabel: 'Master Detailing',
      icon: Wrench,
      cred: 'tech.fahad',
      pwd: 'tech123',
      name: 'Fahad Al-Marri',
      hint: 'tech.fahad (Bay #04 Workshop Floor)',
    },
    {
      role: 'CUSTOMER' as UserRole,
      label: 'Customer',
      sublabel: 'Client Portal',
      icon: Car,
      cred: '29463401234',
      pwd: 'QP#911Doha26',
      name: 'Khalid Al-Sulaiti',
      hint: 'Qatar ID: 29463401234 (WhatsApp Link)',
    },
  ];

  const handleRoleTabClick = (preset: typeof rolePresets[0]) => {
    setActiveRoleTab(preset.role);
    setCredential(preset.cred);
    setPassword(preset.pwd);
    setError('');
  };

  const executeLogin = (credToUse: string, pwdToUse: string, expectedRole?: UserRole) => {
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(credToUse, pwdToUse);
      setIsLoading(false);
      if (!res.success) {
        setError(res.message || 'Login failed. Please verify credentials.');
      } else {
        if (onSuccess) onSuccess(res.role || expectedRole || 'ADMIN');
      }
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim()) {
      setError('Please enter your Qatar ID (QID), Technician Username, or Admin Email');
      return;
    }
    executeLogin(credential, password, activeRoleTab);
  };

  const handleDirectOneTapLogin = (preset: typeof rolePresets[0]) => {
    setActiveRoleTab(preset.role);
    setCredential(preset.cred);
    setPassword(preset.pwd);
    executeLogin(preset.cred, preset.pwd, preset.role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="w-full max-w-md mx-auto text-center px-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Q Planet Car Care
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          State of Qatar · Multi-Branch Auto Detailing &amp; Workshop SaaS
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-5 sm:mt-6 w-full max-w-md mx-auto">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-8 border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50">
          
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Universal Sign-In</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">
                RBAC Security
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your credentials or use 1-tap instant mobile access below.
            </p>
          </div>

          {/* 1-Tap Fast Mobile Access Bar */}
          <div className="mb-5 bg-blue-50/70 border border-blue-100 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                1-Tap Instant Mobile Demo:
              </span>
              <span className="text-[10px] text-blue-600 font-medium">Auto routes</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5">
              {rolePresets.map((preset) => {
                const isSelected = activeRoleTab === preset.role;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handleDirectOneTapLogin(preset)}
                    className={`py-2 px-1.5 text-center rounded-lg transition-all min-h-[46px] flex flex-col items-center justify-center border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <preset.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                      <span className="text-xs font-bold leading-tight">{preset.label}</span>
                    </div>
                    <span className={`text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {preset.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Credential Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qatar ID (QID), Username, or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="e.g. 29463401234 or admin@qplanet.qa"
                  className="w-full h-12 pl-10 pr-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Customers: 11-digit QID</span>
                <span>Techs: tech.username</span>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password / Passkey
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Encrypted
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-12 pl-10 pr-10 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 min-w-[36px] justify-center cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/30 disabled:opacity-70 cursor-pointer min-h-[48px]"
            >
              {isLoading ? (
                <span>Authenticating with Qatar Security Service...</span>
              ) : (
                <>
                  <span>Sign In as {activeRoleTab}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Active Hint */}
          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
            <span className="truncate">Active: <strong className="text-slate-900">{credential}</strong></span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">
              Verified
            </span>
          </div>

          {/* Security badge */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Ministry of Commerce &amp; Industry (State of Qatar) · CR 104928</span>
          </div>

        </div>
      </div>
    </div>
  );
};
