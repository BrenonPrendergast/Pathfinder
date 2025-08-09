// Achievement management operations

import {
  collection,
  doc,
  getDocs,
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
        const { type, targetValue, skillId } = achievement.criteria;
        let qualified = false;

        switch (type) {
          case 'level_reached':
            qualified = userStats.level >= targetValue;
            break;
          case 'quest_count':
            qualified = userStats.completedQuests.length >= targetValue;
            break;
          case 'skill_hours':
            if (skillId && userStats.skillHours[skillId]) {
              qualified = userStats.skillHours[skillId] >= targetValue;
            }
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

  // Seed achievements (for initial data population)
  async seedAchievements(achievements: Omit<Achievement, 'id' | 'createdAt'>[]): Promise<void> {
    const batch = writeBatch(db);
    
    achievements.forEach((achievement) => {
      const achievementRef = doc(collection(db, 'achievements'));
      batch.set(achievementRef, {
        ...achievement,
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();
  }
};