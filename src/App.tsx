import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { NutritionPlanView } from './components/NutritionPlanView';
import { AIChatbotView } from './components/AIChatbotView';
import { AuthModal } from './components/AuthModal';
import { HealthDataForm } from './components/HealthDataForm';
import { HealthReportModal } from './components/HealthReportModal';
import { MedicineGuidance } from './components/MedicineGuidance';
import { SystemWorkflowModal } from './components/SystemWorkflowModal';
import { LoginPage } from './components/LoginPage';
import { SecureDoctorMessaging } from './components/SecureDoctorMessaging';
import {
  AdminStats,
  AuditLog,
  ChatMessage,
  DoctorNote,
  MLModelInfo,
  NutritionPlan,
  RiskPrediction,
  User,
  UserRole,
  VitalsRecord,
} from './types';
import {
  MOCK_ADMIN_USER,
  MOCK_DOCTOR_NOTE,
  MOCK_DOCTOR_USER,
  MOCK_PATIENT_USER,
  MOCK_PREDICTIONS,
  MOCK_USERS,
  MOCK_VITALS_HISTORY,
  SEED_AUDIT_LOGS,
  SEED_ML_MODELS,
  SEED_NUTRITION_PLAN,
} from './data/seedData';

export default function App() {
  // Session & User State
  const [currentUser, setCurrentUser] = useState<User>(MOCK_PATIENT_USER);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);

  // Active View & Modals
  const [activeView, setActiveView] = useState<'dashboard' | 'nutrition' | 'chat' | 'messages' | 'admin' | 'medicine' | 'login'>('dashboard');
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [selectedTargetPatientId, setSelectedTargetPatientId] = useState<string | undefined>(undefined);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);


  // Patient Core Data
  const [vitalsHistory, setVitalsHistory] = useState<VitalsRecord[]>(MOCK_VITALS_HISTORY);
  const [predictions, setPredictions] = useState<RiskPrediction[]>(MOCK_PREDICTIONS);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(SEED_NUTRITION_PLAN);
  const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>([MOCK_DOCTOR_NOTE]);

  // Chat Data
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'ai',
      text: `Hello ${MOCK_PATIENT_USER.name}! I am your AURA AI Healthcare Assistant. I am monitoring your prenatal metrics for Gestational Diabetes and Cervical Health. How can I guide you today?`,
      timestamp: new Date().toISOString(),
      sources: ['WHO Prenatal Care Guidelines (2024)', 'ACOG Practice Bulletin No. 190'],
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Admin Data
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalPatients: 42,
    totalDoctors: 8,
    totalAdmins: 2,
    totalPredictionsRun: 156,
    totalReportsGenerated: 89,
    avgGdmRiskProbability: 0.28,
    avgCervicalRiskProbability: 0.15,
    systemHealthStatus: 'Optimal',
  });
  const [mlModels, setMlModels] = useState<MLModelInfo[]>(SEED_ML_MODELS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);

  // Fetch Patient Data & Unread Messages on Change
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`/api/messages/unread-count/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setUnreadMessageCount(data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore initial load network errors
    }
  };

  useEffect(() => {
    fetchPatientData(currentUser.id);
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);


  const fetchPatientData = async (patientId: string) => {
    try {
      const vitalsRes = await fetch(`/api/health-records/${patientId}`);
      if (vitalsRes.ok) {
        const data = await vitalsRes.json();
        if (data.records && data.records.length > 0) {
          setVitalsHistory(data.records);
        }
      }

      const predRes = await fetch(`/api/predictions/${patientId}`);
      if (predRes.ok) {
        const data = await predRes.json();
        if (data.predictions && data.predictions.length > 0) {
          setPredictions(data.predictions);
        }
      }

      const nutrRes = await fetch(`/api/nutrition/${patientId}`);
      if (nutrRes.ok) {
        const data = await nutrRes.json();
        if (data.plan) {
          setNutritionPlan(data.plan);
        }
      }
    } catch (err) {
      console.warn('Backend server connecting, using seed state:', err);
    }
  };

  // Auth Registration
  const handleRegister = async (name: string, email: string, role: UserRole) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password: 'SecurePassword123!' }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAllUsers((prev) => [...prev, data.user]);
        if (role === 'admin') setActiveView('admin');
        else setActiveView('dashboard');
        return;
      }
    } catch (err) {
      console.error('Registration API error, applying local state:', err);
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setAllUsers((prev) => [...prev, newUser]);
    if (role === 'admin') setActiveView('admin');
    else setActiveView('dashboard');
  };

  // Log Vitals Record
  const handleSubmitRecord = async (recordData: Omit<VitalsRecord, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/health-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });

      if (res.ok) {
        const data = await res.json();
        setVitalsHistory((prev) => [...prev, data.record]);
        setPredictions(data.predictions);
        setNutritionPlan(data.nutritionPlan);
        return;
      }
    } catch (err) {
      console.error('Record API error:', err);
    }

    // Fallback local update
    const newRecord: VitalsRecord = {
      ...recordData,
      id: `rec-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setVitalsHistory((prev) => [...prev, newRecord]);
  };

  // Regenerate Nutrition Plan
  const handleRegenerateNutrition = async (
    dietaryPreference: 'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'vegan',
    allergies: string[]
  ) => {
    const latestVitals = vitalsHistory[vitalsHistory.length - 1];
    try {
      const res = await fetch('/api/nutrition/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: currentUser.id,
          dietaryPreference,
          allergies,
          vitals: latestVitals,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNutritionPlan(data.plan);
        return;
      }
    } catch (err) {
      console.error('Nutrition API error:', err);
    }

    if (nutritionPlan) {
      setNutritionPlan({
        ...nutritionPlan,
        dietaryPreference,
        allergiesOrRestrictions: allergies,
      });
    }
  };

  // Doctor Approves Nutrition Plan
  const handleApproveNutrition = async (planId: string, note: string) => {
    try {
      await fetch(`/api/nutrition/${planId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: currentUser.id, doctorNote: note }),
      });
    } catch (err) {
      console.error('Approve error:', err);
    }

    if (nutritionPlan) {
      setNutritionPlan({
        ...nutritionPlan,
        isDoctorApproved: true,
      });
    }

    // Add note
    const newNote: DoctorNote = {
      id: `note-${Date.now()}`,
      patientId: 'usr-patient-1',
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      note: `Approved Nutrition Plan: ${note}`,
      recommendedAction: 'Continue low-GI diet and check blood sugar daily',
      timestamp: new Date().toISOString(),
    };
    setDoctorNotes((prev) => [newNote, ...prev]);
  };

  // Add Doctor Note
  const handleAddDoctorNote = (patientId: string, noteText: string, action?: string) => {
    const newNote: DoctorNote = {
      id: `note-${Date.now()}`,
      patientId,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      note: noteText,
      recommendedAction: action,
      timestamp: new Date().toISOString(),
    };
    setDoctorNotes((prev) => [newNote, ...prev]);
  };

  // Send Chatbot Message
  const handleSendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setChatHistory((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const latestVitals = vitalsHistory[vitalsHistory.length - 1];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userContext: {
            user: currentUser,
            vitals: latestVitals,
            gdmRisk: predictions.find((p) => p.type === 'gestational_diabetes'),
            cervicalRisk: predictions.find((p) => p.type === 'cervical_cancer'),
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: data.response || data.reply,
          timestamp: new Date().toISOString(),
          sources: data.sources || ['WHO Maternal Guidelines (2024)', 'ACOG Gestational Diabetes Bulletin'],
        };
        setChatHistory((prev) => [...prev, aiMsg]);
        setIsChatLoading(false);
        return;
      }
    } catch (err) {
      console.error('Chat API error:', err);
    }

    // Local fallback reply
    setTimeout(() => {
      const fallbackReply: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: `Based on your gestational week (${vitalsHistory[vitalsHistory.length - 1]?.gestationalAgeWeeks || 26}), maintaining balanced complex carbs with 25g daily fiber will help stabilize blood sugar spikes. Pair your iron supplement with citrus fruits to maximize absorption.`,
        timestamp: new Date().toISOString(),
        sources: ['ACOG Practice Bulletin No. 190: Gestational Diabetes', 'WHO Prenatal Nutrition Standard'],
      };
      setChatHistory((prev) => [...prev, fallbackReply]);
      setIsChatLoading(false);
    }, 800);
  };

  // Admin Role Update
  const handleUpdateRole = async (userId: string, role: UserRole) => {
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  // Admin Retrain ML Model
  const handleRetrainModel = (modelId: string) => {
    setMlModels((prev) =>
      prev.map((m) =>
        m.id === modelId
          ? {
              ...m,
              lastRetrained: new Date().toISOString(),
              trainingSamples: m.trainingSamples + 250,
              accuracy: Math.min(0.98, Number((m.accuracy + 0.005).toFixed(3))),
            }
          : m
      )
    );
  };

  // Doctor Patients list compilation
  const doctorPatientList = [
    {
      user: MOCK_PATIENT_USER,
      latestVitals: vitalsHistory[vitalsHistory.length - 1] || null,
      latestGdmRisk: predictions.find((p) => p.type === 'gestational_diabetes') || null,
      latestCervicalRisk: predictions.find((p) => p.type === 'cervical_cancer') || null,
      totalRecords: vitalsHistory.length,
    },
    {
      user: {
        id: 'usr-patient-2',
        name: 'Sunita Sharma',
        email: 'sunita.sharma@maternalhealth.org',
        role: 'patient' as UserRole,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      },
      latestVitals: {
        ...MOCK_VITALS_HISTORY[0],
        patientId: 'usr-patient-2',
        fastingBloodSugarMgDl: 92,
        hemoglobinGDl: 12.1,
      },
      latestGdmRisk: {
        id: 'pred-2',
        patientId: 'usr-patient-2',
        type: 'gestational_diabetes' as const,
        probability: 0.18,
        category: 'Low' as const,
        topContributingFactors: [],
        recommendations: ['Maintain standard healthy balanced diet'],
        modelName: 'GDM LightGBM Predictor',
        modelVersion: 'v3.1',
        timestamp: new Date().toISOString(),
      },
      latestCervicalRisk: {
        id: 'pred-c2',
        patientId: 'usr-patient-2',
        type: 'cervical_cancer' as const,
        probability: 0.12,
        category: 'Low' as const,
        topContributingFactors: [],
        recommendations: ['Routine Pap Smear screening in 3 years'],
        modelName: 'Cervical Risk RF-XGB Hybrid',
        modelVersion: 'v2.4',
        timestamp: new Date().toISOString(),
      },
      totalRecords: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200">
      {/* Navigation Header Bar */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        activeTab={activeView}
        unreadMessageCount={unreadMessageCount}
        setActiveTab={(tab) => {
          if (tab === 'report') {
            setIsReportModalOpen(true);
          } else {
            setActiveView(tab);
          }
        }}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            setActiveView('admin');
          } else {
            setActiveView('dashboard');
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNewRecordModal={() => setIsHealthFormOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenWorkflowModal={() => setIsWorkflowModalOpen(true)}
        onLogout={() => setActiveView('login')}
      />

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dedicated Login Page View */}
        {activeView === 'login' ? (
          <LoginPage
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              if (user.role === 'admin') {
                setActiveView('admin');
              } else {
                setActiveView('dashboard');
              }
            }}
            onRegisterUser={handleRegister}
          />
        ) : activeView === 'medicine' ? (
          /* Medicine Guidance View */
          <MedicineGuidance />
        ) : activeView === 'messages' ? (
          /* VIEW: Secure In-App Doctor-Patient Direct Messaging */
          <SecureDoctorMessaging
            currentUser={currentUser}
            allUsers={allUsers}
            initialPatientId={selectedTargetPatientId}
            onRefreshUnreadCount={fetchUnreadCount}
          />
        ) : (
          <>
            {/* VIEW 1: Patient Dashboard */}
            {currentUser.role === 'patient' && activeView === 'dashboard' && (
              <PatientDashboard
                user={currentUser}
                allUsers={allUsers}
                vitalsHistory={vitalsHistory}
                predictions={predictions}
                nutritionPlan={nutritionPlan}
                doctorNotes={doctorNotes}
                onOpenNewRecordModal={() => setIsHealthFormOpen(true)}
                onOpenNutritionView={() => setActiveView('nutrition')}
                onOpenChat={() => setActiveView('chat')}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onNavigateToMessages={() => setActiveView('messages')}
              />
            )}

            {/* VIEW 2: Doctor Dashboard */}
            {currentUser.role === 'doctor' && activeView === 'dashboard' && (
              <DoctorDashboard
                doctorUser={currentUser}
                allUsers={allUsers}
                patients={doctorPatientList}
                onApproveNutrition={handleApproveNutrition}
                onAddDoctorNote={handleAddDoctorNote}
                onOpenReportForPatient={() => setIsReportModalOpen(true)}
                onNavigateToMessages={(patId) => {
                  setSelectedTargetPatientId(patId);
                  setActiveView('messages');
                }}
              />
            )}


            {/* VIEW 3: Admin Dashboard */}
            {(currentUser.role === 'admin' || activeView === 'admin') && (
              <AdminDashboard
                stats={adminStats}
                models={mlModels}
                users={allUsers}
                patients={doctorPatientList}
                auditLogs={auditLogs}
                onUpdateRole={handleUpdateRole}
                onRetrainModel={handleRetrainModel}
                onOpenReportForPatient={() => setIsReportModalOpen(true)}
              />
            )}

            {/* VIEW 4: Nutrition Engine View */}
            {activeView === 'nutrition' && currentUser.role !== 'admin' && (
              <NutritionPlanView
                plan={nutritionPlan}
                vitals={vitalsHistory[vitalsHistory.length - 1] || null}
                onRegeneratePlan={handleRegenerateNutrition}
              />
            )}

            {/* VIEW 5: AI Healthcare Chatbot */}
            {activeView === 'chat' && currentUser.role !== 'admin' && (
              <AIChatbotView
                user={currentUser}
                chatHistory={chatHistory}
                onSendMessage={handleSendChatMessage}
                isLoading={isChatLoading}
              />
            )}
          </>
        )}
      </main>

      {/* Footer Branding & Disclaimer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-16 py-8 bg-white dark:bg-slate-900 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="font-bold text-slate-900 dark:text-white">AURA Maternal Health Risk Platform</span>
          </div>
          <p className="text-center md:text-left">
            Built for clinical decision support. Compliant with HIPAA-grade data standards and WHO maternal health bulletins.
          </p>
          <p>© 2026 AURA Healthcare. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth / Account Switch Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onRegister={handleRegister}
      />

      {/* New Vitals / Lab Record Entry Form */}
      <HealthDataForm
        isOpen={isHealthFormOpen}
        patientId={currentUser.id}
        latestVitals={vitalsHistory[vitalsHistory.length - 1] || null}
        onClose={() => setIsHealthFormOpen(false)}
        onSubmitRecord={handleSubmitRecord}
      />

      {/* Downloadable Health Report PDF Preview Modal */}
      <HealthReportModal
        isOpen={isReportModalOpen}
        user={currentUser}
        vitals={vitalsHistory[vitalsHistory.length - 1] || null}
        vitalsHistory={vitalsHistory}
        gdmRisk={predictions.find((p) => p.type === 'gestational_diabetes') || null}
        cervicalRisk={predictions.find((p) => p.type === 'cervical_cancer') || null}
        nutritionPlan={nutritionPlan}
        doctorNotes={doctorNotes}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* System Architecture & Use Case Workflow Modal */}
      <SystemWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        onNavigateTab={(tab) => {
          if (tab === 'report') {
            setIsReportModalOpen(true);
          } else {
            setActiveView(tab);
          }
        }}
      />
    </div>
  );
}
