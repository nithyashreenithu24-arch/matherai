import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  HeartPulse,
  User as UserIcon,
  Stethoscope,
  Shield,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  UserPlus,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { MOCK_ADMIN_USER, MOCK_DOCTOR_USER, MOCK_PATIENT_USER } from '../data/seedData';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onRegisterUser: (name: string, email: string, role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onRegisterUser }) => {
  const [activeTab, setActiveTab] = useState<UserRole>('patient');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('patient');
  const [error, setError] = useState('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide valid email and password credentials.');
      return;
    }

    // Match seed users or create logged-in user context
    if (activeTab === 'patient') {
      onLoginSuccess({
        ...MOCK_PATIENT_USER,
        email: email || MOCK_PATIENT_USER.email,
      });
    } else if (activeTab === 'doctor') {
      onLoginSuccess({
        ...MOCK_DOCTOR_USER,
        email: email || MOCK_DOCTOR_USER.email,
      });
    } else {
      onLoginSuccess({
        ...MOCK_ADMIN_USER,
        email: email || MOCK_ADMIN_USER.email,
      });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide full name and email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    onRegisterUser(name, email, regRole);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow-sm">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">MaternalHealth.AI Portal</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
              SECURE SSO
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {isRegisterMode ? 'Create Your Account' : 'Clinical Portal Access'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Select your specialized role portal to authenticate and access GDM risk analytics, doctor decisions, or administrative controls.
          </p>
        </div>

        {/* Portal Role Selector Tabs (Only when in Login Mode) */}
        {!isRegisterMode && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto p-1.5 bg-slate-800/90 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                setActiveTab('patient');
                setEmail('sunita.das@maternalhealth.org');
                setPassword('••••••••');
                setError('');
              }}
              className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'patient'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Patient Login</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('doctor');
                setEmail('dr.sunita.reddy@maternalhealth.org');
                setPassword('••••••••');
                setError('');
              }}
              className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'doctor'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Doctor Portal</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('admin');
                setEmail('admin@maternalhealth.org');
                setPassword('••••••••');
                setError('');
              }}
              className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin Console</span>
            </button>
          </div>
        )}

        {/* Login Box vs Register Box */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md max-w-2xl mx-auto space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {!isRegisterMode ? (
            /* Login Form View */
            <div className="space-y-6">
              {/* Active Role Portal Info Header */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-lg text-white font-bold ${
                    activeTab === 'patient' ? 'bg-emerald-600' :
                    activeTab === 'doctor' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {activeTab === 'patient' && <UserIcon className="h-5 w-5" />}
                    {activeTab === 'doctor' && <Stethoscope className="h-5 w-5" />}
                    {activeTab === 'admin' && <Shield className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white capitalize">
                      {activeTab === 'patient' && 'Maternal Patient Portal Login'}
                      {activeTab === 'doctor' && 'Obstetrician & Clinical Decision Portal'}
                      {activeTab === 'admin' && 'System Administrator & Governance Portal'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeTab === 'patient' && 'Access personal prenatal vitals, GDM risk scores, and AI assistant'}
                      {activeTab === 'doctor' && 'Monitor high-risk patients, review ML scores, approve nutrition plans'}
                      {activeTab === 'admin' && 'Full user registry, ML model telemetry, security audit logs'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {activeTab === 'patient' ? 'Patient Email' : activeTab === 'doctor' ? 'Clinical Email' : 'Admin Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email || (activeTab === 'patient' ? 'sunita.das@maternalhealth.org' : activeTab === 'doctor' ? 'dr.sunita.reddy@maternalhealth.org' : 'admin@maternalhealth.org')}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      value={password || '••••••••'}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className={`flex-1 py-3 px-4 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 ${
                      activeTab === 'patient' ? 'bg-emerald-600 hover:bg-emerald-700' :
                      activeTab === 'doctor' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>Log In to {activeTab.toUpperCase()} Portal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'patient') onLoginSuccess(MOCK_PATIENT_USER);
                      else if (activeTab === 'doctor') onLoginSuccess(MOCK_DOCTOR_USER);
                      else onLoginSuccess(MOCK_ADMIN_USER);
                    }}
                    className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 border border-slate-600"
                  >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>One-Click Demo Login</span>
                  </button>
                </div>
              </form>

              {/* Portal Features Checklist */}
              <div className="pt-4 border-t border-slate-700/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Portal Capabilities:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {activeTab === 'patient' && (
                    <>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /><span>Gestational Diabetes Risk Analytics</span></div>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /><span>Personalized 7-Day Nutrition Plan</span></div>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /><span>WHO & ACOG AI Assistant</span></div>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /><span>Medicine Safety & Dosage Guide</span></div>
                    </>
                  )}
                  {activeTab === 'doctor' && (
                    <>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400" /><span>Assigned High-Risk Patient Roster</span></div>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400" /><span>XAI Explainable Risk Factor Scoring</span></div>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400" /><span>Nutrition Plan One-Click Approval</span></div>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400" /><span>Clinical Notes & Actions Entry</span></div>
                    </>
                  )}
                  {activeTab === 'admin' && (
                    <>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400" /><span>Full Patient Health Registry Overview</span></div>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400" /><span>ML Model Telemetry & Retraining</span></div>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400" /><span>Security & Compliance Audit Stream</span></div>
                      <div className="flex items-center space-x-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400" /><span>Role Access Control & User Roster</span></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Registration Form View */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <UserPlus className="h-4 w-4 text-blue-400" />
                  <span>Register New AURA Account</span>
                </h3>
                <span className="text-[10px] text-slate-400">JWT Encrypted Session</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Kavita Nair or Sunita Das"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@maternalhealth.org"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assign Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('patient')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                      regRole === 'patient' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('doctor')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                      regRole === 'doctor' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                      regRole === 'admin' ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 mt-4"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Create Account & Authenticate</span>
              </button>
            </form>
          )}

          {/* Switch Mode Toggle */}
          <div className="text-center pt-2 border-t border-slate-700/80">
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline"
            >
              {isRegisterMode ? 'Already have an account? Back to Login' : "Don't have an account? Register new profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
