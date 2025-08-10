// Test script to add sample quests with skill rewards
// Run this with: node scripts/seed-test-quests.js

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'pathfinder-000'
  });
}

const db = admin.firestore();

const testQuests = [
  {
    title: "JavaScript Fundamentals Course",
    description: "Master the core concepts of JavaScript programming including variables, functions, and DOM manipulation.",
    instructions: "Complete the online JavaScript course covering ES6+ features, async programming, and practical projects.",
    type: "course",
    difficulty: "beginner", 
    xpReward: 150,
    skillRewards: [
      {
        skillId: "javascript",
        skillName: "JavaScript Programming",
        hoursAwarded: 8
      },
      {
        skillId: "web-development",
        skillName: "Web Development",
        hoursAwarded: 4
      },
      {
        skillId: "problem-solving",
        skillName: "Problem Solving",
        hoursAwarded: 3
      }
    ],
    estimatedHours: 12,
    externalUrl: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
    prerequisites: [],
    tags: ["javascript", "programming", "web", "frontend"],
    relatedCareers: ["software-developer", "frontend-developer"],
    isActive: true,
    createdBy: "system",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Data Analysis with Python",
    description: "Learn to analyze data using Python, Pandas, and visualization libraries to uncover insights.",
    instructions: "Work through hands-on exercises analyzing real-world datasets using Python and popular data science libraries.",
    type: "project",
    difficulty: "intermediate",
    xpReward: 200,
    skillRewards: [
      {
        skillId: "python",
        skillName: "Python Programming", 
        hoursAwarded: 10
      },
      {
        skillId: "data-analysis",
        skillName: "Data Analysis",
        hoursAwarded: 8
      },
      {
        skillId: "statistics",
        skillName: "Statistics",
        hoursAwarded: 5
      },
      {
        skillId: "critical-thinking",
        skillName: "Critical Thinking",
        hoursAwarded: 4
      }
    ],
    estimatedHours: 16,
    externalUrl: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/",
    prerequisites: ["basic-programming"],
    tags: ["python", "data-science", "analytics", "pandas"],
    relatedCareers: ["data-scientist", "data-analyst"],
    isActive: true,
    createdBy: "system", 
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "UX Research Methods Workshop",
    description: "Master user research techniques including interviews, surveys, and usability testing.",
    instructions: "Practice conducting user interviews, create survey instruments, and run usability tests on existing products.",
    type: "practice",
    difficulty: "intermediate",
    xpReward: 175,
    skillRewards: [
      {
        skillId: "user-research",
        skillName: "User Research",
        hoursAwarded: 12
      },
      {
        skillId: "empathy",
        skillName: "Empathy",
        hoursAwarded: 6
      },
      {
        skillId: "active-listening",
        skillName: "Active Listening",
        hoursAwarded: 5
      },
      {
        skillId: "analytical-thinking",
        skillName: "Analytical Thinking",
        hoursAwarded: 4
      }
    ],
    estimatedHours: 15,
    externalUrl: "https://www.nngroup.com/articles/which-ux-research-methods/",
    prerequisites: [],
    tags: ["ux", "research", "design", "user-testing"],
    relatedCareers: ["ux-designer", "product-manager"],
    isActive: true,
    createdBy: "system",
    createdAt: admin.firestore.FieldValue.serverTimestamp(), 
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Communication Skills Assessment", 
    description: "Evaluate and improve your verbal and written communication abilities through practical exercises.",
    instructions: "Complete a series of communication challenges including presentations, written reports, and team discussions.",
    type: "assessment",
    difficulty: "beginner",
    xpReward: 100,
    skillRewards: [
      {
        skillId: "verbal-communication",
        skillName: "Verbal Communication",
        hoursAwarded: 6
      },
      {
        skillId: "written-communication", 
        skillName: "Written Communication",
        hoursAwarded: 5
      },
      {
        skillId: "presentation-skills",
        skillName: "Presentation Skills",
        hoursAwarded: 4
      },
      {
        skillId: "confidence",
        skillName: "Confidence",
        hoursAwarded: 3
      }
    ],
    estimatedHours: 8,
    prerequisites: [],
    tags: ["communication", "soft-skills", "presentation", "writing"],
    relatedCareers: ["general", "management", "sales"],
    isActive: true,
    createdBy: "system",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "AWS Cloud Practitioner Certification",
    description: "Prepare for and obtain the AWS Cloud Practitioner certification to demonstrate cloud knowledge.",
    instructions: "Study cloud concepts, AWS services, security, and pricing. Take practice exams and schedule the official certification test.",
    type: "certification", 
    difficulty: "intermediate",
    xpReward: 300,
    skillRewards: [
      {
        skillId: "cloud-computing",
        skillName: "Cloud Computing",
        hoursAwarded: 15
      },
      {
        skillId: "aws",
        skillName: "Amazon Web Services",
        hoursAwarded: 12
      },
      {
        skillId: "system-architecture",
        skillName: "System Architecture", 
        hoursAwarded: 8
      },
      {
        skillId: "security",
        skillName: "Security",
        hoursAwarded: 6
      }
    ],
    estimatedHours: 25,
    externalUrl: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    prerequisites: ["basic-networking", "basic-security"],
    tags: ["aws", "cloud", "certification", "infrastructure"],
    relatedCareers: ["software-developer", "cloud-engineer", "devops"],
    isActive: true,
    createdBy: "system",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seedQuests() {
  try {
    console.log('Starting to seed test quests...');
    
    // Add each quest to Firestore
    for (const quest of testQuests) {
      const questRef = db.collection('quests').doc();
      await questRef.set(quest);
      console.log(`Added quest: ${quest.title}`);
    }
    
    console.log('✅ Successfully seeded all test quests!');
    console.log(`Total quests added: ${testQuests.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding quests:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedQuests();