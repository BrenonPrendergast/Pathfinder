import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

export interface SiteStats {
  activeUsers: number;
  careerPaths: number;
  totalQuests: number;
  totalAchievements: number;
}

export const statsService = {
  async getSiteStats(): Promise<SiteStats> {
    try {
      // Get active users (users with totalXP > 0)
      const usersQuery = query(
        collection(db, 'users'),
        where('totalXP', '>', 0)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const activeUsers = usersSnapshot.size;

      // Get total career paths
      const careersSnapshot = await getDocs(collection(db, 'careers'));
      const careerPaths = careersSnapshot.size;

      // Get total quests
      const questsSnapshot = await getDocs(collection(db, 'quests'));
      const totalQuests = questsSnapshot.size;

      // Get total achievements
      const achievementsSnapshot = await getDocs(collection(db, 'achievements'));
      const totalAchievements = achievementsSnapshot.size;

      return {
        activeUsers,
        careerPaths,
        totalQuests,
        totalAchievements
      };
    } catch (error) {
      console.error('Error fetching site stats:', error);
      // Return fallback values if there's an error
      return {
        activeUsers: 0,
        careerPaths: 0,
        totalQuests: 0,
        totalAchievements: 0
      };
    }
  },

  formatNumber(num: number): string {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}k+`;
    }
    return num.toString();
  }
};