import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertCircle,
  Apple,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Heart,
  MessageSquare,
  Plus,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  MessageCircle,
  Lock,
} from 'lucide-react';
import {
  DoctorNote,
  NutritionPlan,
  RiskPrediction,
  User,
  VitalsRecord,
} from '../types';
import { MedicationTracker } from './MedicationTracker';
import { AppointmentScheduler } from './AppointmentScheduler';

interface PatientDashboardProps {
  user: User;
  allUsers?: User[];
  vitalsHistory: VitalsRecord[];
  predictions: RiskPrediction[];
  nutritionPlan: NutritionPlan | null;
  doctorNotes: DoctorNote[];
  onOpenNewRecordModal: () => void;
  onOpenNutritionView: () => void;
  onOpenChat: () => void;
  onOpenReportModal: () => void;
  onNavigateToMessages?: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  user,
  allUsers = [],
  vitalsHistory = [],
  predictions = [],
  nutritionPlan = null,
  doctorNotes = [],
  onOpenNewRecordModal,
  onOpenNutritionView,
  onOpenChat,
  onOpenReportModal,
  onNavigateToMessages,
}) => {

  const latestVitals = vitalsHistory && vitalsHistory.length > 0 ? vitalsHistory[vitalsHistory.length - 1] : undefined;

  const gdmRisk = (predictions || []).find((p) => p.type === 'gestational_diabetes');
  const cervicalRisk = (predictions || []).find((p) => p.type === 'cervical_cancer');

  // Chart data formatting
  const chartData = (vitalsHistory || []).map((rec) => {
    const dateStr = new Date(rec.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return {
      date: dateStr,
      fastingSugar: rec.fastingBloodSugarMgDl,
      randomSugar: rec.randomBloodSugarMgDl,
      systolic: rec.systolicBp,
      diastolic: rec.diastolicBp,
      hemoglobin: rec.hemoglobinGDl,
      gestationalWeek: rec.gestationalAgeWeeks || 20,
    };
  });

  // Gauge Chart Data for Gestational Diabetes (GDM)
  const gdmRiskPercent = gdmRisk ? Math.round(gdmRisk.probability * 100) : 28;

  const gaugeBackgroundData = [
    { name: 'Low Risk', value: 30, color: '#10b981' },
    { name: 'Moderate Risk', value: 30, color: '#f59e0b' },
    { name: 'High Risk', value: 40, color: '#f43f5e' },
  ];

  const gaugeValData = [
    { name: 'Score', value: Math.min(100, Math.max(0, gdmRiskPercent)) },
    { name: 'Remaining', value: Math.max(0, 100 - gdmRiskPercent) },
  ];

  const getRiskGaugeColor = (val: number) => {
    if (val >= 60) return '#f43f5e';
    if (val >= 30) return '#f59e0b';
    return '#10b981';
  };

  // Sparkline data for GDM historical fluctuations
  const sparklineGdmData = (vitalsHistory && vitalsHistory.length > 0 ? vitalsHistory : []).map((rec, idx) => {
    const fasting = rec.fastingBloodSugarMgDl || 90;
    const hba1c = rec.hba1cPercent || 5.2;
    let riskVal = Math.round(
      Math.min(95, Math.max(8, ((fasting - 70) / 70) * 50 + ((hba1c - 4.5) / 2) * 35))
    );
    if (idx === (vitalsHistory || []).length - 1 && gdmRisk) {
      riskVal = Math.round(gdmRisk.probability * 100);
    }
    const dateLabel = new Date(rec.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return {
      date: dateLabel,
      week: `Week ${rec.gestationalAgeWeeks || 20}`,
      riskScore: riskVal,
      fastingSugar: rec.fastingBloodSugarMgDl,
    };
  });

  const currentRiskVal = gdmRiskPercent;
  const prevRiskVal = sparklineGdmData.length > 1 ? sparklineGdmData[sparklineGdmData.length - 2]?.riskScore : currentRiskVal;
  const riskDiff = currentRiskVal - prevRiskVal;

  const getRiskColor = (category?: string) => {
    if (category === 'High') return 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 shadow-xs';
    if (category === 'Medium') return 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50 shadow-xs';
    return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs';
  };

  const getRiskBadge = (category?: string) => {
    if (category === 'High') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">High Risk</span>;
    if (category === 'Medium') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Moderate Risk</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Low Risk</span>;
  };

  return (
    <div className="space-y-6">
      {/* Patient Header Banner */}
      <div className="bg-[#1E293B] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-400/40 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Patient Overview: {user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {latestVitals?.gestationalAgeWeeks ? `Gestational Week ${latestVitals.gestationalAgeWeeks}` : 'Prenatal Care'}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                Real-time predictive screening & clinical decision support for GDM and Cervical Health.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={onOpenNewRecordModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Log Vitals / Lab</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-600 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download Health PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Risk Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gestational Diabetes Risk Card with Recharts Gauge & Mini Sparkline */}
        <div className={`p-5 rounded-xl border ${getRiskColor(gdmRisk?.category)} bg-white dark:bg-slate-900 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gestational Diabetes Risk (GDM)</h2>
                  <p className="text-[11px] text-slate-400">Model: GDM LightGBM v3.1</p>
                </div>
              </div>
              {getRiskBadge(gdmRisk?.category)}
            </div>

            {/* Gauge & Sparkline Interactive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center my-2 py-2 border-y border-slate-100 dark:border-slate-800/80">
              {/* Recharts Semi-Circle Gauge */}
              <div className="relative flex flex-col items-center justify-center p-2 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="h-28 w-full max-w-[170px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={gaugeBackgroundData}
                        cx="50%"
                        cy="85%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={44}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {gaugeBackgroundData.map((entry, index) => (
                          <Cell key={`bg-cell-${index}`} fill={entry.color} opacity={0.25} />
                        ))}
                      </Pie>
                      <Pie
                        data={gaugeValData}
                        cx="50%"
                        cy="85%"
                        startAngle={180}
                        endAngle={180 - (180 * (Math.min(100, Math.max(0, gdmRiskPercent)) / 100))}
                        innerRadius={42}
                        outerRadius={62}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={getRiskGaugeColor(gdmRiskPercent)} />
                        <Cell fill="transparent" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block leading-none">
                    {gdmRiskPercent}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                    GDM Score
                  </span>
                </div>
              </div>

              {/* Recharts Mini Sparkline Fluctuation Chart */}
              <div className="flex flex-col justify-between p-2.5 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 h-28">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    <span>Risk Trajectory</span>
                  </span>
                  {riskDiff < 0 ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center space-x-0.5">
                      <TrendingDown className="h-2.5 w-2.5" />
                      <span>{Math.abs(riskDiff)}% Improvement</span>
                    </span>
                  ) : riskDiff > 0 ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center space-x-0.5">
                      <TrendingUp className="h-2.5 w-2.5" />
                      <span>+{riskDiff}% Shift</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      Stable
                    </span>
                  )}
                </div>

                <div className="h-14 w-full mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineGdmData} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gdmSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={getRiskGaugeColor(gdmRiskPercent)} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={getRiskGaugeColor(gdmRiskPercent)} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-1.5 rounded-md text-[10px] shadow-lg border border-slate-700">
                                <p className="font-bold">{data.date} ({data.week})</p>
                                <p className="text-teal-300 font-semibold">GDM Risk: {data.riskScore}%</p>
                                <p className="text-slate-300">FBS: {data.fastingSugar} mg/dL</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="riskScore"
                        stroke={getRiskGaugeColor(gdmRiskPercent)}
                        strokeWidth={2}
                        fill="url(#gdmSparklineGrad)"
                        dot={{ r: 2.5, fill: getRiskGaugeColor(gdmRiskPercent), strokeWidth: 0 }}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {gdmRisk?.topContributingFactors && gdmRisk.topContributingFactors.length > 0 && (
              <div className="space-y-1.5 mb-3 pt-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Contributing Clinical Factors:</p>
                <div className="space-y-1">
                  {gdmRisk.topContributingFactors.slice(0, 2).map((factor, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{factor.displayName}: <strong className="text-slate-900 dark:text-white">{factor.value}</strong></span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        +{(factor.importanceScore * 100).toFixed(0)}% Impact
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">Updated: {gdmRisk ? new Date(gdmRisk.timestamp).toLocaleDateString() : 'Today'}</span>
            <button
              onClick={onOpenChat}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
            >
              <span>Ask AI Assistant</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Cervical Cancer Risk Card */}
        <div className={`p-5 rounded-xl border ${getRiskColor(cervicalRisk?.category)} bg-white dark:bg-slate-900 shadow-xs transition-all relative overflow-hidden`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cervical Cancer Risk</h2>
                <p className="text-[11px] text-slate-400">Model: Cervical RF-XGB v2.4</p>
              </div>
            </div>
            {getRiskBadge(cervicalRisk?.category)}
          </div>

          <div className="flex items-baseline space-x-3 my-3">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {cervicalRisk ? `${(cervicalRisk.probability * 100).toFixed(1)}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500 font-medium">Screening Risk Probability</span>
          </div>

          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (cervicalRisk?.probability || 0) * 100)}%` }}
            />
          </div>

          {cervicalRisk?.topContributingFactors && cervicalRisk.topContributingFactors.length > 0 && (
            <div className="space-y-2 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Contributing Clinical Factors:</p>
              <div className="space-y-1.5">
                {cervicalRisk.topContributingFactors.slice(0, 3).map((factor, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{factor.displayName}: <strong className="text-slate-900 dark:text-white">{factor.value}</strong></span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      +{(factor.importanceScore * 100).toFixed(0)}% Impact
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Updated: {cervicalRisk ? new Date(cervicalRisk.timestamp).toLocaleDateString() : 'Today'}</span>
            <button
              onClick={onOpenChat}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline"
            >
              <span>Ask AI Assistant</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Vitals Matrix Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fasting Blood Sugar</p>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{latestVitals?.fastingBloodSugarMgDl || 90}</span>
            <span className="text-xs text-slate-400">mg/dL</span>
          </div>
          <span className={`inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
            (latestVitals?.fastingBloodSugarMgDl || 0) >= 95 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          }`}>
            {(latestVitals?.fastingBloodSugarMgDl || 0) >= 95 ? 'Elevated' : 'Target (<95)'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Blood Pressure</p>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{latestVitals?.systolicBp || 120}/{latestVitals?.diastolicBp || 80}</span>
            <span className="text-xs text-slate-400">mmHg</span>
          </div>
          <span className="inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Normal Range
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hemoglobin</p>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{latestVitals?.hemoglobinGDl || 11.5}</span>
            <span className="text-xs text-slate-400">g/dL</span>
          </div>
          <span className={`inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
            (latestVitals?.hemoglobinGDl || 12) < 11 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          }`}>
            {(latestVitals?.hemoglobinGDl || 12) < 11 ? 'Mild Anemia (<11)' : 'Adequate'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Body Mass Index (BMI)</p>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{latestVitals?.bmi || 24.5}</span>
            <span className="text-xs text-slate-400">kg/m²</span>
          </div>
          <span className="inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            {latestVitals?.bmi && latestVitals.bmi >= 30 ? 'Obesity Class I' : latestVitals?.bmi && latestVitals.bmi >= 25 ? 'Overweight' : 'Normal'}
          </span>
        </div>
      </div>

      {/* Interactive Longitudinal Recharts Trend Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Sugar Trend Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Blood Glucose Trend (Longitudinal)</h3>
              <p className="text-[11px] text-slate-400">Fasting vs Random Sugar Levels (mg/dL)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-medium">
              <span className="flex items-center space-x-1 text-blue-600"><span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block"></span> Fasting</span>
              <span className="flex items-center space-x-1 text-amber-600"><span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block"></span> Random</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFasting" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRandom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[60, 200]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="fastingSugar" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFasting)" name="Fasting Sugar" />
                <Area type="monotone" dataKey="randomSugar" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRandom)" name="Random Sugar" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Pressure Trend Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Blood Pressure Monitoring</h3>
              <p className="text-[11px] text-slate-400">Systolic/Diastolic BP (mmHg)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-medium">
              <span className="flex items-center space-x-1 text-rose-600"><span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block"></span> Systolic</span>
              <span className="flex items-center space-x-1 text-blue-600"><span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block"></span> Diastolic</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[60, 160]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="systolic" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 3 }} name="Systolic BP" />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Diastolic BP" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Iron & Prenatal Medication Tracker Feature */}
      <MedicationTracker patientId={user.id} />

      {/* Appointment Scheduling & Status Tracking Feature */}
      <AppointmentScheduler currentUser={user} allUsers={allUsers} />

      {/* Personalized Nutrition & Doctor Notes Widget Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nutrition Plan Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Apple className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Personalized Nutrition Plan</h3>
                <p className="text-[11px] text-slate-400">Tailored Glycemic Control & Micronutrients</p>
              </div>
            </div>
            {nutritionPlan?.isDoctorApproved ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Doctor Approved</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Pending Review
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Daily Calorie Target</p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{nutritionPlan?.calorieTarget || 1950} kcal</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Macronutrients</p>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
                {nutritionPlan?.carbsPercentage || 40}% C / {nutritionPlan?.proteinPercentage || 30}% P / {nutritionPlan?.fatPercentage || 30}% F
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Diet Preference</p>
              <p className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200 mt-1">{nutritionPlan?.dietaryPreference || 'Vegetarian'}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sample Day Meal Preview:</p>
            {nutritionPlan?.sample7DayPlan?.[0] && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <p><strong>Breakfast:</strong> {nutritionPlan.sample7DayPlan[0].breakfast}</p>
                <p><strong>Lunch:</strong> {nutritionPlan.sample7DayPlan[0].lunch}</p>
                <p><strong>Dinner:</strong> {nutritionPlan.sample7DayPlan[0].dinner}</p>
              </div>
            )}
          </div>

          <button
            onClick={onOpenNutritionView}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2"
          >
            <Stethoscope className="h-4 w-4" />
            <span>View Full 7-Day Meal Schedule & Micronutrient Guide</span>
          </button>
        </div>

        {/* Doctor Clinical Notes */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doctor Clinical Notes</h3>
              <p className="text-[11px] text-slate-400">Dr. Sunita Reddy (Obstetrician)</p>
            </div>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto mb-4">
            {doctorNotes.length > 0 ? (
              doctorNotes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">{note.doctorName}</span>
                    <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{note.note}</p>
                  {note.recommendedAction && (
                    <div className="pt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      Action Required: {note.recommendedAction}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No notes recorded yet. Your doctor will review your latest vitals shortly.</p>
            )}
          </div>

          {onNavigateToMessages && (
            <button
              onClick={onNavigateToMessages}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Send Encrypted Message to Dr. Sunita</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
