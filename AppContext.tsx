
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserState, ClassSchedule, AppContextType, SyncHistoryEntry, StudySession, Buddy, RedemptionHistoryEntry } from './types';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const STORAGE_PREFIX = 'sync_code_user_';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to load user-specific data from storage
  const loadUserData = (fbUser: FirebaseUser): UserState => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${fbUser.uid}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date();
        const lastActive = new Date(parsed.lastActiveDate);
        
        // Update user state with latest Firebase info (name/email) if changed
        const updatedFromFirebase = {
          ...parsed,
          name: fbUser.displayName || parsed.name || "User",
          email: fbUser.email || parsed.email || "",
          totalCheckIns: parsed.totalCheckIns || 0
        };

        if (today.toDateString() === lastActive.toDateString()) {
          return updatedFromFirebase;
        }

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        let updatedStreak = parsed.streak;
        if (lastActive.toDateString() === yesterday.toDateString()) {
          updatedStreak += 1;
        } else {
          updatedStreak = 1;
        }

        return {
          ...updatedFromFirebase,
          dailyPoints: 0,
          dailyStudyPoints: 0, 
          streak: updatedStreak,
          lastActiveDate: today.toISOString()
        };
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    // Default state for new authenticated user
    return {
      id: fbUser.uid,
      name: fbUser.displayName || "New User",
      major: "Student",
      email: fbUser.email || "",
      totalPoints: 0,
      dailyPoints: 0,
      dailyGoal: 1000,
      streak: 1,
      lastActiveDate: new Date().toISOString(),
      lastCheckInDates: {},
      classes: [],
      totalCheckIns: 0,
      totalSessions: 0,
      friendsCount: 0,
      syncHistory: [],
      redemptionHistory: [],
      buddies: [],
      studyLog: [],
      dailyStudyPoints: 0
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const userData = loadUserData(fbUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      localStorage.setItem(`${STORAGE_PREFIX}${user.id}`, JSON.stringify(user));
    }
  }, [user]);

  // Auth Actions
  const signup = async (email: string, password: string, fullName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;
    
    // Crucial Step: Wait for profile update to finish
    await updateProfile(fbUser, { displayName: fullName });
    
    // Create Firestore database entry for public profile
    try {
      await setDoc(doc(db, "users", fbUser.uid), {
        name: fullName,
        email: email,
        uid: fbUser.uid,
        photoURL: "",
        classes: [] 
      });
    } catch (dbError: any) {
      console.error("Firestore permission error during signup:", dbError);
      if (dbError.code === 'permission-denied') {
        throw new Error("PROFILE_DB_ERROR");
      }
    }
    
    const userData = loadUserData(fbUser);
    setUser({ ...userData, name: fullName });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateName = async (newName: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: newName });
      // Also update Firestore
      await setDoc(doc(db, "users", auth.currentUser.uid), { name: newName }, { merge: true });
      setUser(prev => prev ? ({ ...prev, name: newName }) : null);
    }
  };

  const checkIn = (classId: string, buddyCount: number = 0) => {
    if (!user) return;
    const today = new Date().toDateString();
    if (user.lastCheckInDates[classId] === today) return;

    const pointsEarned = 50 + (buddyCount * 10);
    setUser(prev => prev ? ({
      ...prev,
      dailyPoints: prev.dailyPoints + pointsEarned,
      totalPoints: prev.totalPoints + pointsEarned,
      totalCheckIns: (prev.totalCheckIns || 0) + 1,
      lastCheckInDates: { ...prev.lastCheckInDates, [classId]: today }
    }) : null);
  };

  const logStudySession = (minutes: number, selectedBuddyIds: string[]) => {
    if (!user || minutes <= 0) return;
    const basePoints = Math.floor(minutes / 30) * 10;
    let buddyBonus = 0;
    selectedBuddyIds.forEach(id => {
      const buddy = user.buddies.find(b => b.id === id);
      if (buddy) buddyBonus += (buddy.sharedClasses?.length > 0) ? 20 : 10;
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

  const updateSettings = async (email: string, password?: string) => {
    if (!auth.currentUser) return;

    try {
      if (password) {
        await updatePassword(auth.currentUser, password);
      }
      
      setUser(prev => prev ? ({ ...prev, email }) : null);
    } catch (error) {
      console.error("Error updating settings", error);
      throw error;
    }
  };

  const deleteAccount = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      currentUser.delete().then(() => {
        localStorage.removeItem(`${STORAGE_PREFIX}${currentUser.uid}`);
        setUser(null);
      }).catch(err => console.error("Error deleting account", err));
    }
  };

  const findUserById = async (id: string) => {
    try {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as { name: string; email: string; uid: string };
      }
      return null;
    } catch (error: any) {
      console.error("Firestore error in findUserById:", error);
      if (error.code === 'permission-denied') {
        throw new Error("PERMISSION_DENIED");
      }
      throw error;
    }
  };

  const performGroupSync = async (targetId: string, sharedClasses: string[] = []) => {
    if (!user) return;
    if (targetId === user.id) throw new Error("You cannot sync with yourself!");

    // Lookup real profile from Firestore
    const userData = await findUserById(targetId);
    if (!userData) throw new Error("User not found");

    const friendName = userData.name;
    const initials = friendName.split(' ').map(n => n[0]).join('').toUpperCase();
    const buddyExists = user.buddies.some(b => b.id === targetId);

    const newBuddy: Buddy = {
      id: targetId,
      name: friendName,
      initials: initials,
      sharedClasses: sharedClasses,
      attendingClasses: sharedClasses
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
        ? prev.buddies.map(b => b.id === targetId ? { ...b, sharedClasses: Array.from(new Set([...b.sharedClasses, ...sharedClasses])) } : b)
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
      rewardName, cost, timestamp: new Date().toISOString()
    };
    setUser(prev => prev ? ({
      ...prev,
      totalPoints: prev.totalPoints - cost,
      redemptionHistory: [newRedemption, ...prev.redemptionHistory]
    }) : null);
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
      user, loading, checkIn, updateDailyGoal, addClass, removeClass, editClass, 
      getInitials, updateSettings, deleteAccount, performGroupSync, findUserById, logStudySession,
      redeemReward, signup, login, logout, updateName
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
