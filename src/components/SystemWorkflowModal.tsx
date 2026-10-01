import React, { useState } from 'react';
import { 
  X, Activity, ArrowRight, UserCheck, Database, Brain, Stethoscope, 
  FileText, ShieldCheck, Pill, MessageSquare, LineChart, Sparkles, 
  Layers, ChevronRight, CheckCircle2, User, Eye, Download, Users, Settings
} from 'lucide-react';

interface SystemWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'dashboard' | 'nutrition' | 'chat' | 'report' | 'admin' | 'medicine' | 'login') => void;
}

export const SystemWorkflowModal: React.FC<SystemWorkflowModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [activeDiagramTab, setActiveDiagramTab] = useState<'pipeline' | 'usecase'>('pipeline');
  const [activeStep, setActiveStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const steps = [
    {
      id: 1,
      title: "1. Registration & Login",
      subtitle: "Pregnant Woman & Clinical Roles",
      icon: UserCheck,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      description: "Secure role-based authentication with OAuth/JWT for Pregnant Patients, Obstetricians, and System Admins.",
      details: ["Multi-factor user registration", "Role-based access controls", "Persistent session management"],
      targetTab: "login" as const,
    },
    {
      id: 2,
      title: "2. Health Data Collection",
      subtitle: "Vitals, Symptoms & Test Reports",
      icon: Activity,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      description: "Structured logging of Fasting Sugar, HbA1c, Blood Pressure, Hemoglobin, Pap Smear, and STDs history.",
      details: ["Personal & Medical history", "Lifestyle & Resting Vitals", "Clinical Laboratory Test Reports"],
      targetTab: "dashboard" as const,
    },
    {
      id: 3,
      title: "3. Data Preprocessing",
      subtitle: "Cleaning, Scaling & Normalization",
      icon: Layers,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      description: "Automated missing value imputation, outlier detection, unit standardization, and feature encoding.",
      details: ["Data cleaning & Transformation", "Gestational age feature scaling", "Categorical encoding"],
      targetTab: "dashboard" as const,
    },
    {
      id: 4,
      title: "4. AI / ML Prediction Engine",
      subtitle: "XGBoost & LightGBM Ensembles",
      icon: Brain,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      description: "Machine Learning models trained to calculate probability scores and top SHAP feature importances.",
      details: [
        "Gestational Diabetes (GDM) Risk Prediction",
        "Cervical Cancer Risk Assessment",
        "Personalized Nutrition Plan Generator"
      ],
      targetTab: "dashboard" as const,
    },
    {
      id: 5,
      title: "5. AI Chatbot & Medicine Guidance",
      subtitle: "Gemini 2.5 Flash & Drug Safety",
      icon: MessageSquare,
      color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
      description: "24/7 AI Health Assistant & Obstetric Medication Guidance with FDA pregnancy category warnings.",
      details: ["Context-aware AI queries", "Safe OTC & Prescription guidance", "Symptom mitigation advice"],
      targetTab: "medicine" as const,
    },
    {
      id: 6,
      title: "6. Risk Visualization (Dashboard)",
      subtitle: "Recharts Gauges & Sparklines",
      icon: LineChart,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      description: "Interactive real-time health trajectory charts, risk gauges, and gestational trend analytics.",
      details: ["Recharts GDM Semi-Circle Gauge", "Historical Vitals Sparkline", "Gestational Week Area Charts"],
      targetTab: "dashboard" as const,
    },
    {
      id: 7,
      title: "7. Health Report Generation",
      subtitle: "Verified PDF & Clinical Matrix",
      icon: FileText,
      color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
      description: "Automated generation of printable medical reports complete with laboratory logs and AI risk scores.",
      details: ["Instant PDF & Print export", "Stored patient history table", "Clinical disclaimer & Signatures"],
      targetTab: "report" as const,
    },
    {
      id: 8,
      title: "8. Doctor Dashboard",
      subtitle: "Obstetric Portal & Notes",
      icon: Stethoscope,
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      description: "Clinical dashboard for doctors to review patient risk tiers, record doctor notes, and approve plans.",
      details: ["Patient risk stratification", "Clinical note entry", "High-risk alert monitoring"],
      targetTab: "dashboard" as const,
    },
    {
      id: 9,
      title: "9. Admin Governance & Database",
      subtitle: "System Logs & ML Retraining",
      icon: ShieldCheck,
      color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800",
      description: "System governance, persistent JSON/SQL database synchronization, audit trails, and model retraining.",
      details: ["Persistent Database storage", "User management & Audit logs", "Continuous model retraining"],
      targetTab: "admin" as const,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  System Architecture & Use Case Workflow
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300">
                  MATERN AI SYSTEM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                End-to-end Machine Learning Clinical Pipeline & Actor Interaction Diagram
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 my-6 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shrink-0">
          <button
            onClick={() => setActiveDiagramTab('pipeline')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeDiagramTab === 'pipeline'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>1. 9-Step System Workflow Pipeline Diagram</span>
          </button>
          <button
            onClick={() => setActiveDiagramTab('usecase')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeDiagramTab === 'usecase'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>2. UML Use Case Interaction Diagram</span>
          </button>
        </div>

        {/* TAB 1: 9-STEP PIPELINE DIAGRAM */}
        {activeDiagramTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
                <p>
                  <strong>Interactive Data Flow:</strong> Click on any step in the pipeline below to preview details or jump straight into that module.
                </p>
              </div>
              <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold hidden sm:inline">
                MySQL / Persistent File DB Connected
              </span>
            </div>

            {/* Visual Flow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {steps.map((s) => {
                const IconComp = s.icon;
                const isSelected = activeStep === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveStep(isSelected ? null : s.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/30 dark:bg-slate-800/80 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${s.color} flex items-center space-x-1.5`}>
                          <IconComp className="h-3.5 w-3.5" />
                          <span>Step {s.id}</span>
                        </span>
                        {onNavigateTab && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateTab(s.targetTab);
                              onClose();
                            }}
                            className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5 cursor-pointer"
                          >
                            <span>Open</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{s.title}</h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">{s.subtitle}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{s.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/60">
                      <div className="space-y-1">
                        {s.details.map((d, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                            <CheckCircle2 className="h-3 w-3 text-teal-500 shrink-0" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Central Database Integration Visual Block */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/10 via-teal-900/10 to-blue-900/10 border border-purple-500/20 text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-600 text-white shadow-md mb-1">
                <Database className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                PERSISTENT DATABASE LAYER (MySQL / File DB Sync)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                All patient health records, laboratory inputs, XGBoost risk predictions, doctor clinical notes, and AI consultation logs are safely stored with continuous model retraining support.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: UML USE CASE DIAGRAM */}
        {activeDiagramTab === 'usecase' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-600 shrink-0" />
                <p>
                  <strong>MATERN AI System UML Boundary:</strong> Shows interaction pathways between Pregnant Woman, Doctor, and Admin actors.
                </p>
              </div>
            </div>

            {/* Visual UML Use Case Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* ACTOR 1: Pregnant Woman */}
              <div className="p-5 rounded-2xl border border-pink-200 dark:border-pink-900/50 bg-pink-50/30 dark:bg-slate-800/50 space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-pink-200 dark:border-pink-900/50">
                  <div className="p-2.5 rounded-xl bg-pink-500 text-white font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pregnant Woman</h3>
                    <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold uppercase">Primary Patient Actor</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patient Use Cases:</p>
                  {[
                    "Register / Login",
                    "Manage Profile",
                    "Input Health Data (Vitals/Lab)",
                    "View Risk Results (GDM & Cervical)",
                    "Get Nutrition & Exercise Recommendations",
                    "Chatbot - Ask AI Queries",
                    "Download Health Reports (PDF)",
                  ].map((uc, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-pink-500 shrink-0" />
                      <span>{uc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MATERN AI SYSTEM CORE INCLUDES */}
              <div className="p-5 rounded-2xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/30 dark:bg-slate-800/50 space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-teal-200 dark:border-teal-900/50">
                  <div className="p-2.5 rounded-xl bg-teal-600 text-white font-bold">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">MATERN AI SYSTEM</h3>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase">Core Included Use Cases</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Predictive Inclusion Flow:</p>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-700 text-xs space-y-2">
                    <span className="font-bold text-teal-700 dark:text-teal-300 block">Predict Health Risks</span>
                    <div className="pl-3 border-l-2 border-teal-500 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <p>«include» Cervical Cancer Assessment</p>
                      <p>«include» Gestational Diabetes Risk</p>
                      <p>«include» Generate Overall Risk Level</p>
                      <p>«extend» Suggest Medicines (Medicine Guidance)</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-700 text-xs space-y-1">
                    <span className="font-bold text-teal-700 dark:text-teal-300 block">AI Chatbot Guidance</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Answers maternal queries & provides safe drug dosage guidance.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTORS 2 & 3: Doctor & Admin */}
              <div className="space-y-4">
                {/* Doctor Box */}
                <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-slate-800/50 space-y-3">
                  <div className="flex items-center space-x-2.5 pb-2 border-b border-blue-200 dark:border-blue-900/50">
                    <div className="p-2 rounded-xl bg-blue-600 text-white">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">Doctor / Obstetrician</h4>
                      <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold uppercase">Clinical Actor</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">View All Patients & Records</div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">View Risk Reports & Analytics</div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Record Doctor Clinical Notes</div>
                  </div>
                </div>

                {/* Admin Box */}
                <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/30 dark:bg-slate-800/50 space-y-3">
                  <div className="flex items-center space-x-2.5 pb-2 border-b border-purple-200 dark:border-purple-900/50">
                    <div className="p-2 rounded-xl bg-purple-600 text-white">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">System Admin</h4>
                      <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold uppercase">Governance Actor</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Manage System Users & Roles</div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">View System Audit Logs</div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Trigger ML Retraining Pipeline</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <p>MATERN AI Architecture Diagram Ref v3.2</p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close Architecture View
          </button>
        </div>

      </div>
    </div>
  );
};
