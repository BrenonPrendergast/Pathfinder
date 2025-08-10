// Achievement-related TypeScript interfaces and types

export interface AchievementCriteria {
  type: 'quest_completion' | 'xp_milestone' | 'skill_mastery' | 'career_path' | 'custom';
  value: number;
  target: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: 'career_progress' | 'skill_mastery' | 'quest_completion' | 'learning_milestone' | 'engagement';
  criteria: AchievementCriteria;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  isSecret: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}