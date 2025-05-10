// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, type Firestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemoApiKeyForDevelopment",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abc123def456",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEFGHI"
};

// Log the Firebase configuration in development for debugging (without sensitive values)
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase config (sanitized):', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? 'Configured' : 'Missing',
    appId: firebaseConfig.appId ? 'Configured' : 'Missing',
  });
}

// Initialize Firebase
let app;
let db: Firestore;

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

try {
  // Check if Firebase app has already been initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  db = getFirestore(app);
  
  if (isBrowser) {
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { db };
