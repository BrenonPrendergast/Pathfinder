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

  // Get skills for constellation view by career path
  async getSkillsByCareerPath(careerPath: string): Promise<any[]> {
    try {
      console.log(`Fetching skills for career path: ${careerPath}`);
      
      // Try to get saved constellation template from admin first
      const constellationRef = doc(db, 'skill-constellations', careerPath);
      const constellationDoc = await getDoc(constellationRef);
      
      if (constellationDoc.exists()) {
        const data = constellationDoc.data();
        const skills = data.skills || [];
        console.log(`Found admin template with ${skills.length} skills:`, skills);
        return skills;
      }
      
      // No template exists - check if this is a real career and auto-import its skills
      console.log(`No admin template found for ${careerPath} - checking career database`);
      
      if (careerPath !== 'general') {
        try {
          // Import career service to get career data
          const { careerService } = await import('../career/career.service');
          const career = await careerService.getCareer(careerPath);
          
          if (career && career.skills && career.skills.length > 0) {
            console.log(`Found career with ${career.skills.length} skills - auto-importing`);
            
            // Convert career skills to constellation format
            const constellationSkills = career.skills.map((skill, index) => ({
              id: skill.skillId || `${career.title.toLowerCase().replace(/\s+/g, '_')}_skill_${index}`,
              name: skill.skillName || skill.skillId || `${career.title} Skill ${index + 1}`,
              description: `${skill.skillType || 'Core'} skill for ${career.title}${skill.skillName ? `: ${skill.skillName}` : ''}`,
              level: skill.proficiencyLevel || 1,
              isUnlocked: false,
              isAvailable: skill.isRequired || index === 0, // First skill or required skills are available
              category: skill.skillType || 'general',
              xpReward: (skill.proficiencyLevel || 1) * 10,
              prerequisites: index === 0 ? [] : [career.skills[index - 1]?.skillId || `skill_${index - 1}`],
              starType: this.getStarTypeByProficiency(skill.proficiencyLevel || 1),
              constellation: skill.skillType || 'general',
              estimatedHours: skill.estimatedHours || 0,
              isRequired: skill.isRequired || false,
              // Default positioning - will be arranged in grid
              position: {
                x: (index % 4) * 200 + 100,
                y: Math.floor(index / 4) * 150 + 100
              }
            }));
            
            console.log(`Auto-imported ${constellationSkills.length} skills from career data`);
            return constellationSkills;
          }
        } catch (careerError) {
          console.log('Could not load career data:', careerError);
        }
      }
      
      console.log(`No skills found for ${careerPath} - will show Coming Soon`);
      return [];
    } catch (error) {
      console.error('Error loading constellation template:', error);
      return [];
    }
  }

  // Helper method to determine star type based on proficiency level
  private getStarTypeByProficiency(proficiencyLevel: number): string {
    switch (proficiencyLevel) {
      case 1:
      case 2:
        return 'dwarf';
      case 3:
        return 'main-sequence';
      case 4:
        return 'giant';
      case 5:
        return 'supergiant';
      default:
        return 'main-sequence';
    }
  }

  // Save constellation skill data (admin only)
  async saveSkillConstellation(careerPath: string, skillsData: any[]): Promise<void> {
    try {
      console.log(`Saving constellation for ${careerPath} with ${skillsData.length} skills`);
      console.log('Skills data being saved:', skillsData);
      
      const constellationRef = doc(db, 'skill-constellations', careerPath);
      const saveData = {
        careerPath,
        skills: skillsData,
        lastUpdated: new Date(),
        version: 1,
      };
      
      console.log('Save data structure:', saveData);
      await setDoc(constellationRef, saveData);
      console.log(`Successfully saved constellation to Firestore: skill-constellations/${careerPath}`);
    } catch (error) {
      console.error('Error saving skill constellation:', error);
      throw error;
    }
  }

  // Import existing skills from Firestore for admin editing
  async importExistingSkills(): Promise<any[]> {
    try {
      const skillMap = new Map<string, any>();
      let totalFound = 0;
      
      console.log('Starting skill import from Firestore collections...');
      
      // Import from user-skills collection (user progress data)
      try {
        const userSkillsQuery = query(collection(db, this.COLLECTIONS.USER_SKILLS));
        const userSkillsSnapshot = await getDocs(userSkillsQuery);
        console.log(`Found ${userSkillsSnapshot.size} documents in user-skills collection`);
        
        userSkillsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.skillId) {
            totalFound++;
            if (!skillMap.has(data.skillId)) {
              skillMap.set(data.skillId, {
                id: data.skillId,
                name: this.formatSkillName(data.skillId),
                description: `User skill: ${this.formatSkillName(data.skillId)}`,
                level: Math.min(5, data.currentLevel || 1),
                category: 'user-skills',
                xpReward: 10,
                prerequisites: [],
                starType: 'main-sequence',
                source: 'user-skills',
                usageCount: 1,
              });
            } else {
              skillMap.get(data.skillId)!.usageCount++;
            }
          }
        });
      } catch (error) {
        console.warn('Error importing from user-skills:', error);
      }

      // Import from soft skills (predefined skills)
      try {
        const softSkills = await this.getAllSoftSkills();
        console.log(`Found ${softSkills.length} predefined soft skills`);
        
        softSkills.forEach(skill => {
          totalFound++;
          if (!skillMap.has(skill.id)) {
            skillMap.set(skill.id, {
              id: skill.id,
              name: skill.name,
              description: skill.description || `Soft skill: ${skill.name}`,
              level: skill.skillLevel === 'advanced' ? 4 : skill.skillLevel === 'intermediate' ? 3 : 2,
              category: skill.category || 'soft-skills',
              xpReward: 15,
              prerequisites: skill.prerequisites || [],
              starType: 'giant',
              source: 'soft-skills',
              usageCount: 0,
            });
          }
        });
      } catch (error) {
        console.warn('Error importing soft skills:', error);
      }

      // Import from careers (hard skills)
      try {
        const careersQuery = query(collection(db, 'careers'));
        const careersSnapshot = await getDocs(careersQuery);
        console.log(`Found ${careersSnapshot.size} documents in careers collection`);
        
        careersSnapshot.docs.forEach(doc => {
          const career = doc.data();
          if (career.skills && Array.isArray(career.skills)) {
            career.skills.forEach((skill: any) => {
              totalFound++;
              const skillId = `${skill.skillName.toLowerCase().replace(/\s+/g, '_')}`;
              if (!skillMap.has(skillId)) {
                skillMap.set(skillId, {
                  id: skillId,
                  name: skill.skillName,
                  description: skill.description || `Professional skill: ${skill.skillName}`,
                  level: skill.proficiencyLevel || 3,
                  category: career.primaryField || 'technical',
                  xpReward: (skill.proficiencyLevel || 3) * 5,
                  prerequisites: [],
                  starType: skill.proficiencyLevel >= 4 ? 'supergiant' : 'main-sequence',
                  source: 'careers',
                  careerTitle: career.title,
                  usageCount: 0,
                });
              }
            });
          }
        });
      } catch (error) {
        console.warn('Could not import career skills:', error);
      }

      const results = Array.from(skillMap.values()).sort((a, b) => b.usageCount - a.usageCount);
      console.log(`Import complete: Found ${totalFound} total skill entries, ${results.length} unique skills`);
      
      // If no skills found, provide sample skills for testing
      if (results.length === 0) {
        console.log('No skills found in database, providing sample skills for testing');
        return this.generateSampleSkills();
      }
      
      return results;
    } catch (error) {
      console.error('Error importing existing skills:', error);
      throw error;
    }
  }

  // Helper method to format skill names from IDs
  private formatSkillName(skillId: string): string {
    return skillId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Get all available skill collections for import
  async getSkillCollections(): Promise<{name: string, count: number, description: string}[]> {
    try {
      const collections = [];
      
      // Check user-skills collection
      try {
        const userSkillsQuery = query(collection(db, this.COLLECTIONS.USER_SKILLS));
        const userSkillsSnapshot = await getDocs(userSkillsQuery);
        collections.push({
          name: 'User Skills Progress',
          count: userSkillsSnapshot.size,
          description: 'Skills from user progress tracking and gamification system'
        });
      } catch (error) {
        console.warn('Cannot access user-skills collection:', error);
        collections.push({
          name: 'User Skills Progress',
          count: 0,
          description: 'Skills from user progress tracking (access denied)'
        });
      }

      // Check careers collection
      try {
        const careersQuery = query(collection(db, 'careers'));
        const careersSnapshot = await getDocs(careersQuery);
        let skillCount = 0;
        careersSnapshot.docs.forEach(doc => {
          const career = doc.data();
          if (career.skills && Array.isArray(career.skills)) {
            skillCount += career.skills.length;
          }
        });
        collections.push({
          name: 'Career Skills',
          count: skillCount,
          description: `Professional skills from ${careersSnapshot.size} career definitions`
        });
      } catch (error) {
        console.warn('Cannot access careers collection:', error);
        collections.push({
          name: 'Career Skills',
          count: 0,
          description: 'Professional skills from career definitions (access denied)'
        });
      }

      // Add soft skills
      try {
        const softSkills = await this.getAllSoftSkills();
        collections.push({
          name: 'Soft Skills Library',
          count: softSkills.length,
          description: 'Predefined interpersonal and foundational skills'
        });
      } catch (error) {
        console.warn('Cannot access soft skills:', error);
        collections.push({
          name: 'Soft Skills Library',
          count: 0,
          description: 'Predefined soft skills (error loading)'
        });
      }

      return collections;
    } catch (error) {
      console.error('Error getting skill collections:', error);
      return [];
    }
  }



  // Generate sample skills for testing when no data is available
  private generateSampleSkills(): any[] {
    return [
      {
        id: 'communication',
        name: 'Communication',
        description: 'Effective verbal and written communication skills',
        level: 1,
        category: 'soft-skills',
        xpReward: 15,
        prerequisites: [],
        starType: 'main-sequence',
        source: 'sample',
        usageCount: 10,
      },
      {
        id: 'problem_solving',
        name: 'Problem Solving',
        description: 'Analytical thinking and creative problem resolution',
        level: 2,
        category: 'soft-skills',
        xpReward: 20,
        prerequisites: [],
        starType: 'main-sequence',
        source: 'sample',
        usageCount: 8,
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        description: 'Modern JavaScript programming language',
        level: 3,
        category: 'technical',
        xpReward: 25,
        prerequisites: ['problem_solving'],
        starType: 'giant',
        source: 'sample',
        usageCount: 5,
      },
      {
        id: 'react',
        name: 'React',
        description: 'React framework for building user interfaces',
        level: 4,
        category: 'technical',
        xpReward: 30,
        prerequisites: ['javascript'],
        starType: 'giant',
        source: 'sample',
        usageCount: 3,
      },
      {
        id: 'leadership',
        name: 'Leadership',
        description: 'Team leadership and management skills',
        level: 4,
        category: 'soft-skills',
        xpReward: 35,
        prerequisites: ['communication'],
        starType: 'supergiant',
        source: 'sample',
        usageCount: 2,
      },
      {
        id: 'project_management',
        name: 'Project Management',
        description: 'Planning, organizing, and managing projects',
        level: 3,
        category: 'management',
        xpReward: 25,
        prerequisites: ['communication', 'problem_solving'],
        starType: 'giant',
        source: 'sample',
        usageCount: 4,
      }
    ];
  }
}

export const skillService = new SkillService();
export default skillService;