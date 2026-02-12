
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface ClassSchedule {
  id: string;
  name: string;
  location: string;
  time: string;
  daysOfWeek: DayOfWeek[];
  quantityPerWeek: number;
}

export interface SyncHistoryEntry {
  id: string;
  name: string;
  points: number;
  timestamp: string; // ISO String
}

export interface RedemptionHistoryEntry {
  id: string;
  rewardName: string;
  cost: number;
  timestamp: string; // ISO String
}

export interface Buddy {
  id: string;
  name: string;
  initials: string;
  sharedClasses: string[];
  attendingClasses: string[]; 
}

export interface StudySession {
  id: string;
  date: string; // ISO String
  duration: number; // minutes
  pointsEarned: number;
  buddiesInvolved: string[]; // IDs
}

export interface UserState {
  id: string;
  name: string;
  major: string;
  email: string;
  password?: string;
  totalPoints: number;
  dailyPoints: number;
  dailyGoal: number;
  streak: number;
  lastActiveDate: string; // ISO String
  lastCheckInDates: Record<string, string>; // { classId: lastDateCheckedInISO }
  classes: ClassSchedule[];
  totalCheckIns: number;
  totalSessions: number;
  friendsCount: number;
  syncHistory: SyncHistoryEntry[];
  redemptionHistory: RedemptionHistoryEntry[];
  buddies: Buddy[];
  studyLog: StudySession[];
  dailyStudyPoints: number;
}

export interface AppContextType {
  user: UserState | null;
  loading: boolean;
  checkIn: (classId: string, buddyCount?: number) => void;
  updateDailyGoal: (goal: number) => void;
  addClass: (newClass: ClassSchedule) => void;
  removeClass: (id: string) => void;
  editClass: (updatedClass: ClassSchedule) => void;
  getInitials: () => string;
  updateSettings: (email: string, password?: string) => Promise<void>;
  deleteAccount: () => void;
  performGroupSync: (targetId: string, sharedClasses?: string[]) => Promise<void>;
  findUserById: (id: string) => Promise<{ name: string; email: string; uid: string } | null>;
  logStudySession: (minutes: number, selectedBuddyIds: string[]) => void;
  redeemReward: (rewardName: string, cost: number) => boolean;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (newName: string) => Promise<void>;
}
