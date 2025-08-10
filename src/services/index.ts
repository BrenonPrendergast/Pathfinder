// Main services re-exports

// Import services for legacy compatibility object
import { careerService, careerFieldsService, careerCSVService } from './career';
import { userService } from './user';
import { questService } from './quest';
import { achievementService } from './achievement';
import { questRecommendationService } from './recommendation/quest-recommendation.service';
import { certificationService } from './certification/certification.service';

// Career services
export {
  careerService,
  careerFieldsService,
  careerCSVService
} from './career';
export type { CsvImportResult } from './career';

// User services
export { userService } from './user';

// Quest services
export { questService } from './quest';
export type { Quest } from './quest';

// Achievement services
export { achievementService } from './achievement';
export type { UserStats, Achievement } from './achievement';

// Recommendation services
export { questRecommendationService } from './recommendation/quest-recommendation.service';
export { careerRecommendationService } from './recommendation/career-recommendation.service';
export type { QuestRecommendation, RecommendationReason } from './recommendation/quest-recommendation.service';

// Skill services
export { skillService } from './skill/skill.service';

// O*NET Integration services
export { onetIntegrationService } from './onet/onet-integration.service';
export { hardSkillsService } from './skill/hard-skills.service';
export { CAREER_SOC_MAPPING } from './onet/onet-integration.service';

// Certification services
export { certificationService } from './certification/certification.service';

// Types
export * from './types';

// Constants
export { CAREER_FIELDS } from './constants/career-fields';

// Firebase utilities
export {
  convertTimestamps,
  clearCache,
  isCacheValid,
  escapeCSVField,
  parseCSVRow
} from './firebase/firestore-base';

// Legacy combined service object for backward compatibility

export const firestoreService = {
  // Career operations
  ...careerService,
  
  // Career field operations
  getCareerFields: careerFieldsService.getCareerFields,
  getCareersByField: careerFieldsService.getCareersByField,
  getCareerCountsByField: careerFieldsService.getCareerCountsByField,
  bulkMigrateCareerFields: careerFieldsService.bulkMigrateCareerFields,
  
  // CSV operations
  exportCareersToCSV: careerCSVService.exportCareersToCSV,
  importCareersFromCSV: careerCSVService.importCareersFromCSV,
  
  // User operations
  getAllUsers: userService.getAllUsers,
  updateUserRole: userService.updateUserRole,
  migrateUserRoles: userService.migrateUserRoles,
  
  // Quest operations
  getQuests: questService.getQuests,
  getQuest: questService.getQuest,
  
  // Achievement operations
  getAchievements: achievementService.getAchievements,
  checkAchievements: achievementService.checkAchievements,
  
  // Certification operations
  getAllCertifications: certificationService.getAllCertifications,
  getUserCertifications: certificationService.getUserCertifications,
  addUserCertification: certificationService.addUserCertification,
  getRecommendedCertifications: certificationService.getRecommendedCertifications,
  
  // Seed operations
  seedCareers: careerService.seedCareers,
  seedQuests: questService.seedQuests,
  seedAchievements: achievementService.seedAchievements,
  seedCertifications: certificationService.seedCertifications
};