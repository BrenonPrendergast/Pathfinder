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
import { careerService } from '../services';

// User role types
export type UserRole = 'user' | 'admin' | 'super_admin';

// Career progress tracking
export interface CareerProgress {
  careerId: string;
  careerTitle: string;
  isActive: boolean;
  progressPercentage: number;
  skillsCompleted: number;
  skillsTotal: number;
  estimatedCompletionMonths: number;
  startedAt: Date;
  lastUpdated: Date;
}

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
  careerPaths: CareerProgress[];
  completedQuests: string[];
  activeQuests: string[];
  unlockedAchievements: string[];
  skillHours: Record<string, number>;
  skillProficiencies: Record<string, number>; // skill_id -> proficiency level (1-5)
  learningPreferences: {
    preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
    timeCommitmentHours: number; // weekly hours
    focusAreas: string[]; // skill categories of interest
  };
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
  completeQuest: (questId: string, xpReward: number, skillRewards?: Array<{skillId: string; hoursAwarded: number}>) => Promise<void>;
  addCareerPath: (careerId: string, careerTitle: string) => Promise<void>;
  updateCareerProgress: (careerId: string, updates: Partial<CareerProgress>) => Promise<void>;
  setActiveCareerPath: (careerId: string) => Promise<void>;
  updateSkillProficiency: (skillId: string, level: number) => Promise<void>;
  updateCareerProgressFromSkills: () => Promise<void>;
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
        careerPaths: [],
        completedQuests: [],
        activeQuests: [],
        unlockedAchievements: ['welcome-badge'], // Give welcome achievement
        skillHours: {},
        skillProficiencies: {},
        learningPreferences: {
          preferredDifficulty: 'beginner' as const,
          timeCommitmentHours: 5, // 5 hours per week default
          focusAreas: []
        },
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
        careerPaths: [],
        completedQuests: [],
        activeQuests: [],
        unlockedAchievements: ['welcome-badge'],
        skillHours: {},
        skillProficiencies: {},
        learningPreferences: {
          preferredDifficulty: 'beginner' as const,
          timeCommitmentHours: 5,
          focusAreas: []
        },
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
        careerPaths: userData.careerPaths || [],
        completedQuests: userData.completedQuests || [],
        activeQuests: userData.activeQuests || [],
        unlockedAchievements: userData.unlockedAchievements || [],
        skillHours: userData.skillHours || {},
        skillProficiencies: userData.skillProficiencies || {},
        learningPreferences: userData.learningPreferences || {
          preferredDifficulty: 'beginner' as const,
          timeCommitmentHours: 5,
          focusAreas: []
        },
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

  const completeQuest = async (questId: string, xpReward: number, skillRewards?: Array<{skillId: string; hoursAwarded: number}>) => {
    if (!currentUser || !userProfile) return;

    const updatedCompletedQuests = [...userProfile.completedQuests, questId];
    const updatedActiveQuests = userProfile.activeQuests.filter(id => id !== questId);

    // Update skill hours if skill rewards are provided
    let updatedSkillHours = { ...userProfile.skillHours };
    let updatedSkillProficiencies = { ...userProfile.skillProficiencies };
    
    if (skillRewards) {
      for (const skillReward of skillRewards) {
        // Add hours to skill
        const currentHours = updatedSkillHours[skillReward.skillId] || 0;
        const newHours = currentHours + skillReward.hoursAwarded;
        updatedSkillHours[skillReward.skillId] = newHours;
        
        // Auto-advance skill proficiency based on hours
        const currentProficiency = updatedSkillProficiencies[skillReward.skillId] || 1;
        let newProficiency = currentProficiency;
        
        // Simple progression: every 20 hours = 1 proficiency level (max 5)
        if (newHours >= 100 && currentProficiency < 5) newProficiency = 5; // Expert
        else if (newHours >= 60 && currentProficiency < 4) newProficiency = 4; // Advanced
        else if (newHours >= 35 && currentProficiency < 3) newProficiency = 3; // Intermediate
        else if (newHours >= 15 && currentProficiency < 2) newProficiency = 2; // Beginner
        
        if (newProficiency > currentProficiency) {
          updatedSkillProficiencies[skillReward.skillId] = newProficiency;
        }
      }
    }

    await addXP(xpReward);
    await updateUserProfile({
      completedQuests: updatedCompletedQuests,
      activeQuests: updatedActiveQuests,
      skillHours: updatedSkillHours,
      skillProficiencies: updatedSkillProficiencies
    });

    // Update career progress for all active career paths
    await updateCareerProgressFromSkills();
  };

  // Career Path Management Methods
  const addCareerPath = async (careerId: string, careerTitle: string) => {
    if (!currentUser || !userProfile) return;

    const existingPath = userProfile.careerPaths.find(path => path.careerId === careerId);
    if (existingPath) return; // Already exists

    const newCareerPath: CareerProgress = {
      careerId,
      careerTitle,
      isActive: false,
      progressPercentage: 0,
      skillsCompleted: 0,
      skillsTotal: 0, // Will be calculated based on career requirements
      estimatedCompletionMonths: 12, // Default estimate
      startedAt: new Date(),
      lastUpdated: new Date()
    };

    const updatedCareerPaths = [...userProfile.careerPaths, newCareerPath];
    await updateUserProfile({ careerPaths: updatedCareerPaths });
  };

  const updateCareerProgress = async (careerId: string, updates: Partial<CareerProgress>) => {
    if (!currentUser || !userProfile) return;

    const updatedCareerPaths = userProfile.careerPaths.map(path =>
      path.careerId === careerId 
        ? { ...path, ...updates, lastUpdated: new Date() }
        : path
    );

    await updateUserProfile({ careerPaths: updatedCareerPaths });
  };

  const setActiveCareerPath = async (careerId: string) => {
    if (!currentUser || !userProfile) return;

    // Set all paths to inactive, then set the selected one as active
    const updatedCareerPaths = userProfile.careerPaths.map(path => ({
      ...path,
      isActive: path.careerId === careerId,
      lastUpdated: new Date()
    }));

    await updateUserProfile({ 
      currentCareerPath: careerId,
      careerPaths: updatedCareerPaths 
    });
  };

  const updateSkillProficiency = async (skillId: string, level: number) => {
    if (!currentUser || !userProfile) return;

    const updatedProficiencies = {
      ...userProfile.skillProficiencies,
      [skillId]: level
    };

    await updateUserProfile({ skillProficiencies: updatedProficiencies });
  };

  const updateCareerProgressFromSkills = async () => {
    if (!currentUser || !userProfile) return;

    const updatedCareerPaths = await Promise.all(
      userProfile.careerPaths.map(async (careerPath) => {
        try {
          // Get career details to understand skill requirements
          const career = await careerService.getCareer(careerPath.careerId);
          if (!career) return careerPath;

          // Calculate progress based on user's skill proficiencies vs career requirements
          let skillsCompleted = 0;
          const totalSkills = career.skills.length;

          for (const careerSkill of career.skills) {
            const skillId = `${careerSkill.skillName.toLowerCase().replace(/\s+/g, '_')}`;
            const userProficiency = userProfile.skillProficiencies[skillId] || 0;
            const requiredLevel = careerSkill.proficiencyLevel || 3; // Default to intermediate

            if (userProficiency >= requiredLevel) {
              skillsCompleted++;
            }
          }

          const progressPercentage = totalSkills > 0 ? Math.round((skillsCompleted / totalSkills) * 100) : 0;
          
          // Estimate completion time based on remaining skills and user's time commitment
          const remainingSkills = totalSkills - skillsCompleted;
          const weeklyHours = userProfile.learningPreferences.timeCommitmentHours;
          const estimatedWeeks = remainingSkills * 4; // 4 weeks per skill average
          const estimatedMonths = Math.ceil(estimatedWeeks / 4);

          return {
            ...careerPath,
            progressPercentage,
            skillsCompleted,
            skillsTotal: totalSkills,
            estimatedCompletionMonths: Math.max(1, estimatedMonths),
            lastUpdated: new Date()
          };
        } catch (error) {
          console.error('Error updating career progress:', error);
          return careerPath;
        }
      })
    );

    await updateUserProfile({ careerPaths: updatedCareerPaths });
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
    isSuperAdmin,
    addCareerPath,
    updateCareerProgress,
    setActiveCareerPath,
    updateSkillProficiency,
    updateCareerProgressFromSkills
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};