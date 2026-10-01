export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  assignedDoctorId?: string;
  createdAt: string;
}

export interface VitalsRecord {
  id: string;
  patientId: string;
  timestamp: string;
  
  // Demographics & Anthropometrics
  age: number;
  location: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  gestationalAgeWeeks?: number;

  // Vitals
  systolicBp: number;
  diastolicBp: number;
  heartRate?: number;

  // Lab Values
  fastingBloodSugarMgDl: number;
  randomBloodSugarMgDl: number;
  hba1cPercent?: number;
  hemoglobinGDl: number;

  // Obstetric History
  gravidity: number;
  parity: number;
  priorGdmHistory: boolean;
  priorComplications?: string;

  // Cervical Health History
  papSmearHistory: 'never' | 'normal_3yrs' | 'abnormal_past' | 'overdue';
  hpvStatus: 'negative' | 'positive' | 'unknown';
  previousAbnormalResults: boolean;
  smokingStatus: 'never' | 'former' | 'current';
  sexualPartnersCount?: number;
  familyHistoryCervicalCancer: boolean;

  // General Medical
  chronicDiseases: string[];
  medications: string[];
  allergies: string[];
}

export interface FeatureImportance {
  featureName: string;
  displayName: string;
  value: string | number;
  importanceScore: number; // 0 to 1
  impact: 'increases_risk' | 'decreases_risk' | 'neutral';
  explanation: string;
}

export interface RiskPrediction {
  id: string;
  patientId: string;
  recordId: string;
  type: 'cervical_cancer' | 'gestational_diabetes';
  category: 'Low' | 'Medium' | 'High';
  probability: number; // 0.00 to 1.00
  topContributingFactors: FeatureImportance[];
  recommendations: string[];
  timestamp: string;
  modelName: string;
  modelVersion: string;
}

export interface DailyMeal {
  day: string; // e.g., 'Day 1 (Monday)'
  breakfast: string;
  morningSnack: string;
  lunch: string;
  afternoonSnack: string;
  dinner: string;
}

export interface NutritionPlan {
  id: string;
  patientId: string;
  timestamp: string;
  calorieTarget: number;
  carbsPercentage: number;
  proteinPercentage: number;
  fatPercentage: number;
  dietaryPreference: 'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'vegan';
  allergiesOrRestrictions: string[];
  specialGuidelines: string[];
  sample7DayPlan: DailyMeal[];
  isDoctorApproved: boolean;
  doctorNotes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system' | 'ai';
  text: string;
  timestamp: string;
  sources?: string[];
}

export interface DoctorNote {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  timestamp: string;
  note: string;
  approvedNutritionId?: string;
  recommendedAction?: string;
}

export interface PatientSummary {
  user: User;
  latestVitals: VitalsRecord | null;
  latestGdmRisk: RiskPrediction | null;
  latestCervicalRisk: RiskPrediction | null;
  totalRecords: number;
}

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalAdmins: number;
  totalPredictionsRun: number;
  totalReportsGenerated: number;
  avgGdmRiskProbability: number;
  avgCervicalRiskProbability: number;
  systemHealthStatus: 'Optimal' | 'Degraded' | 'Maintenance';
}

export interface MLModelInfo {
  id: string;
  name: string;
  targetCondition: 'Cervical Cancer' | 'Gestational Diabetes Mellitus';
  version: string;
  algorithm: string;
  accuracy: number; // e.g. 0.94
  rocAuc: number; // e.g. 0.92
  trainingSamples: number;
  lastRetrained: string;
  status: 'Active' | 'Deprecated' | 'Training';
}

export interface MedicationLog {
  id: string;
  patientId: string;
  medicationName: string; // e.g. "Iron Supplement (Ferrous Sulfate 60mg)" or "Prenatal Vitamin (Folic Acid)"
  category: 'iron' | 'prenatal' | 'calcium' | 'folic_acid' | 'other';
  dosage: string;
  status: 'taken' | 'missed' | 'skipped';
  timestamp: string; // ISO date string
  notes?: string;
}

export interface MedicationTrackerState {
  logs: MedicationLog[];
  streakDays: number;
  adherencePercentage: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Rescheduled' | 'Cancelled' | 'Completed';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentType: '75g OGTT Test' | 'High-Risk Prenatal Checkup' | 'Cervical Screening Follow-up' | 'Routine Ultrasound' | 'General Consultation';
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  status: AppointmentStatus;
  notes?: string;
  doctorComments?: string;
  requestedAt: string;
  updatedAt?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  patientId: string; // Context thread ID
  text: string;
  encryptedPayload?: string;
  encryptionAlgorithm?: string; // e.g. "AES-256-GCM (HIPAA/E2EE)"
  timestamp: string;
  isRead: boolean;
  readAt?: string;
  attachments?: { name: string; url: string; type: string }[];
}

