// Career Assessment Types
export interface PersonalityTraits {
  openness: number; // 1-7 scale
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface WorkStylePreferences {
  teamOriented: number; // 1-7 scale (1=Individual, 7=Team)
  structuredFlexible: number; // 1=Highly Structured, 7=Highly Flexible
  analyticalCreative: number; // 1=Analytical, 7=Creative
  detailOriented: number; // 1-7 scale
  riskTolerance: number; // 1=Risk Averse, 7=Risk Seeking
  independenceSupervision: number; // 1=Needs Supervision, 7=Highly Independent
}

export interface WorkEnvironmentPreferences {
  remotePreference: 'office' | 'hybrid' | 'remote' | 'no_preference';
  companySizePreference: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | 'no_preference';
  industryPacePreference: 'stable' | 'moderate' | 'fast_paced' | 'no_preference';
  travelWillingness: 'none' | 'minimal' | 'moderate' | 'frequent' | 'extensive';
  workLifeBalance: number; // 1-7 scale (1=Career First, 7=Life First)
}

export interface CareerValues {
  compensation: number; // 1-7 importance scale
  workLifeBalance: number;
  jobSecurity: number;
  careerGrowth: number;
  creativity: number;
  autonomy: number;
  socialImpact: number;
  intellectualChallenge: number;
  recognition: number;
  leadership: number;
  variety: number;
  stability: number;
}

export interface SkillsAndInterests {
  currentSoftSkills: Record<string, number>; // skill -> proficiency (1-7)
  technicalInterests: string[]; // Array of technical areas of interest
  preferredActivities: string[]; // Array of preferred work activities
  learningStyle: ('visual' | 'auditory' | 'kinesthetic' | 'reading')[];
  problemSolvingStyle: 'systematic' | 'intuitive' | 'collaborative' | 'independent';
}

export interface ExperienceAndGoals {
  experienceLevel: 'entry_level' | 'some_experience' | 'mid_career' | 'senior' | 'executive';
  currentRole?: string;
  industryExperience: string[]; // Array of industries
  careerChangeReason?: 'growth' | 'better_fit' | 'compensation' | 'work_life_balance' | 'industry_interest' | 'other';
  timelineGoal: 'immediate' | '1_2_years' | '3_5_years' | 'long_term';
  salaryExpectations?: {
    min: number;
    max: number;
    priority: number; // 1-7 importance scale
  };
  locationFlexibility: 'local_only' | 'regional' | 'national' | 'international';
}

export interface CareerAssessmentData {
  userId: string;
  completedAt: Date;
  personalityTraits: PersonalityTraits;
  workStylePreferences: WorkStylePreferences;
  workEnvironmentPreferences: WorkEnvironmentPreferences;
  careerValues: CareerValues;
  skillsAndInterests: SkillsAndInterests;
  experienceAndGoals: ExperienceAndGoals;
  assessmentVersion: string; // For tracking changes over time
}

export interface AssessmentQuestion {
  id: string;
  category: 'personality' | 'work_style' | 'work_environment' | 'values' | 'skills' | 'experience';
  questionText: string;
  questionType: 'scale' | 'multiple_choice' | 'multi_select' | 'text';
  scaleLabels?: {
    low: string;
    high: string;
  };
  options?: { value: string; label: string; description?: string }[];
  required: boolean;
  helpText?: string;
}

export interface AssessmentProgress {
  currentSection: number;
  totalSections: number;
  currentQuestion: number;
  totalQuestions: number;
  completedSections: string[];
  timeStarted: Date;
  estimatedTimeRemaining: number; // minutes
}

export interface CareerMatchResult {
  careerId: string;
  careerTitle: string;
  overallMatch: number; // 0-100
  personalityFit: number;
  skillsAlignment: number;
  valuesAlignment: number;
  workStyleFit: number;
  marketDemand: number;
  reasoning: string;
  developmentAreas: string[];
  strengthAreas: string[];
  timeToReadiness: number; // months
}

export interface AssessmentInsights {
  personalityProfile: {
    primaryTraits: string[];
    workingStyle: string;
    idealEnvironment: string;
    communicationStyle: string;
  };
  careerRecommendations: CareerMatchResult[];
  developmentSuggestions: {
    skillGaps: { skill: string; importance: string; timeToAcquire: string }[];
    personalityDevelopment: string[];
    experienceRecommendations: string[];
  };
  industryFit: {
    industry: string;
    fitScore: number;
    reasons: string[];
  }[];
}

// Question bank constants
export const PERSONALITY_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'openness_1',
    category: 'personality',
    questionText: 'I enjoy exploring new ideas and concepts',
    questionType: 'scale',
    scaleLabels: { low: 'Strongly Disagree', high: 'Strongly Agree' },
    required: true,
    helpText: 'This relates to your openness to experience and intellectual curiosity'
  },
  {
    id: 'conscientiousness_1',
    category: 'personality',
    questionText: 'I am very organized and methodical in my approach to work',
    questionType: 'scale',
    scaleLabels: { low: 'Strongly Disagree', high: 'Strongly Agree' },
    required: true
  },
  {
    id: 'extraversion_1',
    category: 'personality',
    questionText: 'I gain energy from being around other people',
    questionType: 'scale',
    scaleLabels: { low: 'Strongly Disagree', high: 'Strongly Agree' },
    required: true
  },
  {
    id: 'agreeableness_1',
    category: 'personality',
    questionText: 'I prioritize harmony and cooperation in team settings',
    questionType: 'scale',
    scaleLabels: { low: 'Strongly Disagree', high: 'Strongly Agree' },
    required: true
  },
  {
    id: 'neuroticism_1',
    category: 'personality',
    questionText: 'I tend to worry about things beyond my control',
    questionType: 'scale',
    scaleLabels: { low: 'Strongly Disagree', high: 'Strongly Agree' },
    required: true
  }
];

export const WORK_STYLE_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'team_individual',
    category: 'work_style',
    questionText: 'I prefer working...',
    questionType: 'scale',
    scaleLabels: { low: 'Independently', high: 'In Teams' },
    required: true
  },
  {
    id: 'structure_flexibility',
    category: 'work_style',
    questionText: 'I work best with...',
    questionType: 'scale',
    scaleLabels: { low: 'Clear Structure & Processes', high: 'Flexibility & Autonomy' },
    required: true
  },
  {
    id: 'analytical_creative',
    category: 'work_style',
    questionText: 'I am naturally more...',
    questionType: 'scale',
    scaleLabels: { low: 'Analytical & Logical', high: 'Creative & Intuitive' },
    required: true
  }
];

export const CAREER_VALUES_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'value_compensation',
    category: 'values',
    questionText: 'How important is high compensation to you?',
    questionType: 'scale',
    scaleLabels: { low: 'Not Important', high: 'Extremely Important' },
    required: true
  },
  {
    id: 'value_work_life_balance',
    category: 'values',
    questionText: 'How important is work-life balance to you?',
    questionType: 'scale',
    scaleLabels: { low: 'Not Important', high: 'Extremely Important' },
    required: true
  },
  {
    id: 'value_job_security',
    category: 'values',
    questionText: 'How important is job security to you?',
    questionType: 'scale',
    scaleLabels: { low: 'Not Important', high: 'Extremely Important' },
    required: true
  }
];