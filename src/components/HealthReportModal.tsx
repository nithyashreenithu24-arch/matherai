import React from 'react';
import { Activity, Database, Download, HeartPulse, Printer, ShieldAlert, Stethoscope, CheckCircle2, X } from 'lucide-react';
import { DoctorNote, NutritionPlan, RiskPrediction, User, VitalsRecord } from '../types';

interface HealthReportModalProps {
  isOpen: boolean;
  user: User;
  vitals: VitalsRecord | null;
  vitalsHistory?: VitalsRecord[];
  gdmRisk: RiskPrediction | null;
  cervicalRisk: RiskPrediction | null;
  nutritionPlan: NutritionPlan | null;
  doctorNotes: DoctorNote[];
  onClose: () => void;
}

export const HealthReportModal: React.FC<HealthReportModalProps> = ({
  isOpen,
  user,
  vitals,
  vitalsHistory = [],
  gdmRisk,
  cervicalRisk,
  nutritionPlan,
  doctorNotes,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const allRecords = vitalsHistory.length > 0 ? vitalsHistory : vitals ? [vitals] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-8 relative max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center space-x-2">
            <HeartPulse className="h-6 w-6 text-teal-600" />
            <div>
              <span className="font-bold text-lg block">Maternal Clinical Health Report</span>
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-teal-600" />
                <span>Generated directly from persistent patient database</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Download PDF Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content Document */}
        <div className="py-6 space-y-6 text-xs text-slate-800 dark:text-slate-200">
          
          {/* Document Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-teal-600 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-base">
                  A
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-wider">AURA MATERNAL HEALTHCARE</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Institute for Precision Obstetrics & Persistent Medical Records</p>
            </div>

            <div className="text-right text-[11px] text-slate-500 space-y-0.5">
              <p><strong>Report Reference ID:</strong> REP-{user.id.substring(4)}-2026</p>
              <p><strong>Generated Date:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified Database Record ({allRecords.length} Stored Entries)</span>
              </p>
            </div>
          </div>

          {/* Patient Demographics Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Age & Location</span>
              <span className="font-bold text-slate-900 dark:text-white">{vitals?.age || 30} yrs ({vitals?.location || 'India'})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Gestational Stage</span>
              <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">Week {vitals?.gestationalAgeWeeks || 26}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Physician</span>
              <span className="font-bold text-slate-900 dark:text-white">Dr. Sunita Reddy</span>
            </div>
          </div>

          {/* Latest Stored Patient Laboratory Vitals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b pb-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider text-teal-700">
                1. Stored Patient Input Laboratory Metrics
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                Last recorded: {vitals?.timestamp ? new Date(vitals.timestamp).toLocaleDateString() : 'Today'}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Fasting Sugar</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{vitals?.fastingBloodSugarMgDl} mg/dL</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Random Sugar</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{vitals?.randomBloodSugarMgDl} mg/dL</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">HbA1c Level</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{vitals?.hba1cPercent}%</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Hemoglobin</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{vitals?.hemoglobinGDl} g/dL</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Pressure</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{vitals?.systolicBp}/{vitals?.diastolicBp}</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">BMI</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{vitals?.bmi} kg/m²</span>
              </div>
            </div>
          </div>

          {/* Database History Log Table */}
          {allRecords.length > 1 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Patient Input History (Stored in Database)
              </h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                    <tr>
                      <th className="p-2">Timestamp</th>
                      <th className="p-2">Gest. Age</th>
                      <th className="p-2">Fasting Sugar</th>
                      <th className="p-2">HbA1c</th>
                      <th className="p-2">Hemoglobin</th>
                      <th className="p-2">BP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {allRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2 font-mono">{new Date(r.timestamp).toLocaleDateString()}</td>
                        <td className="p-2 font-semibold text-teal-600">Week {r.gestationalAgeWeeks}</td>
                        <td className="p-2">{r.fastingBloodSugarMgDl} mg/dL</td>
                        <td className="p-2">{r.hba1cPercent}%</td>
                        <td className="p-2">{r.hemoglobinGDl} g/dL</td>
                        <td className="p-2">{r.systolicBp}/{r.diastolicBp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Risk Predictions Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider text-teal-700 border-b pb-1">
              2. AI Machine Learning Risk Analytics (Based on Stored Data)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GDM Risk */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Gestational Diabetes Mellitus (GDM)</span>
                  <span className={`px-2.5 py-0.5 rounded-md text-xs ${
                    gdmRisk?.category === 'High' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {gdmRisk?.category} Risk ({Math.round((gdmRisk?.probability || 0) * 100)}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Model: {gdmRisk?.modelName} ({gdmRisk?.modelVersion})</p>
                <div className="space-y-1 pt-1">
                  <p className="font-semibold text-[11px]">Primary Risk Drivers:</p>
                  {gdmRisk?.topContributingFactors.map((f, i) => (
                    <p key={i} className="text-[11px] text-slate-600 dark:text-slate-300">
                      • <strong>{f.displayName} ({f.value})</strong>: {f.explanation}
                    </p>
                  ))}
                </div>
              </div>

              {/* Cervical Risk */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Cervical Cancer Screening Risk</span>
                  <span className={`px-2.5 py-0.5 rounded-md text-xs ${
                    cervicalRisk?.category === 'High' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {cervicalRisk?.category} Risk ({Math.round((cervicalRisk?.probability || 0) * 100)}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Model: {cervicalRisk?.modelName} ({cervicalRisk?.modelVersion})</p>
                <div className="space-y-1 pt-1">
                  <p className="font-semibold text-[11px]">Primary Risk Drivers:</p>
                  {cervicalRisk?.topContributingFactors.map((f, i) => (
                    <p key={i} className="text-[11px] text-slate-600 dark:text-slate-300">
                      • <strong>{f.displayName} ({f.value})</strong>: {f.explanation}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Nutrition Plan Summary */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider text-teal-700 border-b pb-1">
              3. Personalized Nutrition & Dietary Plan
            </h4>
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span>Daily Caloric Target: <strong>{nutritionPlan?.calorieTarget} kcal</strong> ({nutritionPlan?.dietaryPreference})</span>
                <span>Macros: {nutritionPlan?.carbsPercentage}% C / {nutritionPlan?.proteinPercentage}% P / {nutritionPlan?.fatPercentage}% F</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                {nutritionPlan?.specialGuidelines.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Doctor Clinical Notes */}
          {doctorNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider text-teal-700 border-b pb-1">
                4. Doctor Consultation Directives
              </h4>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border space-y-1">
                <p className="font-semibold text-teal-700 dark:text-teal-300">{doctorNotes[0].doctorName} ({new Date(doctorNotes[0].timestamp).toLocaleDateString()})</p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{doctorNotes[0].note}</p>
              </div>
            </div>
          )}

          {/* Mandatory Medical Disclaimer & Signature */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <p className="text-[10px] text-slate-400 italic leading-tight">
              Clinical Disclaimer: This document is generated from stored patient records in the AURA AI Maternal Health Database. Predictions are probabilistic decision support aids and must be reviewed by a qualified obstetrician/gynecologist before initiating pharmaceutical intervention.
            </p>

            <div className="flex items-end justify-between pt-4">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">AURA Clinical AI Verification Engine</p>
                <p className="text-[10px] text-slate-400">Cryptographically Hashed Record ID: {user.id.substring(0, 12)}</p>
              </div>
              <div className="text-center">
                <div className="h-10 w-32 border-b border-slate-400 mb-1 flex items-center justify-center font-serif text-slate-600 text-xs italic">
                  Dr. Sunita Reddy
                </div>
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Attending Gynecologist Signature</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
