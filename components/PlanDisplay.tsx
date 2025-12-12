import React from 'react';
import { DailyPlan, ActivityCategory } from '../types';

interface PlanDisplayProps {
  plan: DailyPlan;
  goalProgress: number;
  onReset: () => void;
}

const getCategoryColor = (category: ActivityCategory): string => {
  // Monochrome / Grayscale Palette
  switch (category) {
    case ActivityCategory.WORK: 
      return 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white';
    case ActivityCategory.HEALTH: 
      return 'bg-white text-zinc-900 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700';
    case ActivityCategory.REST: 
      return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    case ActivityCategory.LEARNING: 
      return 'bg-zinc-50 text-zinc-800 border-zinc-300 dark:bg-zinc-900/50 dark:text-zinc-200 dark:border-zinc-600';
    case ActivityCategory.SOCIAL: 
      return 'bg-transparent text-zinc-700 border-zinc-400 border-dashed dark:text-zinc-300 dark:border-zinc-500';
    default: 
      return 'bg-white text-zinc-500 border-zinc-100 dark:bg-zinc-950 dark:text-zinc-500 dark:border-zinc-800';
  }
};

const getDotColor = (category: ActivityCategory): string => {
   switch (category) {
    case ActivityCategory.WORK: return 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white';
    case ActivityCategory.HEALTH: return 'bg-white border-zinc-400 dark:bg-zinc-800 dark:border-zinc-500';
    case ActivityCategory.REST: return 'bg-zinc-300 dark:bg-zinc-600 border-zinc-300 dark:border-zinc-600';
    default: return 'bg-zinc-200 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-700';
   }
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, goalProgress, onReset }) => {
  
  const handleExportCalendar = () => {
    // Generate ICS content
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Goal App//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    const now = new Date();
    const dateString = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    
    plan.schedule.forEach((item) => {
      // Parse time "07:00 - 08:00" or "7:00 - 8:00"
      const timeMatch = item.time.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      
      if (timeMatch) {
        const startStr = timeMatch[1];
        const endStr = timeMatch[2];
        
        const formatTime = (timeStr: string) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          // Simple handling: assume schedule is for today
          // Need to pad with leading zeros
          const h = hours.toString().padStart(2, '0');
          const m = minutes.toString().padStart(2, '0');
          return `${dateString}T${h}${m}00`;
        };

        const dtStart = formatTime(startStr);
        const dtEnd = formatTime(endStr);
        
        icsContent += `BEGIN:VEVENT
SUMMARY:${item.activity}
DTSTART:${dtStart}
DTEND:${dtEnd}
DESCRIPTION:${item.description} - Tip: ${item.tip}
BEGIN:VALARM
TRIGGER:-PT0M
ACTION:DISPLAY
DESCRIPTION:${item.activity}
END:VALARM
END:VEVENT
`;
      }
    });

    icsContent += 'END:VCALENDAR';

    // Create and trigger download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'goal_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      const text = `🎯 My Goal Plan: ${plan.focusSummary}\n\n` + 
        plan.schedule.map(i => `${i.time} - ${i.activity}`).join('\n');
      
      try {
        await navigator.share({
          title: 'My Daily Goal Plan',
          text: text,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up transition-colors duration-300">
      {/* Header Card */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl mb-6 md:mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Your Personalized Flow
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm italic">"{plan.quote}"</p>
        </div>
        
        {/* Progress Display */}
        {goalProgress > 0 && (
          <div className="mb-6 max-w-sm mx-auto">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-400">Current Progress</span>
              <span className="text-[10px] md:text-xs font-mono font-bold text-zinc-900 dark:text-white">{goalProgress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-zinc-900 dark:bg-white transition-all duration-1000 ease-out"
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Focus Summary</h3>
          <p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">{plan.focusSummary}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-1 md:ml-6 space-y-6 md:space-y-8 pb-12">
        {plan.schedule.map((item, index) => (
          <div key={index} className="relative pl-6 md:pl-12 group">
            {/* Dot */}
            <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full shadow-sm border-2 ${getDotColor(item.category)}`}></div>

            {/* Content Card */}
            <div className={`p-4 md:p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${getCategoryColor(item.category)}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-mono opacity-80 font-semibold">{item.time}</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/20 dark:bg-black/20 mt-1 md:mt-0 w-fit">
                  {item.category}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">{item.activity}</h3>
              <p className="text-sm opacity-90 mb-4 font-medium">{item.description}</p>
              
              <div className="flex items-start gap-2 bg-black/5 dark:bg-white/10 p-3 rounded-lg text-sm border border-black/5 dark:border-white/5">
                <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="italic opacity-90 text-xs md:text-sm">{item.tip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 items-center justify-center pt-8 pb-12 px-4">
        {/* Action Buttons Row */}
        <div className="flex w-full md:w-auto gap-3">
          <button
            onClick={handleExportCalendar}
            className="flex-1 md:flex-none px-5 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Alarms
          </button>
          
          <button
            onClick={handleShare}
            className="flex-1 md:flex-none px-5 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>

        <button
          onClick={onReset}
          className="w-full md:w-auto px-8 py-3 rounded-full bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold transition-colors shadow-lg hover:shadow-xl text-sm md:text-base"
        >
          Create New Plan
        </button>
      </div>
    </div>
  );
};

export default PlanDisplay;