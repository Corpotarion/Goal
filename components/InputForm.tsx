import React, { useState, useEffect } from 'react';
import { PlanLevel, UserPreferences, AppSettings } from '../types';

interface InputFormProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading: boolean;
  defaultSettings: AppSettings;
}

const moods = [
  { label: 'Energetic', emoji: '⚡', value: 'Energetic & Focused' },
  { label: 'Calm', emoji: '🧘', value: 'Calm & Steady' },
  { label: 'Creative', emoji: '🎨', value: 'Creative & Spontaneous' },
  { label: 'Tired', emoji: '🔋', value: 'Tired / Low Energy' },
  { label: 'Anxious', emoji: '🌬️', value: 'Anxious / Overwhelmed' },
];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, defaultSettings }) => {
  const [formData, setFormData] = useState<UserPreferences>({
    wakeTime: defaultSettings.defaultWakeTime,
    bedTime: defaultSettings.defaultBedTime,
    mainGoal: '',
    goalProgress: 0,
    mood: 'Energetic & Focused',
    level: PlanLevel.BALANCED,
    userName: defaultSettings.userName,
  });

  // Update form if defaults change (e.g. from settings modal)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      wakeTime: defaultSettings.defaultWakeTime,
      bedTime: defaultSettings.defaultBedTime,
      userName: defaultSettings.userName
    }));
  }, [defaultSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, goalProgress: parseInt(e.target.value) }));
  };

  const handleMoodSelect = (moodValue: string) => {
    setFormData(prev => ({ ...prev, mood: moodValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 backdrop-blur-xl p-5 md:p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl animate-fade-in transition-colors duration-300">
      
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white mb-2 tracking-tight">
          {defaultSettings.userName ? `Ready, ${defaultSettings.userName}?` : 'Set Your Goal'}
        </h1>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">Design a day that moves you forward.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Section 1: Time Window */}
          <div className="space-y-3">
            <label className="block text-xs md:text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Time Window
            </label>
            <div className="flex items-center gap-2 md:gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex-1 relative">
                <span className="absolute top-1 left-3 text-[10px] font-bold text-zinc-400 uppercase">Start</span>
                <input
                  type="time"
                  name="wakeTime"
                  value={formData.wakeTime}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none rounded-xl px-2 md:px-3 pt-5 pb-1 text-center font-bold text-zinc-900 dark:text-zinc-100 focus:ring-0 cursor-pointer hover:bg-white dark:hover:bg-zinc-700/50 transition-colors text-sm md:text-base"
                  required
                />
              </div>
              <div className="text-zinc-300">→</div>
              <div className="flex-1 relative">
                <span className="absolute top-1 left-3 text-[10px] font-bold text-zinc-400 uppercase">End</span>
                <input
                  type="time"
                  name="bedTime"
                  value={formData.bedTime}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none rounded-xl px-2 md:px-3 pt-5 pb-1 text-center font-bold text-zinc-900 dark:text-zinc-100 focus:ring-0 cursor-pointer hover:bg-white dark:hover:bg-zinc-700/50 transition-colors text-sm md:text-base"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Intensity */}
          <div className="space-y-3">
            <label className="block text-xs md:text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Structure Level
            </label>
            <div className="relative">
               <select
                 name="level"
                 value={formData.level}
                 onChange={handleChange}
                 className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all cursor-pointer hover:bg-white dark:hover:bg-zinc-800 text-sm md:text-base"
               >
                  {Object.values(PlanLevel).map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
               </div>
            </div>
          </div>
        </div>

        {/* Section 3: Mood & Energy */}
        <div className="space-y-3">
          <label className="block text-xs md:text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Current Vibe
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
            {moods.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => handleMoodSelect(m.value)}
                className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-xl border-2 transition-all duration-200 ${
                  formData.mood === m.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-500 dark:text-white transform scale-105 shadow-md'
                    : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="text-xl md:text-2xl mb-1">{m.emoji}</span>
                <span className="text-[10px] md:text-xs font-bold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: The Goal (With Integrated Icon Button) */}
        <div className="space-y-4">
          <label className="block text-xs md:text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Main Goal
          </label>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 md:h-6 md:w-6 text-brand-500 dark:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <input
              type="text"
              name="mainGoal"
              placeholder=""
              value={formData.mainGoal}
              onChange={handleChange}
              className="w-full bg-white dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl pl-10 md:pl-12 pr-14 md:pr-16 py-3.5 md:py-4 text-base md:text-lg font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-0 focus:border-brand-500 dark:focus:border-white transition-all shadow-sm outline-none"
              required
              autoComplete="off"
            />

            {/* Integrated Submit Button (Icon Only) */}
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="submit"
                disabled={isLoading}
                className={`h-9 w-9 md:h-11 md:w-11 rounded-xl font-bold text-sm shadow-md transition-all transform active:scale-95 flex items-center justify-center ${
                  isLoading
                    ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'
                    : 'bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200'
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Progress Slider */}
          <div className="pt-2 px-1">
             <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase">Current Progress</label>
                <span className="text-[10px] md:text-xs font-mono font-bold text-zinc-900 dark:text-white">{formData.goalProgress}%</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={formData.goalProgress} 
               onChange={handleSliderChange}
               className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
             />
          </div>
        </div>

      </form>
    </div>
  );
};

export default InputForm;