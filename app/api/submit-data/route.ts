import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

// Define an interface for the expected request body
interface GoalData {
  name: string;
  email: string;
  goal: string;
  deadline: string; // Format: DD/MM/YYYY
  frequency: string;
  tone: string;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, goal, deadline, frequency, tone } = body as GoalData;

    console.log('Processing form submission with data:', {
      name,
      email,
      goal,
      deadline,
      frequency,
      tone
    });

    // Basic Input Validation
    if (!name || !email || !goal || !deadline || !frequency || !tone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Parse the deadline date
    const parts = deadline.split('/');
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: "Invalid deadline date format. Please use DD/MM/YYYY." },
        { status: 400 }
      );
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 0 || month > 11) {
      return NextResponse.json(
        { error: "Invalid deadline date components. Ensure DD/MM/YYYY is correct." },
        { status: 400 }
      );
    }

    const deadlineDate = new Date(year, month, day);
    
    // Store as ISO string instead of Timestamp to avoid server/client mismatches
    const deadlineDateISO = deadlineDate.toISOString();

    console.log('Parsed deadline date:', deadlineDateISO);

    try {
      // Create the document data
      const docData = {
        name,
        email,
        goal,
        deadline: deadlineDateISO, // Store as ISO string, not Timestamp
        deadlineDay: day,          // Store date components separately for easier queries
        deadlineMonth: month + 1,  // Store 1-indexed month for consistency
        deadlineYear: year,
        frequency,
        tone,
        status: 'pending',
        lastSent: null,
        nextSend: null,
        completed: false,
        createdAt: new Date().toISOString(), // Use ISO string for consistency
      };

      console.log('Attempting to add document to Firestore with data:', docData);

      // Add the document to Firestore
      const docRef = await addDoc(collection(db, 'goals'), docData);
      
      console.log('Document added successfully with ID:', docRef.id);

      return NextResponse.json(
        { message: "Goal added successfully", id: docRef.id },
        { status: 200 }
      );
    } catch (err) {
      console.error("Error adding document to Firestore:", err);
      return NextResponse.json(
        { error: "Couldn't add the goal. Firebase error: " + (err instanceof Error ? err.message : 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 