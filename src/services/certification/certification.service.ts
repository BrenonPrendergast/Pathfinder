// Certification Service - Manages professional certifications and skill unlock mappings
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  db
} from '../firebase/firestore-base';
import { Certification, UserCertification, SkillProficiencyLevel } from '../types/skill.types';

export class CertificationService {

  // Seed certifications database with industry-standard certifications
  async seedCertifications(): Promise<void> {
    console.log('Seeding certifications database...');
    const batch = writeBatch(db);
    
    const certifications = CERTIFICATION_DATA;
    
    certifications.forEach(certification => {
      const certRef = doc(collection(db, 'certifications'));
      batch.set(certRef, {
        ...certification,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`✅ Seeded ${certifications.length} certifications to database`);
  }

  // Get all available certifications
  async getAllCertifications(): Promise<Certification[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'certifications'));
      const certifications: Certification[] = [];
      
      querySnapshot.forEach(doc => {
        certifications.push({ id: doc.id, ...doc.data() } as Certification);
      });
      
      return certifications.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching certifications:', error);
      return [];
    }
  }

  // Get certifications by provider
  async getCertificationsByProvider(provider: string): Promise<Certification[]> {
    try {
      const q = query(
        collection(db, 'certifications'),
        where('provider', '==', provider)
      );
      const querySnapshot = await getDocs(q);
      const certifications: Certification[] = [];
      
      querySnapshot.forEach(doc => {
        certifications.push({ id: doc.id, ...doc.data() } as Certification);
      });
      
      return certifications.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error(`Error fetching certifications for provider ${provider}:`, error);
      return [];
    }
  }

  // Get certifications that unlock specific skills
  async getCertificationsForSkill(skillId: string): Promise<Certification[]> {
    try {
      const q = query(
        collection(db, 'certifications'),
        where('skillsUnlocked', 'array-contains', skillId)
      );
      const querySnapshot = await getDocs(q);
      const certifications: Certification[] = [];
      
      querySnapshot.forEach(doc => {
        certifications.push({ id: doc.id, ...doc.data() } as Certification);
      });
      
      return certifications.sort((a, b) => b.skillBoostAmount - a.skillBoostAmount);
    } catch (error) {
      console.error(`Error fetching certifications for skill ${skillId}:`, error);
      return [];
    }
  }

  // Get certification by ID
  async getCertificationById(certId: string): Promise<Certification | null> {
    try {
      const certRef = doc(db, 'certifications', certId);
      const certDoc = await getDoc(certRef);
      
      if (certDoc.exists()) {
        return { id: certDoc.id, ...certDoc.data() } as Certification;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching certification ${certId}:`, error);
      return null;
    }
  }

  // Get user's earned certifications
  async getUserCertifications(userId: string): Promise<UserCertification[]> {
    try {
      const q = query(
        collection(db, 'user-certifications'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const userCertifications: UserCertification[] = [];
      
      querySnapshot.forEach(doc => {
        userCertifications.push({ ...doc.data() } as UserCertification);
      });
      
      return userCertifications.sort((a, b) => b.dateEarned.getTime() - a.dateEarned.getTime());
    } catch (error) {
      console.error(`Error fetching user certifications for ${userId}:`, error);
      return [];
    }
  }

  // Add certification to user profile
  async addUserCertification(
    userId: string,
    certificationId: string,
    dateEarned: Date,
    credentialUrl?: string,
    notes?: string
  ): Promise<void> {
    try {
      const certification = await this.getCertificationById(certificationId);
      if (!certification) {
        throw new Error(`Certification ${certificationId} not found`);
      }

      // Calculate skill advancements
      const skillsAdvanced = certification.skillsUnlocked.map(skillId => ({
        skillId,
        levelsGained: Math.min(certification.skillBoostAmount, 2) // Cap at 2 levels per certification
      }));

      const userCertification: Omit<UserCertification, 'id'> = {
        userId,
        certificationId,
        dateEarned,
        expirationDate: certification.expirationDate,
        credentialUrl,
        notes,
        skillsAdvanced
      };

      await addDoc(collection(db, 'user-certifications'), {
        ...userCertification,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Added certification ${certification.name} for user ${userId}`);
    } catch (error) {
      console.error('Error adding user certification:', error);
      throw error;
    }
  }

  // Update user certification
  async updateUserCertification(
    userId: string,
    certificationId: string,
    updates: Partial<UserCertification>
  ): Promise<void> {
    try {
      const q = query(
        collection(db, 'user-certifications'),
        where('userId', '==', userId),
        where('certificationId', '==', certificationId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Updated certification ${certificationId} for user ${userId}`);
      }
    } catch (error) {
      console.error('Error updating user certification:', error);
      throw error;
    }
  }

  // Remove user certification
  async removeUserCertification(userId: string, certificationId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'user-certifications'),
        where('userId', '==', userId),
        where('certificationId', '==', certificationId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        await deleteDoc(querySnapshot.docs[0].ref);
        console.log(`✅ Removed certification ${certificationId} for user ${userId}`);
      }
    } catch (error) {
      console.error('Error removing user certification:', error);
      throw error;
    }
  }

  // Get recommended certifications for user based on skills and career goals
  async getRecommendedCertifications(
    userId: string,
    careerIds: string[],
    userSkills: Record<string, number>,
    limit: number = 8
  ): Promise<{ certification: Certification, score: number, reason: string }[]> {
    try {
      const allCertifications = await this.getAllCertifications();
      const userCertifications = await this.getUserCertifications(userId);
      const earnedCertIds = new Set(userCertifications.map(uc => uc.certificationId));
      
      // Filter out already earned certifications
      const availableCertifications = allCertifications.filter(cert => 
        !earnedCertIds.has(cert.id)
      );
      
      // Score certifications based on relevance
      const recommendations = availableCertifications.map(cert => {
        const score = this.calculateCertificationScore(cert, userSkills, careerIds);
        const reason = this.generateCertificationReason(cert, userSkills);
        return { certification: cert, score, reason };
      });
      
      return recommendations
        .filter(rec => rec.score > 20) // Only recommend if score is above threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting certification recommendations:', error);
      return [];
    }
  }

  // Get skill boost preview for certification
  async getSkillBoostPreview(
    certificationId: string,
    currentSkills: Record<string, number>
  ): Promise<{ skillId: string, currentLevel: number, newLevel: number, gained: number }[]> {
    try {
      const certification = await this.getCertificationById(certificationId);
      if (!certification) return [];
      
      return certification.skillsUnlocked.map(skillId => {
        const currentLevel = currentSkills[skillId] || 0;
        const gained = Math.min(certification.skillBoostAmount, 2);
        const newLevel = Math.min(currentLevel + gained, 5); // Cap at expert level
        
        return {
          skillId,
          currentLevel,
          newLevel,
          gained: newLevel - currentLevel
        };
      });
    } catch (error) {
      console.error('Error calculating skill boost preview:', error);
      return [];
    }
  }

  // Get certification providers
  async getCertificationProviders(): Promise<string[]> {
    try {
      const allCertifications = await this.getAllCertifications();
      const providers = Array.from(new Set(allCertifications.map(cert => cert.provider)));
      return providers.sort();
    } catch (error) {
      console.error('Error getting certification providers:', error);
      return [];
    }
  }

  // Private helper methods
  private calculateCertificationScore(
    certification: Certification,
    userSkills: Record<string, number>,
    careerIds: string[]
  ): number {
    let score = 0;
    
    // Base relevance score (20 points)
    score += 20;
    
    // Skills alignment score (40 points)
    const relevantSkills = certification.skillsUnlocked.filter(skillId => 
      userSkills[skillId] !== undefined
    );
    const skillAlignment = relevantSkills.length / certification.skillsUnlocked.length;
    score += skillAlignment * 40;
    
    // Skill improvement potential (30 points)
    const improvementPotential = certification.skillsUnlocked.reduce((total, skillId) => {
      const currentLevel = userSkills[skillId] || 0;
      const maxImprovement = Math.min(certification.skillBoostAmount, 5 - currentLevel);
      return total + (maxImprovement > 0 ? maxImprovement / 5 : 0);
    }, 0) / certification.skillsUnlocked.length;
    score += improvementPotential * 30;
    
    // Provider credibility bonus (10 points)
    const premiumProviders = ['AWS', 'Google', 'Microsoft', 'Oracle', 'Cisco', 'Adobe'];
    if (premiumProviders.includes(certification.provider)) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private generateCertificationReason(
    certification: Certification,
    userSkills: Record<string, number>
  ): string {
    const skillCount = certification.skillsUnlocked.length;
    const relevantSkills = certification.skillsUnlocked.filter(skillId => 
      userSkills[skillId] !== undefined
    ).length;
    
    if (relevantSkills === skillCount) {
      return `Perfect match - advances all ${skillCount} of your existing skills`;
    } else if (relevantSkills > skillCount * 0.7) {
      return `Great fit - boosts ${relevantSkills} of your ${skillCount} relevant skills`;
    } else if (certification.skillBoostAmount >= 2) {
      return `High-impact certification with +${certification.skillBoostAmount} skill levels`;
    } else {
      return `Industry-recognized credential from ${certification.provider}`;
    }
  }
}

// Professional certification data
const CERTIFICATION_DATA: Omit<Certification, 'id'>[] = [
  // AWS Certifications
  {
    name: 'AWS Certified Cloud Practitioner',
    provider: 'AWS',
    url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
    description: 'Entry-level certification demonstrating foundational AWS cloud knowledge and skills.',
    skillsUnlocked: ['aws', 'cloud_architecture', 'system_administration'],
    skillBoostAmount: 1,
    verified: true
  },
  {
    name: 'AWS Certified Solutions Architect - Associate',
    provider: 'AWS',
    url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    description: 'Validates expertise in designing distributed applications and systems on AWS.',
    skillsUnlocked: ['aws', 'cloud_architecture', 'system_design', 'networking'],
    skillBoostAmount: 2,
    verified: true
  },
  {
    name: 'AWS Certified Developer - Associate',
    provider: 'AWS',
    url: 'https://aws.amazon.com/certification/certified-developer-associate/',
    description: 'Demonstrates proficiency in developing and maintaining applications on AWS.',
    skillsUnlocked: ['aws', 'serverless', 'api_development', 'devops'],
    skillBoostAmount: 2,
    verified: true
  },

  // Google Cloud Certifications
  {
    name: 'Google Cloud Professional Cloud Architect',
    provider: 'Google',
    url: 'https://cloud.google.com/certification/cloud-architect',
    description: 'Validates ability to design, develop, and manage robust, secure, scalable cloud architecture.',
    skillsUnlocked: ['google_cloud', 'cloud_architecture', 'system_design', 'kubernetes'],
    skillBoostAmount: 2,
    verified: true
  },
  {
    name: 'Google Cloud Professional Data Engineer',
    provider: 'Google',
    url: 'https://cloud.google.com/certification/data-engineer',
    description: 'Demonstrates expertise in designing and building data processing systems.',
    skillsUnlocked: ['google_cloud', 'data_engineering', 'machine_learning', 'sql'],
    skillBoostAmount: 2,
    verified: true
  },

  // Microsoft Certifications
  {
    name: 'Microsoft Certified: Azure Fundamentals',
    provider: 'Microsoft',
    url: 'https://docs.microsoft.com/en-us/learn/certifications/azure-fundamentals/',
    description: 'Foundational level certification covering basic Azure cloud concepts.',
    skillsUnlocked: ['azure', 'cloud_architecture', 'system_administration'],
    skillBoostAmount: 1,
    verified: true
  },
  {
    name: 'Microsoft Certified: Azure Developer Associate',
    provider: 'Microsoft',
    url: 'https://docs.microsoft.com/en-us/learn/certifications/azure-developer/',
    description: 'Validates skills in developing cloud solutions using Azure services.',
    skillsUnlocked: ['azure', 'api_development', 'devops', 'serverless'],
    skillBoostAmount: 2,
    verified: true
  },

  // Programming & Development Certifications
  {
    name: 'Oracle Certified Professional: Java SE Developer',
    provider: 'Oracle',
    url: 'https://education.oracle.com/java-se-11-developer/pexam_1Z0-819',
    description: 'Professional-level Java certification demonstrating advanced programming skills.',
    skillsUnlocked: ['java', 'object_oriented_programming', 'software_development'],
    skillBoostAmount: 2,
    verified: true
  },
  {
    name: 'MongoDB Certified Developer',
    provider: 'MongoDB',
    url: 'https://university.mongodb.com/certification',
    description: 'Validates expertise in developing applications using MongoDB.',
    skillsUnlocked: ['mongodb', 'database_design', 'nosql', 'api_development'],
    skillBoostAmount: 2,
    verified: true
  },

  // Data Science & Analytics Certifications
  {
    name: 'Google Data Analytics Professional Certificate',
    provider: 'Google',
    url: 'https://grow.google/certificates/data-analytics/',
    description: 'Comprehensive data analytics program covering the entire data analysis process.',
    skillsUnlocked: ['data_analysis', 'sql', 'python', 'data_visualization'],
    skillBoostAmount: 2,
    verified: true
  },
  {
    name: 'IBM Data Science Professional Certificate',
    provider: 'IBM',
    url: 'https://www.coursera.org/professional-certificates/ibm-data-science',
    description: 'Hands-on data science certification covering Python, SQL, machine learning, and more.',
    skillsUnlocked: ['python', 'machine_learning', 'data_analysis', 'sql'],
    skillBoostAmount: 2,
    verified: true
  },

  // Cybersecurity Certifications
  {
    name: 'CompTIA Security+',
    provider: 'CompTIA',
    url: 'https://www.comptia.org/certifications/security',
    description: 'Foundational cybersecurity certification covering security concepts and practices.',
    skillsUnlocked: ['cybersecurity', 'network_security', 'risk_management'],
    skillBoostAmount: 2,
    verified: true
  },
  {
    name: 'Certified Information Security Manager (CISM)',
    provider: 'ISACA',
    url: 'https://www.isaca.org/credentialing/cism',
    description: 'Advanced certification for information security management and governance.',
    skillsUnlocked: ['cybersecurity', 'risk_management', 'compliance', 'leadership'],
    skillBoostAmount: 2,
    verified: true
  },

  // Design Certifications
  {
    name: 'Adobe Certified Expert (ACE) - Photoshop',
    provider: 'Adobe',
    url: 'https://www.adobe.com/training/certification.html',
    description: 'Professional certification demonstrating advanced Photoshop skills.',
    skillsUnlocked: ['photoshop', 'graphic_design', 'digital_imaging'],
    skillBoostAmount: 2,
    verified: true
  },
  {
    name: 'Google UX Design Professional Certificate',
    provider: 'Google',
    url: 'https://grow.google/certificates/ux-design/',
    description: 'Comprehensive UX design program covering user research, wireframing, and prototyping.',
    skillsUnlocked: ['user_experience', 'figma', 'user_research', 'prototyping'],
    skillBoostAmount: 2,
    verified: true
  },

  // DevOps & Infrastructure Certifications
  {
    name: 'Docker Certified Associate',
    provider: 'Docker',
    url: 'https://training.mirantis.com/dca-certification-exam/',
    description: 'Validates skills in containerization and Docker platform management.',
    skillsUnlocked: ['docker', 'containerization', 'devops', 'microservices'],
    skillBoostAmount: 2,
    verified: true
  },
  {
    name: 'Certified Kubernetes Administrator (CKA)',
    provider: 'CNCF',
    url: 'https://www.cncf.io/certification/cka/',
    description: 'Hands-on certification for Kubernetes cluster administration.',
    skillsUnlocked: ['kubernetes', 'container_orchestration', 'devops', 'cloud_architecture'],
    skillBoostAmount: 2,
    verified: true
  }
];

export const certificationService = new CertificationService();