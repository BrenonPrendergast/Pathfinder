# Pathfinder 🎯

A gamified career development platform that transforms professional growth into an epic adventure. Built with React, TypeScript, and Firebase.

**🌐 Live Application:** [https://pathfinder-000.web.app](https://pathfinder-000.web.app)

## ✨ Features

### 🧠 AI-Powered Career Assessment
- **6-Step Assessment Wizard**: Comprehensive personality, skills, and values evaluation
- **Big Five Personality Integration**: Science-backed trait analysis
- **Personalized Recommendations**: AI-driven career matching with detailed insights
- **Multi-Dimensional Scoring**: Personality fit, skills alignment, values matching

### 🚀 Career Exploration
- **1000+ Career Profiles**: Browse careers across 18+ industry fields
- **Smart Filtering**: Search by field, experience level, salary range
- **O*NET Integration**: Real-world data from U.S. Department of Labor
- **Detailed Career Information**: Skills, salary data, growth projections

### 🎮 Gamified Learning
- **Quest System**: Structured learning paths with XP rewards
- **Achievement System**: Unlock badges and milestones
- **Skill Development**: Track proficiency levels and learning hours
- **Level Progression**: Logarithmic XP system with visual progress tracking

### 👥 Admin Management
- **Role-Based Access**: User, admin, and super_admin permissions
- **Content Management**: Create and manage careers, quests, achievements
- **User Analytics**: Engagement metrics and progress tracking
- **CSV Import/Export**: Bulk data management tools

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Firebase project with Firestore and Authentication

### Installation

1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd Pathfinder
   npm install
   ```

2. **Firebase setup:**
   - Create project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database and Authentication
   - Add config to `src/firebase/config.ts`
   - Deploy security rules: `firebase deploy --only firestore:rules`

3. **Start development:**
   ```bash
   npm start
   ```

4. **Create admin user:**
   - Sign up through the web interface
   - In Firebase Console → Firestore → `users` collection
   - Set `role` field to `admin` or `super_admin`

## 📋 Available Commands

### Development
```bash
npm start              # Start development server
npm run build          # Create production build
npm test              # Run Jest tests
```

### Data Management
```bash
npm run import-onet    # Import O*NET career data
npm run migrate-fields # Migrate career field data
```

### Firebase Deployment
```bash
firebase deploy                    # Deploy all components
firebase deploy --only hosting     # Deploy frontend only
firebase deploy --only firestore:rules # Deploy security rules
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Material-UI v5
- **Backend**: Firebase (Firestore + Authentication + Hosting)
- **State Management**: React Context with custom hooks
- **Routing**: React Router v7 with protected routes
- **Design**: Gaming-inspired UI with particle effects and animations

### Key Components
- **Assessment System**: Multi-step career evaluation with personality analysis
- **Recommendation Engine**: AI-powered career matching with weighted scoring
- **Gamification**: XP, levels, achievements, and quest progression
- **Admin Dashboard**: Comprehensive content and user management

### Data Models
```typescript
interface UserProfile {
  level: number;
  totalXP: number;
  skillHours: Record<string, number>;
  completedQuests: string[];
  careerPaths: CareerPath[];
  role: 'user' | 'admin' | 'super_admin';
}

interface Career {
  title: string;
  description: string;
  fields: CareerFieldKey[];
  skills: SkillRequirement[];
  averageSalary?: SalaryRange;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

## 🔐 Security

### Role-Based Access Control
- **User**: Career exploration, assessments, personal progress
- **Admin**: Content management, user role updates
- **Super Admin**: Full system access, advanced analytics

### Firestore Security
```javascript
// Example security rule
match /users/{userId} {
  allow read, write: if isOwner(userId) || isAdmin();
}
```

## 🧪 Assessment System

### Scoring Algorithm
```
Overall Match = (Personality Fit × 0.25) + 
                (Skills Alignment × 0.30) + 
                (Values Alignment × 0.20) + 
                (Work Style Fit × 0.15) + 
                (Market Demand × 0.10)
```

### Assessment Components
1. **Personality Assessment**: Big Five traits evaluation
2. **Work Style Preferences**: Team vs individual, structured vs flexible
3. **Environment Preferences**: Remote work, company size, industry pace
4. **Career Values**: Compensation, growth, creativity, autonomy
5. **Skills & Interests**: Technical areas and work activities
6. **Experience & Goals**: Background and timeline planning

## 🚀 Deployment

### Production Build
```bash
npm run build
firebase deploy --only hosting
```

### Environment Variables
Create `.env.local`:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

## 🧪 Testing

```bash
npm test                    # Run all tests
npm test -- --coverage     # Run with coverage
npm test -- --watch        # Watch mode
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes with proper TypeScript types
4. Add tests for new functionality
5. Ensure build passes: `npm run build`
6. Submit pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Extended React/TypeScript rules
- **Prettier**: Consistent formatting
- **Commits**: Conventional commit messages

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔄 Version History

### v2.0.0 - Assessment Revolution (Current)
- Comprehensive 6-step career assessment system
- AI-powered personality-career matching
- Enhanced user experience with personalization
- Advanced analytics and insights

### v1.5.0 - Service Architecture Overhaul
- Modular domain-driven architecture
- Comprehensive TypeScript integration
- Performance optimizations
- Enhanced admin tools

### v1.0.0 - Initial Release
- Core career exploration platform
- Gamification system
- Basic admin dashboard
- Firebase integration

---

**🎯 Transforming career development through gamification and AI-powered insights.**

For support, visit our [live application](https://pathfinder-000.web.app) or open an issue.