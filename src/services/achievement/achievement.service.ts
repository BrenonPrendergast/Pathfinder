// Achievement management operations

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  db
} from '../firebase/firestore-base';
import { convertTimestamps } from '../firebase/firestore-base';
import type { Achievement } from '../types';

export interface UserStats {
  level: number;
  totalXP: number;
  completedQuests: string[];
  skillHours: Record<string, number>;
  achievements: string[];
}

export const achievementService = {
  // Get all active achievements
  async getAchievements(): Promise<Achievement[]> {
    try {
      const q = query(
        collection(db, 'achievements'),
        where('isActive', '==', true),
        orderBy('rarity'),
        orderBy('createdAt')
      );

      const querySnapshot = await getDocs(q);
      const achievements: Achievement[] = [];
      
      querySnapshot.forEach((doc) => {
        achievements.push({
          id: doc.id,
          ...convertTimestamps(doc.data())
        } as Achievement);
      });

      return achievements;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  },

  // Check if user qualifies for achievements
  async checkAchievements(userId: string, userStats: UserStats): Promise<string[]> {
    const newAchievements: string[] = [];
    
    try {
      const achievements = await this.getAchievements();
      
      for (const achievement of achievements) {
        const { type, value, target } = achievement.criteria;
        let qualified = false;

        switch (type) {
          case 'xp_milestone':
            qualified = userStats.totalXP >= value;
            break;
          case 'quest_completion':
            qualified = userStats.completedQuests.length >= value;
            break;
          case 'skill_mastery':
            if (target && userStats.skillHours[target]) {
              qualified = userStats.skillHours[target] >= value;
            }
            break;
          case 'career_path':
            // This would check if user has explored enough careers
            qualified = false; // Placeholder for career path logic
            break;
          default:
            break;
        }

        if (qualified) {
          newAchievements.push(achievement.id);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  },

  // Create a new achievement
  async createAchievement(achievementData: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const achievementRef = doc(collection(db, 'achievements'));
      const newAchievement = {
        ...achievementData,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(achievementRef, newAchievement);
      return achievementRef.id;
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }
  },

  // Update an existing achievement
  async updateAchievement(achievementId: string, updateData: Partial<Omit<Achievement, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const achievementRef = doc(db, 'achievements', achievementId);
      await updateDoc(achievementRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating achievement:', error);
      throw error;
    }
  },

  // Delete an achievement (soft delete by setting isActive to false)
  async deleteAchievement(achievementId: string): Promise<void> {
    try {
      const achievementRef = doc(db, 'achievements', achievementId);
      await updateDoc(achievementRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting achievement:', error);
      throw error;
    }
  },

  // Get user achievement statistics for admin analytics
  async getUserAchievementStats(): Promise<UserStats[]> {
    try {
      // This would typically query user profiles and their achievements
      // For now, returning an empty array as a placeholder
      // In a full implementation, this would:
      // 1. Query all user profiles
      // 2. Count their achievements, XP, completed quests, etc.
      // 3. Return aggregated statistics
      
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const userStats: UserStats[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        userStats.push({
          level: userData.level || 1,
          totalXP: userData.totalXP || 0,
          completedQuests: userData.completedQuests || [],
          skillHours: userData.skillHours || {},
          achievements: userData.achievements || []
        } as UserStats);
      });
      
      return userStats;
    } catch (error) {
      console.error('Error fetching user achievement stats:', error);
      return [];
    }
  },

  // Seed achievements (for initial data population)
  async seedAchievements(achievements?: Omit<Achievement, 'id' | 'createdAt'>[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Default achievements if none provided
      const defaultAchievements = achievements || [
        {
          title: 'First Steps',
          description: 'Complete your first quest',
          category: 'quest_completion',
          badgeIcon: '🎯',
          xpReward: 50,
          isSecret: false,
          criteria: {
            type: 'quest_completion',
            value: 1,
            target: ''
          },
          rarity: 'common',
          isActive: true
        },
        {
          title: 'Knowledge Seeker',
          description: 'Reach 500 XP',
          category: 'learning_milestone',
          badgeIcon: '📚',
          xpReward: 100,
          isSecret: false,
          criteria: {
            type: 'xp_milestone',
            value: 500,
            target: ''
          },
          rarity: 'rare',
          isActive: true
        },
        {
          title: 'Skill Master',
          description: 'Reach advanced level in any skill',
          category: 'skill_mastery',
          badgeIcon: '⭐',
          xpReward: 200,
          isSecret: false,
          criteria: {
            type: 'skill_mastery',
            value: 1,
            target: 'advanced'
          },
          rarity: 'epic',
          isActive: true
        },
        {
          title: 'Career Explorer',
          description: 'Explore 5 different career paths',
          category: 'career_progress',
          badgeIcon: '🗺️',
          xpReward: 150,
          isSecret: false,
          criteria: {
            type: 'career_path',
            value: 5,
            target: ''
          },
          rarity: 'rare',
          isActive: true
        }
      ];
      
      defaultAchievements.forEach((achievement) => {
        const achievementRef = doc(collection(db, 'achievements'));
        batch.set(achievementRef, {
          ...achievement,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error seeding achievements:', error);
      throw error;
    }
  }
};