// O*NET Integration Service - Maps real-world job skills from O*NET database
import { HardSkill } from '../types/skill.types';
import { CareerSkill } from '../types/career.types';

// O*NET API endpoint (public access)
const ONET_API_BASE = 'https://services.onetcenter.org/ws';

// Standard Occupational Classification (SOC) codes for major tech careers
export const CAREER_SOC_MAPPING = {
  'software-developer': ['15-1252.00', '15-1256.00', '15-1254.01'], // Software Developers, Web Developers, Front-End Developers
  'data-scientist': ['15-2051.00', '15-2041.01'], // Data Scientists, Biostatisticians  
  'ux-designer': ['27-1024.00', '15-1255.00'], // Graphic Designers, UI/UX Designers
  'cybersecurity': ['15-1212.00', '33-9032.00'], // Information Security Analysts, Security Guards
  'product-manager': ['11-3021.00', '13-1161.00'], // Computer Systems Managers, Market Research Analysts
  'data-analyst': ['15-2051.01', '15-2041.00'], // Data Scientists, Statisticians
  'cloud-engineer': ['15-1244.00', '15-1241.00'], // Network/Systems Administrators, Computer Network Architects
  'devops-engineer': ['15-1244.00', '15-1252.00'], // Network/Systems Administrators, Software Developers
  'mobile-developer': ['15-1252.00', '15-1254.00'], // Software Developers, Web/Mobile Developers
  'ai-engineer': ['15-2051.00', '15-1252.00'] // Data Scientists, Software Developers
};

// O*NET Hard Skill interface (more flexible than our internal HardSkill interface)
export interface ONetHardSkill {
  id: string;
  name: string;
  category: string; // String literal instead of enum
  description: string;
  onetCodes: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  marketDemand: number;
  averageSalaryImpact: number;
  prerequisites: string[];
  relatedSkills: string[];
  industries: string[];
  certifications: string[];
  learningResources: Array<{
    type: string;
    title: string;
    url: string;
    estimatedHours: number;
  }>;
  proficiencyLevels: Record<number, string>;
}

// Hard skills extracted from O*NET knowledge and skills data
export const ONET_HARD_SKILLS_DATA: ONetHardSkill[] = [
  // Programming Languages
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Programming Languages',
    description: 'Object-oriented programming language for web development, mobile apps, and server-side programming.',
    onetCodes: ['15-1252.00', '15-1254.01', '15-1256.00'],
    skillLevel: 'intermediate',
    marketDemand: 95,
    averageSalaryImpact: 15000,
    prerequisites: ['html', 'css', 'programming_fundamentals'],
    relatedSkills: ['typescript', 'react', 'nodejs', 'web_development'],
    industries: ['Technology', 'E-commerce', 'Media', 'Finance'],
    certifications: ['JavaScript Developer Certification', 'AWS Certified Developer'],
    learningResources: [
      {
        type: 'documentation',
        title: 'MDN JavaScript Guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        estimatedHours: 40
      }
    ],
    proficiencyLevels: {
      1: 'Basic syntax and DOM manipulation',
      2: 'Functions, objects, and event handling',
      3: 'ES6+, async programming, and frameworks',
      4: 'Performance optimization and advanced patterns',
      5: 'Architecture design and mentoring others'
    }
  },
  {
    id: 'python',
    name: 'Python',
    category: 'Programming Languages',
    description: 'High-level programming language for data science, web development, automation, and AI/ML applications.',
    onetCodes: ['15-2051.00', '15-1252.00', '15-2041.00'],
    skillLevel: 'intermediate',
    marketDemand: 90,
    averageSalaryImpact: 18000,
    prerequisites: ['programming_fundamentals', 'mathematics'],
    relatedSkills: ['data_analysis', 'machine_learning', 'django', 'flask'],
    industries: ['Technology', 'Data Science', 'Research', 'Finance'],
    certifications: ['Python Institute Certifications', 'Google Data Analytics'],
    learningResources: [
      {
        type: 'course',
        title: 'Python for Data Science',
        url: 'https://www.python.org/about/gettingstarted/',
        estimatedHours: 60
      }
    ],
    proficiencyLevels: {
      1: 'Basic syntax and data structures',
      2: 'Object-oriented programming and modules',
      3: 'Libraries (pandas, numpy) and web frameworks',
      4: 'Advanced concepts and performance tuning',
      5: 'System architecture and team leadership'
    }
  },
  
  // Data & Analytics
  {
    id: 'sql',
    name: 'SQL',
    category: 'Data & Analytics',
    description: 'Structured Query Language for managing and analyzing relational databases.',
    onetCodes: ['15-2051.00', '15-1244.00', '15-2041.00'],
    skillLevel: 'beginner',
    marketDemand: 85,
    averageSalaryImpact: 12000,
    prerequisites: ['database_fundamentals'],
    relatedSkills: ['data_analysis', 'database_design', 'business_intelligence'],
    industries: ['Technology', 'Finance', 'Healthcare', 'Retail'],
    certifications: ['Microsoft SQL Server Certification', 'Oracle Database Certification'],
    learningResources: [
      {
        type: 'course',
        title: 'SQL for Data Analysis',
        url: 'https://www.w3schools.com/sql/',
        estimatedHours: 30
      }
    ],
    proficiencyLevels: {
      1: 'Basic SELECT, INSERT, UPDATE, DELETE',
      2: 'JOINs, subqueries, and functions',
      3: 'Complex queries, indexes, and optimization',
      4: 'Stored procedures, triggers, and performance tuning',
      5: 'Database design and architecture'
    }
  },
  {
    id: 'machine_learning',
    name: 'Machine Learning',
    category: 'Data Science',
    description: 'Algorithms and statistical models that computer systems use to perform tasks without explicit instructions.',
    onetCodes: ['15-2051.00', '15-2041.01'],
    skillLevel: 'advanced',
    marketDemand: 80,
    averageSalaryImpact: 25000,
    prerequisites: ['python', 'statistics', 'mathematics', 'data_analysis'],
    relatedSkills: ['deep_learning', 'data_visualization', 'python', 'tensorflow'],
    industries: ['Technology', 'Healthcare', 'Finance', 'Automotive'],
    certifications: ['Google AI Certification', 'AWS Machine Learning', 'Coursera ML Certificate'],
    learningResources: [
      {
        type: 'course',
        title: 'Machine Learning Fundamentals',
        url: 'https://www.coursera.org/learn/machine-learning',
        estimatedHours: 80
      }
    ],
    proficiencyLevels: {
      1: 'Understanding ML concepts and terminology',
      2: 'Implementing basic algorithms with libraries',
      3: 'Model selection, evaluation, and tuning',
      4: 'Advanced algorithms and custom implementations',
      5: 'Research and innovation in ML techniques'
    }
  },

  // Cloud & Infrastructure
  {
    id: 'aws',
    name: 'Amazon Web Services (AWS)',
    category: 'Cloud Computing',
    description: 'Cloud computing platform offering scalable infrastructure, storage, databases, and services.',
    onetCodes: ['15-1244.00', '15-1252.00', '15-1241.00'],
    skillLevel: 'intermediate',
    marketDemand: 88,
    averageSalaryImpact: 20000,
    prerequisites: ['linux', 'networking', 'system_administration'],
    relatedSkills: ['docker', 'kubernetes', 'devops', 'cloud_architecture'],
    industries: ['Technology', 'Enterprise', 'Startups', 'Government'],
    certifications: ['AWS Solutions Architect', 'AWS Developer', 'AWS SysOps'],
    learningResources: [
      {
        type: 'certification',
        title: 'AWS Cloud Practitioner',
        url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
        estimatedHours: 60
      }
    ],
    proficiencyLevels: {
      1: 'Basic AWS services and console navigation',
      2: 'EC2, S3, RDS deployment and configuration',
      3: 'Auto-scaling, load balancing, and monitoring',
      4: 'Advanced services and infrastructure as code',
      5: 'Multi-region architecture and cost optimization'
    }
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'DevOps',
    description: 'Platform for developing, shipping, and running applications using containerization technology.',
    onetCodes: ['15-1244.00', '15-1252.00'],
    skillLevel: 'intermediate',
    marketDemand: 75,
    averageSalaryImpact: 15000,
    prerequisites: ['linux', 'command_line', 'networking'],
    relatedSkills: ['kubernetes', 'devops', 'aws', 'microservices'],
    industries: ['Technology', 'DevOps', 'Cloud Services'],
    certifications: ['Docker Certified Associate'],
    learningResources: [
      {
        type: 'course',
        title: 'Docker Fundamentals',
        url: 'https://docs.docker.com/get-started/',
        estimatedHours: 25
      }
    ],
    proficiencyLevels: {
      1: 'Basic container concepts and commands',
      2: 'Dockerfile creation and image management',
      3: 'Docker Compose and multi-container apps',
      4: 'Production deployment and optimization',
      5: 'Container orchestration and security'
    }
  },

  // Design & UX
  {
    id: 'figma',
    name: 'Figma',
    category: 'Design Tools',
    description: 'Collaborative interface design tool for creating user interfaces, prototypes, and design systems.',
    onetCodes: ['27-1024.00', '15-1255.00'],
    skillLevel: 'beginner',
    marketDemand: 70,
    averageSalaryImpact: 8000,
    prerequisites: ['design_principles', 'user_experience'],
    relatedSkills: ['user_interface_design', 'prototyping', 'user_research', 'design_systems'],
    industries: ['Technology', 'Design', 'Marketing', 'E-commerce'],
    certifications: ['Figma Professional Certification'],
    learningResources: [
      {
        type: 'tutorial',
        title: 'Figma for Beginners',
        url: 'https://www.figma.com/resources/learn-design/',
        estimatedHours: 20
      }
    ],
    proficiencyLevels: {
      1: 'Basic shapes, text, and layer management',
      2: 'Components, styles, and simple prototypes',
      3: 'Advanced prototyping and design systems',
      4: 'Complex interactions and design workflows',
      5: 'Team leadership and design process optimization'
    }
  },

  // Web Development
  {
    id: 'react',
    name: 'React',
    category: 'Web Frameworks',
    description: 'JavaScript library for building user interfaces, particularly web applications with interactive UIs.',
    onetCodes: ['15-1254.01', '15-1252.00'],
    skillLevel: 'intermediate',
    marketDemand: 85,
    averageSalaryImpact: 16000,
    prerequisites: ['javascript', 'html', 'css', 'es6'],
    relatedSkills: ['typescript', 'redux', 'nodejs', 'web_development'],
    industries: ['Technology', 'E-commerce', 'Media', 'SaaS'],
    certifications: ['React Developer Certification'],
    learningResources: [
      {
        type: 'documentation',
        title: 'React Official Tutorial',
        url: 'https://reactjs.org/tutorial/tutorial.html',
        estimatedHours: 35
      }
    ],
    proficiencyLevels: {
      1: 'Components, JSX, and props',
      2: 'State management and lifecycle methods',
      3: 'Hooks, context, and performance optimization',
      4: 'Advanced patterns and testing',
      5: 'Architecture design and team mentoring'
    }
  }
];

export class ONetIntegrationService {
  
  // Get hard skills for a specific career based on O*NET SOC codes
  getSkillsForCareer(careerId: string): ONetHardSkill[] {
    const socCodes = CAREER_SOC_MAPPING[careerId as keyof typeof CAREER_SOC_MAPPING] || [];
    
    return ONET_HARD_SKILLS_DATA.filter(skill => 
      socCodes.some(socCode => skill.onetCodes.includes(socCode))
    );
  }

  // Convert O*NET skills to CareerSkill format for integration
  convertToCareerSkills(hardSkills: ONetHardSkill[], careerId: string): CareerSkill[] {
    return hardSkills.map(skill => ({
      skillId: skill.id,
      skillName: skill.name,
      skillType: 'hard' as const,
      proficiencyLevel: this.mapSkillLevelToNumber(skill.skillLevel),
      isRequired: skill.marketDemand > 80,
      estimatedHours: this.estimateHoursToMaster(skill.skillLevel)
    }));
  }

  // Get top skills by market demand
  getTopDemandSkills(limit: number = 10): ONetHardSkill[] {
    return ONET_HARD_SKILLS_DATA
      .sort((a, b) => b.marketDemand - a.marketDemand)
      .slice(0, limit);
  }

  // Get skills by category
  getSkillsByCategory(category: string): ONetHardSkill[] {
    return ONET_HARD_SKILLS_DATA.filter(skill => skill.category === category);
  }

  // Get all available skill categories
  getSkillCategories(): string[] {
    const categories = new Set(ONET_HARD_SKILLS_DATA.map(skill => skill.category));
    return Array.from(categories);
  }

  // Search skills by name or description
  searchSkills(query: string): ONetHardSkill[] {
    const lowercaseQuery = query.toLowerCase();
    return ONET_HARD_SKILLS_DATA.filter(skill =>
      skill.name.toLowerCase().includes(lowercaseQuery) ||
      skill.description.toLowerCase().includes(lowercaseQuery) ||
      skill.relatedSkills.some(related => related.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get skill prerequisites and learning path
  getSkillLearningPath(skillId: string): { prerequisites: ONetHardSkill[], nextSteps: ONetHardSkill[] } {
    const skill = ONET_HARD_SKILLS_DATA.find(s => s.id === skillId);
    if (!skill) return { prerequisites: [], nextSteps: [] };

    const prerequisites = ONET_HARD_SKILLS_DATA.filter(s => 
      skill.prerequisites.includes(s.id)
    );

    const nextSteps = ONET_HARD_SKILLS_DATA.filter(s => 
      s.prerequisites.includes(skillId)
    );

    return { prerequisites, nextSteps };
  }

  // Calculate skill compatibility score for user
  calculateSkillCompatibilityScore(skill: ONetHardSkill, userSkills: Record<string, number>): number {
    let score = 0;
    
    // Check prerequisites
    const metPrerequisites = skill.prerequisites.filter(prereq => 
      userSkills[prereq] >= 2 // At least beginner level
    ).length;
    const prerequisiteRatio = skill.prerequisites.length > 0 
      ? metPrerequisites / skill.prerequisites.length 
      : 1;
    
    score += prerequisiteRatio * 40; // 40% weight for prerequisites
    
    // Market demand factor
    score += (skill.marketDemand / 100) * 30; // 30% weight for market demand
    
    // Salary impact factor
    const normalizedSalaryImpact = Math.min(skill.averageSalaryImpact / 30000, 1);
    score += normalizedSalaryImpact * 20; // 20% weight for salary impact
    
    // Learning difficulty factor (inverse - easier skills get higher score)
    const difficultyScore = skill.skillLevel === 'beginner' ? 1 : 
                          skill.skillLevel === 'intermediate' ? 0.7 : 0.4;
    score += difficultyScore * 10; // 10% weight for accessibility
    
    return Math.min(100, score);
  }

  // Get personalized skill recommendations for user
  getPersonalizedSkillRecommendations(
    userSkills: Record<string, number>,
    careerIds: string[],
    limit: number = 10
  ): { skill: ONetHardSkill, score: number, reason: string }[] {
    let relevantSkills: ONetHardSkill[] = [];
    
    // Get skills relevant to user's career paths
    careerIds.forEach(careerId => {
      const careerSkills = this.getSkillsForCareer(careerId);
      relevantSkills.push(...careerSkills);
    });
    
    // Remove duplicates and skills user already has at high level
    const uniqueSkills = relevantSkills.filter((skill, index, array) => 
      array.findIndex(s => s.id === skill.id) === index &&
      (userSkills[skill.id] || 0) < 4 // Not already at advanced level
    );
    
    // Calculate compatibility scores
    const recommendations = uniqueSkills.map(skill => ({
      skill,
      score: this.calculateSkillCompatibilityScore(skill, userSkills),
      reason: this.generateRecommendationReason(skill, userSkills)
    }));
    
    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Private helper methods
  private mapSkillLevelToNumber(level: 'beginner' | 'intermediate' | 'advanced'): number {
    switch (level) {
      case 'beginner': return 2;
      case 'intermediate': return 3;
      case 'advanced': return 4;
      default: return 3;
    }
  }

  private estimateHoursToMaster(level: 'beginner' | 'intermediate' | 'advanced'): number {
    switch (level) {
      case 'beginner': return 40;
      case 'intermediate': return 80;
      case 'advanced': return 150;
      default: return 80;
    }
  }

  private generateRecommendationReason(skill: ONetHardSkill, userSkills: Record<string, number>): string {
    if (skill.marketDemand > 90) return 'High market demand skill';
    if (skill.averageSalaryImpact > 20000) return 'Significant salary impact';
    
    const metPrerequisites = skill.prerequisites.filter(prereq => 
      userSkills[prereq] >= 2
    ).length;
    
    if (metPrerequisites === skill.prerequisites.length) {
      return 'You meet all prerequisites';
    } else if (metPrerequisites > skill.prerequisites.length * 0.5) {
      return 'You meet most prerequisites';
    }
    
    return 'Builds on your existing skills';
  }
}

export const onetIntegrationService = new ONetIntegrationService();