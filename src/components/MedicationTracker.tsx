import React, { useState, useEffect } from 'react';
import { 
  Pill, CheckCircle2, XCircle, Calendar, Plus, Flame, Award, 
  TrendingUp, Clock, AlertCircle, ShieldCheck, Sparkles, Filter, Trash2
} from 'lucide-react';
import { MedicationLog } from '../types';

interface MedicationTrackerProps {
  patientId: string;
}

const DEFAULT_MEDS = [
  { id: 'm1', name: 'Prenatal Multivitamin', category: 'prenatal', dosage: '1 Tablet Daily (with Folic Acid 800mcg)', color: 'bg-purple-500' },
  { id: 'm2', name: 'Elemental Iron Supplement', category: 'iron', dosage: '60mg Ferrous Sulfate', color: 'bg-rose-500' },
  { id: 'm3', name: 'Calcium + D3 Supplement', category: 'calcium', dosage: '500mg Elemental Calcium', color: 'bg-amber-500' },
];

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({ patientId }) => {
  const [logs, setLogs] = useState<MedicationLog[]>(() => {
    const saved = localStorage.getItem(`aura_med_logs_${patientId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse medication logs', e);
      }
    }
    // Pre-populate with realistic initial history for standard patient
    const today = new Date();
    const mockLogs: MedicationLog[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const iso = date.toISOString();

      if (i !== 3) { // simulate 1 missed day
        mockLogs.push({
          id: `initial-prenatal-${i}`,
          patientId,
          medicationName: 'Prenatal Multivitamin (Folic Acid)',
          category: 'prenatal',
          dosage: '1 Tablet Daily',
          status: 'taken',
          timestamp: iso,
          notes: 'Taken after breakfast'
        });
        mockLogs.push({
          id: `initial-iron-${i}`,
          patientId,
          medicationName: 'Elemental Iron (Ferrous Sulfate 60mg)',
          category: 'iron',
          dosage: '60mg Daily',
          status: 'taken',
          timestamp: iso,
          notes: 'Taken with Vitamin C OJ'
        });
      } else {
        mockLogs.push({
          id: `initial-prenatal-${i}`,
          patientId,
          medicationName: 'Prenatal Multivitamin (Folic Acid)',
          category: 'prenatal',
          dosage: '1 Tablet Daily',
          status: 'missed',
          timestamp: iso,
          notes: 'Forgotten during travel'
        });
      }
    }
    return mockLogs;
  });

  const [selectedMed, setSelectedMed] = useState(DEFAULT_MEDS[0]);
  const [customName, setCustomName] = useState('');
  const [customDosage, setCustomDosage] = useState('');
  const [customCategory, setCustomCategory] = useState<'iron' | 'prenatal' | 'calcium' | 'folic_acid' | 'other'>('prenatal');
  const [notes, setNotes] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'iron' | 'prenatal'>('all');

  useEffect(() => {
    localStorage.setItem(`aura_med_logs_${patientId}`, JSON.stringify(logs));
  }, [logs, patientId]);

  // Calculations for Adherence & Streak
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayTaken = logs.some(
    l => l.timestamp.startsWith(todayStr) && l.status === 'taken'
  );

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const hasLog = logs.some(l => l.timestamp.startsWith(dateString) && l.status === 'taken');
      if (hasLog) {
        streak++;
      } else if (i > 0) {
        break; // break streak if missed prior day
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.toISOString().split('T')[0];
    const dayLogs = logs.filter(l => l.timestamp.startsWith(isoDate));
    const isTaken = dayLogs.some(l => l.status === 'taken');
    const isMissed = dayLogs.some(l => l.status === 'missed');
    return {
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      isoDate,
      isToday: isoDate === todayStr,
      status: isTaken ? 'taken' : isMissed ? 'missed' : 'pending',
    };
  });

  const totalTakenCount = logs.filter(l => l.status === 'taken').length;
  const totalLoggedCount = logs.length;
  const adherenceRate = totalLoggedCount > 0 ? Math.round((totalTakenCount / totalLoggedCount) * 100) : 100;

  const handleQuickLog = (med: typeof DEFAULT_MEDS[0], status: 'taken' | 'missed') => {
    const newLog: MedicationLog = {
      id: `med-${Date.now()}`,
      patientId,
      medicationName: med.name,
      category: med.category as any,
      dosage: med.dosage,
      status,
      timestamp: new Date().toISOString(),
      notes: status === 'taken' ? 'Quick logged for today' : 'Logged as missed',
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newLog: MedicationLog = {
      id: `med-custom-${Date.now()}`,
      patientId,
      medicationName: customName,
      category: customCategory,
      dosage: customDosage || 'Standard Dose',
      status: 'taken',
      timestamp: new Date().toISOString(),
      notes: notes || undefined,
    };

    setLogs(prev => [newLog, ...prev]);
    setCustomName('');
    setCustomDosage('');
    setNotes('');
    setIsFormOpen(false);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const filteredLogs = logs.filter(l => {
    if (filter === 'all') return true;
    return l.category === filter;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Daily Medication & Prenatal Tracker
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                Maternal Adherence
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Log daily Iron, Folic Acid, Calcium, and Prenatal Multivitamin intake for fetal growth
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Adherence Rate Badge */}
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">14-Day Adherence</span>
            <span className="text-base font-black text-teal-600 dark:text-teal-400">{adherenceRate}%</span>
          </div>

          {/* Streak Counter Badge */}
          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-300/40 text-center flex items-center space-x-2">
            <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Streak</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{streak} Days</span>
            </div>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Custom Dose</span>
          </button>
        </div>
      </div>

      {/* 7-Day Visual Adherence Calendar Bar */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <Calendar className="h-4 w-4 text-rose-500" />
            <span>Past 7 Days Supplement Log</span>
          </span>
          <span className="text-[11px] text-slate-500">
            {todayTaken ? (
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Logged for Today
              </strong>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">Pending Today's Intake</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {past7Days.map((day, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                day.isToday
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase">{day.dayLabel}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">{day.dateNum}</span>
              
              {day.status === 'taken' && (
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              )}
              {day.status === 'missed' && (
                <div className="p-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  <XCircle className="h-3.5 w-3.5" />
                </div>
              )}
              {day.status === 'pending' && (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick 1-Click Log Cards for Daily Prescriptions */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
          <Sparkles className="h-3.5 w-3.5 text-rose-500" />
          <span>Quick 1-Click Today's Log</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEFAULT_MEDS.map((med) => {
            const loggedToday = logs.some(
              l => l.timestamp.startsWith(todayStr) && l.medicationName.includes(med.name) && l.status === 'taken'
            );

            return (
              <div
                key={med.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  loggedToday
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{med.name}</span>
                    {loggedToday && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Taken</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{med.dosage}</p>
                </div>

                {!loggedToday ? (
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      onClick={() => handleQuickLog(med, 'taken')}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Take</span>
                    </button>
                    <button
                      onClick={() => handleQuickLog(med, 'missed')}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      title="Mark Missed"
                    >
                      Skip
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold italic text-center">
                    Logged for today
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Log Expansion Form */}
      {isFormOpen && (
        <form onSubmit={handleCustomSubmit} className="p-4 rounded-xl bg-purple-50/50 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-900/60 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-purple-200 dark:border-slate-700">
            <h4 className="font-bold text-xs uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Log Custom Medication / Supplement
            </h4>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Medication Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Folic Acid 5mg, L-Methylfolate"
                required
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as any)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              >
                <option value="prenatal">Prenatal Multivitamin</option>
                <option value="iron">Iron Supplement</option>
                <option value="calcium">Calcium & D3</option>
                <option value="folic_acid">Folic Acid</option>
                <option value="other">Other Prescription</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Dosage</label>
              <input
                type="text"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
                placeholder="e.g. 1 Tablet, 60mg"
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Taken after meal with OJ to boost iron absorption"
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Record Intake Entry
          </button>
        </form>
      )}

      {/* Recent History Table & Logs Filter */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Recent Intake History</span>
          </h4>

          <div className="flex items-center space-x-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-semibold"
            >
              <option value="all">All Supplements</option>
              <option value="iron">Iron Only</option>
              <option value="prenatal">Prenatal Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Date & Time</th>
                <th className="p-2.5">Medication Name</th>
                <th className="p-2.5">Dosage</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Notes</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-2.5 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                      {log.medicationName}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">
                      {log.dosage}
                    </td>
                    <td className="p-2.5">
                      {log.status === 'taken' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Taken
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 inline-flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Missed
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500 italic max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400 italic text-xs">
                    No medication logs found. Click 'Take' on a supplement above to record your first intake.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
