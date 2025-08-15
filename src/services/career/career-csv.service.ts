// CSV import/export functionality for careers

import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  db
} from '../firebase/firestore-base';
import {
  convertTimestamps,
  clearCache,
  escapeCSVField,
  parseCSVRow
} from '../firebase/firestore-base';
import { CAREER_FIELDS } from '../constants/career-fields';
import type { Career, CareerFieldKey, CareerSkill } from '../types';

export interface CsvImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

export const careerCSVService = {
  // Export all careers to CSV format
  async exportCareersToCSV(): Promise<string> {
    try {
      console.log('Starting CSV export...');
      
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

      console.log(`Found ${careers.length} careers to export`);

      // CSV headers
      const headers = [
        'id',
        'title',
        'description',
        'pathfinderCode',
        'difficulty',
        'estimatedTimeToMaster',
        'fields',
        'skills',
        'averageSalary_min',
        'averageSalary_max',
        'averageSalary_median',
        'jobOutlook',
        'relatedCareers'
      ];

      const csvRows = [headers.join(',')];

      // Convert careers to CSV rows
      for (const career of careers) {
        const row = [
          escapeCSVField(career.id || ''),
          escapeCSVField(career.title || ''),
          escapeCSVField(career.description || ''),
          escapeCSVField(career.pathfinderCode || ''),
          escapeCSVField(career.difficulty || ''),
          escapeCSVField(career.estimatedTimeToMaster?.toString() || ''),
          escapeCSVField(career.fields ? career.fields.join(';') : ''),
          escapeCSVField(career.skills ? JSON.stringify(career.skills) : ''),
          escapeCSVField(career.averageSalary?.min?.toString() || ''),
          escapeCSVField(career.averageSalary?.max?.toString() || ''),
          escapeCSVField(career.averageSalary?.median?.toString() || ''),
          escapeCSVField(career.jobOutlook || ''),
          escapeCSVField(career.relatedCareers ? career.relatedCareers.join(';') : '')
        ];
        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\n');
      console.log(`CSV export completed. Generated ${csvRows.length - 1} rows`);
      
      return csvContent;
    } catch (error) {
      console.error('Error exporting careers to CSV:', error);
      throw error;
    }
  },

  // Import careers from CSV content
  async importCareersFromCSV(csvContent: string): Promise<CsvImportResult> {
    try {
      console.log('Starting CSV import...');
      
      const lines = csvContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Parse header row
      const headers = parseCSVRow(lines[0]);
      console.log('CSV headers:', headers);

      // Validate required headers
      const requiredHeaders = ['title', 'description', 'pathfinderCode', 'difficulty', 'estimatedTimeToMaster'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      const result: CsvImportResult = {
        success: true,
        imported: 0,
        skipped: 0,
        errors: []
      };

      // Process each data row
      for (let i = 1; i < lines.length; i++) {
        const lineNumber = i + 1;
        
        try {
          const values = parseCSVRow(lines[i]);
          
          if (values.length !== headers.length) {
            result.errors.push(`Line ${lineNumber}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
            continue;
          }

          // Create career object from CSV data
          const careerData: any = {};
          let hasErrors = false;
          
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            const value = values[j]?.trim();
            
            switch (header) {
              case 'title':
              case 'description':
              case 'pathfinderCode':
              case 'jobOutlook':
                careerData[header] = value || '';
                break;
                
              case 'difficulty':
                if (value && !['beginner', 'intermediate', 'advanced'].includes(value)) {
                  result.errors.push(`Line ${lineNumber}: Invalid difficulty "${value}". Must be beginner, intermediate, or advanced`);
                  hasErrors = true;
                  break;
                }
                careerData[header] = value || 'beginner';
                break;
                
              case 'estimatedTimeToMaster':
                if (value) {
                  const timeValue = parseInt(value);
                  if (isNaN(timeValue) || timeValue < 0) {
                    result.errors.push(`Line ${lineNumber}: Invalid estimatedTimeToMaster "${value}". Must be a positive number`);
                    hasErrors = true;
                    break;
                  }
                  careerData[header] = timeValue;
                } else {
                  careerData[header] = 12; // Default to 12 months
                }
                break;
                
              case 'fields':
                if (value) {
                  const fieldKeys = value.split(';').map(f => f.trim()).filter(f => f);
                  const validFields = fieldKeys.filter(field => 
                    Object.keys(CAREER_FIELDS).includes(field as CareerFieldKey)
                  );
                  
                  if (validFields.length !== fieldKeys.length) {
                    const invalidFields = fieldKeys.filter(field => 
                      !Object.keys(CAREER_FIELDS).includes(field as CareerFieldKey)
                    );
                    result.errors.push(`Line ${lineNumber}: Invalid field(s): ${invalidFields.join(', ')}`);
                  }
                  
                  careerData[header] = validFields as CareerFieldKey[];
                } else {
                  careerData[header] = [];
                }
                break;
                
              case 'skills':
                if (value) {
                  try {
                    const skills = JSON.parse(value) as CareerSkill[];
                    // Validate skills structure
                    const validSkills = skills.filter(skill => 
                      skill && 
                      typeof skill.skillName === 'string' && 
                      skill.skillName.trim() &&
                      ['hard', 'soft', 'transferable'].includes(skill.skillType) &&
                      typeof skill.proficiencyLevel === 'number' &&
                      skill.proficiencyLevel >= 1 && skill.proficiencyLevel <= 5 &&
                      typeof skill.isRequired === 'boolean' &&
                      typeof skill.estimatedHours === 'number' && skill.estimatedHours >= 0
                    );
                    
                    if (validSkills.length !== skills.length) {
                      result.errors.push(`Line ${lineNumber}: Some skills have invalid format and were skipped`);
                    }
                    
                    careerData[header] = validSkills;
                  } catch (error) {
                    result.errors.push(`Line ${lineNumber}: Invalid JSON format for skills: ${error}`);
                    careerData[header] = [];
                  }
                } else {
                  careerData[header] = [];
                }
                break;
                
              case 'averageSalary_min':
              case 'averageSalary_max':
              case 'averageSalary_median':
                if (value) {
                  const salaryValue = parseInt(value);
                  if (!isNaN(salaryValue) && salaryValue >= 0) {
                    if (!careerData.averageSalary) {
                      careerData.averageSalary = {};
                    }
                    const salaryKey = header.split('_')[1]; // Extract min/max/median
                    careerData.averageSalary[salaryKey] = salaryValue;
                  }
                }
                break;
                
              case 'relatedCareers':
                if (value) {
                  careerData[header] = value.split(';').map(id => id.trim()).filter(id => id);
                } else {
                  careerData[header] = [];
                }
                break;
            }
          }

          // Skip if there were errors in processing
          if (hasErrors) {
            continue;
          }

          // Validate required fields
          if (!careerData.title?.trim()) {
            result.errors.push(`Line ${lineNumber}: Title is required`);
            continue;
          }

          if (!careerData.description?.trim()) {
            result.errors.push(`Line ${lineNumber}: Description is required`);
            continue;
          }

          // Skip if this is an update (has ID) - for now we only support new careers
          if (careerData.id) {
            result.skipped++;
            continue;
          }

          // Add default values for required fields
          if (!careerData.skills) careerData.skills = [];
          if (!careerData.relatedCareers) careerData.relatedCareers = [];
          if (!careerData.fields) careerData.fields = [];

          // Create new career
          await addDoc(collection(db, 'careers'), {
            ...careerData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          result.imported++;
          console.log(`Imported career: ${careerData.title}`);

        } catch (error) {
          result.errors.push(`Line ${lineNumber}: ${error}`);
          result.success = false;
        }
      }

      // Clear cache after import
      if (result.imported > 0) {
        clearCache();
      }

      console.log('CSV import completed:', result);
      return result;

    } catch (error) {
      console.error('Error importing careers from CSV:', error);
      throw error;
    }
  }
};