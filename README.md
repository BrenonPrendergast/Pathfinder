# Pathfinder

A career exploration and skill development platform built with React and Firebase.

## 🌟 Features

- **Career Exploration**: Browse and discover career paths across 20+ industry fields
- **Skill Development**: Track skills and proficiency levels for each career
- **Quest System**: Complete learning quests to advance your skills
- **Achievement System**: Unlock achievements as you progress
- **Admin Dashboard**: Comprehensive admin tools for content management
- **CSV Import/Export**: Bulk career data management capabilities
- **Field Categorization**: Intelligent career field suggestions and organization

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Backend**: Firebase (Firestore, Authentication)
- **Routing**: React Router v7
- **Build Tool**: Create React App

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
├── contexts/           # React context providers
├── pages/              # Main application pages
├── services/           # Firebase services and API layer
│   ├── career/         # Career-related services
│   ├── user/           # User management services
│   ├── quest/          # Quest system services
│   ├── achievement/    # Achievement services
│   ├── types/          # TypeScript type definitions
│   ├── constants/      # Application constants
│   └── firebase/       # Firebase utilities
├── utils/              # Utility functions
└── firebase/           # Firebase configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd Pathfinder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase configuration:
   - Create a Firebase project
   - Enable Firestore and Authentication
   - Add your Firebase config to `src/firebase/config.ts`

4. Start the development server:
   ```bash
   npm start
   ```

## 📊 Available Scripts

- `npm start` - Runs the development server
- `npm run build` - Creates a production build
- `npm test` - Runs the test suite
- `npm run import-onet` - Import O*NET career data
- `npm run migrate-fields` - Migrate career field assignments

## 🔧 Service Architecture

The application uses a modular service architecture:

- **Career Service**: CRUD operations for career data
- **Career Fields Service**: Field categorization and filtering
- **Career CSV Service**: Import/export functionality
- **User Service**: User management and roles
- **Quest Service**: Learning quest management
- **Achievement Service**: Achievement tracking

## 🎯 Key Features

### Career Management
- Browse 1000+ career profiles
- Filter by industry field, difficulty level
- Smart field categorization using keyword matching
- Bulk field assignment tools

### Admin Dashboard
- User role management
- Career content management
- CSV import/export for bulk operations
- Field audit and migration tools

### Gamification
- XP and level system
- Achievement unlocking
- Quest completion tracking
- Skill proficiency tracking

## 🚀 Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

## 📝 Environment Variables

Create a `.env` file with your Firebase configuration:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure build passes
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔄 Recent Updates

- **Service Refactoring**: Migrated from monolithic service (1,136 lines) to modular architecture
- **Type Safety**: Comprehensive TypeScript type definitions
- **Performance**: Optimized caching and API calls
- **Maintainability**: Domain-driven service organization