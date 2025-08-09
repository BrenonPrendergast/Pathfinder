// Achievement-related TypeScript interfaces and types

export interface AchievementCriteria {
  type: 'quest_count' | 'skill_hours' | 'level_reached' | 'streak_days' | 'career_completed';
  targetValue: number;
  skillId?: string;
  questType?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: 'skill' | 'quest' | 'milestone' | 'streak' | 'community';
  criteria: AchievementCriteria;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsReward: number;
  isActive: boolean;
  createdAt: Date;
}