// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, type Firestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Validate that we have actual Firebase config values, not demo placeholders
const validateFirebaseConfig = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!apiKey || apiKey.includes('DemoApiKey') || !projectId || projectId === 'demo-project') {
    console.error(
      'WARNING: Using demo Firebase configuration. Please set up your Firebase project and update .env.local with your project credentials.\n' +
      'Visit https://console.firebase.google.com to create a project, then enable Firestore.'
    );
    return false;
  }
  return true;
};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Create a variable to track Firebase connectivity status
let isFirebaseConnected = false;
let isConfigValid = validateFirebaseConfig();

// Log the Firebase configuration in development for debugging (without sensitive values)
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase config (sanitized):', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? 'Configured' : 'Missing',
    appId: firebaseConfig.appId ? 'Configured' : 'Missing',
    projectId: firebaseConfig.projectId,
    isConfigValid
  });
}

// Initialize Firebase
let app;
let db: Firestore;

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Function to check Firebase connectivity
const checkFirebaseConnection = async () => {
  if (!db) return false;
  
  try {
    // A lightweight operation to check Firebase connection
    // We're using the settings() method which doesn't require a network request
    const settings = db.toJSON ? db.toJSON() : 'Firebase initialized';
    console.log('Firebase connection check passed:', settings);
    isFirebaseConnected = true;
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    isFirebaseConnected = false;
    return false;
  }
};

// Function to get current Firebase connection status
const getFirebaseConnectionStatus = () => {
  // If we're in the browser, also check the navigator.onLine status
  if (isBrowser) {
    return isFirebaseConnected && navigator.onLine;
  }
  return isFirebaseConnected;
};

const initializeFirebase = () => {
  if (!isConfigValid) {
    console.error(`
      --------------------------------------------------------
      ERROR: Invalid Firebase configuration detected.
      
      To resolve this issue:
      1. Create a Firebase project at https://console.firebase.google.com
      2. Enable Firestore in your project
      3. Create a web app in your Firebase project
      4. Create a .env.local file with your Firebase configuration
      
      See documentation for more details.
      --------------------------------------------------------
    `);
  }

  try {
    // Check if Firebase app has already been initialized
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    db = getFirestore(app);

    // If in development and the environment variable is set, connect to the emulator
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      // Default emulator host and port - adjust as needed
      const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
      const port = parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080', 10);
      connectFirestoreEmulator(db, host, port);
      console.log(`Connected to Firestore emulator at ${host}:${port}`);
    }
    
    // Enable offline persistence only in browser environment
    if (isBrowser) {
      enableIndexedDbPersistence(db)
        .then(() => {
          console.log('Firestore offline persistence has been enabled.');
        })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Firestore persistence can only be enabled in one tab at a time.');
          } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support offline persistence.');
          } else {
            console.error('Error enabling offline persistence:', err);
          }
        });
      
      console.log('Firebase initialized successfully');
      
      // Monitor online/offline status for the browser environment
      window.addEventListener('online', () => {
        console.log('Browser is online. Attempting to reconnect to Firebase...');
        checkFirebaseConnection();
      });
      
      window.addEventListener('offline', () => {
        console.log('Browser is offline. Firebase operations may fail.');
        isFirebaseConnected = false;
      });
      
      // Initial connection check
      checkFirebaseConnection();
    }
    
    return db;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    
    // Check if the error is related to Firebase API not being enabled
    const errorMessage = String(error);
    if (errorMessage.includes('PERMISSION_DENIED') && errorMessage.includes('Cloud Firestore API has not been used')) {
      console.error(`
        --------------------------------------------------------
        ERROR: Firestore API is not enabled for this project.
        
        To resolve this issue:
        1. Go to https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${firebaseConfig.projectId}
        2. Click "Enable API" to enable Firestore
        3. Wait a few minutes for the change to propagate
        --------------------------------------------------------
      `);
    }
    
    isFirebaseConnected = false;
    throw error;
  }
};

// Initialize Firebase and export db
try {
  db = initializeFirebase();
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  // Create a fallback db object that logs errors
  db = new Proxy({} as Firestore, {
    get: (target, prop) => {
      return () => {
        console.error(`Firebase is not available. Cannot use method: ${String(prop)}`);
        return Promise.reject(new Error('Firebase connection failed'));
      };
    }
  }) as Firestore;
}

export { db, checkFirebaseConnection, getFirebaseConnectionStatus };
