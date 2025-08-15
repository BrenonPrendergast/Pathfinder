// Core career management operations

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  db,
  QueryDocumentSnapshot
} from '../firebase/firestore-base';
import {
  convertTimestamps,
  clearCache,
  isCacheValid,
  getAllCareersCache,
  setAllCareersCache,
  setCacheTimestamp
} from '../firebase/firestore-base';
import type { Career, CareerFieldKey } from '../types';

export const careerService = {
  // Get all careers with pagination
  async getCareers(pageSize: number = 20, lastDoc?: QueryDocumentSnapshot): Promise<{
    careers: Career[];
    lastDoc: QueryDocumentSnapshot | null;
    hasMore: boolean;
  }> {
    try {
      let q = query(
        collection(db, 'careers'),
        orderBy('title'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const careers: Career[] = [];
      
      querySnapshot.forEach((doc) => {
        careers.push({
          id: doc.id,
          ...convertTimestamps(doc.data())
        } as Career);
      });

      const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      const hasMore = querySnapshot.docs.length === pageSize;

      return {
        careers,
        lastDoc: lastDocument,
        hasMore
      };
    } catch (error) {
      console.error('Error fetching careers:', error);
      throw error;
    }
  },

  // Enhanced search careers with flexible text matching
  async searchCareers(searchTerm: string): Promise<Career[]> {
    try {
      // Get all careers for client-side filtering (more flexible than Firestore queries)
      const q = query(
        collection(db, 'careers'),
        orderBy('title'),
        limit(500) // Get more careers for better search results
      );

      const querySnapshot = await getDocs(q);
      const allCareers: Career[] = [];
      
      querySnapshot.forEach((doc) => {
        allCareers.push({
          id: doc.id,
          ...convertTimestamps(doc.data())
        } as Career);
      });

      // Client-side flexible search
      const searchTermLower = searchTerm.toLowerCase();
      const filteredCareers = allCareers.filter(career => {
        // Search in title
        if (career.title.toLowerCase().includes(searchTermLower)) {
          return true;
        }
        
        // Search in description
        if (career.description.toLowerCase().includes(searchTermLower)) {
          return true;
        }
        
        // Search in skills
        const skillMatch = career.skills.some(skill => 
          skill.skillName.toLowerCase().includes(searchTermLower)
        );
        if (skillMatch) {
          return true;
        }
        
        return false;
      });

      // Sort by relevance (title matches first, then description, then skills)
      filteredCareers.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(searchTermLower);
        const bTitle = b.title.toLowerCase().includes(searchTermLower);
        
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        
        return a.title.localeCompare(b.title);
      });

      return filteredCareers.slice(0, 50); // Limit results
    } catch (error) {
      console.error('Error searching careers:', error);
      throw error;
    }
  },

  // Get all careers for admin dropdown (no pagination)
  async getAllCareers(): Promise<Career[]> {
    try {
      // Check cache first
      if (isCacheValid() && getAllCareersCache().length > 0) {
        return getAllCareersCache();
      }

      // Fetch all careers from Firestore
      const q = query(
        collection(db, 'careers'),
        orderBy('title'),
        limit(1000) // Get up to 1000 careers
      );

      const querySnapshot = await getDocs(q);
      const allCareers: Career[] = [];
      
      querySnapshot.forEach((doc) => {
        allCareers.push({
          id: doc.id,
          ...convertTimestamps(doc.data())
        } as Career);
      });

      // Cache the results
      setAllCareersCache(allCareers);
      setCacheTimestamp(Date.now());

      return allCareers;
    } catch (error) {
      console.error('Error fetching all careers:', error);
      throw error;
    }
  },

  // Get single career by ID
  async getCareer(careerId: string): Promise<Career | null> {
    try {
      const careerDoc = await getDoc(doc(db, 'careers', careerId));
      
      if (careerDoc.exists()) {
        return {
          id: careerDoc.id,
          ...convertTimestamps(careerDoc.data())
        } as Career;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching career:', error);
      throw error;
    }
  },

  // Create new career
  async createCareer(careerData: Omit<Career, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'careers'), {
        ...careerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Clear cache after creating
      clearCache();
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating career:', error);
      throw error;
    }
  },

  // Update existing career
  async updateCareer(careerId: string, updates: Partial<Omit<Career, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const careerRef = doc(db, 'careers', careerId);
      
      // Remove undefined values to prevent Firestore errors
      const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      await updateDoc(careerRef, {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      });

      // Clear cache after updating
      clearCache();
    } catch (error) {
      console.error('Error updating career:', error);
      throw error;
    }
  },

  // Delete career
  async deleteCareer(careerId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'careers', careerId));
      
      // Clear cache after deleting
      clearCache();
    } catch (error) {
      console.error('Error deleting career:', error);
      throw error;
    }
  },

  // Legacy method for backward compatibility
  async addCareer(career: Omit<Career, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createCareer(career);
  },

  // Admin: Remove legacy field property from career (migration helper)
  async removeLegacyField(careerId: string): Promise<void> {
    try {
      const careerRef = doc(db, 'careers', careerId);
      // Use deleteField to properly remove the legacy field property
      const { deleteField } = await import('firebase/firestore');
      await updateDoc(careerRef, {
        field: deleteField(),
        updatedAt: serverTimestamp()
      });
      
      // Clear cache after successful field removal
      clearCache();
    } catch (error) {
      console.error('Error removing legacy field:', error);
      throw error;
    }
  },

  // Seed careers (for initial data population)
  async seedCareers(careers: Omit<Career, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    try {
      for (const career of careers) {
        await this.createCareer(career);
      }
    } catch (error) {
      console.error('Error seeding careers:', error);
      throw error;
    }
  },

  // Get quests related to a specific career
  async getQuestsForCareer(careerId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'quests'),
        where('relatedCareers', 'array-contains', careerId),
        where('isActive', '==', true),
        orderBy('difficulty'),
        orderBy('title')
      );

      const querySnapshot = await getDocs(q);
      const quests: any[] = [];
      
      querySnapshot.forEach((doc) => {
        quests.push({
          id: doc.id,
          ...convertTimestamps(doc.data())
        });
      });

      return quests;
    } catch (error) {
      console.error('Error fetching quests for career:', error);
      throw error;
    }
  }
};