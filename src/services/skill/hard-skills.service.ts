// Hard Skills Service for Pathfinder Database
// Manages technical skills without O*NET dependencies

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  db
} from '../firebase/firestore-base';
import { HardSkill } from '../types/skill.types';

export class HardSkillsService {
  
  // Seed hard skills database with Pathfinder data
  async seedHardSkills(): Promise<void> {
    console.log('Seeding hard skills database with sample Pathfinder data...');
    const batch = writeBatch(db);
    
    // Sample hard skills for Pathfinder database
    const sampleSkills = [
      {
        name: 'JavaScript',
        description: 'Programming language for web development',
        category: 'technical',
        estimatedHoursToMaster: 120,
        marketDemand: 'High'
      },
      {
        name: 'Python',
        description: 'Versatile programming language for development and data science',
        category: 'technical',
        estimatedHoursToMaster: 100,
        marketDemand: 'High'
      },
      {
        name: 'React',
        description: 'JavaScript library for building user interfaces',
        category: 'technical',
        estimatedHoursToMaster: 80,
        marketDemand: 'High'
      },
      {
        name: 'Node.js',
        description: 'JavaScript runtime for server-side development',
        category: 'technical',
        estimatedHoursToMaster: 70,
        marketDemand: 'High'
      },
      {
        name: 'SQL',
        description: 'Database query language',
        category: 'technical',
        estimatedHoursToMaster: 60,
        marketDemand: 'High'
      },
      {
        name: 'TypeScript',
        description: 'Typed superset of JavaScript',
        category: 'technical',
        estimatedHoursToMaster: 40,
        marketDemand: 'High'
      },
      {
        name: 'Git',
        description: 'Version control system',
        category: 'technical',
        estimatedHoursToMaster: 30,
        marketDemand: 'High'
      }
    ];
    
    sampleSkills.forEach(skill => {
      const skillRef = doc(collection(db, 'hard-skills'));
      batch.set(skillRef, {
        id: skillRef.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        type: 'hard',
        prerequisites: [],
        relatedCareers: [],
        pathfinderCode: skillRef.id, // Use document ID as Pathfinder code
        estimatedHoursToMaster: skill.estimatedHoursToMaster,
        marketDemand: skill.marketDemand,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`Seeded ${sampleSkills.length} hard skills successfully`);
  }

  // Get all hard skills from database
  async getAllHardSkills(): Promise<HardSkill[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'hard-skills'));
      const skills: HardSkill[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        skills.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps back to dates if needed
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as HardSkill);
      });
      
      return skills.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching hard skills:', error);
      return [];
    }
  }

  // Get a specific hard skill by ID
  async getHardSkill(skillId: string): Promise<HardSkill | null> {
    try {
      const docRef = doc(db, 'hard-skills', skillId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as HardSkill;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching hard skill:', error);
      return null;
    }
  }

  // Create a new hard skill
  async createHardSkill(skillData: Partial<HardSkill>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'hard-skills'), {
        ...skillData,
        type: 'hard',
        pathfinderCode: '', // Will be updated with document ID
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update pathfinderCode to match document ID
      await updateDoc(doc(db, 'hard-skills', docRef.id), {
        pathfinderCode: docRef.id
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating hard skill:', error);
      throw error;
    }
  }

  // Update an existing hard skill
  async updateHardSkill(skillId: string, skillData: Partial<HardSkill>): Promise<void> {
    try {
      const docRef = doc(db, 'hard-skills', skillId);
      await updateDoc(docRef, {
        ...skillData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating hard skill:', error);
      throw error;
    }
  }

  // Delete a hard skill
  async deleteHardSkill(skillId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'hard-skills', skillId));
    } catch (error) {
      console.error('Error deleting hard skill:', error);
      throw error;
    }
  }

  // Get skills for a specific career
  async getSkillsForCareer(careerId: string): Promise<HardSkill[]> {
    try {
      const allSkills = await this.getAllHardSkills();
      return allSkills.filter(skill => 
        skill.relatedCareers && skill.relatedCareers.includes(careerId)
      );
    } catch (error) {
      console.error('Error fetching skills for career:', error);
      return [];
    }
  }

  // Search skills by name or category
  async searchSkills(searchTerm: string, category?: string): Promise<HardSkill[]> {
    try {
      const allSkills = await this.getAllHardSkills();
      let filteredSkills = allSkills;

      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredSkills = filteredSkills.filter(skill =>
          skill.name.toLowerCase().includes(lowerSearchTerm) ||
          skill.description.toLowerCase().includes(lowerSearchTerm)
        );
      }

      if (category) {
        filteredSkills = filteredSkills.filter(skill =>
          skill.category === category
        );
      }

      return filteredSkills;
    } catch (error) {
      console.error('Error searching skills:', error);
      return [];
    }
  }
}

export const hardSkillsService = new HardSkillsService();