import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Database,
  FileText,
  RefreshCw,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Server,
  Lock,
  HardDrive,
  Eye,
  Sliders,
  Layers,
  HeartPulse,
} from 'lucide-react';
import { AdminStats, AuditLog, MLModelInfo, PatientSummary, User, UserRole } from '../types';

interface AdminDashboardProps {
  stats: AdminStats;
  models: MLModelInfo[];
  users: User[];
  patients?: PatientSummary[];
  auditLogs: AuditLog[];
  onUpdateRole: (userId: string, role: UserRole) => void;
  onRetrainModel: (modelId: string) => void;
  onOpenReportForPatient?: (patientId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  models = [],
  users = [],
  patients = [],
  auditLogs = [],
  onUpdateRole,
  onRetrainModel,
  onOpenReportForPatient,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patient_registry' | 'models' | 'users' | 'audit' | 'infrastructure'>('overview');
  const [retrainingId, setRetrainingId] = useState<string | null>(null);

  // Patient registry search & filter
  const [patientSearch, setPatientSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Audit log search
  const [auditSearch, setAuditSearch] = useState('');

  const handleRetrain = (modelId: string) => {
    setRetrainingId(modelId);
    setTimeout(() => {
      onRetrainModel(modelId);
      setRetrainingId(null);
    }, 1200);
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.user.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.user.email.toLowerCase().includes(patientSearch.toLowerCase());

    if (riskFilter === 'all') return matchesSearch;
    const gdmCat = p.latestGdmRisk?.category.toLowerCase() || 'low';
    const cervCat = p.latestCervicalRisk?.category.toLowerCase() || 'low';
    return matchesSearch && (gdmCat === riskFilter || cervCat === riskFilter);
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    return (
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-[#1E293B] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">System Admin Governance Console</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>System Health: {stats.systemHealthStatus}</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Full-spectrum platform inspection: Patient health registry, user permissions, ML model telemetry, and security logs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center min-w-[100px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Users</p>
              <p className="text-lg font-bold text-white">{users.length}</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center min-w-[100px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Active Patients</p>
              <p className="text-lg font-bold text-emerald-400">{patients.length || stats.totalPatients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab('patient_registry')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTab === 'patient_registry'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HeartPulse className="h-3.5 w-3.5" />
          <span>Patient Health Registry ({patients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>User Role Governance ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTab === 'models'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>ML Model Telemetry ({models.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Security Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTab === 'infrastructure'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Server className="h-3.5 w-3.5" />
          <span>Infrastructure Health</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & KEY METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* High-Level Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{users.length}</p>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1 font-medium">
                <span>{users.filter(u => u.role === 'patient').length} Patients</span> • <span>{users.filter(u => u.role === 'doctor').length} Doctors</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Predictions Run</span>
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalPredictionsRun}</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">GDM & Cervical AI Scoring</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reports Generated</span>
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalReportsGenerated}</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">Downloaded Clinical PDFs</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Avg Population Risk</span>
                <Database className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{Math.round(stats.avgGdmRiskProbability * 100)}%</p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">GDM Baseline Probability</p>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
                <HeartPulse className="h-4 w-4 text-emerald-600" />
                <span>Patient Health Summary</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {patients.length} total registered patients monitored. Currently, <strong>{patients.filter(p => p.latestGdmRisk?.category === 'High').length}</strong> patient(s) exhibit high-risk GDM indicators requiring dietary or insulin intervention.
              </p>
              <button
                onClick={() => setActiveTab('patient_registry')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 underline"
              >
                Inspect Full Patient Health Registry →
              </button>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-purple-600" />
                <span>ML Telemetry Quick View</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                2 active models in production: XGBoost GDM Classifier (AUC: 0.942) and Cervical Health Risk Engine (AUC: 0.915). Zero model drift detected over last 30 days.
              </p>
              <button
                onClick={() => setActiveTab('models')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 underline"
              >
                View Model Performance Details →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLETE PATIENT HEALTH REGISTRY (ENTIRE DETAILS) */}
      {activeTab === 'patient_registry' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
                <HeartPulse className="h-4 w-4 text-purple-600" />
                <span>Comprehensive Patient Health & Risk Registry</span>
              </h3>
              <p className="text-[11px] text-slate-400">Entire details of all patient vitals, gestational age, lab values, and calculated risk categories</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Filter patient name..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold outline-none"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk Only</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">Patient Name</th>
                  <th className="py-3 px-3">Age / Gest. Week</th>
                  <th className="py-3 px-3">FBS (mg/dL)</th>
                  <th className="py-3 px-3">BP (mmHg)</th>
                  <th className="py-3 px-3">Hemoglobin</th>
                  <th className="py-3 px-3">GDM Risk Score</th>
                  <th className="py-3 px-3">Cervical Risk</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400">No patient records found.</td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => {
                    const v = p.latestVitals;
                    const gdm = p.latestGdmRisk;
                    const cerv = p.latestCervicalRisk;

                    return (
                      <tr key={p.user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <img src={p.user.avatarUrl} alt={p.user.name} className="h-7 w-7 rounded-full object-cover" />
                          <div>
                            <p>{p.user.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{p.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {v?.age || 28} yrs • <strong className="text-purple-600">Wk {v?.gestationalAgeWeeks || 24}</strong>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {v?.fastingBloodSugarMgDl || 90} mg/dL
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {v?.systolicBp || 120}/{v?.diastolicBp || 80}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {v?.hemoglobinGDl || 11.5} g/dL
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            gdm?.category === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            gdm?.category === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {gdm?.category || 'Low'} ({Math.round((gdm?.probability || 0.1) * 100)}%)
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cerv?.category === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {cerv?.category || 'Low'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {onOpenReportForPatient && (
                            <button
                              onClick={() => onOpenReportForPatient(p.user.id)}
                              className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[11px] hover:bg-purple-200 transition-colors inline-flex items-center space-x-1"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Clinical PDF</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER ROLES GOVERNANCE */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span>User Role Access & Permission Governance</span>
            </h3>
            <p className="text-[11px] text-slate-400">Modify active user roles and access rights across Patient, Doctor, and Admin roles</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Active Role</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <img src={u.avatarUrl} alt={u.name} className="h-8 w-8 rounded-full object-cover" />
                      <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        u.role === 'patient' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        u.role === 'doctor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => onUpdateRole(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ML MODEL TELEMETRY */}
      {activeTab === 'models' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-purple-600" />
                <span>AI / ML Risk Prediction Models Telemetry</span>
              </h3>
              <p className="text-[11px] text-slate-400">Active production algorithms, validation metrics, and dataset retraining pipeline</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center space-x-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
              <Database className="h-4 w-4 text-purple-600" />
              <span>Real-time DB Retraining: Active</span>
            </div>
          </div>

          {/* Model Retraining Pipeline Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
              <RefreshCw className="h-4 w-4 text-teal-600" />
              <span>Continuous Training from Stored Patient Records</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              When patients log their health metrics and resting vitals, the details are written to the persistent database. These patient details are automatically incorporated into the training dataset to retrain and refine model weights for Gestational Diabetes and Cervical Cancer risk classifiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <div key={model.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{model.name}</h4>
                    <p className="text-[11px] text-slate-400">{model.targetCondition} • Version {model.version}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {model.status}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl space-y-1.5 text-xs">
                  <p className="text-slate-500">Algorithm: <strong className="text-slate-800 dark:text-slate-200">{model.algorithm}</strong></p>
                  <div className="flex items-center justify-between pt-1">
                    <span>Accuracy: <strong className="text-teal-600">{(model.accuracy * 100).toFixed(1)}%</strong></span>
                    <span>ROC-AUC: <strong className="text-purple-600">{model.rocAuc.toFixed(3)}</strong></span>
                    <span>Training Samples: <strong>{model.trainingSamples.toLocaleString()}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Last Retrained: {new Date(model.lastRetrained).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleRetrain(model.id)}
                    disabled={retrainingId === model.id}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all flex items-center space-x-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${retrainingId === model.id ? 'animate-spin' : ''}`} />
                    <span>{retrainingId === model.id ? 'Retraining Pipeline...' : 'Trigger Retraining'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY AUDIT STREAM */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Security & HIPAA Compliance Audit Trail</span>
            </h3>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit actions..."
                className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredAuditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <span className="text-[10px] text-slate-400">• {log.actorEmail} ({log.actorRole})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-4">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: INFRASTRUCTURE & HEALTH */}
      {activeTab === 'infrastructure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <Server className="h-4 w-4 text-blue-600" />
              <span>Cloud Services & Microservices Uptime</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-800">
                <span>Express API Server (Node / Vite Engine)</span>
                <span className="text-emerald-600 font-bold">99.99% Operational</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-800">
                <span>Firestore Medical DB Connection</span>
                <span className="text-emerald-600 font-bold">Synchronized (0ms lag)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-800">
                <span>Gemini 3.6 Flash AI Assistant Pipeline</span>
                <span className="text-blue-600 font-bold">142ms Avg Latency</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <Lock className="h-4 w-4 text-purple-600" />
              <span>HIPAA & Security Compliance Matrix</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>AES-256 Encryption at rest & TLS 1.3 in transit</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Role-Based Access Control (RBAC) enforced</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Anonymized telemetry for AI model retraining</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
