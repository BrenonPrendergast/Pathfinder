// Web SDK script to add sample quests with skill rewards
// This should be run in a browser console on the Firebase web app

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
        skillId: "web_development",
        skillName: "Web Development",
        hoursAwarded: 4
      },
      {
        skillId: "problem_solving",
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
    createdBy: "system"
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
        skillId: "data_analysis",
        skillName: "Data Analysis",
        hoursAwarded: 8
      },
      {
        skillId: "statistics",
        skillName: "Statistics",
        hoursAwarded: 5
      },
      {
        skillId: "critical_thinking",
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
    createdBy: "system"
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
        skillId: "verbal_communication",
        skillName: "Verbal Communication",
        hoursAwarded: 6
      },
      {
        skillId: "written_communication", 
        skillName: "Written Communication",
        hoursAwarded: 5
      },
      {
        skillId: "presentation_skills",
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
    createdBy: "system"
  }
];

// Function to add quests to Firestore
async function seedQuests() {
  console.log('Starting to seed test quests...');
  
  try {
    for (const quest of testQuests) {
      const questData = {
        ...quest,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await firebase.firestore().collection('quests').add(questData);
      console.log(`✅ Added quest: ${quest.title} (ID: ${docRef.id})`);
    }
    
    console.log(`🎉 Successfully seeded ${testQuests.length} quests!`);
  } catch (error) {
    console.error('❌ Error seeding quests:', error);
  }
}

// Instructions for use:
console.log(`
📝 To seed quests:
1. Open the browser developer console on https://pathfinder-000.web.app
2. Make sure you're signed in as an admin
3. Run: seedQuests()
`);

// Make function available globally
window.seedQuests = seedQuests;
window.testQuests = testQuests;