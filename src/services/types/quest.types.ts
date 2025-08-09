// Quest-related TypeScript interfaces and types

export interface QuestSkillReward {
  skillId: string;
  skillName: string;
  hoursAwarded: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  instructions: string;
  type: 'course' | 'practice' | 'project' | 'assessment' | 'certification';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  skillRewards: QuestSkillReward[];
  estimatedHours: number;
  externalUrl?: string;
  prerequisites: string[];
  tags: string[];
  relatedCareers: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}