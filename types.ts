export enum PlanLevel {
  BASIC = 'Basic Structure',
  BALANCED = 'Balanced Flow',
  ADVANCED = 'High Performance'
}

export enum ActivityCategory {
  WORK = 'Work',
  HEALTH = 'Health',
  REST = 'Rest',
  LEARNING = 'Learning',
  SOCIAL = 'Social',
  OTHER = 'Other'
}

export interface ScheduleItem {
  time: string;
  activity: string;
  category: ActivityCategory;
  description: string;
  tip: string;
}

export interface DailyPlan {
  quote: string;
  focusSummary: string;
  schedule: ScheduleItem[];
}

export interface UserPreferences {
  wakeTime: string;
  bedTime: string;
  mainGoal: string;
  goalProgress: number;
  mood: string;
  level: PlanLevel;
  userName?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  userName: string;
  defaultWakeTime: string;
  defaultBedTime: string;
  theme: ThemeMode;
}