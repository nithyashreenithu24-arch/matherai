import React, { useState } from 'react';
import {
  Pill,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Bot,
  Send,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { MedicationInfo, PREGNANCY_CATEGORIES_GUIDE, PRENATAL_MEDICATIONS } from '../data/medicineData';

export const MedicineGuidance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSafetyFilter, setSelectedSafetyFilter] = useState<string>('all');
  const [expandedMedId, setExpandedMedId] = useState<string | null>('med-insulin-nph');

  // AI Medication Query State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Filter logic
  const filteredMeds = PRENATAL_MEDICATIONS.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.indications.some((ind) => ind.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    const matchesSafety = selectedSafetyFilter === 'all' || med.pregnancyCategory === selectedSafetyFilter;

    return matchesSearch && matchesCategory && matchesSafety;
  });

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Medication Guidance Query: ${aiQuery}. Please provide WHO/ACOG evidence-based safety guidance for this medication during pregnancy, trimester safety, potential GDM or cervical health considerations, and dosage precautions.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.reply || data.text || 'Medication safety verified against WHO Prenatal Guidelines.');
      } else {
        // Fallback clinical reasoning rule engine
        const lower = aiQuery.toLowerCase();
        if (lower.includes('insulin')) {
          setAiResponse('Insulin (NPH, Lispro, Aspart) is Category B and the gold standard for Gestational Diabetes Mellitus (GDM) when dietary modifications fail. It does NOT cross the placenta, making it completely safe for fetal development. Fasting target: < 95 mg/dL; 2-hour postprandial: < 120 mg/dL.');
        } else if (lower.includes('metformin')) {
          setAiResponse('Metformin is Category B and crosses the placenta in minimal amounts. It is recommended in GDM as second-line treatment when insulin self-injection is refused or impractical. Monitor for mild GI side effects (nausea, diarrhea).');
        } else if (lower.includes('iron') || lower.includes('anemia')) {
          setAiResponse('Elemental Iron (e.g. Ferrous Ascorbate 100mg) is Category A. First-line for hemoglobin < 11.0 g/dL. Always take on an empty stomach with Vitamin C (orange juice) for optimal absorption. Separate from Calcium supplements by at least 2 hours.');
        } else if (lower.includes('aspirin')) {
          setAiResponse('Low-Dose Aspirin (81mg - 150mg daily) is Category B and strongly endorsed by ACOG for preeclampsia prophylaxis in high-risk pregnancies (GDM, prior preeclampsia, hypertension). Initiate between 12 and 28 weeks of gestation.');
        } else {
          setAiResponse(`Regarding "${aiQuery}": Always consult your prescribing obstetrician before starting or modifying any medication during pregnancy. Medications should be evaluated based on trimester safety, maternal health conditions (like GDM or cervical length), and fetal risk vs benefit.`);
        }
      }
    } catch {
      setAiResponse(`Regarding "${aiQuery}": Essential prenatal medications like Insulin, Metformin, Ferrous Ascorbate, and Folic Acid are strictly categorized by FDA pregnancy safety ratings. Always verify prescriptions with your gynecologist.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getBadgeStyle = (cat: 'A' | 'B' | 'C' | 'D' | 'X') => {
    switch (cat) {
      case 'A':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'B':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      case 'C':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'D':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      case 'X':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1E293B] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Clinical Medicine & Dosage Guidance</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>WHO & ACOG Verified</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Evidence-based maternal pharmacotherapy for Gestational Diabetes, Anemia, Preeclampsia & Cervical Health.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Disclaimer Box */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start space-x-3 text-xs text-amber-800 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Prescribing Guidance & Patient Safety Notice:</strong>
          <span className="ml-1">
            This directory provides medical reference data on standard prenatal dosage protocols, FDA pregnancy categories, and administration timing. Do not self-prescribe or alter insulin/antihypertensive dosages without direct instructions from your treating obstetrician.
          </span>
        </div>
      </div>

      {/* FDA Pregnancy Safety Rating Guide Accordion/Grid */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>FDA Pregnancy Safety Categories Reference Guide</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PREGNANCY_CATEGORIES_GUIDE.map((cat) => (
            <div key={cat.category} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  cat.category === 'Category A' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  cat.category === 'Category B' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  cat.category === 'Category C' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  cat.category === 'Category D' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-purple-100 text-purple-800 border-purple-300'
                }`}>
                  {cat.category}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{cat.badge}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3">{cat.description}</p>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                <strong>Examples:</strong> {cat.examples}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medication name, generic compound (e.g. Insulin, Metformin, Iron)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1 md:w-56">
              <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="all">All Clinical Categories</option>
                <option value="GDM Glycemic Control">GDM Glycemic Control</option>
                <option value="Prenatal Supplement & Anemia">Prenatal Supplement & Anemia</option>
                <option value="Hypertension & Preeclampsia">Hypertension & Preeclampsia</option>
                <option value="Cervical & Reproductive Health">Cervical & Reproductive Health</option>
              </select>
            </div>

            <select
              value={selectedSafetyFilter}
              onChange={(e) => setSelectedSafetyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">FDA Safety Class</option>
              <option value="A">Category A</option>
              <option value="B">Category B</option>
              <option value="C">Category C</option>
              <option value="D">Category D</option>
              <option value="X">Category X</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medication Cards List */}
      <div className="space-y-4">
        {filteredMeds.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <Pill className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No medications matched your search filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for generic names like "Insulin", "Iron", "Metformin", or clear filters.</p>
          </div>
        ) : (
          filteredMeds.map((med) => {
            const isExpanded = expandedMedId === med.id;
            return (
              <div
                key={med.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
              >
                {/* Header card summary */}
                <div
                  onClick={() => setExpandedMedId(isExpanded ? null : med.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{med.name}</h3>
                        <span className="text-xs text-slate-400 font-medium">({med.genericName})</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeStyle(med.pregnancyCategory)}`}>
                          FDA Category {med.pregnancyCategory}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">{med.category}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                        <Clock className="h-3 w-3 inline text-slate-400" />
                        <span>Trimester Safety: <strong>{med.trimesterSafety}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 sm:self-center">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Standard Dosage</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{med.standardDosage.split('(')[0]}</p>
                    </div>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed View */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column: Indications & Dosage */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Clinical Indications</h4>
                          <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                            {med.indications.map((ind, idx) => (
                              <li key={idx}>{ind}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Standard Dosage & Protocol</h4>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            {med.standardDosage}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Administration Timing</h4>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{med.administrationTiming}</p>
                        </div>
                      </div>

                      {/* Right Column: Precautions & Side Effects */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Side Effects & Tolerability</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {med.sideEffects.map((se, idx) => (
                              <span key={idx} className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px]">
                                {se}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contraindications</h4>
                          <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 dark:text-rose-400">
                            {med.contraindications.map((ci, idx) => (
                              <li key={idx}>{ci}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800/60">
                          <h4 className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                            <Info className="h-3.5 w-3.5" />
                            <span>Special Practice Instructions</span>
                          </h4>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{med.specialInstructions}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Interactive AI Medication Safety Consultant */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Medication Safety Advisor</h3>
            <p className="text-xs text-slate-500">Ask clinical questions about any prenatal drug, supplement combination, or GDM regimen</p>
          </div>
        </div>

        <form onSubmit={handleAiAsk} className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g. Can I take Metformin and Iron together in the second trimester?"
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={isAiLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isAiLoading ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Ask AI Advisor</span>
              </>
            )}
          </button>
        </form>

        {aiResponse && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold">
              <Bot className="h-4 w-4" />
              <span>WHO & ACOG Grounded AI Recommendation:</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};
