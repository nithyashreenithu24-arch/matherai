import React, { useState } from 'react';
import { Activity, X, Heart, ShieldAlert, Sparkles, Stethoscope, Database, Cpu, CheckCircle2 } from 'lucide-react';
import { VitalsRecord } from '../types';

interface HealthDataFormProps {
  isOpen: boolean;
  patientId: string;
  latestVitals?: VitalsRecord | null;
  onClose: () => void;
  onSubmitRecord: (record: Omit<VitalsRecord, 'id' | 'timestamp'>) => void;
}

export const HealthDataForm: React.FC<HealthDataFormProps> = ({
  isOpen,
  patientId,
  latestVitals,
  onClose,
  onSubmitRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'cervical' | 'obstetric'>('vitals');

  // Form State initialized with previous values if available
  const [age, setAge] = useState(latestVitals?.age || 32);
  const [location, setLocation] = useState(latestVitals?.location || 'Bengaluru, India');
  const [heightCm, setHeightCm] = useState(latestVitals?.heightCm || 162);
  const [weightKg, setWeightKg] = useState(latestVitals?.weightKg || 80);
  const [gestationalAgeWeeks, setGestationalAgeWeeks] = useState(latestVitals?.gestationalAgeWeeks || 26);

  const [systolicBp, setSystolicBp] = useState(latestVitals?.systolicBp || 132);
  const [diastolicBp, setDiastolicBp] = useState(latestVitals?.diastolicBp || 86);
  const [heartRate, setHeartRate] = useState(latestVitals?.heartRate || 80);

  const [fastingBloodSugarMgDl, setFastingBloodSugarMgDl] = useState(latestVitals?.fastingBloodSugarMgDl || 110);
  const [randomBloodSugarMgDl, setRandomBloodSugarMgDl] = useState(latestVitals?.randomBloodSugarMgDl || 165);
  const [hba1cPercent, setHba1cPercent] = useState(latestVitals?.hba1cPercent || 6.1);
  const [hemoglobinGDl, setHemoglobinGDl] = useState(latestVitals?.hemoglobinGDl || 10.4);

  const [gravidity, setGravidity] = useState(latestVitals?.gravidity || 2);
  const [parity, setParity] = useState(latestVitals?.parity || 1);
  const [priorGdmHistory, setPriorGdmHistory] = useState(latestVitals?.priorGdmHistory ?? true);
  const [priorComplications, setPriorComplications] = useState(latestVitals?.priorComplications || '');

  const [papSmearHistory, setPapSmearHistory] = useState<'never' | 'normal_3yrs' | 'abnormal_past' | 'overdue'>(
    latestVitals?.papSmearHistory || 'normal_3yrs'
  );
  const [hpvStatus, setHpvStatus] = useState<'negative' | 'positive' | 'unknown'>(latestVitals?.hpvStatus || 'negative');
  const [previousAbnormalResults, setPreviousAbnormalResults] = useState(latestVitals?.previousAbnormalResults ?? false);
  const [smokingStatus, setSmokingStatus] = useState<'never' | 'former' | 'current'>(latestVitals?.smokingStatus || 'never');
  const [sexualPartnersCount, setSexualPartnersCount] = useState(latestVitals?.sexualPartnersCount || 1);
  const [familyHistoryCervicalCancer, setFamilyHistoryCervicalCancer] = useState(latestVitals?.familyHistoryCervicalCancer ?? false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const heightM = heightCm / 100;
    const calculatedBmi = Number((weightKg / (heightM * heightM)).toFixed(1));

    onSubmitRecord({
      patientId,
      age: Number(age),
      location,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      bmi: calculatedBmi,
      gestationalAgeWeeks: Number(gestationalAgeWeeks),
      systolicBp: Number(systolicBp),
      diastolicBp: Number(diastolicBp),
      heartRate: Number(heartRate),
      fastingBloodSugarMgDl: Number(fastingBloodSugarMgDl),
      randomBloodSugarMgDl: Number(randomBloodSugarMgDl),
      hba1cPercent: Number(hba1cPercent),
      hemoglobinGDl: Number(hemoglobinGDl),
      gravidity: Number(gravidity),
      parity: Number(parity),
      priorGdmHistory,
      priorComplications,
      papSmearHistory,
      hpvStatus,
      previousAbnormalResults,
      smokingStatus,
      sexualPartnersCount: Number(sexualPartnersCount),
      familyHistoryCervicalCancer,
      chronicDiseases: latestVitals?.chronicDiseases || [],
      medications: latestVitals?.medications || [],
      allergies: latestVitals?.allergies || [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Log Longitudinal Health Record</h3>
            <p className="text-xs text-slate-500">Updates Vitals, Glycemic Labs, Obstetric, and Cervical Screening metrics</p>
          </div>
        </div>

        {/* Database & ML Training Notice */}
        <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-teal-500/10 to-blue-500/10 border border-purple-500/20 dark:border-purple-400/20 text-xs flex items-center space-x-3 text-slate-700 dark:text-slate-300">
          <div className="h-8 w-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Database className="h-4 w-4" />
          </div>
          <p className="text-[11px] leading-snug">
            <strong className="text-purple-700 dark:text-purple-300 font-semibold block">Continuous Model Training Pipeline Active</strong>
            Patient details logged after resting/testing are stored in the database to train & fine-tune the XGBoost GDM & Cervical risk models with real clinical patient data.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('vitals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'vitals'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Vitals & Glycemic Labs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cervical')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cervical'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Cervical Health History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('obstetric')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'obstetric'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Obstetric History
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gestational Week</label>
                  <input
                    type="number"
                    value={gestationalAgeWeeks}
                    onChange={(e) => setGestationalAgeWeeks(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Fasting Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={fastingBloodSugarMgDl}
                    onChange={(e) => setFastingBloodSugarMgDl(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Random Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={randomBloodSugarMgDl}
                    onChange={(e) => setRandomBloodSugarMgDl(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">HbA1c Level (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hba1cPercent}
                    onChange={(e) => setHba1cPercent(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hemoglobinGDl}
                    onChange={(e) => setHemoglobinGDl(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cervical' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pap Smear Screening History</label>
                <select
                  value={papSmearHistory}
                  onChange={(e: any) => setPapSmearHistory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="normal_3yrs">Normal Pap Smear within 3 Years</option>
                  <option value="abnormal_past">Past Abnormal Pap Smear (ASCUS/LSIL/HSIL)</option>
                  <option value="overdue">Overdue for Screening (&gt;3 Years)</option>
                  <option value="never">Never Screened</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Oncogenic HPV Status</label>
                <select
                  value={hpvStatus}
                  onChange={(e: any) => setHpvStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="negative">HPV Negative</option>
                  <option value="positive">High-Risk HPV Positive</option>
                  <option value="unknown">Unknown / Not Tested</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="prevAbnormal"
                  checked={previousAbnormalResults}
                  onChange={(e) => setPreviousAbnormalResults(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <label htmlFor="prevAbnormal" className="font-semibold text-slate-700 dark:text-slate-300">
                  History of previous abnormal cervical cytology/biopsy results
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Smoking Exposure</label>
                <select
                  value={smokingStatus}
                  onChange={(e: any) => setSmokingStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="never">Never Smoked</option>
                  <option value="former">Former Smoker</option>
                  <option value="current">Active Smoker</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="famHistCC"
                  checked={familyHistoryCervicalCancer}
                  onChange={(e) => setFamilyHistoryCervicalCancer(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <label htmlFor="famHistCC" className="font-semibold text-slate-700 dark:text-slate-300">
                  Family History of Cervical Cancer (First-degree relative)
                </label>
              </div>
            </div>
          )}

          {activeTab === 'obstetric' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gravidity (Total Pregnancies)</label>
                  <input
                    type="number"
                    value={gravidity}
                    onChange={(e) => setGravidity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Parity (Live Deliveries)</label>
                  <input
                    type="number"
                    value={parity}
                    onChange={(e) => setParity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="priorGdm"
                  checked={priorGdmHistory}
                  onChange={(e) => setPriorGdmHistory(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <label htmlFor="priorGdm" className="font-semibold text-slate-700 dark:text-slate-300">
                  History of Gestational Diabetes in prior pregnancies
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prior Obstetric Complications</label>
                <textarea
                  rows={2}
                  value={priorComplications}
                  onChange={(e) => setPriorComplications(e.target.value)}
                  placeholder="e.g. Mild preeclampsia or macrosomia in 1st pregnancy..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Save & Trigger AI Risk Analysis</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
