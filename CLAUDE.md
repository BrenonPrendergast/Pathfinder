# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pathfinder is a career exploration web application built with React, TypeScript, and Firebase. It provides a structured framework for career development, making professional growth transparent and measurable through comprehensive career exploration, skills tracking, learning quests, and achievement systems.

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
- **Theme**: Custom Material-UI theme with green/purple gradient palette
- **Design System**: Gaming-inspired UI with particle effects, interactive backgrounds, and custom PathfinderLogo component
- **Background Effects**: Interactive particle systems, floating nodes, and subtle cursor effects

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
- **PathfinderLogo** (`src/components/PathfinderLogo.tsx`): Custom SVG logo component with size variants
- **GamingBackground** (`src/components/backgrounds/GamingBackground.tsx`): Particle animation system
- **FloatingNodes** (`src/components/backgrounds/FloatingNodes.tsx`): Interactive node network visualization
- **InteractiveSpotlight** (`src/components/backgrounds/InteractiveSpotlight.tsx`): Cursor particle effects
- **StatsService** (`src/services/stats/stats.service.ts`): Real-time database statistics
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

## Design System & Consistency Standards

### Visual Design Standards
- **Color Scheme**: Consistent use of lime green (#00B162) for primary actions and purple (#6366f1) for interactive elements
- **Button Styling**: All action buttons use lime green (#00B162) with hover state (#009654)
- **Card Styling**: Semi-transparent backgrounds with `linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)`
- **Border Colors**: Purple (#6366f1) for form inputs and interactive borders
- **Background Effects**: Gaming-inspired particle systems, floating nodes, and interactive cursor effects on all main pages

### Layout Standards
- **Container Structure**: All pages use `Container maxWidth="lg"` with `position: 'relative', zIndex: 10`
- **Background Layers**: Consistent background animation components across all pages:
  - `<GamingBackground variant="combined" intensity="medium" />`
  - `<FloatingNodes nodeCount={20} connectionOpacity={0.12} />`
  - `<InteractiveSpotlight size="large" intensity="subtle" color="primary" />`
- **Card Height Alignment**: Use flexbox for consistent card heights in grid layouts:
  ```tsx
  <Card sx={{ 
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  }}>
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
  ```

### Typography Standards
- **Page Headers**: Use GradientText component with consistent gradient styling
- **Section Titles**: Consistent spacing and hierarchy with Material-UI variants
- **Font System**: Nacelle font family for headers, Inter for body text

### Component Standards
- **Navigation**: Layout component provides consistent navigation across all pages
- **Forms**: Purple borders for inputs with consistent focus states
- **Icons**: Material-UI icons with consistent color mapping (purple for interactive, lime green for actions)
- **Progress Indicators**: Linear progress bars use lime green color (#00B162)

### Animation Standards
- **Hover Effects**: Cards have subtle purple glow on hover (hsl(250 86% 67% / 0.35))
- **Button Animations**: Slight upward translate on hover with smooth transitions
- **Page Transitions**: Consistent AOS (Animate On Scroll) effects with 600ms duration
- **Particle Effects**: Subtle, non-distracting particle animations that enhance the gaming theme

### Responsive Design
- **Breakpoints**: Follow Material-UI standard breakpoints (xs, sm, md, lg, xl)
- **Grid System**: Consistent use of Material-UI Grid with responsive spacing
- **Typography**: Responsive font sizes using sx prop with xs/md breakpoint scaling

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