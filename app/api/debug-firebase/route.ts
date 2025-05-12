import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, DocumentData } from 'firebase/firestore';

export async function GET() {
  try {
    // Get Firebase configuration (safely)
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY 
        ? `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 4)}...` 
        : 'not set',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'not set',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not set',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'not set',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID 
        ? 'set' : 'not set',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID 
        ? 'set' : 'not set',
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID 
        ? 'set' : 'not set',
    };

    // Check database connection
    const dbInitialized = !!db;
    
    let testReadResult = 'not attempted';
    let collections: string[] = [];
    
    // Only try to read if db is initialized
    if (dbInitialized) {
      try {
        // Try to read from goals collection
        const goalsCollection = collection(db, 'goals');
        const snapshot = await getDocs(collection(db, 'goals'));
        testReadResult = `Read successful. ${snapshot.size} documents found.`;
        
        // List all collections
        const collsSnapshot = await getDocs(collection(db, 'goals'));
        collections = collsSnapshot.docs.map(doc => doc.id);
      } catch (error) {
        testReadResult = `Read error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      firebaseConfig,
      dbInitialized,
      testReadResult,
      collections,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error checking Firebase: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 