// Assessment Data Storage Service
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp,
  db
} from '../firebase/firestore-base';
import { CareerAssessmentData } from '../types/assessment.types';

export class AssessmentStorageService {
  private readonly COLLECTION = 'user-assessments';

  /**
   * Save user assessment data to Firestore
   */
  async saveAssessment(assessmentData: CareerAssessmentData): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, assessmentData.userId);
      
      // Add metadata
      const dataToSave = {
        ...assessmentData,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        version: assessmentData.assessmentVersion || '1.0'
      };

      await setDoc(docRef, dataToSave);
      
      console.log('Assessment data saved successfully for user:', assessmentData.userId);
    } catch (error) {
      console.error('Error saving assessment data:', error);
      throw new Error('Failed to save assessment data');
    }
  }

  /**
   * Get user's latest assessment data
   */
  async getUserAssessment(userId: string): Promise<CareerAssessmentData | null> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Convert Firestore timestamps back to Date objects
        return {
          ...data,
          completedAt: data.completedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as unknown as CareerAssessmentData;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user assessment:', error);
      return null;
    }
  }

  /**
   * Check if user has completed an assessment
   */
  async hasUserCompletedAssessment(userId: string): Promise<boolean> {
    const assessment = await this.getUserAssessment(userId);
    return assessment !== null;
  }

  /**
   * Get assessment completion statistics
   */
  async getAssessmentStats(): Promise<{
    totalAssessments: number;
    completionRate: number;
    avgCompletionTime: number;
  }> {
    try {
      const querySnapshot = await getDocs(collection(db, this.COLLECTION));
      const totalAssessments = querySnapshot.size;

      // For now, return basic stats
      // In production, you'd calculate more detailed statistics
      return {
        totalAssessments,
        completionRate: 85, // Mock completion rate
        avgCompletionTime: 23 // Mock average completion time in minutes
      };
    } catch (error) {
      console.error('Error fetching assessment stats:', error);
      return {
        totalAssessments: 0,
        completionRate: 0,
        avgCompletionTime: 0
      };
    }
  }

  /**
   * Delete user assessment data
   */
  async deleteUserAssessment(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      await deleteDoc(docRef);
      console.log('Assessment data deleted for user:', userId);
    } catch (error) {
      console.error('Error deleting assessment data:', error);
      throw new Error('Failed to delete assessment data');
    }
  }

  /**
   * Update specific assessment section
   */
  async updateAssessmentSection(
    userId: string, 
    sectionData: Partial<CareerAssessmentData>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      
      await setDoc(docRef, {
        ...sectionData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log('Assessment section updated for user:', userId);
    } catch (error) {
      console.error('Error updating assessment section:', error);
      throw new Error('Failed to update assessment section');
    }
  }

  /**
   * Get recent assessments for analytics
   */
  async getRecentAssessments(limitCount: number = 50): Promise<CareerAssessmentData[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('completedAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const assessments: CareerAssessmentData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        assessments.push({
          ...data,
          completedAt: data.completedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as unknown as CareerAssessmentData);
      });

      return assessments;
    } catch (error) {
      console.error('Error fetching recent assessments:', error);
      return [];
    }
  }
}

export const assessmentStorageService = new AssessmentStorageService();