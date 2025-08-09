// Quest management operations

import {
  collection,
  doc,
  getDocs,
  getDoc,
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

  // Seed quests (for initial data population)
  async seedQuests(quests: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const batch = writeBatch(db);
    
    quests.forEach((quest) => {
      const questRef = doc(collection(db, 'quests'));
      batch.set(questRef, {
        ...quest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  }
};