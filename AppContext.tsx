import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserState, ClassSchedule, AppContextType, SyncHistoryEntry, StudySession, Buddy, RedemptionHistoryEntry } from './types';

const STORAGE_KEY = 'sync_code_user_data';

const MOCK_BUDDIES: Buddy[] = [
  { id: 'b1', name: 'Sarah Miller', initials: 'SM', sharedClasses: ['Accounting 101'], attendingClasses: ['Accounting 101', 'Marketing 201'] },
  { id: 'b2', name: 'James Low', initials: 'JL', sharedClasses: [], attendingClasses: ['Marketing 201'] },
  { id: 'b3', name: 'Emma Rose', initials: 'ER', sharedClasses: ['Accounting 101'], attendingClasses: ['Accounting 101'] },
  { id: 'b4', name: 'Oliver Twist', initials: 'OT', sharedClasses: [], attendingClasses: ['UX Design 101'] },
  { id: 'b5', name: 'Kate Lane', initials: 'KL', sharedClasses: ['Marketing 201'], attendingClasses: ['Marketing 201', 'Accounting 101'] },
  { id: 'b6', name: 'Olivia Todd', initials: 'OT', sharedClasses: ['Accounting 101'], attendingClasses: ['Accounting 101'] },
];

const DEFAULT_USER: UserState = {
  id: "SYNC-BRU-7721",
  name: "Bruno Ashton",
  major: "Freshman - UX Design",
  email: "bruno.ashton@university.edu",
  password: "password123",
  totalPoints: 850,
  dailyPoints: 70,
  dailyGoal: 1000,
  streak: 7,
  lastActiveDate: new Date().toISOString(),
  lastCheckInDates: {},
  classes: [
    {
      id: '1',
      name: 'Accounting 101',
      location: 'Tanner Building',
      time: '08:00 AM',
      daysOfWeek: ['Mon', 'Wed', 'Fri'],
      quantityPerWeek: 3
    }
  ],
  totalSessions: 15,
  friendsCount: 6,
  syncHistory: [
    { id: 'h1', name: 'Sarah M.', points: 50, timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { id: 'h2', name: 'James L.', points: 50, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
  ],
  redemptionHistory: [],
  buddies: MOCK_BUDDIES,
  studyLog: [],
  dailyStudyPoints: 0
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed) return DEFAULT_USER;
        
        const today = new Date();
        const lastActive = new Date(parsed.lastActiveDate);
        
        const todayStr = today.toDateString();
        const lastActiveStr = lastActive.toDateString();

        if (todayStr === lastActiveStr) {
          return parsed;
        }

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let updatedStreak = parsed.streak;
        if (lastActiveStr === yesterdayStr) {
          updatedStreak += 1;
        } else {
          updatedStreak = 1;
        }

        return {
          ...parsed,
          dailyPoints: 0,
          dailyStudyPoints: 0, 
          streak: updatedStreak,
          lastActiveDate: today.toISOString()
        };
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const checkIn = (classId: string, buddyCount: number = 0) => {
    if (!user) return;
    const today = new Date().toDateString();
    if (user.lastCheckInDates[classId] === today) return;

    const pointsEarned = 50 + (buddyCount * 10);

    setUser(prev => prev ? ({
      ...prev,
      dailyPoints: prev.dailyPoints + pointsEarned,
      totalPoints: prev.totalPoints + pointsEarned,
      lastCheckInDates: {
        ...prev.lastCheckInDates,
        [classId]: today
      }
    }) : null);
  };

  const logStudySession = (minutes: number, selectedBuddyIds: string[]) => {
    if (!user || minutes <= 0) return;

    const basePoints = Math.floor(minutes / 30) * 10;
    
    let buddyBonus = 0;
    selectedBuddyIds.forEach(id => {
      const buddy = user.buddies.find(b => b.id === id);
      if (buddy) {
        buddyBonus += (buddy.sharedClasses && buddy.sharedClasses.length > 0) ? 20 : 10;
      }
    });

    const totalEarned = basePoints + buddyBonus;
    const newSession: StudySession = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      duration: minutes,
      pointsEarned: totalEarned,
      buddiesInvolved: selectedBuddyIds
    };

    setUser(prev => prev ? ({
      ...prev,
      dailyPoints: prev.dailyPoints + totalEarned,
      totalPoints: prev.totalPoints + totalEarned,
      dailyStudyPoints: prev.dailyStudyPoints + totalEarned,
      totalSessions: prev.totalSessions + 1,
      studyLog: [newSession, ...prev.studyLog]
    }) : null);
  };

  const updateDailyGoal = (goal: number) => {
    setUser(prev => prev ? ({ ...prev, dailyGoal: goal }) : null);
  };

  const addClass = (newClass: ClassSchedule) => {
    setUser(prev => prev ? ({ ...prev, classes: [...prev.classes, newClass] }) : null);
  };

  const removeClass = (id: string) => {
    setUser(prev => prev ? ({ ...prev, classes: prev.classes.filter(c => c.id !== id) }) : null);
  };

  const editClass = (updatedClass: ClassSchedule) => {
    setUser(prev => prev ? ({
      ...prev,
      classes: prev.classes.map(c => c.id === updatedClass.id ? updatedClass : c)
    }) : null);
  };

  const updateSettings = (email: string, password?: string) => {
    setUser(prev => prev ? ({
      ...prev,
      email,
      ...(password ? { password } : {})
    }) : null);
  };

  const deleteAccount = () => {
    setUser(null);
  };

  const performGroupSync = (targetId: string, sharedClasses: string[] = []) => {
    if (!user || targetId === user.id) return;
    
    const buddyExists = user.buddies.some(b => b.id === targetId);
    const friendIdPart = targetId.split('-').pop() || 'Unknown';
    const friendName = targetId === 'SYNC-JOR-1234' ? 'Jordan Smith' : `Sync Buddy ${friendIdPart}`;
    const initials = friendName.split(' ').map(n => n[0]).join('').toUpperCase();

    const attendingClasses = targetId === 'SYNC-JOR-1234' 
      ? ['Accounting 101', 'History 101', 'Calculus II', 'Intro to UX'] 
      : (user.classes.length > 0 ? [user.classes[0].name] : []);

    const newBuddy: Buddy = {
      id: targetId,
      name: friendName,
      initials: initials,
      sharedClasses: sharedClasses,
      attendingClasses: Array.from(new Set([...attendingClasses, ...sharedClasses]))
    };

    const newEntry: SyncHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: friendName,
      points: 50,
      timestamp: new Date().toISOString()
    };

    setUser(prev => {
      if (!prev) return null;
      
      const updatedBuddies = buddyExists 
        ? prev.buddies.map(b => b.id === targetId ? { 
            ...b, 
            sharedClasses: Array.from(new Set([...b.sharedClasses, ...sharedClasses])),
            attendingClasses: Array.from(new Set([...b.attendingClasses, ...sharedClasses]))
          } : b)
        : [...prev.buddies, newBuddy];

      return {
        ...prev,
        totalPoints: prev.totalPoints + 50,
        dailyPoints: prev.dailyPoints + 50,
        syncHistory: [newEntry, ...prev.syncHistory].slice(0, 5),
        buddies: updatedBuddies,
        friendsCount: updatedBuddies.length
      };
    });
  };

  const redeemReward = (rewardName: string, cost: number): boolean => {
    if (!user || user.totalPoints < cost) return false;

    const newRedemption: RedemptionHistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      rewardName,
      cost,
      timestamp: new Date().toISOString()
    };

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        totalPoints: prev.totalPoints - cost,
        redemptionHistory: [newRedemption, ...prev.redemptionHistory]
      };
    });

    return true;
  };

  const getInitials = () => {
    if (!user || !user.name) return "??";
    const parts = user.name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <AppContext.Provider value={{ 
      user, checkIn, updateDailyGoal, addClass, removeClass, editClass, 
      getInitials, updateSettings, deleteAccount, performGroupSync, logStudySession,
      redeemReward
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
