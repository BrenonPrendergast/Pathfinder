// Hard Skills Service - Manages O*NET-based hard skills integration
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
  db
} from '../firebase/firestore-base';
import { HardSkill } from '../types/skill.types';
import { ONET_HARD_SKILLS_DATA, onetIntegrationService, ONetHardSkill } from '../onet/onet-integration.service';
// import { ALL_HARD_SKILLS_DATA } from '../data/hard-skills.data'; // Temporarily disabled for build

export class HardSkillsService {
  
  // Seed hard skills database with O*NET data
  async seedHardSkills(): Promise<void> {
    console.log('Seeding hard skills database with O*NET data...');
    const batch = writeBatch(db);
    
    // Use only O*NET skills for now
    const allSkills = [...ONET_HARD_SKILLS_DATA];
    
    allSkills.forEach(skill => {
      const skillRef = doc(collection(db, 'hard-skills'));
      batch.set(skillRef, {
        ...skill,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`✅ Seeded ${allSkills.length} hard skills to database`);
  }

  // Get all hard skills from database
  async getAllHardSkills(): Promise<ONetHardSkill[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'hard-skills'));
      const skills: ONetHardSkill[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        skills.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps back to dates if needed
          learningResources: data.learningResources || []
        } as ONetHardSkill);
      });
      
      return skills.sort((a, b) => b.marketDemand - a.marketDemand);
    } catch (error) {
      console.error('Error fetching hard skills:', error);
      return [];
    }
  }

  // Get hard skills by category
  async getHardSkillsByCategory(category: string): Promise<ONetHardSkill[]> {
    try {
      const q = query(
        collection(db, 'hard-skills'),
        where('category', '==', category)
      );
      const querySnapshot = await getDocs(q);
      const skills: ONetHardSkill[] = [];
      
      querySnapshot.forEach(doc => {
        skills.push({ id: doc.id, ...doc.data() } as ONetHardSkill);
      });
      
      return skills.sort((a, b) => b.marketDemand - a.marketDemand);
    } catch (error) {
      console.error(`Error fetching skills for category ${category}:`, error);
      return [];
    }
  }

  // Get hard skills for specific career
  async getHardSkillsForCareer(careerId: string): Promise<ONetHardSkill[]> {
    try {
      // Use O*NET integration service to get relevant skills
      const relevantSkills = onetIntegrationService.getSkillsForCareer(careerId);
      
      // If no O*NET mapping exists, get skills from database by searching industries
      if (relevantSkills.length === 0) {
        const allSkills = await this.getAllHardSkills();
        return allSkills.filter(skill => 
          skill.relatedSkills.some(related => related.includes(careerId)) ||
          skill.description.toLowerCase().includes(careerId.replace('-', ' '))
        ).slice(0, 15); // Limit to top 15 relevant skills
      }
      
      return relevantSkills;
    } catch (error) {
      console.error(`Error fetching skills for career ${careerId}:`, error);
      return [];
    }
  }

  // Get skill by ID
  async getHardSkillById(skillId: string): Promise<ONetHardSkill | null> {
    try {
      const skillRef = doc(db, 'hard-skills', skillId);
      const skillDoc = await getDoc(skillRef);
      
      if (skillDoc.exists()) {
        return { id: skillDoc.id, ...skillDoc.data() } as ONetHardSkill;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching skill ${skillId}:`, error);
      return null;
    }
  }

  // Get top demand skills
  async getTopDemandSkills(limit: number = 10): Promise<ONetHardSkill[]> {
    const allSkills = await this.getAllHardSkills();
    return allSkills
      .sort((a, b) => b.marketDemand - a.marketDemand)
      .slice(0, limit);
  }

  // Get skills with highest salary impact
  async getHighSalaryImpactSkills(limit: number = 10): Promise<ONetHardSkill[]> {
    const allSkills = await this.getAllHardSkills();
    return allSkills
      .sort((a, b) => b.averageSalaryImpact - a.averageSalaryImpact)
      .slice(0, limit);
  }

  // Search skills by query
  async searchHardSkills(query: string): Promise<ONetHardSkill[]> {
    const allSkills = await this.getAllHardSkills();
    const lowercaseQuery = query.toLowerCase();
    
    return allSkills.filter(skill =>
      skill.name.toLowerCase().includes(lowercaseQuery) ||
      skill.description.toLowerCase().includes(lowercaseQuery) ||
      skill.category.toLowerCase().includes(lowercaseQuery) ||
      skill.relatedSkills.some(related => related.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get learning path for a skill
  async getSkillLearningPath(skillId: string): Promise<{
    skill: ONetHardSkill | null,
    prerequisites: ONetHardSkill[],
    nextSteps: ONetHardSkill[]
  }> {
    try {
      const skill = await this.getHardSkillById(skillId);
      if (!skill) return { skill: null, prerequisites: [], nextSteps: [] };
      
      const allSkills = await this.getAllHardSkills();
      
      const prerequisites = allSkills.filter(s => 
        skill.prerequisites.includes(s.id)
      );
      
      const nextSteps = allSkills.filter(s => 
        s.prerequisites.includes(skillId)
      );
      
      return { skill, prerequisites, nextSteps };
    } catch (error) {
      console.error(`Error getting learning path for skill ${skillId}:`, error);
      return { skill: null, prerequisites: [], nextSteps: [] };
    }
  }

  // Get personalized skill recommendations for user
  async getPersonalizedHardSkillRecommendations(
    userSkills: Record<string, number>,
    careerIds: string[],
    limit: number = 10
  ): Promise<{ skill: ONetHardSkill, score: number, reason: string }[]> {
    try {
      return onetIntegrationService.getPersonalizedSkillRecommendations(
        userSkills,
        careerIds,
        limit
      );
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  // Get skills by proficiency level
  async getSkillsByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<ONetHardSkill[]> {
    const allSkills = await this.getAllHardSkills();
    return allSkills.filter(skill => skill.skillLevel === level);
  }

  // Get all skill categories
  async getSkillCategories(): Promise<string[]> {
    const allSkills = await this.getAllHardSkills();
    const categories = Array.from(new Set(allSkills.map(skill => skill.category)));
    return categories.sort();
  }

  // Update career skills with O*NET hard skills
  async updateCareerWithHardSkills(careerId: string): Promise<void> {
    try {
      const hardSkills = await this.getHardSkillsForCareer(careerId);
      const careerSkills = onetIntegrationService.convertToCareerSkills(hardSkills, careerId);
      
      // This would integrate with the existing career service
      // Implementation depends on career data structure
      console.log(`Updated ${careerId} with ${careerSkills.length} hard skills from O*NET`);
    } catch (error) {
      console.error(`Error updating career ${careerId} with hard skills:`, error);
    }
  }

  // Get industry trends and skill demand
  async getSkillDemandTrends(): Promise<{
    trending: ONetHardSkill[],
    emerging: ONetHardSkill[],
    declining: ONetHardSkill[]
  }> {
    const allSkills = await this.getAllHardSkills();
    
    // Mock trend analysis - in production this would use real market data
    const trending = allSkills
      .filter(skill => skill.marketDemand > 75)
      .slice(0, 8);
    
    const emerging = allSkills
      .filter(skill => 
        skill.category.includes('AI') || 
        skill.category.includes('Machine Learning') ||
        skill.category.includes('Cloud') ||
        skill.name.includes('AI') ||
        skill.name.includes('ML')
      )
      .slice(0, 8);
    
    const declining = allSkills
      .filter(skill => skill.marketDemand < 40)
      .slice(0, 5);
    
    return { trending, emerging, declining };
  }

  // Generate skill development plan
  async generateSkillDevelopmentPlan(
    userId: string,
    targetCareer: string,
    timeCommitment: number, // hours per week
    currentSkills: Record<string, number>
  ): Promise<{
    plan: Array<{
      skill: ONetHardSkill,
      priority: number,
      estimatedWeeks: number,
      prerequisites: string[],
      reasoning: string
    }>,
    totalEstimatedMonths: number
  }> {
    try {
      const careerSkills = await this.getHardSkillsForCareer(targetCareer);
      
      // Filter out skills user already has at high level
      const skillsToLearn = careerSkills.filter(skill => 
        (currentSkills[skill.id] || 0) < 4
      );
      
      // Calculate priority and timeline for each skill
      const plan = skillsToLearn.map((skill, index) => {
        const userLevel = currentSkills[skill.id] || 0;
        const hoursNeeded = this.calculateHoursNeeded(skill.skillLevel, userLevel);
        const estimatedWeeks = Math.ceil(hoursNeeded / timeCommitment);
        
        const priority = this.calculateSkillPriority(skill, currentSkills);
        const reasoning = this.generateSkillReasoning(skill, userLevel);
        
        return {
          skill,
          priority,
          estimatedWeeks,
          prerequisites: skill.prerequisites,
          reasoning
        };
      });
      
      // Sort by priority and calculate total time
      const sortedPlan = plan.sort((a, b) => b.priority - a.priority);
      const totalWeeks = sortedPlan.reduce((sum, item) => sum + item.estimatedWeeks, 0);
      const totalEstimatedMonths = Math.ceil(totalWeeks / 4.3); // Average weeks per month
      
      return {
        plan: sortedPlan.slice(0, 12), // Limit to 12 skills
        totalEstimatedMonths
      };
    } catch (error) {
      console.error('Error generating skill development plan:', error);
      return { plan: [], totalEstimatedMonths: 0 };
    }
  }

  // Private helper methods
  private calculateHoursNeeded(skillLevel: string, userLevel: number): number {
    const targetLevel = skillLevel === 'beginner' ? 2 : skillLevel === 'intermediate' ? 3 : 4;
    const levelsToGain = Math.max(0, targetLevel - userLevel);
    return levelsToGain * 25; // 25 hours per skill level
  }

  private calculateSkillPriority(skill: ONetHardSkill, userSkills: Record<string, number>): number {
    let priority = 0;
    
    // Market demand factor (40%)
    priority += (skill.marketDemand / 100) * 40;
    
    // Salary impact factor (30%)
    priority += Math.min(skill.averageSalaryImpact / 30000, 1) * 30;
    
    // Prerequisites readiness (20%)
    const metPrerequisites = skill.prerequisites.filter(prereq => 
      (userSkills[prereq] || 0) >= 2
    ).length;
    const prerequisiteRatio = skill.prerequisites.length > 0 
      ? metPrerequisites / skill.prerequisites.length 
      : 1;
    priority += prerequisiteRatio * 20;
    
    // Learning difficulty (10% - easier skills get slight boost)
    const difficultyBonus = skill.skillLevel === 'beginner' ? 10 : 
                           skill.skillLevel === 'intermediate' ? 7 : 5;
    priority += difficultyBonus;
    
    return Math.min(100, priority);
  }

  private generateSkillReasoning(skill: ONetHardSkill, userLevel: number): string {
    if (skill.marketDemand > 90) return `High market demand (${skill.marketDemand}% demand rating)`;
    if (skill.averageSalaryImpact > 20000) return `Significant salary impact (+$${skill.averageSalaryImpact.toLocaleString()})`;
    if (userLevel === 0) return 'Foundation skill for your career path';
    if (skill.skillLevel === 'beginner') return 'Good starting point with manageable learning curve';
    return 'Builds naturally on your existing skills';
  }
}

export const hardSkillsService = new HardSkillsService();