// Authentication context for Pathfinder
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// User role types
export type UserRole = 'user' | 'admin' | 'super_admin';

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  level: number;
  xp: number;
  totalXP: number;
  currentCareerPath?: string;
  completedQuests: string[];
  activeQuests: string[];
  unlockedAchievements: string[];
  skillHours: Record<string, number>;
  createdAt: Date;
  lastActive: Date;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  completeQuest: (questId: string, xpReward: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to remove undefined values from object
  const removeUndefinedFields = (obj: any): any => {
    const result: any = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    });
    return result;
  };

  // Calculate level based on XP (classic RPG progression)
  const calculateLevel = (xp: number): number => {
    if (xp < 100) return 1;
    return Math.floor(Math.log2(xp / 50)) + 1;
  };

  // Create or get user profile from Firestore
  const createUserProfile = async (user: FirebaseUser, additionalData?: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile with gamification defaults
      const baseProfile = {
        email: user.email!,
        role: 'user' as UserRole, // Default role for new users
        level: 1,
        xp: 0,
        totalXP: 0,
        completedQuests: [],
        activeQuests: [],
        unlockedAchievements: ['welcome-badge'], // Give welcome achievement
        skillHours: {},
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      };

      // Add optional fields only if they exist
      const optionalFields: any = {};
      if (user.displayName) {
        optionalFields.displayName = user.displayName;
      }
      if (user.photoURL) {
        optionalFields.photoURL = user.photoURL;
      }
      if (additionalData) {
        Object.assign(optionalFields, removeUndefinedFields(additionalData));
      }

      const newProfile = { ...baseProfile, ...optionalFields };
      await setDoc(userRef, newProfile);

      const fullProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        role: 'user' as UserRole,
        level: 1,
        xp: 0,
        totalXP: 0,
        completedQuests: [],
        activeQuests: [],
        unlockedAchievements: ['welcome-badge'],
        skillHours: {},
        createdAt: new Date(),
        lastActive: new Date(),
        ...removeUndefinedFields(additionalData || {})
      };

      setUserProfile(fullProfile);
      return fullProfile;
    } else {
      // Update last active timestamp
      await updateDoc(userRef, {
        lastActive: serverTimestamp()
      });

      // Convert Firestore data to UserProfile
      const userData = userSnap.data();
      const profile: UserProfile = {
        uid: user.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role || 'user', // Default to 'user' for existing profiles
        level: userData.level || 1,
        xp: userData.xp || 0,
        totalXP: userData.totalXP || 0,
        currentCareerPath: userData.currentCareerPath,
        completedQuests: userData.completedQuests || [],
        activeQuests: userData.activeQuests || [],
        unlockedAchievements: userData.unlockedAchievements || [],
        skillHours: userData.skillHours || {},
        createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : new Date(),
        lastActive: userData.lastActive instanceof Timestamp ? userData.lastActive.toDate() : new Date()
      };

      setUserProfile(profile);
      return profile;
    }
  };

  // Authentication methods
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      await createUserProfile(user, { displayName });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const { user } = await signInWithPopup(auth, provider);
      await createUserProfile(user);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Gamification methods
  const addXP = async (amount: number) => {
    if (!currentUser || !userProfile) return;

    const newXP = userProfile.xp + amount;
    const newTotalXP = userProfile.totalXP + amount;
    const newLevel = calculateLevel(newTotalXP);

    const updates = {
      xp: newXP,
      totalXP: newTotalXP,
      level: newLevel,
      lastActive: new Date()
    };

    await updateUserProfile(updates);
  };

  const completeQuest = async (questId: string, xpReward: number) => {
    if (!currentUser || !userProfile) return;

    const updatedCompletedQuests = [...userProfile.completedQuests, questId];
    const updatedActiveQuests = userProfile.activeQuests.filter(id => id !== questId);

    await addXP(xpReward);
    await updateUserProfile({
      completedQuests: updatedCompletedQuests,
      activeQuests: updatedActiveQuests
    });
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user logged in');

    const userRef = doc(db, 'users', currentUser.uid);
    
    // Remove undefined values and convert Date objects to Firestore timestamps
    const cleanUpdates = removeUndefinedFields(updates);
    const firestoreUpdates: any = { ...cleanUpdates };
    if (updates.lastActive) {
      firestoreUpdates.lastActive = serverTimestamp();
    }

    await updateDoc(userRef, firestoreUpdates);

    // Update local state
    if (userProfile) {
      const updatedProfile = { 
        ...userProfile, 
        ...updates, 
        lastActive: new Date() 
      };
      setUserProfile(updatedProfile);
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        
        if (user) {
          await createUserProfile(user);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Admin permission helpers
  const isAdmin = (): boolean => {
    return userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
  };

  const isSuperAdmin = (): boolean => {
    return userProfile?.role === 'super_admin';
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile,
    addXP,
    completeQuest,
    isAdmin,
    isSuperAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};