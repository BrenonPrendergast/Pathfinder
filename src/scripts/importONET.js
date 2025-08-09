// O*NET Data Import Script for Firestore
// This script imports the comprehensive O*NET career database into Firestore

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, writeBatch, doc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBKJbAHRJKA4c5V3Ev499zx0YrGZwcM8pw",
  authDomain: "pathfinder-000.firebaseapp.com",
  projectId: "pathfinder-000",
  storageBucket: "pathfinder-000.firebasestorage.app",
  messagingSenderId: "680035885497",
  appId: "1:680035885497:web:d9ef662f2dd79122269668"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Path to O*NET data
const ONET_DATA_PATH = "C:\\Users\\bpren\\OneDrive\\Documents\\Ideas\\Work\\Pathfinder\\Data\\db_29_3_text";

// Job Zone to difficulty mapping
const JOB_ZONE_TO_DIFFICULTY = {
  1: 'beginner',    // Little or no preparation
  2: 'beginner',    // Some preparation  
  3: 'intermediate', // Medium preparation
  4: 'intermediate', // Considerable preparation
  5: 'advanced'     // Extensive preparation
};

// Job Zone to estimated months mapping
const JOB_ZONE_TO_MONTHS = {
  1: 3,   // Few days to few months
  2: 6,   // Few months to 1 year
  3: 18,  // 1-2 years training
  4: 36,  // Several years + degree
  5: 60   // Graduate degree + 5+ years
};

// Parse tab-separated files
function parseTSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');
  
  return lines.slice(1).map(line => {
    const values = line.split('\t');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index] ? values[index].trim() : '';
    });
    return obj;
  });
}

// Load all O*NET data
function loadONETData() {
  console.log('📚 Loading O*NET data files...');
  
  const occupations = parseTSV(path.join(ONET_DATA_PATH, 'Occupation Data.txt'));
  const jobZones = parseTSV(path.join(ONET_DATA_PATH, 'Job Zones.txt'));
  const skills = parseTSV(path.join(ONET_DATA_PATH, 'Skills.txt'));
  
  console.log(`✅ Loaded ${occupations.length} occupations`);
  console.log(`✅ Loaded ${jobZones.length} job zones`);
  console.log(`✅ Loaded ${skills.length} skill entries`);
  
  return { occupations, jobZones, skills };
}

// Create job zone lookup map
function createJobZoneLookup(jobZones) {
  const lookup = {};
  jobZones.forEach(jz => {
    lookup[jz['O*NET-SOC Code']] = parseInt(jz['Job Zone']);
  });
  return lookup;
}

// Create skills lookup map - group skills by occupation
function createSkillsLookup(skillsData) {
  const lookup = {};
  
  skillsData.forEach(skill => {
    const socCode = skill['O*NET-SOC Code'];
    const elementName = skill['Element Name'];
    const dataValue = parseFloat(skill['Data Value']);
    
    // Only include skills with importance (IM) scale and significant values
    if (skill['Scale ID'] === 'IM' && dataValue >= 2.5 && elementName) {
      if (!lookup[socCode]) {
        lookup[socCode] = [];
      }
      
      // Map skill importance to proficiency level (1-5)
      const proficiencyLevel = Math.max(1, Math.min(5, Math.round(dataValue)));
      const isRequired = dataValue >= 3.5;
      const estimatedHours = Math.round(dataValue * 40); // Rough estimate
      
      lookup[socCode].push({
        skillId: elementName.toLowerCase().replace(/[\s\(\)]+/g, '-'),
        skillName: elementName,
        skillType: getSkillType(elementName),
        proficiencyLevel,
        isRequired,
        estimatedHours
      });
    }
  });
  
  // Keep only top 8 skills per occupation to avoid overwhelming data
  Object.keys(lookup).forEach(socCode => {
    lookup[socCode] = lookup[socCode]
      .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
      .slice(0, 8);
  });
  
  return lookup;
}

// Determine if skill is hard or soft
function getSkillType(skillName) {
  const hardSkillKeywords = [
    'programming', 'mathematics', 'science', 'technology', 'equipment',
    'systems', 'analysis', 'design', 'engineering', 'computer', 'technical'
  ];
  
  const skillLower = skillName.toLowerCase();
  return hardSkillKeywords.some(keyword => skillLower.includes(keyword)) ? 'hard' : 'soft';
}

// Transform O*NET occupation to Firestore Career format
function transformToCareer(occupation, jobZoneLookup, skillsLookup) {
  const socCode = occupation['O*NET-SOC Code'];
  const jobZone = jobZoneLookup[socCode] || 3; // Default to medium preparation
  
  return {
    title: occupation['Title'],
    description: occupation['Description'] || 'Career description not available.',
    onetCode: socCode,
    difficulty: JOB_ZONE_TO_DIFFICULTY[jobZone],
    estimatedTimeToMaster: JOB_ZONE_TO_MONTHS[jobZone],
    skills: skillsLookup[socCode] || [],
    // Note: Salary data would need to be pulled from additional O*NET files
    // For now, we'll use placeholder values or null
    averageSalary: null, 
    jobOutlook: getJobOutlook(jobZone),
    relatedCareers: [], // Could be populated from Related Occupations.txt
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Generate job outlook based on job zone
function getJobOutlook(jobZone) {
  const outlooks = {
    1: 'Stable employment with basic entry requirements',
    2: 'Good opportunities with some preparation needed', 
    3: 'Growing field requiring vocational training',
    4: 'Strong growth expected, bachelor\'s degree preferred',
    5: 'Excellent prospects for advanced degree holders'
  };
  return outlooks[jobZone] || 'Employment outlook varies by location and specialization';
}

// Batch write careers to Firestore (max 500 per batch)
async function batchWriteCareers(careers) {
  const BATCH_SIZE = 500;
  const batches = [];
  
  for (let i = 0; i < careers.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchCareers = careers.slice(i, i + BATCH_SIZE);
    
    batchCareers.forEach(career => {
      const docRef = doc(collection(db, 'careers'));
      batch.set(docRef, career);
    });
    
    batches.push(batch);
  }
  
  console.log(`📝 Created ${batches.length} batches for ${careers.length} careers`);
  
  // Execute all batches
  let batchIndex = 1;
  for (const batch of batches) {
    console.log(`⏳ Writing batch ${batchIndex}/${batches.length}...`);
    await batch.commit();
    console.log(`✅ Batch ${batchIndex} committed successfully`);
    batchIndex++;
    
    // Small delay between batches to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Main import function
async function importONETData() {
  try {
    console.log('🚀 Starting O*NET data import to Firestore...');
    console.log('📁 Data source:', ONET_DATA_PATH);
    
    // Load all data
    const { occupations, jobZones, skills } = loadONETData();
    
    // Create lookup maps
    const jobZoneLookup = createJobZoneLookup(jobZones);
    const skillsLookup = createSkillsLookup(skills);
    
    console.log('🔄 Transforming occupations to career format...');
    
    // Transform occupations to careers
    const careers = occupations.map(occupation => 
      transformToCareer(occupation, jobZoneLookup, skillsLookup)
    );
    
    // Filter out careers with empty titles or very short descriptions
    const validCareers = careers.filter(career => 
      career.title && 
      career.title.length > 0 && 
      career.description && 
      career.description.length > 20
    );
    
    console.log(`✅ Transformed ${validCareers.length} valid careers`);
    console.log(`🗑️  Filtered out ${careers.length - validCareers.length} invalid careers`);
    
    // Sample the first few careers for verification
    console.log('\n📋 Sample careers:');
    validCareers.slice(0, 3).forEach((career, index) => {
      console.log(`${index + 1}. ${career.title} (${career.difficulty}) - ${career.skills.length} skills`);
    });
    
    // Import to Firestore
    console.log('\n📤 Starting Firestore import...');
    await batchWriteCareers(validCareers);
    
    console.log(`\n🎉 Successfully imported ${validCareers.length} careers to Firestore!`);
    console.log('✨ Career database is now fully populated');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importONETData();