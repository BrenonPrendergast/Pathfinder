// Skill System Types for Advanced Career Development

export enum SkillProficiencyLevel {
  LOCKED = 0,
  NOVICE = 1,
  BEGINNER = 2,
  INTERMEDIATE = 3,
  ADVANCED = 4,
  EXPERT = 5,
}

export enum SkillCategory {
  // Soft Skills Categories
  FOUNDATIONAL = 'foundational',
  PROBLEM_SOLVING = 'problem_solving',
  INTERPERSONAL = 'interpersonal',
  LEADERSHIP = 'leadership',
  
  // Hard Skills Categories (dynamic based on career)
  TECHNICAL = 'technical',
  ANALYTICAL = 'analytical',
  INDUSTRY_SPECIFIC = 'industry_specific',
  TOOLS_SOFTWARE = 'tools_software',
  METHODOLOGIES = 'methodologies',
}

export enum SkillType {
  SOFT = 'soft',
  HARD = 'hard',
}

// Base skill interface
export interface BaseSkill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  type: SkillType;
  prerequisites: string[]; // Array of skill IDs that must be unlocked first
  relatedCareers: string[]; // Career IDs where this skill is relevant
  onetCode?: string; // O*NET skill code if applicable
  estimatedHoursToMaster: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Gaming-style skill tree properties
  treePosition?: {
    x: number;
    y: number;
    tier: number; // 1-5, representing skill tier/level
  };
  maxPoints?: number; // Maximum points that can be allocated (usually 5)
  pointsPerLevel?: number; // Points needed per proficiency level
  iconName?: string; // Icon identifier for the skill
  unlockRequirements?: {
    minimumCareerLevel?: number;
    requiredQuests?: string[];
    requiredAchievements?: string[];
  };
  skillEffects?: {
    description: string;
    bonuses: string[];
  };
}

// Soft skills are universal across all users
export interface SoftSkill extends BaseSkill {
  type: SkillType.SOFT;
  universallyRelevant: true;
  defaultUnlocked: boolean; // Some foundational skills start unlocked
}

// Hard skills are career-specific
export interface HardSkill extends BaseSkill {
  type: SkillType.HARD;
  requiredForCareers: string[]; // Career IDs that require this skill
  skillLevel: 'entry' | 'intermediate' | 'advanced'; // Required level for career
  alternativeSkills?: string[]; // Other skills that can substitute for this one
}

// User's progress in a specific skill
export interface UserSkillProgress {
  userId: string;
  skillId: string;
  currentLevel: SkillProficiencyLevel;
  hoursLogged: number;
  lastUpdated: Date;
  experiencePoints: number; // XP gained specifically for this skill
  completedQuests: string[]; // Quest IDs that contributed to this skill
  certifications: string[]; // Certification IDs that boosted this skill
  selfAssessmentDate?: Date;
  selfAssessmentNotes?: string;
  verificationSource?: 'self' | 'quest' | 'certification' | 'external';
}

// Certification system
export interface Certification {
  id: string;
  name: string;
  provider: string; // Coursera, Credly, University, etc.
  url?: string;
  description: string;
  skillsUnlocked: string[]; // Skill IDs this certification unlocks/advances
  skillBoostAmount: number; // How much this cert advances related skills
  credlyBadgeId?: string; // For future Credly integration
  courseraId?: string; // For future Coursera integration
  dateEarned?: Date;
  expirationDate?: Date;
  verified: boolean;
}

// User's certifications
export interface UserCertification {
  userId: string;
  certificationId: string;
  dateEarned: Date;
  expirationDate?: Date;
  credentialUrl?: string;
  notes?: string;
  skillsAdvanced: { skillId: string; levelsGained: number }[];
}

// Career path with skills
export interface CareerPath {
  userId: string;
  careerId: string;
  careerTitle: string;
  isActive: boolean;
  requiredSkills: { skillId: string; minimumLevel: SkillProficiencyLevel }[];
  optionalSkills: { skillId: string; preferredLevel: SkillProficiencyLevel }[];
  progress: {
    completedSkills: number;
    totalSkills: number;
    percentage: number;
  };
  estimatedCompletionTime: number; // in months
  createdAt: Date;
  updatedAt: Date;
}

// Skill tree node for visualization
export interface SkillTreeNode {
  skill: BaseSkill;
  userProgress: UserSkillProgress | null;
  isUnlocked: boolean;
  isRecommended: boolean; // Based on user's career goals
  position: { x: number; y: number }; // For tree layout
  connections: string[]; // Connected skill IDs
  urgency: 'low' | 'medium' | 'high'; // Based on career timeline
}

// Skill assessment for onboarding and updates
export interface SkillAssessment {
  userId: string;
  assessmentDate: Date;
  skills: {
    skillId: string;
    currentLevel: SkillProficiencyLevel;
    confidence: 'low' | 'medium' | 'high';
    experience: string; // User's description of their experience
    yearsOfExperience?: number;
  }[];
  notes?: string;
}

// Career recommendation based on skills
export interface CareerRecommendation {
  careerId: string;
  careerTitle: string;
  matchPercentage: number;
  matchingSkills: string[]; // Skills user already has
  missingSkills: { skillId: string; gap: number }[]; // Skills needed and gap size
  estimatedTimeToReady: number; // months to reach minimum requirements
  confidenceScore: number; // Algorithm confidence in recommendation
  reasoning: string; // Why this career is recommended
}

// Skill development plan
export interface SkillDevelopmentPlan {
  userId: string;
  targetCareerId: string;
  plannedSkills: {
    skillId: string;
    currentLevel: SkillProficiencyLevel;
    targetLevel: SkillProficiencyLevel;
    estimatedHours: number;
    priority: 'low' | 'medium' | 'high';
    suggestedQuests: string[];
    suggestedCertifications: string[];
  }[];
  estimatedTimeline: number; // months
  createdAt: Date;
  lastUpdated: Date;
}

// Gaming-style skill tree node with allocated points
export interface GameSkillTreeNode {
  skill: BaseSkill;
  userProgress: UserSkillProgress | null;
  allocatedPoints: number; // Current points allocated by user
  isUnlocked: boolean;
  isAvailable: boolean; // Can be unlocked (prerequisites met)
  connections: string[]; // Connected skill IDs for visual lines
  nodeStyle: {
    color: string;
    glowEffect: boolean;
    pulseAnimation: boolean;
  };
  effects: {
    description: string;
    currentBonuses: string[];
    nextLevelPreview?: string;
  };
}

// Skill tree section for gaming-style layout
export interface GameSkillTreeSection {
  id: string;
  name: string;
  description: string;
  color: string;
  tier: number; // 1-5, representing difficulty/progression tier
  skills: GameSkillTreeNode[];
  completionPercentage: number;
  isUnlocked: boolean;
  backgroundPattern?: string; // CSS pattern for section background
}

// Complete skill tree data structure
export interface GameSkillTree {
  id: string;
  name: string;
  type: 'soft' | 'technical' | 'career-specific';
  careerId?: string;
  description: string;
  color: string;
  totalPoints: number;
  maxPoints: number;
  availablePoints: number;
  sections: GameSkillTreeSection[];
  unlockedNodes: number;
  totalNodes: number;
  progressLevel: number; // Overall tree mastery level
  specializations?: {
    id: string;
    name: string;
    requiredPoints: number;
    isUnlocked: boolean;
    benefits: string[];
  }[];
}

// Skill tree layout configuration
export interface SkillTreeLayout {
  treeType: 'soft' | 'hard';
  careerId?: string; // For hard skill trees
  nodes: SkillTreeNode[];
  connections: { from: string; to: string }[];
  layout: 'hierarchical' | 'circular' | 'force-directed';
}

export default {
  SkillProficiencyLevel,
  SkillCategory,
  SkillType,
};