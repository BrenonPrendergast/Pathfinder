import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  BaseSkill, 
  SoftSkill, 
  HardSkill, 
  UserSkillProgress, 
  SkillProficiencyLevel,
  SkillType,
  Certification,
  UserCertification,
  CareerPath,
  SkillAssessment,
  CareerRecommendation,
  SkillDevelopmentPlan,
  SkillTreeNode,
} from '../types/skill.types';
import { SOFT_SKILLS, getDefaultUnlockedSkills, isSkillUnlockable } from '../data/soft-skills.data';
import { careerService } from '../career';

class SkillService {
  // Collections
  private readonly COLLECTIONS = {
    USER_SKILLS: 'user-skills',
    HARD_SKILLS: 'hard-skills',
    CERTIFICATIONS: 'certifications',
    USER_CERTIFICATIONS: 'user-certifications',
    CAREER_PATHS: 'career-paths',
    SKILL_ASSESSMENTS: 'skill-assessments',
  };

  // Initialize user skills with default unlocked soft skills
  async initializeUserSkills(userId: string): Promise<void> {
    try {
      const defaultSkills = getDefaultUnlockedSkills();
      const batch = writeBatch(db);

      for (const skill of defaultSkills) {
        const userSkillRef = doc(db, this.COLLECTIONS.USER_SKILLS, `${userId}_${skill.id}`);
        const userSkillProgress: UserSkillProgress = {
          userId,
          skillId: skill.id,
          currentLevel: SkillProficiencyLevel.NOVICE,
          hoursLogged: 0,
          lastUpdated: new Date(),
          experiencePoints: 0,
          completedQuests: [],
          certifications: [],
          verificationSource: 'self',
        };
        batch.set(userSkillRef, userSkillProgress);
      }

      await batch.commit();
    } catch (error) {
      console.error('Error initializing user skills:', error);
      throw error;
    }
  }

  // Get user's skill progress for all skills
  async getUserSkillProgress(userId: string): Promise<UserSkillProgress[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.USER_SKILLS),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      // If no skills exist for this user, initialize with default skills
      if (querySnapshot.empty) {
        await this.initializeUserSkills(userId);
        // Re-query after initialization
        const newQuerySnapshot = await getDocs(q);
        return newQuerySnapshot.docs.map(doc => doc.data() as UserSkillProgress);
      }
      
      return querySnapshot.docs.map(doc => doc.data() as UserSkillProgress);
    } catch (error) {
      console.error('Error fetching user skill progress:', error);
      throw error;
    }
  }

  // Update skill proficiency level
  async updateSkillLevel(
    userId: string, 
    skillId: string, 
    newLevel: SkillProficiencyLevel,
    source: 'self' | 'quest' | 'certification' | 'external' = 'self',
    notes?: string
  ): Promise<void> {
    try {
      const skillProgressRef = doc(db, this.COLLECTIONS.USER_SKILLS, `${userId}_${skillId}`);
      const currentProgress = await getDoc(skillProgressRef);

      if (currentProgress.exists()) {
        await updateDoc(skillProgressRef, {
          currentLevel: newLevel,
          lastUpdated: new Date(),
          verificationSource: source,
          ...(notes && { selfAssessmentNotes: notes, selfAssessmentDate: new Date() }),
        });
      } else {
        // Create new skill progress entry
        const userSkillProgress: UserSkillProgress = {
          userId,
          skillId,
          currentLevel: newLevel,
          hoursLogged: 0,
          lastUpdated: new Date(),
          experiencePoints: 0,
          completedQuests: [],
          certifications: [],
          verificationSource: source,
          ...(notes && { selfAssessmentNotes: notes, selfAssessmentDate: new Date() }),
        };
        await setDoc(skillProgressRef, userSkillProgress);
      }
    } catch (error) {
      console.error('Error updating skill level:', error);
      throw error;
    }
  }

  // Add hours to a skill and potentially increase level
  async addSkillHours(userId: string, skillId: string, hours: number, fromQuestId?: string): Promise<void> {
    try {
      const skillProgressRef = doc(db, this.COLLECTIONS.USER_SKILLS, `${userId}_${skillId}`);
      const currentProgress = await getDoc(skillProgressRef);

      if (currentProgress.exists()) {
        const progress = currentProgress.data() as UserSkillProgress;
        const newHours = Math.max(0, progress.hoursLogged + hours); // Prevent negative hours
        const newXP = progress.experiencePoints + (hours * 10); // 10 XP per hour

        // Simple leveling logic based on hours
        let newLevel = progress.currentLevel;
        if (newHours >= 200 && progress.currentLevel < SkillProficiencyLevel.EXPERT) {
          newLevel = SkillProficiencyLevel.EXPERT;
        } else if (newHours >= 100 && progress.currentLevel < SkillProficiencyLevel.ADVANCED) {
          newLevel = SkillProficiencyLevel.ADVANCED;
        } else if (newHours >= 50 && progress.currentLevel < SkillProficiencyLevel.INTERMEDIATE) {
          newLevel = SkillProficiencyLevel.INTERMEDIATE;
        } else if (newHours >= 20 && progress.currentLevel < SkillProficiencyLevel.BEGINNER) {
          newLevel = SkillProficiencyLevel.BEGINNER;
        }

        const updateData: Partial<UserSkillProgress> = {
          hoursLogged: newHours,
          experiencePoints: newXP,
          lastUpdated: new Date(),
          currentLevel: newLevel,
        };

        if (fromQuestId && !progress.completedQuests.includes(fromQuestId)) {
          updateData.completedQuests = [...progress.completedQuests, fromQuestId];
        }

        await updateDoc(skillProgressRef, updateData);
      } else {
        // Create new skill progress entry for point allocation
        const userSkillProgress: UserSkillProgress = {
          userId,
          skillId,
          currentLevel: Math.max(1, hours) as SkillProficiencyLevel,
          hoursLogged: Math.max(0, hours),
          lastUpdated: new Date(),
          experiencePoints: hours * 10,
          completedQuests: fromQuestId ? [fromQuestId] : [],
          certifications: [],
          verificationSource: 'self',
        };
        await setDoc(skillProgressRef, userSkillProgress);
      }
    } catch (error) {
      console.error('Error adding skill hours:', error);
      throw error;
    }
  }

  // Gaming-style point allocation for interactive skill tree
  async allocateSkillPoints(userId: string, skillId: string, points: number): Promise<void> {
    try {
      const skillProgressRef = doc(db, this.COLLECTIONS.USER_SKILLS, `${userId}_${skillId}`);
      const currentProgress = await getDoc(skillProgressRef);

      if (currentProgress.exists()) {
        const progress = currentProgress.data() as UserSkillProgress;
        const newLevel = Math.max(0, Math.min(5, progress.currentLevel + points)) as SkillProficiencyLevel;
        
        await updateDoc(skillProgressRef, {
          currentLevel: newLevel,
          lastUpdated: new Date(),
          experiencePoints: progress.experiencePoints + (points * 100), // 100 XP per point
          verificationSource: 'self' as const,
        });
      } else {
        // Create new skill progress with allocated points
        const userSkillProgress: UserSkillProgress = {
          userId,
          skillId,
          currentLevel: Math.max(1, points) as SkillProficiencyLevel,
          hoursLogged: points * 5, // 5 hours per point equivalent
          lastUpdated: new Date(),
          experiencePoints: points * 100,
          completedQuests: [],
          certifications: [],
          verificationSource: 'self' as const,
        };
        await setDoc(skillProgressRef, userSkillProgress);
      }
    } catch (error) {
      console.error('Error allocating skill points:', error);
      throw error;
    }
  }

  // Get user's available skill points based on career level and completed activities
  async getUserAvailablePoints(userId: string): Promise<number> {
    try {
      // Get user profile to check level, completed quests, achievements
      // For now, return a base amount + bonuses
      const userProgress = await this.getUserSkillProgress(userId);
      const totalSkillLevels = userProgress.reduce((sum, progress) => sum + progress.currentLevel, 0);
      
      // Base points + bonus for activity
      const basePoints = 70;
      const levelBonus = Math.floor(totalSkillLevels / 10) * 5; // 5 points per 10 skill levels
      
      return basePoints + levelBonus;
    } catch (error) {
      console.error('Error calculating available points:', error);
      return 70; // Default
    }
  }

  // Get soft skills tree data for display
  async getSoftSkillsTree(userId: string): Promise<SkillTreeNode[]> {
    try {
      const userProgress = await this.getUserSkillProgress(userId);
      const progressMap = new Map<string, UserSkillProgress>();
      
      userProgress.forEach(progress => {
        progressMap.set(progress.skillId, progress);
      });

      const unlockedSkillIds = userProgress
        .filter(progress => progress.currentLevel > SkillProficiencyLevel.LOCKED)
        .map(progress => progress.skillId);

      return SOFT_SKILLS.map((skill, index) => {
        const progress = progressMap.get(skill.id) || null;
        const isUnlocked = progress ? progress.currentLevel > SkillProficiencyLevel.LOCKED : skill.defaultUnlocked;
        const canUnlock = !isUnlocked && isSkillUnlockable(skill.id, unlockedSkillIds);

        return {
          skill,
          userProgress: progress,
          isUnlocked,
          isRecommended: canUnlock,
          position: this.calculateSkillPosition(skill, index),
          connections: skill.prerequisites,
          urgency: this.calculateSkillUrgency(skill, progress),
        };
      });
    } catch (error) {
      console.error('Error getting soft skills tree:', error);
      throw error;
    }
  }

  // Get hard skills for a specific career
  async getHardSkillsForCareer(userId: string, careerId: string): Promise<SkillTreeNode[]> {
    try {
      // For now, we'll create sample hard skills based on career
      // In the future, this will integrate with O*NET data
      const career = await careerService.getCareer(careerId);
      if (!career) return [];

      // Create hard skills based on career skills data
      const hardSkills = career.skills.map((skillData, index) => ({
        id: `hard_${careerId}_${skillData.skillName.toLowerCase().replace(/\s+/g, '_')}`,
        name: skillData.skillName,
        description: `Professional skill required for ${career.title}: ${skillData.skillName}`,
        category: this.categorizeHardSkill(skillData.skillName),
        type: SkillType.HARD,
        prerequisites: [],
        relatedCareers: [careerId],
        estimatedHoursToMaster: skillData.proficiencyLevel * 50, // Basic estimation
        requiredForCareers: [careerId],
        skillLevel: this.mapSkillLevel(skillData.proficiencyLevel),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const userProgress = await this.getUserSkillProgress(userId);
      const progressMap = new Map<string, UserSkillProgress>();
      
      userProgress.forEach(progress => {
        progressMap.set(progress.skillId, progress);
      });

      return hardSkills.map((skill, index) => {
        const progress = progressMap.get(skill.id) || null;
        
        return {
          skill,
          userProgress: progress,
          isUnlocked: true, // Hard skills can be worked on immediately
          isRecommended: !progress || progress.currentLevel < SkillProficiencyLevel.INTERMEDIATE,
          position: this.calculateSkillPosition(skill, index),
          connections: skill.prerequisites,
          urgency: 'medium' as const,
        };
      });
    } catch (error) {
      console.error('Error getting hard skills for career:', error);
      throw error;
    }
  }

  // Create or update a career path
  async createCareerPath(userId: string, careerId: string): Promise<CareerPath> {
    try {
      const career = await careerService.getCareer(careerId);
      if (!career) throw new Error('Career not found');

      const careerPath: CareerPath = {
        userId,
        careerId,
        careerTitle: career.title,
        isActive: true,
        requiredSkills: career.skills.map(skill => ({
          skillId: `hard_${careerId}_${skill.skillName.toLowerCase().replace(/\s+/g, '_')}`,
          minimumLevel: SkillProficiencyLevel.INTERMEDIATE,
        })),
        optionalSkills: [],
        progress: {
          completedSkills: 0,
          totalSkills: career.skills.length,
          percentage: 0,
        },
        estimatedCompletionTime: Math.ceil(career.estimatedTimeToMaster / 12), // Convert to months
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const careerPathRef = doc(db, this.COLLECTIONS.CAREER_PATHS, `${userId}_${careerId}`);
      await setDoc(careerPathRef, careerPath);

      return careerPath;
    } catch (error) {
      console.error('Error creating career path:', error);
      throw error;
    }
  }

  // Save skill assessment
  async saveSkillAssessment(assessment: SkillAssessment): Promise<void> {
    try {
      const assessmentRef = await addDoc(collection(db, this.COLLECTIONS.SKILL_ASSESSMENTS), assessment);
      
      // Update user skill levels based on assessment
      for (const skillAssessment of assessment.skills) {
        await this.updateSkillLevel(
          assessment.userId,
          skillAssessment.skillId,
          skillAssessment.currentLevel,
          'self',
          skillAssessment.experience
        );
      }
    } catch (error) {
      console.error('Error saving skill assessment:', error);
      throw error;
    }
  }

  // Helper methods
  private calculateSkillPosition(skill: BaseSkill, index: number): { x: number; y: number } {
    // Simple grid layout - can be enhanced with better algorithms
    const col = index % 4;
    const row = Math.floor(index / 4);
    return {
      x: col * 250 + 125,
      y: row * 180 + 90,
    };
  }

  private calculateSkillUrgency(skill: BaseSkill, progress: UserSkillProgress | null): 'low' | 'medium' | 'high' {
    if (!progress) return 'medium';
    if (progress.currentLevel === SkillProficiencyLevel.LOCKED) return 'high';
    if (progress.currentLevel < SkillProficiencyLevel.INTERMEDIATE) return 'medium';
    return 'low';
  }

  private categorizeHardSkill(skillName: string): any {
    // Simple categorization - can be enhanced
    const technical = ['programming', 'coding', 'software', 'database', 'algorithm'];
    const tools = ['excel', 'word', 'powerpoint', 'adobe', 'figma'];
    
    const lowerSkillName = skillName.toLowerCase();
    if (technical.some(term => lowerSkillName.includes(term))) {
      return 'technical';
    }
    if (tools.some(term => lowerSkillName.includes(term))) {
      return 'tools_software';
    }
    return 'industry_specific';
  }

  private mapSkillLevel(level: number): 'entry' | 'intermediate' | 'advanced' {
    if (level <= 2) return 'entry';
    if (level <= 4) return 'intermediate';
    return 'advanced';
  }

  // Get all soft skills for admin (without user-specific data)
  async getAllSoftSkills(): Promise<any[]> {
    try {
      return SOFT_SKILLS.map((skill, index) => ({
        ...skill,
        position: this.calculateSkillPosition(skill, index),
      }));
    } catch (error) {
      console.error('Error getting all soft skills:', error);
      throw error;
    }
  }

  // Admin CRUD methods (placeholder implementations for admin interface)
  async createSoftSkill(skillData: any): Promise<string> {
    console.log('createSoftSkill called:', skillData);
    // Placeholder - implement based on your needs
    return 'placeholder-id';
  }

  async updateSoftSkill(skillId: string, skillData: any): Promise<void> {
    console.log('updateSoftSkill called:', skillId, skillData);
    // Placeholder - implement based on your needs
  }

  async deleteSoftSkill(skillId: string): Promise<void> {
    console.log('deleteSoftSkill called:', skillId);
    // Placeholder - implement based on your needs
  }

  async createHardSkill(skillData: any): Promise<string> {
    console.log('createHardSkill called:', skillData);
    // Placeholder - implement based on your needs
    return 'placeholder-id';
  }

  async updateHardSkill(skillId: string, skillData: any): Promise<void> {
    console.log('updateHardSkill called:', skillId, skillData);
    // Placeholder - implement based on your needs
  }

  async deleteHardSkill(skillId: string): Promise<void> {
    console.log('deleteHardSkill called:', skillId);
    // Placeholder - implement based on your needs
  }
}

export const skillService = new SkillService();
export default skillService;