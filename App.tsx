import React, { useState, useEffect } from 'react';
import { DailyPlan, UserPreferences, AppSettings } from './types';
import { generateDailyPlan } from './services/geminiService';
import InputForm from './components/InputForm';
import PlanDisplay from './components/PlanDisplay';
import SettingsModal from './components/SettingsModal';

const DEFAULT_SETTINGS: AppSettings = {
  userName: '',
  defaultWakeTime: '07:00',
  defaultBedTime: '23:00',
  theme: 'system',
};

const App: React.FC = () => {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [currentPrefs, setCurrentPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('dailyflow_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new fields (like theme) for existing users
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = 
      settings.theme === 'dark' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dailyflow_settings', JSON.stringify(newSettings));
  };

  const handleGenerate = async (prefs: UserPreferences) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure we pass the username if it wasn't in the form data but is in settings
      const finalPrefs = { ...prefs, userName: settings.userName };
      const generatedPlan = await generateDailyPlan(finalPrefs);
      setCurrentPrefs(finalPrefs);
      setPlan(generatedPlan);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setCurrentPrefs(null);
    setError(null);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-300 dark:selection:bg-zinc-700 transition-colors duration-300 flex flex-col">
      
      {/* Background Decorative Elements - Subtle Gray/Black */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-black/5 dark:bg-white/5 blur-[100px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-zinc-500/5 dark:bg-zinc-500/5 blur-[100px]"></div>
      </div>

      {/* Header - Added Safe Area Top Padding */}
      <header className="relative z-10 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-black/70 backdrop-blur-md sticky top-0 transition-colors duration-300 shrink-0 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-md">
              {/* Planet Icon */}
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <span className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white">
              Goal
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Settings Button */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              title="Settings"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-6 md:py-12 flex flex-col items-center justify-center flex-grow">
        
        {error && (
          <div className="w-full max-w-xl mb-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl flex items-start gap-3 shadow-sm">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">Generation Failed</h3>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {!plan ? (
          <InputForm 
            onSubmit={handleGenerate} 
            isLoading={loading} 
            defaultSettings={settings}
          />
        ) : (
          <PlanDisplay 
            plan={plan} 
            goalProgress={currentPrefs?.goalProgress || 0}
            onReset={handleReset} 
          />
        )}
      </main>

      {/* Footer - Added Safe Area Bottom Padding */}
      <footer className="relative z-10 py-6 text-center text-zinc-500 dark:text-zinc-500 text-xs md:text-sm shrink-0 pb-[env(safe-area-inset-bottom)]">
        <p>&copy; {new Date().getFullYear()} Goal. Optimize your day.</p>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default App;