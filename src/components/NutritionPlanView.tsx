import React, { useState } from 'react';
import { Apple, CheckCircle2, ChevronRight, Clock, Flame, RefreshCw, ShieldAlert, Sparkles, Stethoscope, Utensils } from 'lucide-react';
import { DailyMeal, NutritionPlan, VitalsRecord } from '../types';

interface NutritionPlanViewProps {
  plan: NutritionPlan | null;
  vitals: VitalsRecord | null;
  onRegeneratePlan: (preference: 'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'vegan', allergies: string[]) => void;
}

export const NutritionPlanView: React.FC<NutritionPlanViewProps> = ({ plan, vitals, onRegeneratePlan }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [preference, setPreference] = useState<'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'vegan'>(
    plan?.dietaryPreference || 'vegetarian'
  );
  const [allergiesText, setAllergiesText] = useState(plan?.allergiesOrRestrictions?.join(', ') || '');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!plan) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <Apple className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Nutrition Plan Generated Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Log your vitals or click regenerate below to generate your personalized 7-day prenatal nutrition plan.
        </p>
      </div>
    );
  }

  const handleRegenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      const allergyArray = allergiesText
        ? allergiesText.split(',').map((s) => s.trim())
        : [];
      onRegeneratePlan(preference, allergyArray);
      setIsGenerating(false);
    }, 600);
  };

  const currentMealDay: DailyMeal = plan.sample7DayPlan[selectedDayIndex] || plan.sample7DayPlan[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1E293B] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <Apple className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Personalized Nutrition Engine</h1>
                {plan.isDoctorApproved && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Clinically Approved</span>
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Precision caloric and micronutrient distribution designed for GDM glycemic management and maternal hemoglobin support.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Daily Calorie Goal</p>
              <p className="text-lg font-bold text-white">{plan.calorieTarget} kcal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Macronutrients & Special Protocols Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Carbohydrates (Low-GI)</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{plan.carbsPercentage}%</span>
            <span className="text-xs text-slate-400 font-medium">({Math.round((plan.calorieTarget * (plan.carbsPercentage / 100)) / 4)}g/day)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Complex fiber starches only</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Protein Target</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{plan.proteinPercentage}%</span>
            <span className="text-xs text-slate-400 font-medium">({Math.round((plan.calorieTarget * (plan.proteinPercentage / 100)) / 4)}g/day)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Fetal growth & lean muscle</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Healthy Fats</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-purple-600">{plan.fatPercentage}%</span>
            <span className="text-xs text-slate-400">({Math.round((plan.calorieTarget * (plan.fatPercentage / 100)) / 9)}g/day)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Omega-3 & essential DHA</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Dietary Profile</p>
          <p className="text-lg font-bold capitalize text-slate-900 dark:text-white mt-2">{plan.dietaryPreference}</p>
          <p className="text-[10px] text-slate-400 mt-1">{plan.allergiesOrRestrictions.join(', ') || 'No restrictions logged'}</p>
        </div>
      </div>

      {/* Specific Guidelines & Medical Protocols */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Stethoscope className="h-5 w-5 text-emerald-600" />
          <span>Tailored Clinical Nutrition Directives</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {plan.specialGuidelines.map((guide, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 flex items-start space-x-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{guide}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Interactive Meal Schedule */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Utensils className="h-5 w-5 text-teal-600" />
            <span>7-Day Prenatal Meal Plan</span>
          </h3>
        </div>

        {/* Day Buttons Switcher */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {plan.sample7DayPlan.map((meal, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDayIndex === idx
                  ? 'bg-teal-600 text-white shadow-md scale-[1.02]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {meal.day}
            </button>
          ))}
        </div>

        {/* Selected Day Meal Timeline */}
        {currentMealDay && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Breakfast (8:00 AM)</span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{currentMealDay.breakfast}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Mid-Morning Snack (11:00 AM)</span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{currentMealDay.morningSnack}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Lunch (1:30 PM)</span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{currentMealDay.lunch}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Evening Snack (5:00 PM)</span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{currentMealDay.afternoonSnack}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Dinner (8:00 PM)</span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{currentMealDay.dinner}</p>
            </div>
          </div>
        )}
      </div>

      {/* Customize & Regenerate Plan Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Adjust Meal Preferences & Re-calculate</h3>

        <form onSubmit={handleRegenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dietary Preference</label>
            <select
              value={preference}
              onChange={(e: any) => setPreference(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            >
              <option value="vegetarian">Vegetarian (Plant + Dairy)</option>
              <option value="non-vegetarian">Non-Vegetarian (Includes Lean Fish & Meat)</option>
              <option value="eggetarian">Eggetarian (Plant + Eggs)</option>
              <option value="vegan">Vegan (Strictly Plant-based)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Allergies / Restrictions</label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="e.g. Penicillin, lactose intolerance, peanuts..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Recalculating Plan...' : 'Regenerate 7-Day Plan'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
