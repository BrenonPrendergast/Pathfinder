const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, getDocs, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDs2NqWr8fWIRyR3aYKb3jd4CwMPXUCOno',
  authDomain: 'pathfinder-000.firebaseapp.com',
  projectId: 'pathfinder-000',
  storageBucket: 'pathfinder-000.appspot.com',
  messagingSenderId: '1063024040830',
  appId: '1:1063024040830:web:32aa4b37b9eef2d1516aef'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Career field categories with keywords for automatic assignment
const CAREER_FIELDS = {
  'accommodation_food': {
    name: 'Accommodation and Food Services',
    keywords: ['hotel', 'restaurant', 'food', 'hospitality', 'lodging', 'accommodation', 'chef', 'server', 'bartender', 'housekeeper', 'concierge', 'catering', 'tourism', 'travel', 'inn', 'resort']
  },
  'admin_support': {
    name: 'Administrative and Support Services',
    keywords: ['administrative', 'support', 'clerical', 'office', 'secretary', 'assistant', 'receptionist', 'data entry', 'waste', 'cleaning', 'security', 'temp', 'staffing', 'business support']
  },
  'agriculture_forestry': {
    name: 'Agriculture, Forestry, Fishing, and Hunting',
    keywords: ['agriculture', 'farm', 'farmer', 'forestry', 'fishing', 'hunting', 'crop', 'livestock', 'agricultural', 'forest', 'timber', 'fishery', 'ranch', 'veterinary', 'animal', 'plant']
  },
  'arts_entertainment': {
    name: 'Arts, Entertainment, and Recreation',
    keywords: ['artist', 'entertainment', 'recreation', 'sports', 'creative', 'music', 'theater', 'film', 'video', 'dance', 'performer', 'athlete', 'coach', 'fitness', 'amusement', 'gambling']
  },
  'construction': {
    name: 'Construction',
    keywords: ['construction', 'building', 'contractor', 'electrician', 'plumber', 'carpenter', 'mason', 'roofer', 'painter', 'welder', 'heavy construction', 'specialty trade', 'infrastructure']
  },
  'educational': {
    name: 'Educational Services',
    keywords: ['education', 'teacher', 'professor', 'instructor', 'school', 'university', 'college', 'training', 'tutor', 'librarian', 'counselor', 'principal', 'academic', 'educational']
  },
  'finance_insurance': {
    name: 'Finance and Insurance',
    keywords: ['finance', 'financial', 'banking', 'insurance', 'investment', 'securities', 'credit', 'loan', 'accounting', 'actuary', 'underwriter', 'broker', 'advisor', 'analyst', 'economist']
  },
  'government': {
    name: 'Government',
    keywords: ['government', 'federal', 'state', 'local', 'public', 'civil service', 'military', 'political', 'public administration', 'policy', 'regulatory', 'municipal', 'county']
  },
  'healthcare_social': {
    name: 'Health Care and Social Assistance',
    keywords: ['health', 'healthcare', 'medical', 'hospital', 'nurse', 'doctor', 'physician', 'dentist', 'pharmacy', 'therapy', 'clinical', 'social', 'mental health', 'care', 'patient']
  },
  'information': {
    name: 'Information',
    keywords: ['information', 'technology', 'telecommunications', 'software', 'computer', 'data', 'internet', 'web', 'publishing', 'broadcasting', 'media', 'communications', 'IT', 'tech']
  },
  'management': {
    name: 'Management of Companies and Enterprises',
    keywords: ['management', 'corporate', 'headquarters', 'holding company', 'enterprise', 'executive', 'director', 'manager', 'administration', 'leadership', 'strategic', 'operations']
  },
  'manufacturing': {
    name: 'Manufacturing',
    keywords: ['manufacturing', 'production', 'factory', 'industrial', 'assembly', 'machinist', 'operator', 'quality', 'supervisor', 'technician', 'fabrication', 'processing']
  },
  'mining_extraction': {
    name: 'Mining, Quarrying, and Oil and Gas Extraction',
    keywords: ['mining', 'quarrying', 'oil', 'gas', 'extraction', 'petroleum', 'coal', 'mineral', 'drilling', 'refinery', 'geologist', 'engineer', 'natural resources']
  },
  'other_services': {
    name: 'Other Services (Except Public Administration)',
    keywords: ['repair', 'maintenance', 'personal services', 'religious', 'organization', 'automotive', 'equipment', 'machinery', 'personal care', 'dry cleaning', 'funeral']
  },
  'professional_scientific': {
    name: 'Professional, Scientific, and Technical Services',
    keywords: ['professional', 'scientific', 'technical', 'legal', 'lawyer', 'attorney', 'consulting', 'engineering', 'architect', 'research', 'scientist', 'specialist', 'expert']
  },
  'real_estate': {
    name: 'Real Estate and Rental and Leasing',
    keywords: ['real estate', 'rental', 'leasing', 'property', 'realtor', 'agent', 'broker', 'landlord', 'property management', 'appraisal', 'development']
  },
  'retail_trade': {
    name: 'Retail Trade',
    keywords: ['retail', 'sales', 'store', 'merchandise', 'cashier', 'clerk', 'associate', 'manager', 'customer service', 'shopping', 'commerce', 'consumer']
  },
  'transportation_warehousing': {
    name: 'Transportation and Warehousing',
    keywords: ['transportation', 'warehousing', 'logistics', 'shipping', 'delivery', 'driver', 'pilot', 'freight', 'supply chain', 'distribution', 'storage', 'postal']
  },
  'utilities': {
    name: 'Utilities',
    keywords: ['utilities', 'electric', 'power', 'gas', 'water', 'waste', 'energy', 'utility', 'infrastructure', 'maintenance', 'technician', 'operator']
  },
  'wholesale_trade': {
    name: 'Wholesale Trade',
    keywords: ['wholesale', 'distribution', 'trade', 'distributor', 'supplier', 'sales', 'merchant', 'goods', 'inventory', 'supply']
  }
};

function determineCareerFields(career) {
  const titleLower = career.title.toLowerCase();
  const descriptionLower = career.description.toLowerCase();
  
  // Find all matching fields based on keywords
  const fieldMatches = [];
  
  for (const [fieldKey, fieldInfo] of Object.entries(CAREER_FIELDS)) {
    let matches = 0;
    
    for (const keyword of fieldInfo.keywords) {
      if (titleLower.includes(keyword) || descriptionLower.includes(keyword)) {
        matches++;
      }
    }
    
    if (matches > 0) {
      fieldMatches.push({ fieldKey, matches });
    }
  }
  
  // Sort by number of matches (descending) and return top suggestions
  return fieldMatches
    .sort((a, b) => b.matches - a.matches)
    .filter(field => field.matches >= 1) // Only include fields with at least 1 match
    .slice(0, 3) // Limit to top 3 suggestions
    .map(field => field.fieldKey);
}

async function migrateCareerFields() {
  console.log('Starting career field migration...');
  
  try {
    // Get all careers
    const q = query(collection(db, 'careers'));
    const snapshot = await getDocs(q);
    
    let processed = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const docSnap of snapshot.docs) {
      const career = { id: docSnap.id, ...docSnap.data() };
      processed++;
      
      let fieldsToUpdate = [];
      let migrationReason = '';
      
      // Check if career already has fields array
      if (career.fields && career.fields.length > 0) {
        skipped++;
        console.log(`${processed}. Skipped "${career.title}" - already has fields: ${career.fields.join(', ')}`);
        continue;
      }
      
      // Convert single field to fields array
      if (career.field) {
        fieldsToUpdate = [career.field];
        migrationReason = `Converted single field "${career.field}" to array`;
      } else {
        // Suggest multiple fields if career doesn't have any
        const suggestedFields = determineCareerFields(career);
        if (suggestedFields.length > 0) {
          fieldsToUpdate = suggestedFields;
          migrationReason = `Suggested fields based on keywords`;
        }
      }
      
      if (fieldsToUpdate.length > 0) {
        // Update the career with the field array
        const careerRef = doc(db, 'careers', career.id);
        const updateData = {
          fields: fieldsToUpdate,
          updatedAt: new Date()
        };
        
        // Remove old single field property if it exists
        if (career.field) {
          updateData.field = null;
        }
        
        await updateDoc(careerRef, updateData);
        
        updated++;
        const fieldNames = fieldsToUpdate.map(f => CAREER_FIELDS[f].name).join(', ');
        console.log(`${processed}. Updated "${career.title}" -> [${fieldNames}] (${migrationReason})`);
      } else {
        console.log(`${processed}. No field match found for "${career.title}"`);
      }
      
      // Add a small delay to avoid overwhelming Firestore
      if (processed % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`\nMigration complete!`);
    console.log(`Processed: ${processed} careers`);
    console.log(`Updated: ${updated} careers`);
    console.log(`Skipped: ${skipped} careers (already had fields)`);
    console.log(`No match: ${processed - updated - skipped} careers`);
    
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run the migration
migrateCareerFields();