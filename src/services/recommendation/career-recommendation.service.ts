// Career Recommendation Service - AI-powered career path suggestions based on skills
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  db
} from '../firebase/firestore-base';
import { CareerRecommendation, SkillProficiencyLevel } from '../types/skill.types';
import { Career } from '../types/career.types';
// Removed O*NET integration - using Pathfinder database instead
import { hardSkillsService } from '../skill/hard-skills.service';
import { careerService } from '../career/career.service';

interface UserSkillProfile {
  userId: string;
  skills: Record<string, number>; // skillId -> proficiency level
  certifications: string[]; // certification IDs
  experienceYears: number;
  currentRole?: string;
  preferredIndustries?: string[];
  salaryExpectations?: { min: number; max: number };
  workPreferences?: {
    remote: boolean;
    partTime: boolean;
    freelance: boolean;
  };
}

interface MarketData {
  jobPostings: number;
  averageSalary: number;
  growthRate: number;
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  location: string;
}

interface CareerCompatibilityScore {
  skillMatch: number; // 0-40 points
  experienceMatch: number; // 0-25 points
  marketDemand: number; // 0-20 points
  salaryAlignment: number; // 0-10 points
  industryPreference: number; // 0-5 points
  total: number; // 0-100 points
}

export class CareerRecommendationService {

  // Get personalized career recommendations for a user
  async getCareerRecommendations(
    userProfile: UserSkillProfile,
    options: {
      limit?: number;
      includeCurrentRole?: boolean;
      minConfidence?: number;
      preferredIndustries?: string[];
    } = {}
  ): Promise<CareerRecommendation[]> {
    try {
      const { limit: maxResults = 10, includeCurrentRole = false, minConfidence = 60 } = options;
      
      // Get all available careers
      const careersResponse = await careerService.getCareers(100);
      let careers = careersResponse.careers;
      
      // Filter out current role if requested
      if (!includeCurrentRole && userProfile.currentRole) {
        careers = careers.filter(career => 
          career.title.toLowerCase() !== userProfile.currentRole?.toLowerCase()
        );
      }
      
      // Calculate compatibility scores for each career
      const recommendations: CareerRecommendation[] = [];
      
      for (const career of careers) {
        const compatibilityScore = await this.calculateCareerCompatibility(career, userProfile);
        
        if (compatibilityScore.total >= minConfidence) {
          const missingSkills = await this.identifySkillGaps(career, userProfile.skills);
          const timeToReady = this.estimateTimeToReadiness(missingSkills, userProfile.experienceYears);
          const reasoning = this.generateRecommendationReasoning(career, compatibilityScore, userProfile);
          
          recommendations.push({
            careerId: career.id!,
            careerTitle: career.title,
            matchPercentage: compatibilityScore.total,
            matchingSkills: this.identifyMatchingSkills(career, userProfile.skills),
            missingSkills,
            estimatedTimeToReady: timeToReady,
            confidenceScore: this.calculateConfidenceScore(compatibilityScore, career),
            reasoning
          });
        }
      }
      
      // Sort by match percentage and return top results
      return recommendations
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, maxResults);
    } catch (error) {
      console.error('Error generating career recommendations:', error);
      return [];
    }
  }

  // Calculate comprehensive compatibility score between user and career
  private async calculateCareerCompatibility(
    career: Career,
    userProfile: UserSkillProfile
  ): Promise<CareerCompatibilityScore> {
    // Get skills required for this career from O*NET data
    const careerSkills = await this.getCareerRequiredSkills(career);
    
    // 1. Skill Match Analysis (40 points max)
    const skillMatch = this.calculateSkillMatchScore(careerSkills, userProfile.skills);
    
    // 2. Experience Level Match (25 points max)
    const experienceMatch = this.calculateExperienceMatchScore(career, userProfile.experienceYears);
    
    // 3. Market Demand Score (20 points max)
    const marketDemand = await this.calculateMarketDemandScore(career);
    
    // 4. Salary Alignment (10 points max)
    const salaryAlignment = this.calculateSalaryAlignmentScore(career, userProfile.salaryExpectations);
    
    // 5. Industry Preference (5 points max)
    const industryPreference = this.calculateIndustryPreferenceScore(career, userProfile.preferredIndustries);
    
    const total = skillMatch + experienceMatch + marketDemand + salaryAlignment + industryPreference;
    
    return {
      skillMatch,
      experienceMatch,
      marketDemand,
      salaryAlignment,
      industryPreference,
      total: Math.min(100, total)
    };
  }

  // Get required skills for a career from Pathfinder database
  private async getCareerRequiredSkills(career: Career): Promise<Array<{skillId: string, requiredLevel: number, isRequired: boolean}>> {
    const skills: Array<{skillId: string, requiredLevel: number, isRequired: boolean}> = [];
    
    // Get skills from career's skills array (Pathfinder database)
    if (career.skills && career.skills.length > 0) {
      skills.push(...career.skills.map(skill => ({
        skillId: skill.skillId,
        requiredLevel: skill.proficiencyLevel,
        isRequired: skill.isRequired
      })));
    }
    
    return skills;
  }

  // Calculate skill match score (0-40 points)
  private calculateSkillMatchScore(
    requiredSkills: Array<{skillId: string, requiredLevel: number, isRequired: boolean}>,
    userSkills: Record<string, number>
  ): number {
    if (requiredSkills.length === 0) return 20; // Default score if no specific requirements
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    for (const reqSkill of requiredSkills) {
      const userLevel = userSkills[reqSkill.skillId] || 0;
      const weight = reqSkill.isRequired ? 2 : 1;
      
      // Score based on how well user level meets requirement
      let skillScore = 0;
      if (userLevel >= reqSkill.requiredLevel) {
        skillScore = 10; // Full points for meeting requirement
      } else if (userLevel > 0) {
        skillScore = (userLevel / reqSkill.requiredLevel) * 8; // Partial credit
      }
      
      totalScore += skillScore * weight;
      maxPossibleScore += 10 * weight;
    }
    
    return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 40 : 20;
  }

  // Calculate experience match score (0-25 points)
  private calculateExperienceMatchScore(career: Career, userExperience: number): number {
    // Estimate required experience based on career level indicators
    let requiredExperience = 2; // Default 2 years
    
    const title = career.title.toLowerCase();
    if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
      requiredExperience = 5;
    } else if (title.includes('manager') || title.includes('director') || title.includes('architect')) {
      requiredExperience = 7;
    } else if (title.includes('junior') || title.includes('entry') || title.includes('associate')) {
      requiredExperience = 1;
    }
    
    // Score based on experience alignment
    if (userExperience >= requiredExperience) {
      return 25; // Full points for meeting/exceeding requirement
    } else if (userExperience === 0) {
      return requiredExperience <= 1 ? 20 : 5; // Low score for no experience unless entry-level
    } else {
      return (userExperience / requiredExperience) * 20; // Scaled score
    }
  }

  // Calculate market demand score (0-20 points)
  private async calculateMarketDemandScore(career: Career): Promise<number> {
    // For now, use static scoring based on career fields
    // In production, this would integrate with job market APIs
    const highDemandFields = ['information', 'healthcare_social', 'professional_scientific'];
    const mediumDemandFields = ['finance_insurance', 'educational', 'management'];
    
    const careerFields = career.fields || [];
    
    if (careerFields.some(field => highDemandFields.includes(field))) {
      return 20;
    } else if (careerFields.some(field => mediumDemandFields.includes(field))) {
      return 15;
    } else {
      return 10;
    }
  }

  // Calculate salary alignment score (0-10 points)
  private calculateSalaryAlignmentScore(
    career: Career,
    salaryExpectations?: { min: number; max: number }
  ): number {
    if (!salaryExpectations || !career.averageSalary) return 5; // Default score
    
    const careerMin = career.averageSalary.min;
    const careerMax = career.averageSalary.max;
    const userMin = salaryExpectations.min;
    const userMax = salaryExpectations.max;
    
    // Check for overlap in salary ranges
    const overlapMin = Math.max(careerMin, userMin);
    const overlapMax = Math.min(careerMax, userMax);
    
    if (overlapMax >= overlapMin) {
      // Calculate percentage of overlap
      const userRange = userMax - userMin;
      const overlapRange = overlapMax - overlapMin;
      const overlapRatio = overlapRange / userRange;
      return Math.round(overlapRatio * 10);
    }
    
    // No overlap - check if career salary is higher than expectations
    if (careerMin >= userMax) return 8; // Career pays more than expected
    if (careerMax <= userMin) return 2; // Career pays less than expected
    
    return 5; // Partial overlap
  }

  // Calculate industry preference score (0-5 points)
  private calculateIndustryPreferenceScore(
    career: Career,
    preferredIndustries?: string[]
  ): number {
    if (!preferredIndustries || preferredIndustries.length === 0) return 3; // Default score
    
    const careerFields = career.fields || [];
    const matchingFields = careerFields.filter(field => 
      preferredIndustries.some(pref => 
        field.toLowerCase().includes(pref.toLowerCase()) ||
        pref.toLowerCase().includes(field.toLowerCase())
      )
    );
    
    return matchingFields.length > 0 ? 5 : 1;
  }

  // Identify skill gaps between user and career requirements
  private async identifySkillGaps(
    career: Career,
    userSkills: Record<string, number>
  ): Promise<{ skillId: string; gap: number }[]> {
    const requiredSkills = await this.getCareerRequiredSkills(career);
    const gaps: { skillId: string; gap: number }[] = [];
    
    for (const reqSkill of requiredSkills.filter(s => s.isRequired)) {
      const userLevel = userSkills[reqSkill.skillId] || 0;
      const gap = Math.max(0, reqSkill.requiredLevel - userLevel);
      
      if (gap > 0) {
        gaps.push({ skillId: reqSkill.skillId, gap });
      }
    }
    
    return gaps.sort((a, b) => b.gap - a.gap); // Sort by largest gaps first
  }

  // Identify matching skills between user and career
  private identifyMatchingSkills(
    career: Career,
    userSkills: Record<string, number>
  ): string[] {
    const matchingSkills: string[] = [];
    
    // Check career skills
    if (career.skills) {
      for (const skill of career.skills) {
        if (userSkills[skill.skillId] && userSkills[skill.skillId] >= 2) {
          matchingSkills.push(skill.skillId);
        }
      }
    }
    
    return matchingSkills;
  }

  // Estimate time to career readiness
  private estimateTimeToReadiness(
    skillGaps: { skillId: string; gap: number }[],
    currentExperience: number
  ): number {
    if (skillGaps.length === 0) return 0; // Already ready
    
    // Estimate 3 months per skill level gap, with experience reducing time
    const totalGaps = skillGaps.reduce((sum, gap) => sum + gap.gap, 0);
    const baseTime = totalGaps * 3; // months
    
    // Experience factor reduces time (max 50% reduction for 5+ years experience)
    const experienceFactor = Math.min(0.5, currentExperience * 0.1);
    const adjustedTime = Math.round(baseTime * (1 - experienceFactor));
    
    return Math.max(1, adjustedTime); // Minimum 1 month
  }

  // Calculate confidence score for recommendation
  private calculateConfidenceScore(
    compatibilityScore: CareerCompatibilityScore,
    career: Career
  ): number {
    // Base confidence on compatibility score
    let confidence = compatibilityScore.total;
    
    // Boost confidence for well-defined careers
    if (career.description && career.description.length > 100) confidence += 5;
    if (career.skills && career.skills.length > 3) confidence += 5;
    if (career.averageSalary) confidence += 3;
    
    return Math.min(100, confidence);
  }

  // Generate human-readable reasoning for recommendation
  private generateRecommendationReasoning(
    career: Career,
    score: CareerCompatibilityScore,
    userProfile: UserSkillProfile
  ): string {
    const reasons: string[] = [];
    
    // Skill-based reasons
    if (score.skillMatch >= 30) {
      reasons.push(`Strong skill alignment with your current abilities`);
    } else if (score.skillMatch >= 20) {
      reasons.push(`Good foundation with some skill development needed`);
    } else {
      reasons.push(`Growth opportunity requiring new skill acquisition`);
    }
    
    // Experience-based reasons
    if (score.experienceMatch >= 20) {
      reasons.push(`Your experience level matches well with role requirements`);
    } else if (userProfile.experienceYears === 0) {
      reasons.push(`Entry-level opportunity perfect for career starters`);
    }
    
    // Market-based reasons
    if (score.marketDemand >= 18) {
      reasons.push(`High demand in current job market`);
    } else if (score.marketDemand >= 12) {
      reasons.push(`Stable career path with consistent opportunities`);
    }
    
    // Industry alignment
    if (score.industryPreference >= 4) {
      reasons.push(`Aligns with your preferred industry focus`);
    }
    
    // Salary considerations
    if (score.salaryAlignment >= 8) {
      reasons.push(`Compensation aligns well with your expectations`);
    } else if (score.salaryAlignment >= 6) {
      reasons.push(`Competitive compensation potential`);
    }
    
    return reasons.length > 0 ? reasons.join('. ') : 'Career path shows potential for growth and development';
  }

  // Get trending career recommendations based on market data
  async getTrendingCareers(limit: number = 10): Promise<{
    career: Career;
    trendScore: number;
    reason: string;
  }[]> {
    try {
      const careersResponse = await careerService.getCareers(50);
      const careers = careersResponse.careers;
      
      // Score careers based on trending factors
      const trendingCareers = careers.map(career => {
        const trendScore = this.calculateTrendingScore(career);
        const reason = this.generateTrendingReason(career, trendScore);
        
        return { career, trendScore, reason };
      });
      
      return trendingCareers
        .filter(tc => tc.trendScore >= 60)
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting trending careers:', error);
      return [];
    }
  }

  // Calculate trending score for a career
  private calculateTrendingScore(career: Career): number {
    let score = 50; // Base score
    
    const title = career.title.toLowerCase();
    const description = career.description?.toLowerCase() || '';
    const fields = career.fields || [];
    
    // AI/ML trend boost
    if (title.includes('ai') || title.includes('machine learning') || 
        title.includes('data scientist') || description.includes('artificial intelligence')) {
      score += 25;
    }
    
    // Cloud computing trend boost
    if (title.includes('cloud') || title.includes('devops') || 
        description.includes('aws') || description.includes('kubernetes')) {
      score += 20;
    }
    
    // Cybersecurity trend boost
    if (title.includes('security') || title.includes('cyber') || 
        fields.includes('information') || fields.includes('professional_scientific')) {
      score += 20;
    }
    
    // Remote work friendly boost
    if (title.includes('developer') || title.includes('analyst') || 
        title.includes('designer') || title.includes('consultant')) {
      score += 10;
    }
    
    // High-growth field boost
    if (fields.some(field => ['information', 'healthcare_social', 'professional_scientific', 'finance_insurance'].includes(field))) {
      score += 15;
    }
    
    return Math.min(100, score);
  }

  // Generate trending reason
  private generateTrendingReason(career: Career, trendScore: number): string {
    if (trendScore >= 85) return 'Rapidly growing field with exceptional opportunities';
    if (trendScore >= 75) return 'High-demand career with strong growth potential';
    if (trendScore >= 65) return 'Emerging opportunities in expanding market';
    return 'Stable career path with consistent demand';
  }

  // Helper methods
  private normalizeCareerTitle(title: string): string {
    return title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim();
  }

  private mapSkillLevelToNumber(level: string): number {
    switch (level) {
      case 'beginner':
      case 'entry': return 2;
      case 'intermediate': return 3;
      case 'advanced': return 4;
      default: return 3;
    }
  }
}

export const careerRecommendationService = new CareerRecommendationService();