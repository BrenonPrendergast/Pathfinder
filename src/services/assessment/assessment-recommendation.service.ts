// Enhanced Career Recommendation Service with Assessment Integration
import { Career } from '../types/career.types';
import { CareerRecommendation } from '../types/skill.types';
import { 
  CareerAssessmentData, 
  PersonalityTraits, 
  WorkStylePreferences,
  CareerValues,
  SkillsAndInterests,
  ExperienceAndGoals,
  CareerMatchResult
} from '../types/assessment.types';
import { careerService } from '../career/career.service';
import { assessmentStorageService } from './assessment-storage.service';

interface PersonalityCareerMapping {
  [key: string]: {
    traits: Partial<PersonalityTraits>;
    weight: number;
    description: string;
  };
}

export class AssessmentRecommendationService {
  
  // Career-personality mapping based on research
  private readonly PERSONALITY_CAREER_MAPPING: PersonalityCareerMapping = {
    'Software Developer': {
      traits: { openness: 6, conscientiousness: 5 },
      weight: 0.8,
      description: 'High openness for problem-solving, conscientiousness for attention to detail'
    },
    'Product Manager': {
      traits: { extraversion: 5, conscientiousness: 6, agreeableness: 5 },
      weight: 0.9,
      description: 'Leadership, organization, and collaborative skills'
    },
    'Data Scientist': {
      traits: { openness: 7, conscientiousness: 6 },
      weight: 0.85,
      description: 'High openness to new methods, conscientiousness for rigorous analysis'
    },
    'UX Designer': {
      traits: { openness: 6, agreeableness: 6 },
      weight: 0.8,
      description: 'Creative openness and empathy for user needs'
    },
    'Marketing Manager': {
      traits: { extraversion: 6, openness: 5, agreeableness: 5 },
      weight: 0.85,
      description: 'Outgoing personality with creative and people skills'
    },
    'Financial Analyst': {
      traits: { conscientiousness: 6, neuroticism: 3 },
      weight: 0.8,
      description: 'Detail-oriented and emotionally stable for financial decisions'
    },
    'Sales Representative': {
      traits: { extraversion: 7, agreeableness: 5 },
      weight: 0.9,
      description: 'High social energy and interpersonal skills'
    },
    'Research Scientist': {
      traits: { openness: 7, conscientiousness: 6 },
      weight: 0.85,
      description: 'Intellectual curiosity and methodical approach'
    },
    'Human Resources': {
      traits: { agreeableness: 6, extraversion: 5, conscientiousness: 5 },
      weight: 0.8,
      description: 'People-oriented with organizational skills'
    },
    'Project Manager': {
      traits: { conscientiousness: 6, extraversion: 5 },
      weight: 0.85,
      description: 'Organizational skills and leadership abilities'
    }
  };

  /**
   * Get personalized career recommendations based on assessment data
   */
  async getAssessmentBasedRecommendations(
    userId: string, 
    options: {
      limit?: number;
      includeCurrentRole?: boolean;
      minConfidence?: number;
    } = {}
  ): Promise<CareerMatchResult[]> {
    try {
      const { limit: maxResults = 10, includeCurrentRole = false, minConfidence = 70 } = options;
      
      // Get user's assessment data
      const assessmentData = await assessmentStorageService.getUserAssessment(userId);
      if (!assessmentData) {
        console.warn('No assessment data found for user:', userId);
        return [];
      }

      // Get all available careers
      const careersResponse = await careerService.getCareers(100);
      let careers = careersResponse.careers;

      // Filter out current role if requested
      if (!includeCurrentRole && assessmentData.experienceAndGoals.currentRole) {
        careers = careers.filter(career => 
          career.title.toLowerCase() !== assessmentData.experienceAndGoals.currentRole?.toLowerCase()
        );
      }

      // Calculate comprehensive match scores
      const recommendations: CareerMatchResult[] = [];

      for (const career of careers) {
        const matchResult = await this.calculateComprehensiveMatch(career, assessmentData);
        
        if (matchResult.overallMatch >= minConfidence) {
          recommendations.push(matchResult);
        }
      }

      // Sort by overall match and return top results
      return recommendations
        .sort((a, b) => b.overallMatch - a.overallMatch)
        .slice(0, maxResults);

    } catch (error) {
      console.error('Error generating assessment-based recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate comprehensive career match including all assessment dimensions
   */
  private async calculateComprehensiveMatch(
    career: Career, 
    assessment: CareerAssessmentData
  ): Promise<CareerMatchResult> {
    
    // Calculate individual dimension scores (0-100 each)
    const personalityFit = this.calculatePersonalityFit(career, assessment.personalityTraits);
    const skillsAlignment = this.calculateSkillsAlignment(career, assessment.skillsAndInterests);
    const valuesAlignment = this.calculateValuesAlignment(career, assessment.careerValues);
    const workStyleFit = this.calculateWorkStyleFit(career, assessment.workStylePreferences);
    const marketDemand = await this.calculateMarketDemand(career);

    // Weighted overall score
    const weights = {
      personalityFit: 0.25,
      skillsAlignment: 0.30,
      valuesAlignment: 0.20,
      workStyleFit: 0.15,
      marketDemand: 0.10
    };

    const overallMatch = Math.round(
      personalityFit * weights.personalityFit +
      skillsAlignment * weights.skillsAlignment +
      valuesAlignment * weights.valuesAlignment +
      workStyleFit * weights.workStyleFit +
      marketDemand * weights.marketDemand
    );

    // Generate insights
    const reasoning = this.generateComprehensiveReasoning(
      career, assessment, {
        personalityFit, skillsAlignment, valuesAlignment, workStyleFit, marketDemand
      }
    );

    const { developmentAreas, strengthAreas } = this.identifyDevelopmentAreas(
      career, assessment, {
        personalityFit, skillsAlignment, valuesAlignment, workStyleFit
      }
    );

    const timeToReadiness = this.calculateTimeToReadiness(assessment, developmentAreas.length);

    return {
      careerId: career.id!,
      careerTitle: career.title,
      overallMatch,
      personalityFit: Math.round(personalityFit),
      skillsAlignment: Math.round(skillsAlignment),
      valuesAlignment: Math.round(valuesAlignment),
      workStyleFit: Math.round(workStyleFit),
      marketDemand: Math.round(marketDemand),
      reasoning,
      developmentAreas,
      strengthAreas,
      timeToReadiness
    };
  }

  /**
   * Calculate personality fit using Big Five traits
   */
  private calculatePersonalityFit(career: Career, personality: PersonalityTraits): number {
    const careerTitle = career.title;
    const mapping = this.PERSONALITY_CAREER_MAPPING[careerTitle];
    
    if (!mapping) {
      // Generic scoring for careers not in mapping
      return this.calculateGenericPersonalityFit(career, personality);
    }

    let totalScore = 0;
    let weightSum = 0;

    // Compare user traits with ideal traits for this career
    Object.entries(mapping.traits).forEach(([trait, idealValue]) => {
      const userValue = personality[trait as keyof PersonalityTraits];
      const difference = Math.abs(userValue - idealValue);
      const score = Math.max(0, 100 - (difference / 6) * 100); // Convert to percentage
      
      totalScore += score * mapping.weight;
      weightSum += mapping.weight;
    });

    return weightSum > 0 ? totalScore / weightSum : 70; // Default score if no mapping
  }

  /**
   * Generic personality fit calculation for unmapped careers
   */
  private calculateGenericPersonalityFit(career: Career, personality: PersonalityTraits): number {
    const title = career.title.toLowerCase();
    const description = career.description?.toLowerCase() || '';
    let score = 70; // Base score

    // Adjust based on career type indicators
    if (title.includes('manager') || title.includes('director') || title.includes('lead')) {
      score += (personality.extraversion - 4) * 5; // Leadership benefits from extraversion
      score += (personality.conscientiousness - 4) * 3;
    }

    if (title.includes('analyst') || title.includes('researcher') || title.includes('scientist')) {
      score += (personality.openness - 4) * 4; // Analytical roles benefit from openness
      score += (personality.conscientiousness - 4) * 3;
    }

    if (title.includes('designer') || title.includes('creative') || title.includes('artist')) {
      score += (personality.openness - 4) * 5; // Creative roles need high openness
      score -= Math.max(0, (personality.neuroticism - 4)) * 2; // Stability helps with creative pressure
    }

    if (title.includes('sales') || title.includes('marketing') || title.includes('customer')) {
      score += (personality.extraversion - 4) * 4; // People-facing roles
      score += (personality.agreeableness - 4) * 3;
    }

    return Math.max(20, Math.min(100, score));
  }

  /**
   * Calculate skills alignment score
   */
  private calculateSkillsAlignment(career: Career, skillsInterests: SkillsAndInterests): number {
    let score = 50; // Base score

    // Technical interests alignment
    const careerTitle = career.title.toLowerCase();
    const description = career.description?.toLowerCase() || '';
    
    skillsInterests.technicalInterests.forEach(interest => {
      const interestLower = interest.toLowerCase();
      if (careerTitle.includes(interestLower) || description.includes(interestLower)) {
        score += 15; // Boost for matching technical interests
      }
    });

    // Preferred activities alignment
    skillsInterests.preferredActivities.forEach(activity => {
      const activityLower = activity.toLowerCase();
      
      // Map activities to career characteristics
      if (activityLower.includes('problem solving') && 
          (careerTitle.includes('developer') || careerTitle.includes('analyst') || careerTitle.includes('engineer'))) {
        score += 10;
      }
      if (activityLower.includes('creative') && 
          (careerTitle.includes('designer') || careerTitle.includes('creative') || careerTitle.includes('marketing'))) {
        score += 12;
      }
      if (activityLower.includes('leadership') && 
          (careerTitle.includes('manager') || careerTitle.includes('director') || careerTitle.includes('lead'))) {
        score += 10;
      }
      if (activityLower.includes('data analysis') && 
          (careerTitle.includes('analyst') || careerTitle.includes('scientist') || careerTitle.includes('researcher'))) {
        score += 12;
      }
    });

    // Career-specific skills from database
    if (career.skills && career.skills.length > 0) {
      let skillMatches = 0;
      career.skills.forEach(careerSkill => {
        const userSkillLevel = skillsInterests.currentSoftSkills[careerSkill.skillId] || 0;
        if (userSkillLevel >= careerSkill.proficiencyLevel - 1) { // Allow 1 level tolerance
          skillMatches++;
          score += 8;
        }
      });
    }

    return Math.max(20, Math.min(100, score));
  }

  /**
   * Calculate values alignment score
   */
  private calculateValuesAlignment(career: Career, values: CareerValues): number {
    let score = 0;
    let totalWeight = 0;

    // Map career characteristics to values
    const careerTitle = career.title.toLowerCase();
    const fields = career.fields || [];
    
    // Compensation alignment
    if (career.averageSalary) {
      const salaryMidpoint = (career.averageSalary.min + career.averageSalary.max) / 2;
      let compensationScore = 70; // Base score
      
      if (salaryMidpoint > 80000) compensationScore = 85;
      if (salaryMidpoint > 120000) compensationScore = 95;
      if (salaryMidpoint < 50000) compensationScore = 50;
      
      score += compensationScore * (values.compensation / 7);
      totalWeight += values.compensation / 7;
    }

    // Work-life balance (estimated by career type)
    let workLifeScore = 70; // Default
    if (careerTitle.includes('startup') || careerTitle.includes('sales')) workLifeScore = 50;
    if (careerTitle.includes('teacher') || careerTitle.includes('librarian')) workLifeScore = 85;
    if (careerTitle.includes('consultant') || careerTitle.includes('freelance')) workLifeScore = 60;
    
    score += workLifeScore * (values.workLifeBalance / 7);
    totalWeight += values.workLifeBalance / 7;

    // Job security
    let securityScore = 70;
    if (fields.includes('government') || fields.includes('healthcare_social')) securityScore = 90;
    if (fields.includes('information') || fields.includes('professional_scientific')) securityScore = 75;
    if (careerTitle.includes('startup') || careerTitle.includes('freelance')) securityScore = 40;
    
    score += securityScore * (values.jobSecurity / 7);
    totalWeight += values.jobSecurity / 7;

    // Career growth
    let growthScore = 70;
    if (careerTitle.includes('manager') || careerTitle.includes('senior') || careerTitle.includes('lead')) growthScore = 85;
    if (fields.includes('information') || fields.includes('healthcare_social')) growthScore = 80;
    
    score += growthScore * (values.careerGrowth / 7);
    totalWeight += values.careerGrowth / 7;

    // Creativity
    let creativityScore = 50;
    if (careerTitle.includes('designer') || careerTitle.includes('creative') || careerTitle.includes('architect')) creativityScore = 90;
    if (careerTitle.includes('marketing') || careerTitle.includes('product')) creativityScore = 75;
    if (careerTitle.includes('developer') || careerTitle.includes('engineer')) creativityScore = 65;
    
    score += creativityScore * (values.creativity / 7);
    totalWeight += values.creativity / 7;

    // Add other values with default scoring
    const defaultValues = [
      'autonomy', 'socialImpact', 'intellectualChallenge', 
      'recognition', 'leadership', 'variety', 'stability'
    ];
    
    defaultValues.forEach(valueKey => {
      const valueImportance = values[valueKey as keyof CareerValues];
      score += 70 * (valueImportance / 7); // Default 70% alignment
      totalWeight += valueImportance / 7;
    });

    return totalWeight > 0 ? Math.round(score / totalWeight) : 70;
  }

  /**
   * Calculate work style fit
   */
  private calculateWorkStyleFit(career: Career, workStyle: WorkStylePreferences): number {
    let score = 70; // Base score
    const careerTitle = career.title.toLowerCase();

    // Team vs Individual preference
    if (careerTitle.includes('manager') || careerTitle.includes('lead') || careerTitle.includes('coordinator')) {
      score += (workStyle.teamOriented - 4) * 3; // Management roles benefit from team orientation
    } else if (careerTitle.includes('developer') || careerTitle.includes('writer') || careerTitle.includes('analyst')) {
      score += Math.abs(workStyle.teamOriented - 3) * -2; // Individual-focused roles
    }

    // Structure vs Flexibility
    if (careerTitle.includes('consultant') || careerTitle.includes('creative') || careerTitle.includes('entrepreneur')) {
      score += (workStyle.structuredFlexible - 4) * 3; // Flexible roles
    } else if (careerTitle.includes('accountant') || careerTitle.includes('administrator') || careerTitle.includes('clerk')) {
      score += (4 - workStyle.structuredFlexible) * 3; // Structured roles
    }

    // Analytical vs Creative
    if (careerTitle.includes('designer') || careerTitle.includes('artist') || careerTitle.includes('creative')) {
      score += (workStyle.analyticalCreative - 4) * 4; // Creative roles
    } else if (careerTitle.includes('analyst') || careerTitle.includes('scientist') || careerTitle.includes('researcher')) {
      score += (4 - workStyle.analyticalCreative) * 4; // Analytical roles
    }

    // Risk tolerance
    if (careerTitle.includes('entrepreneur') || careerTitle.includes('sales') || careerTitle.includes('trader')) {
      score += (workStyle.riskTolerance - 4) * 3; // High-risk roles
    }

    // Independence level
    if (careerTitle.includes('freelance') || careerTitle.includes('consultant') || careerTitle.includes('remote')) {
      score += (workStyle.independenceSupervision - 4) * 3; // Independent roles
    } else if (careerTitle.includes('entry') || careerTitle.includes('junior') || careerTitle.includes('assistant')) {
      score += (4 - workStyle.independenceSupervision) * 2; // Supervised roles
    }

    return Math.max(20, Math.min(100, score));
  }

  /**
   * Calculate market demand score
   */
  private async calculateMarketDemand(career: Career): Promise<number> {
    // Enhanced market demand calculation
    const fields = career.fields || [];
    const title = career.title.toLowerCase();
    
    let score = 60; // Base score

    // High-growth fields
    const highGrowthFields = ['information', 'healthcare_social', 'professional_scientific'];
    const mediumGrowthFields = ['finance_insurance', 'educational', 'management'];
    const stableFields = ['government', 'retail_trade', 'accommodation_food'];

    if (fields.some(field => highGrowthFields.includes(field))) {
      score += 25;
    } else if (fields.some(field => mediumGrowthFields.includes(field))) {
      score += 15;
    } else if (fields.some(field => stableFields.includes(field))) {
      score += 5;
    }

    // Technology trend bonus
    if (title.includes('ai') || title.includes('machine learning') || title.includes('data scientist')) {
      score += 20;
    }
    if (title.includes('cloud') || title.includes('devops') || title.includes('cybersecurity')) {
      score += 15;
    }
    if (title.includes('developer') || title.includes('software') || title.includes('programmer')) {
      score += 12;
    }

    // Remote work compatibility bonus
    if (title.includes('developer') || title.includes('designer') || title.includes('analyst') || 
        title.includes('consultant') || title.includes('writer')) {
      score += 8;
    }

    return Math.max(20, Math.min(100, score));
  }

  /**
   * Generate comprehensive reasoning for the match
   */
  private generateComprehensiveReasoning(
    career: Career,
    assessment: CareerAssessmentData,
    scores: {
      personalityFit: number;
      skillsAlignment: number;
      valuesAlignment: number;
      workStyleFit: number;
      marketDemand: number;
    }
  ): string {
    const reasons: string[] = [];

    // Personality insights
    if (scores.personalityFit >= 80) {
      reasons.push('Your personality traits align exceptionally well with this career path');
    } else if (scores.personalityFit >= 70) {
      reasons.push('Your personality shows good compatibility with this role');
    } else if (scores.personalityFit >= 60) {
      reasons.push('Your personality has potential for growth in this area');
    }

    // Skills insights
    if (scores.skillsAlignment >= 80) {
      reasons.push('Your technical interests and preferred activities strongly match this career');
    } else if (scores.skillsAlignment >= 70) {
      reasons.push('Your current skills provide a solid foundation for this career path');
    } else {
      reasons.push('This career offers opportunities to develop new skills in your areas of interest');
    }

    // Values insights
    if (scores.valuesAlignment >= 80) {
      reasons.push('This career strongly aligns with your most important values');
    } else if (scores.valuesAlignment >= 70) {
      reasons.push('The career characteristics match well with your priorities');
    }

    // Work style insights
    if (scores.workStyleFit >= 80) {
      reasons.push('The work environment and style perfectly match your preferences');
    } else if (scores.workStyleFit >= 70) {
      reasons.push('The working style aligns well with how you prefer to operate');
    }

    // Market insights
    if (scores.marketDemand >= 80) {
      reasons.push('Excellent job market outlook with high demand and growth potential');
    } else if (scores.marketDemand >= 70) {
      reasons.push('Strong market demand with good career stability');
    } else if (scores.marketDemand >= 60) {
      reasons.push('Stable career path with consistent opportunities');
    }

    // Experience level consideration
    const expLevel = assessment.experienceAndGoals.experienceLevel;
    if (expLevel === 'entry_level' && career.title.toLowerCase().includes('senior')) {
      reasons.push('Consider this as a long-term career goal as you gain experience');
    } else if (expLevel === 'senior' && career.title.toLowerCase().includes('entry')) {
      reasons.push('This could be a career change opportunity leveraging your experience');
    }

    return reasons.length > 0 ? reasons.join('. ') + '.' : 'This career path shows potential based on your assessment profile.';
  }

  /**
   * Identify development areas and strengths
   */
  private identifyDevelopmentAreas(
    career: Career,
    assessment: CareerAssessmentData,
    scores: {
      personalityFit: number;
      skillsAlignment: number;
      valuesAlignment: number;
      workStyleFit: number;
    }
  ): { developmentAreas: string[]; strengthAreas: string[] } {
    const developmentAreas: string[] = [];
    const strengthAreas: string[] = [];

    // Analyze each dimension
    if (scores.personalityFit >= 80) {
      strengthAreas.push('Personality traits naturally suit this career');
    } else if (scores.personalityFit < 60) {
      developmentAreas.push('Consider personality development through coaching or training');
    }

    if (scores.skillsAlignment >= 80) {
      strengthAreas.push('Strong technical skills foundation');
    } else if (scores.skillsAlignment < 60) {
      developmentAreas.push('Develop specific technical skills relevant to this field');
    }

    if (scores.valuesAlignment < 60) {
      developmentAreas.push('Consider if this career aligns with your long-term values');
    } else if (scores.valuesAlignment >= 80) {
      strengthAreas.push('Career values strongly align with your priorities');
    }

    if (scores.workStyleFit < 60) {
      developmentAreas.push('Adapt working style or seek roles with better style alignment');
    } else if (scores.workStyleFit >= 80) {
      strengthAreas.push('Work style preferences perfectly match this career');
    }

    // Add specific development suggestions based on career
    const careerTitle = career.title.toLowerCase();
    if (careerTitle.includes('manager') || careerTitle.includes('lead')) {
      if (assessment.personalityTraits.extraversion < 5) {
        developmentAreas.push('Develop leadership and communication skills');
      }
    }

    if (careerTitle.includes('developer') || careerTitle.includes('engineer')) {
      if (!assessment.skillsAndInterests.technicalInterests.some(interest => 
          interest.toLowerCase().includes('software') || 
          interest.toLowerCase().includes('programming'))) {
        developmentAreas.push('Gain programming and technical development skills');
      }
    }

    return { developmentAreas, strengthAreas };
  }

  /**
   * Calculate estimated time to career readiness
   */
  private calculateTimeToReadiness(
    assessment: CareerAssessmentData, 
    developmentAreasCount: number
  ): number {
    const expLevel = assessment.experienceAndGoals.experienceLevel;
    let baseTime = 6; // months

    // Adjust for experience level
    switch (expLevel) {
      case 'entry_level':
        baseTime = 12;
        break;
      case 'some_experience':
        baseTime = 8;
        break;
      case 'mid_career':
        baseTime = 4;
        break;
      case 'senior':
      case 'executive':
        baseTime = 2;
        break;
    }

    // Adjust for development areas
    baseTime += developmentAreasCount * 3;

    // Consider timeline goals
    if (assessment.experienceAndGoals.timelineGoal === 'immediate') {
      return Math.max(1, baseTime - 6);
    } else if (assessment.experienceAndGoals.timelineGoal === 'long_term') {
      return baseTime + 12;
    }

    return Math.max(1, baseTime);
  }
}

export const assessmentRecommendationService = new AssessmentRecommendationService();