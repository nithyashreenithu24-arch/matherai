import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck,
  Filter,
  MessageCircle,
  Plus,
  Search,
  ShieldAlert,
  Stethoscope,
  User as UserIcon,
  X,
} from 'lucide-react';
import { DoctorNote, NutritionPlan, RiskPrediction, User, VitalsRecord } from '../types';
import { AppointmentScheduler } from './AppointmentScheduler';

interface PatientSummary {
  user: User;
  latestVitals: VitalsRecord | null;
  latestGdmRisk: RiskPrediction | null;
  latestCervicalRisk: RiskPrediction | null;
  totalRecords: number;
}

interface DoctorDashboardProps {
  doctorUser: User;
  allUsers?: User[];
  patients: PatientSummary[];
  onApproveNutrition: (planId: string, doctorNote: string) => void;
  onAddDoctorNote: (patientId: string, note: string, action?: string) => void;
  onOpenReportForPatient: (patientId: string) => void;
  onNavigateToMessages?: (patientId: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctorUser,
  allUsers = [],
  patients = [],
  onApproveNutrition,
  onAddDoctorNote,
  onOpenReportForPatient,
  onNavigateToMessages,
}) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high_gdm' | 'high_cervical'>('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(patients?.[0] || null);

  const [newDoctorNote, setNewDoctorNote] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [approvalNote, setApprovalNote] = useState('');

  // Filtering
  const filteredPatients = (patients || []).filter((p) => {
    const matchesSearch =
      p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (riskFilter === 'high_gdm') return p.latestGdmRisk?.category === 'High';
    if (riskFilter === 'high_cervical') return p.latestCervicalRisk?.category === 'High';

    return true;
  });

  const handleApprove = () => {
    if (!selectedPatient) return;
    // Call approval trigger
    onApproveNutrition('nutr-ps-1', approvalNote || 'Nutrition plan clinically reviewed and approved for GDM protocol.');
    setApprovalNote('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newDoctorNote.trim()) return;

    onAddDoctorNote(selectedPatient.user.id, newDoctorNote, recommendedAction);
    setNewDoctorNote('');
    setRecommendedAction('');
  };

  const getBadge = (category?: string) => {
    if (category === 'High') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">High Risk</span>;
    }
    if (category === 'Medium') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">Moderate</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">Low Risk</span>;
  };

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner */}
      <div className="bg-[#1E293B] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <img
              src={doctorUser.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
              alt={doctorUser.name}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-400/40 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{doctorUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Lead Obstetrician Portal
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Clinical decision support system with explainable AI risk indicators and nutrition approval engine.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center min-w-[90px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Patients</p>
              <p className="text-lg font-bold text-white">{patients.length}</p>
            </div>
            <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-800/50 text-center min-w-[90px]">
              <p className="text-[10px] uppercase font-bold text-rose-300">High Risk</p>
              <p className="text-lg font-bold text-rose-400">
                {patients.filter((p) => p.latestGdmRisk?.category === 'High' || p.latestCervicalRisk?.category === 'High').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Roster & Search Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Patient Roster List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-blue-600" />
              <span>Assigned Patients</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">{filteredPatients.length} Active</span>
          </div>

          {/* Search & Risk Filter Controls */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name or email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setRiskFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  riskFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRiskFilter('high_gdm')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  riskFilter === 'high_gdm'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                High GDM
              </button>
              <button
                onClick={() => setRiskFilter('high_cervical')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  riskFilter === 'high_cervical'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                High Cervical
              </button>
            </div>
          </div>

          {/* Patient Cards List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredPatients.map((pat) => (
              <div
                key={pat.user.id}
                onClick={() => setSelectedPatient(pat)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedPatient?.user.id === pat.user.id
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <img src={pat.user.avatarUrl} alt={pat.user.name} className="h-9 w-9 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pat.user.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {pat.latestVitals?.age || 30}y • {pat.latestVitals?.gestationalAgeWeeks ? `Week ${pat.latestVitals.gestationalAgeWeeks}` : 'Gestation'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px]">
                  <div>
                    <span className="text-slate-400">GDM: </span>
                    {getBadge(pat.latestGdmRisk?.category)}
                  </div>
                  <div>
                    <span className="text-slate-400">Cervical: </span>
                    {getBadge(pat.latestCervicalRisk?.category)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Patient Drill-Down Workspace */}
        {selectedPatient ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Header Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedPatient.user.avatarUrl}
                    alt={selectedPatient.user.name}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-blue-500/20"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedPatient.user.name}</h2>
                    <p className="text-xs text-slate-500">
                      {selectedPatient.user.email} • {selectedPatient.latestVitals?.location || 'India'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {onNavigateToMessages && (
                    <button
                      onClick={() => onNavigateToMessages(selectedPatient.user.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Direct Message</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenReportForPatient(selectedPatient.user.id)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span>Generate Full Clinical Report</span>
                  </button>
                </div>

              </div>

              {/* Vitals Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Fasting Sugar</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedPatient.latestVitals?.fastingBloodSugarMgDl || 'N/A'} mg/dL
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Blood Pressure</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedPatient.latestVitals?.systolicBp}/{selectedPatient.latestVitals?.diastolicBp} mmHg
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Hemoglobin</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedPatient.latestVitals?.hemoglobinGDl || 'N/A'} g/dL
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">BMI & Obstetric</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedPatient.latestVitals?.bmi} kg/m² (G{selectedPatient.latestVitals?.gravidity}P{selectedPatient.latestVitals?.parity})
                  </span>
                </div>
              </div>
            </div>

            {/* Explainable AI Risk Feature Importances */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GDM Explainability */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-teal-600" />
                    <span>GDM Risk Feature Importance</span>
                  </h3>
                  {getBadge(selectedPatient.latestGdmRisk?.category)}
                </div>

                <p className="text-xs text-slate-500">
                  AI Probability Score: <strong className="text-slate-900 dark:text-white">{selectedPatient.latestGdmRisk ? `${Math.round(selectedPatient.latestGdmRisk.probability * 100)}%` : 'N/A'}</strong>
                </p>

                <div className="space-y-2 pt-2">
                  {selectedPatient.latestGdmRisk?.topContributingFactors.map((factor, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span>{factor.displayName} ({factor.value})</span>
                        <span className="text-[10px] text-amber-600 font-bold">{(factor.importanceScore * 100).toFixed(0)}% Weight</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{factor.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cervical Risk Explainability */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 text-purple-600" />
                    <span>Cervical Risk Feature Importance</span>
                  </h3>
                  {getBadge(selectedPatient.latestCervicalRisk?.category)}
                </div>

                <p className="text-xs text-slate-500">
                  AI Probability Score: <strong className="text-slate-900 dark:text-white">{selectedPatient.latestCervicalRisk ? `${Math.round(selectedPatient.latestCervicalRisk.probability * 100)}%` : 'N/A'}</strong>
                </p>

                <div className="space-y-2 pt-2">
                  {selectedPatient.latestCervicalRisk?.topContributingFactors.map((factor, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span>{factor.displayName} ({factor.value})</span>
                        <span className="text-[10px] text-purple-600 font-bold">{(factor.importanceScore * 100).toFixed(0)}% Weight</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{factor.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nutrition Approval & Add Doctor Notes Form */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <span>Clinical Notes & Nutrition Plan Approval</span>
              </h3>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 space-y-3">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">Approve Personalized Nutrition Plan</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    placeholder="Add clinical directive (e.g. Enforce 100mg elemental iron daily)..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve Plan</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddNote} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Add Clinical Consultation Note
                  </label>
                  <textarea
                    rows={3}
                    value={newDoctorNote}
                    onChange={(e) => setNewDoctorNote(e.target.value)}
                    placeholder="Record patient observations, physical exam, and management directives..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={recommendedAction}
                    onChange={(e) => setRecommendedAction(e.target.value)}
                    placeholder="Recommended Action (e.g., OGTT test in 2 weeks)..."
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
            Select a patient from the roster to review clinical details.
          </div>
        )}
      </div>

      {/* Patient Appointments Management Section */}
      <AppointmentScheduler currentUser={doctorUser} allUsers={allUsers} />
    </div>
  );
};
