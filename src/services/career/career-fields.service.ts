// Career field categorization and field-based operations

import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  writeBatch,
  db
} from '../firebase/firestore-base';
import {
  convertTimestamps,
  clearCache,
  isCacheValid,
  getFieldCareersCache,
  setFieldCareersCache,
  getAllCareersCache,
  setAllCareersCache,
  setCacheTimestamp
} from '../firebase/firestore-base';
import { CAREER_FIELDS } from '../constants/career-fields';
import type { Career, CareerFieldKey } from '../types';

export const careerFieldsService = {
  // Get all career fields
  getCareerFields() {
    return CAREER_FIELDS;
  },

  // Get careers by field category with caching
  async getCareersByField(fieldKey: CareerFieldKey): Promise<Career[]> {
    try {
      const fieldCareersCache = getFieldCareersCache();
      
      // Check if we have valid cached data for this field
      if (isCacheValid() && fieldCareersCache[fieldKey]) {
        return fieldCareersCache[fieldKey];
      }

      // If cache is invalid or we don't have cached data, fetch from Firestore
      let allCareers: Career[] = [];
      
      // Use cached all careers if available and valid
      if (isCacheValid() && getAllCareersCache().length > 0) {
        allCareers = getAllCareersCache();
      } else {
        // Fetch all careers from Firestore
        const q = query(
          collection(db, 'careers'),
          orderBy('title'),
          limit(1000)
        );

        const querySnapshot = await getDocs(q);
        allCareers = [];
        
        querySnapshot.forEach((doc) => {
          allCareers.push({
            id: doc.id,
            ...convertTimestamps(doc.data())
          } as Career);
        });

        // Cache all careers
        setAllCareersCache(allCareers);
        setCacheTimestamp(Date.now());
      }

      // Filter careers by field and populate cache for all fields at once
      const updatedFieldCache = getFieldCareersCache();
      const field = CAREER_FIELDS[fieldKey];
      
      if (field) {
        // Filter careers for this specific field
        const fieldCareers = allCareers.filter(career => {
          // First check if career has explicit field assignments
          if (career.fields && career.fields.length > 0) {
            return career.fields.includes(fieldKey);
          }
          
          // Fallback to keyword-based matching for careers without explicit field assignments
          const searchText = `${career.title} ${career.description}`.toLowerCase();
          return field.keywords.some(keyword => 
            searchText.includes(keyword.toLowerCase())
          );
        });

        updatedFieldCache[fieldKey] = fieldCareers;
      }

      // Update the cache
      setFieldCareersCache(updatedFieldCache);

      return updatedFieldCache[fieldKey] || [];
    } catch (error) {
      console.error(`Error fetching careers for field ${fieldKey}:`, error);
      throw error;
    }
  },

  // Get career counts by field (optimized version)
  async getCareerCountsByField(): Promise<Record<CareerFieldKey, number>> {
    try {
      const fieldCounts: Record<CareerFieldKey, number> = {} as Record<CareerFieldKey, number>;

      // Get careers for each field (this will populate the cache efficiently)
      const fieldPromises = Object.keys(CAREER_FIELDS).map(async (fieldKey) => {
        const careers = await this.getCareersByField(fieldKey as CareerFieldKey);
        fieldCounts[fieldKey as CareerFieldKey] = careers.length;
      });

      await Promise.all(fieldPromises);
      return fieldCounts;
    } catch (error) {
      console.error('Error getting career counts by field:', error);
      throw error;
    }
  },

  // Suggest fields for a career based on keywords
  suggestFieldsForCareer(career: Career): CareerFieldKey[] {
    const suggestions: CareerFieldKey[] = [];
    const searchText = `${career.title} ${career.description}`.toLowerCase();
    
    // Add skill names to search text
    const skillText = career.skills.map(skill => skill.skillName).join(' ').toLowerCase();
    const fullSearchText = `${searchText} ${skillText}`;
    
    Object.entries(CAREER_FIELDS).forEach(([key, field]) => {
      const matchCount = field.keywords.filter(keyword => 
        fullSearchText.includes(keyword.toLowerCase())
      ).length;
      
      // Suggest field if it has multiple keyword matches or high relevance
      if (matchCount >= 2 || 
          field.keywords.some(keyword => 
            career.title.toLowerCase().includes(keyword.toLowerCase())
          )) {
        suggestions.push(key as CareerFieldKey);
      }
    });
    
    return suggestions;
  },

  // Bulk migrate career fields using existing logic
  async bulkMigrateCareerFields(): Promise<{
    success: boolean;
    processed: number;
    updated: number;
    errors: string[];
  }> {
    try {
      console.log('Starting bulk career field migration...');
      
      // Get all careers
      const q = query(
        collection(db, 'careers'),
        orderBy('title'),
        limit(1000)
      );

      const querySnapshot = await getDocs(q);
      const careers: Career[] = [];
      
      querySnapshot.forEach((doc) => {
        careers.push({
          id: doc.id,
          ...convertTimestamps(doc.data())
        } as Career);
      });

      console.log(`Found ${careers.length} careers to process`);
      
      const batchSize = 500; // Firestore batch limit
      const errors: string[] = [];
      let processed = 0;
      let updated = 0;

      // Process careers in batches
      for (let i = 0; i < careers.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchCareers = careers.slice(i, i + batchSize);
        
        for (const career of batchCareers) {
          try {
            processed++;
            
            // Skip if career already has fields assigned
            if (career.fields && career.fields.length > 0) {
              console.log(`Skipping ${career.title} - already has fields assigned`);
              continue;
            }
            
            // Get field suggestions for this career
            const suggestedFields = this.suggestFieldsForCareer(career);
            
            if (suggestedFields.length > 0) {
              // Update career with suggested fields
              const careerRef = doc(db, 'careers', career.id);
              batch.update(careerRef, {
                fields: suggestedFields,
                updatedAt: new Date()
              });
              
              updated++;
              console.log(`Updated ${career.title} with fields: ${suggestedFields.join(', ')}`);
            } else {
              console.log(`No field suggestions found for: ${career.title}`);
            }
          } catch (error) {
            const errorMsg = `Error processing career ${career.title}: ${error}`;
            console.error(errorMsg);
            errors.push(errorMsg);
          }
        }
        
        // Commit the batch
        if (updated > 0) {
          await batch.commit();
          console.log(`Committed batch ${Math.floor(i / batchSize) + 1}, updated ${updated} careers so far`);
        }
      }

      // Clear cache after bulk operation
      clearCache();

      console.log('Bulk migration completed:', {
        processed,
        updated,
        errors: errors.length
      });

      return {
        success: errors.length === 0,
        processed,
        updated,
        errors
      };
    } catch (error) {
      console.error('Error in bulk career field migration:', error);
      throw error;
    }
  }
};