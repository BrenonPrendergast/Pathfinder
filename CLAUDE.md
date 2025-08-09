# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pathfinder is a career exploration web application built with React, TypeScript, and Firebase. It helps users explore career paths through a gamified experience with quests, skills tracking, achievements, and role-based access control.

**Live URL:** https://pathfinder-000.web.app
**Firebase Project:** pathfinder-000

## Development Commands

### Frontend (React)
```bash
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests with Jest
npm run import-onet # Import career data from O*NET
npm run migrate-fields # Migrate career field data
```

### Firebase Functions
```bash
cd functions
npm run build      # Compile TypeScript
npm run lint       # ESLint code checking
npm run serve      # Start local emulator
npm run deploy     # Deploy to Firebase
npm run logs       # View function logs
```

### Firebase Deployment
```bash
firebase deploy    # Deploy hosting, functions, and rules
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## Architecture

### Frontend Structure
- **React 18** with TypeScript and Material-UI v5
- **Authentication**: Firebase Auth with Google and email/password
- **Database**: Firestore with real-time updates
- **State Management**: React Context (AuthContext) for global state
- **Routing**: React Router v7 with protected routes
- **Theme**: Custom Material-UI theme with blue/purple palette

### Data Models
- **Career**: Job information with O*NET codes, skills, salary data, and career fields
- **Quest**: Learning activities with XP rewards and skill progression
- **Achievement**: Gamification badges with completion criteria
- **UserProfile**: Gamified user data with XP, level, skills, and role-based permissions

### Firebase Collections
- `users` - User profiles with role-based access control
- `careers` - Career information categorized by industry fields
- `quests` - Learning activities linked to careers
- `achievements` - Unlockable badges and milestones
- `user-quests` - User progress tracking
- `user-achievements` - User achievement unlocks

### Key Components
- **AuthContext** (`src/contexts/AuthContext.tsx`): User authentication and profile management
- **Layout** (`src/components/Layout/Layout.tsx`): Navigation and layout wrapper
- **ProtectedRoute**: Route guards for authenticated users
- **AdminPage**: User management and content administration
- **CareerFieldCategories** (`src/services/firestore.ts`): 18 standardized career field classifications

### Security & Permissions
- **Firestore Rules**: Role-based security (user/admin/super_admin)
- **Admin Features**: User role management, career/quest creation
- **Public Access**: Careers and basic information readable by all
- **User Data**: Self-managed profiles with admin oversight

## Development Patterns

### Authentication Flow
1. Users can sign up with email/password or Google OAuth
2. New users get default 'user' role and welcome achievement
3. User profiles track gamification data (XP, level, completed quests)
4. Admin promotion requires manual Firestore role update

### Career Field System
The application uses 18 standardized career field categories based on industry classifications. Each career can be assigned to multiple fields for better organization and searchability.

### Gamification System
- **XP System**: Users gain experience points from completing quests
- **Level Progression**: Logarithmic XP-to-level calculation
- **Skill Tracking**: Hours spent learning specific skills
- **Achievement System**: Unlockable badges based on user activity

## Admin Setup

To create the first admin user:
1. Sign up through the web app first
2. Go to Firebase Console → Firestore
3. Find your user document in the `users` collection
4. Add/edit the `role` field to `admin` or `super_admin`
5. Sign out and back in to access admin features

## Common Tasks

### Adding New Careers
Use the admin interface or import scripts. Careers should include:
- O*NET SOC codes for standardization
- Multiple career field assignments
- Skill requirements with proficiency levels
- Salary data and job outlook information

### Creating Quests
Quests should be linked to specific careers and include:
- Clear learning objectives and instructions
- Appropriate XP rewards
- Skill progression tracking
- External resource links when applicable

### Testing User Flows
- Test both authenticated and public routes
- Verify role-based access controls
- Check gamification calculations
- Validate Firebase security rules

### Local Development
Firebase emulators can be enabled in `src/firebase/config.ts` by uncommenting the development configuration. This allows local testing without affecting production data.