// Firebase configuration for Pathfinder
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBKJbAHRJKA4c5V3Ev499zx0YrGZwcM8pw",
  authDomain: "pathfinder-000.firebaseapp.com",
  projectId: "pathfinder-000",
  storageBucket: "pathfinder-000.firebasestorage.app",
  messagingSenderId: "680035885497",
  appId: "1:680035885497:web:d9ef662f2dd79122269668",
  measurementId: "G-HKMNS4YCXQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics disabled to prevent cookie issues
// TODO: Re-enable analytics with proper domain configuration later
export const analytics = null;

// Development emulators (uncomment for local testing)
// if (process.env.NODE_ENV === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app;