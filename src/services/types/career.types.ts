// Career-related TypeScript interfaces and types

export interface CareerSkill {
  skillId: string;
  skillName: string;
  skillType: 'hard' | 'soft' | 'transferable';
  proficiencyLevel: number; // 1-5 scale
  isRequired: boolean;
  estimatedHours: number;
}

export interface Career {
  id: string;
  title: string;
  description: string;
  onetCode: string; // O*NET SOC code like "15-1252.00"
  skills: CareerSkill[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTimeToMaster: number; // in months
  fields?: CareerFieldKey[]; // Career field categories (supports multiple fields)
  averageSalary?: {
    min: number;
    max: number;
    median: number;
  };
  jobOutlook?: string;
  relatedCareers: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Career field types
export type CareerFieldKey = 
  | 'accommodation_food'
  | 'admin_support'
  | 'agriculture_forestry'
  | 'arts_entertainment'
  | 'construction'
  | 'educational'
  | 'finance_insurance'
  | 'government'
  | 'healthcare_social'
  | 'information'
  | 'management'
  | 'manufacturing'
  | 'mining_extraction'
  | 'other_services'
  | 'professional_scientific'
  | 'real_estate'
  | 'retail_trade'
  | 'transportation_warehousing'
  | 'utilities'
  | 'wholesale_trade';

export interface CareerField {
  name: string;
  description: string;
  keywords: readonly string[];
}

// API response types
export interface GetCareersResponse {
  careers: Career[];
  lastDoc: any; // QueryDocumentSnapshot
  hasMore: boolean;
}

export interface BulkOperationResult {
  total: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface CsvImportResult {
  total: number;
  imported: number;
  errors: string[];
}