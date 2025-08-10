// Quest recommendation service - provides personalized quest suggestions
import { Quest } from '../types';
import { UserProfile } from '../../contexts/AuthContext';
import { questService } from '../quest/quest.service';
import { careerService } from '../career/career.service';

export interface QuestRecommendation {
  quest: Quest;
  score: number;
  reasons: RecommendationReason[];
  category: 'skill_gap' | 'career_aligned' | 'next_level' | 'interest_based' | 'popular';
}

export interface RecommendationReason {
  type: 'skill_development' | 'career_progress' | 'difficulty_match' | 'prerequisite_ready' | 'trending';
  message: string;
  weight: number;
}

class QuestRecommendationService {
  
  // Get personalized quest recommendations for a user
  async getRecommendationsForUser(userProfile: UserProfile): Promise<QuestRecommendation[]> {
    try {
      // Get all available quests
      const allQuests = await questService.getQuests();
      
      // Filter out already completed quests
      const availableQuests = allQuests.filter(quest => 
        !userProfile.completedQuests.includes(quest.id)
      );

      // Generate recommendations with scoring
      const recommendations: QuestRecommendation[] = [];

      for (const quest of availableQuests) {
        const recommendation = await this.scoreQuest(quest, userProfile);
        if (recommendation.score > 0) {
          recommendations.push(recommendation);
        }
      }

      // Sort by score (highest first) and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 12); // Return top 12 recommendations

    } catch (error) {
      console.error('Error generating quest recommendations:', error);
      return [];
    }
  }

  // Score a quest for a specific user
  private async scoreQuest(quest: Quest, userProfile: UserProfile): Promise<QuestRecommendation> {
    let score = 0;
    const reasons: RecommendationReason[] = [];
    let category: QuestRecommendation['category'] = 'interest_based';

    // 1. Career Alignment Scoring (30% weight)
    const careerScore = this.scoreCareerAlignment(quest, userProfile);
    score += careerScore.score;
    reasons.push(...careerScore.reasons);
    if (careerScore.score > 15) category = 'career_aligned';

    // 2. Skill Gap Analysis (25% weight)
    const skillScore = this.scoreSkillGaps(quest, userProfile);
    score += skillScore.score;
    reasons.push(...skillScore.reasons);
    if (skillScore.score > 12) category = 'skill_gap';

    // 3. Difficulty Matching (20% weight)
    const difficultyScore = this.scoreDifficultyMatch(quest, userProfile);
    score += difficultyScore.score;
    reasons.push(...difficultyScore.reasons);
    if (difficultyScore.score > 15) category = 'next_level';

    // 4. Prerequisites & Learning Path (15% weight)
    const prerequisiteScore = this.scorePrerequisites(quest, userProfile);
    score += prerequisiteScore.score;
    reasons.push(...prerequisiteScore.reasons);

    // 5. Learning Preferences (10% weight)
    const preferenceScore = this.scoreLearningPreferences(quest, userProfile);
    score += preferenceScore.score;
    reasons.push(...preferenceScore.reasons);

    return {
      quest,
      score: Math.min(100, score), // Cap at 100
      reasons: reasons.filter(reason => reason.weight > 0),
      category
    };
  }

  // Score based on career path alignment
  private scoreCareerAlignment(quest: Quest, userProfile: UserProfile): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    // Check if quest relates to user's active career paths
    const activeCareerIds = userProfile.careerPaths
      .filter(path => path.isActive)
      .map(path => path.careerId);

    const relevantCareers = quest.relatedCareers.filter(careerId => 
      activeCareerIds.includes(careerId) || 
      userProfile.careerPaths.some(path => path.careerId === careerId)
    );

    if (relevantCareers.length > 0) {
      const careerMatch = relevantCareers.length * 10; // 10 points per matching career
      score += careerMatch;
      
      reasons.push({
        type: 'career_progress',
        message: `Advances your ${relevantCareers.length > 1 ? 'career paths' : 'career path'}`,
        weight: careerMatch
      });
    }

    // Bonus for active career path
    if (activeCareerIds.some(id => quest.relatedCareers.includes(id))) {
      score += 10;
      reasons.push({
        type: 'career_progress',
        message: 'Directly supports your active career goal',
        weight: 10
      });
    }

    return { score, reasons };
  }

  // Score based on skill gaps and development needs
  private scoreSkillGaps(quest: Quest, userProfile: UserProfile): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    if (!quest.skillRewards || quest.skillRewards.length === 0) {
      return { score: 0, reasons: [] };
    }

    for (const skillReward of quest.skillRewards) {
      const currentHours = userProfile.skillHours[skillReward.skillId] || 0;
      const currentProficiency = userProfile.skillProficiencies[skillReward.skillId] || 1;

      // Higher score for skills that need development
      if (currentProficiency < 3) { // Below intermediate
        score += 8;
        reasons.push({
          type: 'skill_development',
          message: `Develops ${skillReward.skillName} (currently ${this.getProficiencyLabel(currentProficiency)})`,
          weight: 8
        });
      } else if (currentProficiency < 5) { // Below expert
        score += 5;
        reasons.push({
          type: 'skill_development',
          message: `Advances ${skillReward.skillName} to higher proficiency`,
          weight: 5
        });
      }

      // Bonus for skills with zero hours (completely new)
      if (currentHours === 0) {
        score += 5;
        reasons.push({
          type: 'skill_development',
          message: `Learn new skill: ${skillReward.skillName}`,
          weight: 5
        });
      }
    }

    return { score, reasons };
  }

  // Score based on difficulty match to user's skill level
  private scoreDifficultyMatch(quest: Quest, userProfile: UserProfile): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    const userLevel = userProfile.level;
    const preferredDifficulty = userProfile.learningPreferences.preferredDifficulty;

    // Calculate user's overall skill level
    const skillLevels = Object.values(userProfile.skillProficiencies);
    const avgSkillLevel = skillLevels.length > 0 
      ? skillLevels.reduce((sum, level) => sum + level, 0) / skillLevels.length
      : 1;

    // Score based on difficulty preference match
    if (quest.difficulty === preferredDifficulty) {
      score += 15;
      reasons.push({
        type: 'difficulty_match',
        message: `Matches your preferred ${preferredDifficulty} difficulty`,
        weight: 15
      });
    }

    // Score based on progression logic
    if (quest.difficulty === 'beginner' && avgSkillLevel < 2) {
      score += 10;
      reasons.push({
        type: 'difficulty_match',
        message: 'Perfect for building foundational skills',
        weight: 10
      });
    } else if (quest.difficulty === 'intermediate' && avgSkillLevel >= 2 && avgSkillLevel < 4) {
      score += 12;
      reasons.push({
        type: 'difficulty_match',
        message: 'Good next step to advance your skills',
        weight: 12
      });
    } else if (quest.difficulty === 'advanced' && avgSkillLevel >= 4) {
      score += 8;
      reasons.push({
        type: 'difficulty_match',
        message: 'Challenging quest to master advanced concepts',
        weight: 8
      });
    }

    return { score, reasons };
  }

  // Score based on prerequisites readiness
  private scorePrerequisites(quest: Quest, userProfile: UserProfile): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    if (quest.prerequisites.length === 0) {
      score += 5; // Bonus for no prerequisites
      reasons.push({
        type: 'prerequisite_ready',
        message: 'No prerequisites required - ready to start',
        weight: 5
      });
    } else {
      // Check if user has completed prerequisite quests or has relevant skills
      let metPrerequisites = 0;
      
      for (const prereq of quest.prerequisites) {
        // Check if user has completed a quest with this prerequisite
        const hasSkill = userProfile.skillProficiencies[prereq] >= 2; // At least beginner level
        const completedRelatedQuest = userProfile.completedQuests.length > 0; // Simplified check
        
        if (hasSkill || completedRelatedQuest) {
          metPrerequisites++;
        }
      }

      const prerequisiteRatio = metPrerequisites / quest.prerequisites.length;
      score += prerequisiteRatio * 10;

      if (prerequisiteRatio >= 0.8) {
        reasons.push({
          type: 'prerequisite_ready',
          message: 'You meet the prerequisites for this quest',
          weight: 8
        });
      } else if (prerequisiteRatio >= 0.5) {
        reasons.push({
          type: 'prerequisite_ready',
          message: 'You meet most prerequisites - slight challenge',
          weight: 5
        });
      }
    }

    return { score, reasons };
  }

  // Score based on user's learning preferences
  private scoreLearningPreferences(quest: Quest, userProfile: UserProfile): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    const preferences = userProfile.learningPreferences;

    // Match quest type to user interests (simplified)
    if (quest.type === 'certification' && preferences.focusAreas.includes('certifications')) {
      score += 8;
      reasons.push({
        type: 'difficulty_match',
        message: 'Matches your interest in certifications',
        weight: 8
      });
    }

    // Time commitment match
    if (quest.estimatedHours <= preferences.timeCommitmentHours * 2) { // Within 2 weeks
      score += 5;
      reasons.push({
        type: 'difficulty_match',
        message: `Fits your weekly time commitment (${quest.estimatedHours}h total)`,
        weight: 5
      });
    }

    return { score, reasons };
  }

  // Get user-friendly proficiency label
  private getProficiencyLabel(level: number): string {
    switch(level) {
      case 1: return 'Novice';
      case 2: return 'Beginner';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  }

  // Get recommendations by category
  async getRecommendationsByCategory(
    userProfile: UserProfile, 
    category: QuestRecommendation['category']
  ): Promise<QuestRecommendation[]> {
    const allRecommendations = await this.getRecommendationsForUser(userProfile);
    return allRecommendations.filter(rec => rec.category === category);
  }

  // Get quick recommendations for dashboard
  async getQuickRecommendations(userProfile: UserProfile, limit: number = 3): Promise<QuestRecommendation[]> {
    const recommendations = await this.getRecommendationsForUser(userProfile);
    return recommendations.slice(0, limit);
  }
}

export const questRecommendationService = new QuestRecommendationService();