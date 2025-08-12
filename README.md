# Pathfinder 🎯

A structured framework for career development, making professional growth transparent and measurable through comprehensive career exploration, AI-powered assessments, and skill tracking systems.

**🌐 Live Application:** [https://pathfinder-000.web.app](https://pathfinder-000.web.app)

## 🌟 Features

### 🧠 AI-Powered Career Assessment
- **Comprehensive Personality Analysis**: Big Five personality model integration
- **6-Step Assessment Wizard**: Personality, work style, environment, values, skills, and goals
- **Real-Time Recommendations**: Personalized career suggestions based on scientific personality matching
- **Multi-Dimensional Scoring**: Personality fit, skills alignment, values matching, work style compatibility
- **Development Insights**: Specific strength areas and growth recommendations for each career

### 🚀 Career Exploration
- **1000+ Career Profiles**: Browse careers across 18+ standardized industry fields
- **Smart Filtering**: Advanced search by field, experience level, salary range
- **Detailed Career Information**: Skills, salary data, job outlook, O*NET integration
- **Assessment-Driven Recommendations**: Different experiences for assessed vs non-assessed users

### 🎮 Gamified Learning Platform
- **Quest System**: Structured learning paths linked to career development
- **Achievement System**: Unlock badges and milestones based on progress
- **XP & Leveling**: Logarithmic progression system with skill tracking
- **Skill Development**: Track proficiency levels and learning hours

### 👥 User Management & Admin Tools
- **Role-Based Access**: User, admin, and super_admin permissions
- **Comprehensive Admin Dashboard**: User management, content creation, analytics
- **CSV Import/Export**: Bulk career data management capabilities
- **Content Management**: Create and manage careers, quests, and achievements

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript and Material-UI v5
- **Authentication**: Firebase Auth with Google and email/password
- **Database**: Firestore with real-time updates and security rules
- **State Management**: React Context with custom hooks
- **Routing**: React Router v7 with protected routes
- **Theme**: Custom Material-UI theme with green/purple gradient palette
- **Design System**: Gaming-inspired UI with interactive particle effects and custom PathfinderLogo component

### Backend Services
- **Firebase Firestore**: NoSQL database with real-time sync
- **Firebase Authentication**: Secure user management
- **Firebase Hosting**: Static site hosting with CDN
- **Cloud Security**: Comprehensive Firestore security rules

### Assessment Engine
- **Personality Matching**: Research-backed Big Five trait correlations
- **Multi-Factor Scoring**: Weighted algorithm combining 5+ dimensions
- **Career Database**: Extensive mapping between careers and personality traits
- **Dynamic Recommendations**: Real-time processing of assessment data

## 📁 Project Structure

```
Pathfinder/
├── public/                     # Static assets and HTML template
│   ├── fonts/                 # Custom Nacelle font files
│   ├── images/               # Static images and illustrations
│   ├── index.html            # Main HTML template
│   └── manifest.json         # PWA manifest
│
├── src/                       # Main application source code
│   ├── components/           # Reusable React components
│   │   ├── assessment/       # 🧠 Career Assessment System
│   │   │   ├── CareerAssessmentForm.tsx    # Main assessment wizard
│   │   │   ├── PersonalityAssessment.tsx   # Big Five personality test
│   │   │   ├── WorkStyleAssessment.tsx     # Work preferences evaluation
│   │   │   ├── WorkEnvironmentAssessment.tsx # Environment preferences
│   │   │   ├── CareerValuesAssessment.tsx  # Values importance rating
│   │   │   ├── SkillsInterestsAssessment.tsx # Skills and interests
│   │   │   ├── ExperienceGoalsAssessment.tsx # Background and goals
│   │   │   └── AssessmentResults.tsx       # Results visualization
│   │   │
│   │   ├── admin/            # 👥 Admin Management Components
│   │   │   ├── AchievementManagement.tsx   # Achievement CRUD
│   │   │   ├── QuestManagement.tsx         # Quest content management
│   │   │   └── SkillManagement.tsx         # Skill database management
│   │   │
│   │   ├── Layout/           # 🎨 Layout and Navigation
│   │   │   └── Layout.tsx    # Main application layout
│   │   │
│   │   ├── CareerRecommendations.tsx      # Career matching UI
│   │   ├── AdminCareerForm.tsx            # Career creation form
│   │   ├── SkillTree.tsx                  # Skill progression visualization
│   │   ├── CharacterSheet.tsx             # Gamification profile
│   │   ├── CertificationGallery.tsx       # Certification display
│   │   ├── ProtectedRoute.tsx             # Auth route guards
│   │   └── ErrorBoundary.tsx              # Error handling
│   │
│   ├── pages/                # 📄 Main Application Pages
│   │   ├── HomePage.tsx                   # Landing page
│   │   ├── DashboardPage.tsx             # User dashboard
│   │   ├── CareersPage.tsx               # Career exploration
│   │   ├── CareerDetailPage.tsx          # Individual career details
│   │   ├── CareerRecommendationsPage.tsx # AI recommendations
│   │   ├── QuestsPage.tsx                # Learning quests
│   │   ├── RecommendedQuestsPage.tsx     # Personalized quest suggestions
│   │   ├── AchievementsPage.tsx          # Achievement tracking
│   │   ├── SkillTreePage.tsx             # Skill development
│   │   ├── ProfilePage.tsx               # User profile management
│   │   ├── AdminPage.tsx                 # Admin dashboard
│   │   └── AuthPage.tsx                  # Authentication
│   │
│   ├── services/             # 🔧 Service Layer & Business Logic
│   │   ├── assessment/       # 🧠 Assessment Processing
│   │   │   ├── assessment-storage.service.ts      # Firestore data persistence
│   │   │   └── assessment-recommendation.service.ts # Personality-career matching
│   │   │
│   │   ├── career/           # 💼 Career Data Management
│   │   │   ├── career.service.ts          # Career CRUD operations
│   │   │   ├── career-fields.service.ts   # Industry field management
│   │   │   └── career-csv.service.ts      # Bulk data import/export
│   │   │
│   │   ├── recommendation/   # 🎯 AI Recommendation Engine
│   │   │   ├── career-recommendation.service.ts # Skill-based recommendations
│   │   │   └── quest-recommendation.service.ts  # Learning path suggestions
│   │   │
│   │   ├── quest/           # 🎮 Gamification System
│   │   │   ├── quest.service.ts          # Quest management
│   │   │   └── index.ts                  # Quest service exports
│   │   │
│   │   ├── achievement/     # 🏆 Achievement System
│   │   │   ├── achievement.service.ts    # Achievement logic
│   │   │   └── index.ts                  # Achievement exports
│   │   │
│   │   ├── user/            # 👤 User Management
│   │   │   ├── user.service.ts          # User profile operations
│   │   │   └── index.ts                 # User service exports
│   │   │
│   │   ├── skill/           # 🛠️ Skill Management
│   │   │   ├── skill.service.ts         # Skill database operations
│   │   │   └── hard-skills.service.ts   # Technical skill definitions
│   │   │
│   │   ├── onet/            # 📊 O*NET Integration
│   │   │   └── onet-integration.service.ts # O*NET API integration
│   │   │
│   │   ├── certification/   # 🎓 Certification System
│   │   │   └── certification.service.ts # Certification management
│   │   │
│   │   ├── types/           # 📝 TypeScript Definitions
│   │   │   ├── assessment.types.ts      # Assessment data models
│   │   │   ├── career.types.ts          # Career data models
│   │   │   ├── quest.types.ts           # Quest data models
│   │   │   ├── skill.types.ts           # Skill data models
│   │   │   ├── achievement.types.ts     # Achievement data models
│   │   │   ├── user.types.ts            # User data models
│   │   │   └── index.ts                 # Type exports
│   │   │
│   │   ├── constants/       # 📋 Application Constants
│   │   │   └── career-fields.ts         # Industry field definitions
│   │   │
│   │   ├── data/            # 📚 Static Data
│   │   │   └── soft-skills.data.ts      # Soft skills definitions
│   │   │
│   │   ├── firebase/        # 🔥 Firebase Configuration
│   │   │   └── firestore-base.ts        # Firestore utilities
│   │   │
│   │   └── index.ts         # Service layer exports
│   │
│   ├── contexts/            # 🏪 React Context Providers
│   │   └── AuthContext.tsx  # Authentication state management
│   │
│   ├── firebase/            # 🔥 Firebase Setup
│   │   └── config.ts        # Firebase configuration
│   │
│   ├── scripts/             # 🔧 Utility Scripts
│   │   ├── importONET.js    # O*NET data import script
│   │   └── migrateCareerFields.js # Data migration utilities
│   │
│   ├── utils/               # 🛠️ Utility Functions
│   │   └── careerFieldSuggestions.ts # Career field suggestions
│   │
│   ├── App.tsx              # Main application component
│   └── index.tsx            # Application entry point
│
├── functions/               # ☁️ Firebase Cloud Functions
│   ├── src/                 # Function source code
│   │   └── index.ts         # Cloud function definitions
│   ├── package.json         # Function dependencies
│   └── tsconfig.json        # TypeScript configuration
│
├── scripts/                 # 🔧 Project Scripts
│   ├── seed-test-quests.js  # Test quest data seeding
│   └── seed-web-quests.js   # Production quest seeding
│
├── firebase.json            # Firebase project configuration
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore database indexes
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── CLAUDE.md               # Claude Code instructions
└── README.md               # Project documentation
```

### 🏗️ Architecture Highlights

- **🧠 Assessment System**: Complete psychological evaluation pipeline with Big Five personality integration
- **🎯 AI Recommendations**: Multi-dimensional career matching using personality, skills, and market data
- **🎮 Gamification**: XP, levels, achievements, and quest system for engagement
- **👥 Role-Based Access**: User, admin, and super_admin permission levels
- **📊 O*NET Integration**: Real-world career data from the U.S. Department of Labor
- **🔥 Firebase Backend**: Firestore database with real-time updates and security rules
- **📱 Responsive Design**: Mobile-first UI with Material-UI components
- **🔧 TypeScript**: Full type safety across the entire application

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Pathfinder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase configuration:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database and Authentication
   - Add your Firebase config to `src/firebase/config.ts`
   - Set up authentication providers (Google, Email/Password)

4. **Configure Firestore Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Start the development server:**
   ```bash
   npm start
   ```

6. **Create your first admin user:**
   - Sign up through the web interface
   - Go to Firebase Console → Firestore
   - Find your user document in the `users` collection
   - Add/edit the `role` field to `admin` or `super_admin`
   - Sign out and back in to access admin features

## 📊 Available Scripts

### Development Commands
- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run Jest tests

### Data Management Scripts
- `npm run import-onet` - Import O*NET career data
- `npm run migrate-fields` - Migrate career field assignments

### Firebase Deployment
- `firebase deploy --only hosting` - Deploy frontend only
- `firebase deploy --only firestore:rules` - Deploy security rules
- `firebase deploy` - Deploy all components (requires Blaze plan)

## 🧠 Assessment System

### Personality Analysis
The assessment system uses validated psychological models:

- **Big Five Personality Traits**: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- **Work Style Preferences**: Team vs individual, structured vs flexible, analytical vs creative
- **Career Values**: Compensation, work-life balance, job security, growth, creativity, autonomy
- **Environment Preferences**: Remote work, company size, industry pace, travel willingness

### Recommendation Algorithm
```
Overall Match = (Personality Fit × 0.25) + 
                (Skills Alignment × 0.30) + 
                (Values Alignment × 0.20) + 
                (Work Style Fit × 0.15) + 
                (Market Demand × 0.10)
```

### Data Models
```typescript
interface CareerAssessmentData {
  userId: string;
  personalityTraits: PersonalityTraits;
  workStylePreferences: WorkStylePreferences;
  workEnvironmentPreferences: WorkEnvironmentPreferences;
  careerValues: CareerValues;
  skillsAndInterests: SkillsAndInterests;
  experienceAndGoals: ExperienceAndGoals;
  completedAt: Date;
}

interface CareerMatchResult {
  careerId: string;
  careerTitle: string;
  overallMatch: number;
  personalityFit: number;
  skillsAlignment: number;
  valuesAlignment: number;
  workStyleFit: number;
  marketDemand: number;
  reasoning: string;
  strengthAreas: string[];
  developmentAreas: string[];
}
```

## 🔐 Security & Permissions

### Role-Based Access Control
- **User**: Basic access to careers, assessments, quests
- **Admin**: Content management, user role updates
- **Super Admin**: Full system access, advanced analytics

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for careers
    match /careers/{careerDoc} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // User data access
    match /users/{userId} {
      allow read, write: if isOwner(userId) || isAdmin();
    }
    
    // Assessment data privacy
    match /user-assessments/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

## 📈 Key Features Deep Dive

### Career Assessment Wizard
1. **Personality Assessment**: 5-factor model evaluation with career relevance insights
2. **Work Style Evaluation**: Preferences on 7-point scales with visual examples
3. **Environment Preferences**: Remote work, company size, industry pace preferences
4. **Career Values**: Importance ratings for 12+ career factors
5. **Skills & Interests**: Technical areas and preferred work activities
6. **Experience & Goals**: Background assessment and timeline planning

### Recommendation Engine Enhancements
- **Personality-Career Mapping**: Research-backed trait correlations for 100+ careers
- **Dynamic Scoring**: Real-time calculation of multi-dimensional fit scores
- **Explanation Generation**: AI-powered reasoning for why careers are recommended
- **Development Planning**: Specific skills and experiences needed for career transition

### Admin Dashboard Features
- **User Management**: Role assignments, user analytics, engagement metrics
- **Content Management**: Career creation/editing, quest development, achievement design
- **Assessment Analytics**: Completion rates, personality distribution, recommendation accuracy
- **Data Import/Export**: CSV tools for bulk career data management

## 🚀 Deployment

### Production Build
```bash
npm run build
firebase deploy --only hosting
```

### Environment Configuration
Create a `.env.local` file:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Performance Optimizations
- **Code Splitting**: Dynamic imports for assessment components
- **Lazy Loading**: Progressive image loading and component mounting
- **Caching**: Firestore data caching with TTL
- **Bundle Optimization**: Tree shaking and production optimizations

## 🧪 Testing

### Test Categories
- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: Service layer and Firebase integration
- **Assessment Tests**: Personality scoring and recommendation accuracy
- **Security Tests**: Firestore rules and authentication flows

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --coverage     # Run with coverage report
npm test -- --watch        # Watch mode for development
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/assessment-enhancement`
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Ensure build passes: `npm run build`
6. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled, comprehensive type definitions
- **ESLint**: Extended React and TypeScript rules
- **Prettier**: Consistent code formatting
- **Commits**: Conventional commit messages

### Assessment System Contributions
When contributing to the assessment system:
- Maintain psychological validity in personality correlations
- Add proper TypeScript interfaces for new assessment dimensions
- Include comprehensive test coverage for scoring algorithms
- Document any changes to the recommendation weighting system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Version History

### v2.0.0 - Assessment Revolution (Latest)
- **Comprehensive Career Assessment System**: 6-step wizard with personality analysis
- **AI-Powered Recommendations**: Science-backed personality-career matching
- **Enhanced User Experience**: Assessment-driven personalization
- **Data Persistence**: User assessment storage and retrieval
- **Advanced Analytics**: Multi-dimensional scoring and insights

### v1.5.0 - Service Architecture Overhaul  
- **Modular Services**: Migrated from monolithic to domain-driven architecture
- **Type Safety**: Comprehensive TypeScript integration
- **Performance**: Optimized caching and API efficiency
- **Admin Enhancements**: Advanced content management tools

### v1.0.0 - Initial Release
- **Core Platform**: Career exploration and skill tracking
- **Gamification**: Quest and achievement systems
- **Admin Dashboard**: Basic content management
- **Firebase Integration**: Authentication and data storage

---

**🎯 Built with passion for career development and powered by psychological science.**

For support or questions, please [open an issue](https://github.com/your-repo/pathfinder/issues) or visit our live application at [https://pathfinder-000.web.app](https://pathfinder-000.web.app).