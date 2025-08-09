// User-related TypeScript interfaces and types

export type UserRole = 'user' | 'admin' | 'super_admin';

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

export interface UserMigrationResult {
  success: number;
  failed: number;
  total: number;
}