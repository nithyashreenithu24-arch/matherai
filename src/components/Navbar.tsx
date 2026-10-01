import React from 'react';
import { User, UserRole } from '../types';
import { Activity, Stethoscope, UserCheck, LogIn, ChevronDown, HeartPulse, FileText, MessageSquareQuote, Shield, Pill, LogOut, Brain, MessageCircle, Lock } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  activeTab: 'dashboard' | 'nutrition' | 'chat' | 'messages' | 'report' | 'admin' | 'medicine' | 'login';
  setActiveTab: (tab: 'dashboard' | 'nutrition' | 'chat' | 'messages' | 'report' | 'admin' | 'medicine' | 'login') => void;
  unreadMessageCount?: number;
  onSwitchUser: (user: User) => void;
  onOpenAuthModal: () => void;
  onOpenNewRecordModal: () => void;
  onOpenReportModal: () => void;
  onOpenWorkflowModal?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  activeTab,
  setActiveTab,
  unreadMessageCount = 0,
  onSwitchUser,
  onOpenAuthModal,
  onOpenNewRecordModal,
  onOpenReportModal,
  onOpenWorkflowModal,
  onLogout,
}) => {
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'patient':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">Patient</span>;
      case 'doctor':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">Obstetrician</span>;
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">System Admin</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1E293B] text-slate-100 border-b border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">MaternalHealth.AI</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  CLINICAL ENGINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Predictive Maternal Analytics & Risk Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            {/* Medicine Guidance (Available for all clinical & patient roles) */}
            <button
              onClick={() => setActiveTab('medicine')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'medicine'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Pill className="h-4 w-4 text-emerald-400" />
              <span>Medicine Guidance</span>
            </button>

            {/* Secure Direct Messaging (Available for Patients & Doctors) */}
            {(currentUser.role === 'patient' || currentUser.role === 'doctor') && (
              <button
                onClick={() => setActiveTab('messages')}
                className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'messages'
                    ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <MessageCircle className="h-4 w-4 text-blue-400" />
                <span>{currentUser.role === 'doctor' ? 'Patient Messages' : 'Doctor Messaging'}</span>
                {unreadMessageCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full animate-pulse">
                    {unreadMessageCount}
                  </span>
                )}
              </button>
            )}


            {currentUser.role === 'patient' && (
              <>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'nutrition'
                      ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>Nutrition Plan</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'chat'
                      ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <MessageSquareQuote className="h-4 w-4" />
                  <span>AI Assistant</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('report');
                    onOpenReportModal();
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'report'
                      ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Health Reports</span>
                </button>
              </>
            )}

            {/* System Architecture & Use Case Diagram Modal Trigger */}
            {onOpenWorkflowModal && (
              <button
                onClick={onOpenWorkflowModal}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 transition-all cursor-pointer"
                title="View MATERN AI System Workflow Architecture & Use Case Diagrams"
              >
                <Brain className="h-4 w-4 text-purple-400" />
                <span className="hidden lg:inline">System Architecture</span>
              </button>
            )}

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Shield className="h-4 w-4 text-purple-400" />
                <span>Admin Governance</span>
              </button>
            )}
          </nav>

          {/* Actions & Role Quick Switcher */}
          <div className="flex items-center space-x-3">
            {currentUser.role === 'patient' && (
              <button
                onClick={onOpenNewRecordModal}
                className="hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Log Vitals / Lab</span>
              </button>
            )}

            {/* Role Portals Login Switcher */}
            <button
              onClick={() => setActiveTab('login')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">Role Portals</span>
            </button>

            {/* Profile Dropdown & Quick Switch */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2.5 p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 transition-colors"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-100 flex items-center space-x-1">
                    <span>{currentUser.name}</span>
                  </div>
                  <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {/* Role Quick-Switch Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-slate-900 dark:text-slate-100">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Switch Role Profile</p>
                    <p className="text-xs text-slate-500 mt-0.5">Toggle between Patient, Doctor, and Admin views</p>
                  </div>

                  <div className="py-1 max-h-64 overflow-y-auto">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-300 font-semibold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <img src={u.avatarUrl} alt={u.name} className="h-7 w-7 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                          </div>
                        </div>
                        {u.id === currentUser.id && <UserCheck className="h-4 w-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 px-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        setActiveTab('login');
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <LogIn className="h-3.5 w-3.5 text-blue-600" />
                      <span>Dedicated Login Page</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
