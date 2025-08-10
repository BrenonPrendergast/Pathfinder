// Quest management operations

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  db
} from '../firebase/firestore-base';
import { convertTimestamps } from '../firebase/firestore-base';
import type { Quest } from '../types';

export const questService = {
  // Get quests with optional filters
  async getQuests(filters?: {
    difficulty?: string;
    type?: string;
    tags?: string[];
  }): Promise<Quest[]> {
    try {
      let q = query(
        collection(db, 'quests'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      // Apply filters
      if (filters?.difficulty) {
        q = query(q, where('difficulty', '==', filters.difficulty));
      }
      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }

      const querySnapshot = await getDocs(q);
      const quests: Quest[] = [];
      
      querySnapshot.forEach((doc) => {
        quests.push({
          id: doc.id,
          ...convertTimestamps(doc.data())
        } as Quest);
      });

      return quests;
    } catch (error) {
      console.error('Error fetching quests:', error);
      throw error;
    }
  },

  // Get quest by ID
  async getQuest(questId: string): Promise<Quest | null> {
    try {
      const questRef = doc(db, 'quests', questId);
      const questSnap = await getDoc(questRef);

      if (questSnap.exists()) {
        return {
          id: questSnap.id,
          ...convertTimestamps(questSnap.data())
        } as Quest;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching quest:', error);
      throw error;
    }
  },

  // Get quests for a specific career
  async getQuestsForCareer(careerId: string): Promise<Quest[]> {
    try {
      const q = query(
        collection(db, 'quests'),
        where('relatedCareers', 'array-contains', careerId),
        where('isActive', '==', true),
        orderBy('difficulty'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const quests: Quest[] = [];
      
      querySnapshot.forEach((doc) => {
        quests.push({
          id: doc.id,
          ...convertTimestamps(doc.data())
        } as Quest);
      });

      return quests;
    } catch (error) {
      console.error('Error fetching quests for career:', error);
      throw error;
    }
  },

  // Create a new quest
  async createQuest(questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const questRef = doc(collection(db, 'quests'));
      const newQuest = {
        ...questData,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(questRef, newQuest);
      return questRef.id;
    } catch (error) {
      console.error('Error creating quest:', error);
      throw error;
    }
  },

  // Update an existing quest
  async updateQuest(questId: string, updateData: Partial<Omit<Quest, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const questRef = doc(db, 'quests', questId);
      await updateDoc(questRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating quest:', error);
      throw error;
    }
  },

  // Delete a quest (soft delete by setting isActive to false)
  async deleteQuest(questId: string): Promise<void> {
    try {
      const questRef = doc(db, 'quests', questId);
      await updateDoc(questRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting quest:', error);
      throw error;
    }
  },

  // Seed quests (for initial data population)
  async seedQuests(quests?: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Default quests if none provided
      const defaultQuests = quests || [
        {
          title: 'Explore Your First Career',
          description: 'Browse through career options and save your first career interest',
          difficulty: 'beginner',
          xpReward: 50,
          estimatedHours: 1,
          category: 'career_exploration',
          relatedSkills: ['research', 'decision_making'],
          prerequisites: [],
          isActive: true
        },
        {
          title: 'Complete Your Profile',
          description: 'Fill out your complete user profile including skills and interests',
          difficulty: 'beginner',
          xpReward: 75,
          estimatedHours: 1,
          category: 'profile_building',
          relatedSkills: ['self_awareness', 'communication'],
          prerequisites: [],
          isActive: true
        },
        {
          title: 'Skill Assessment Challenge',
          description: 'Take a comprehensive skills assessment to identify your strengths',
          difficulty: 'intermediate',
          xpReward: 150,
          estimatedHours: 3,
          category: 'skill_development',
          relatedSkills: ['self_assessment', 'critical_thinking'],
          prerequisites: ['profile_completion'],
          isActive: true
        }
      ];
      
      defaultQuests.forEach((quest) => {
        const questRef = doc(collection(db, 'quests'));
        batch.set(questRef, {
          ...quest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error seeding quests:', error);
      throw error;
    }
  }
};