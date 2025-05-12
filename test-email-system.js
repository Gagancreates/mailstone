// Test script for mailgoal email system
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const fetch = require('node-fetch');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log("Firebase Config:", firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data with different tones and frequencies
const testGoals = [
  {
    name: "Test User 1",
    email: "test1@example.com", // Replace with a real email for testing
    goal: "Complete the quarterly financial report",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    deadlineDay: new Date().getDate() + 7,
    deadlineMonth: new Date().getMonth() + 1,
    deadlineYear: new Date().getFullYear(),
    frequency: "daily",
    tone: "Elon Musk",
    status: "pending",
    lastSent: null,
    nextSend: null,
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Test User 2",
    email: "test2@example.com", // Replace with a real email for testing
    goal: "Launch the marketing campaign for the new product",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    deadlineDay: new Date().getDate() + 14,
    deadlineMonth: new Date().getMonth() + 1,
    deadlineYear: new Date().getFullYear(),
    frequency: "weekly",
    tone: "Steve Jobs",
    status: "pending",
    lastSent: null,
    nextSend: null,
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Test User 3",
    email: "test3@example.com", // Replace with a real email for testing
    goal: "Prepare the presentation for the board meeting",
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
    deadlineDay: new Date().getDate() + 21,
    deadlineMonth: new Date().getMonth() + 1,
    deadlineYear: new Date().getFullYear(),
    frequency: "biweekly",
    tone: "Sam Altman",
    status: "pending",
    lastSent: null,
    nextSend: null,
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Test User 4",
    email: "test4@example.com", // Replace with a real email for testing
    goal: "Complete the online course on advanced data analytics",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month from now
    deadlineDay: new Date().getDate(),
    deadlineMonth: new Date().getMonth() + 2,
    deadlineYear: new Date().getFullYear(),
    frequency: "monthly",
    tone: "Naval Ravikant",
    status: "pending",
    lastSent: null,
    nextSend: null,
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Test User 5",
    email: "test5@example.com", // Replace with a real email for testing
    goal: "Master the fundamentals of machine learning",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 months from now
    deadlineDay: new Date().getDate(),
    deadlineMonth: new Date().getMonth() + 3,
    deadlineYear: new Date().getFullYear(),
    frequency: "weekly",
    tone: "Your Future Self",
    status: "pending",
    lastSent: null,
    nextSend: null,
    completed: false,
    createdAt: new Date().toISOString()
  }
];

// Add test goals to Firestore
async function addTestGoals() {
  console.log("Adding test goals to Firestore...");
  
  for (const goal of testGoals) {
    try {
      const docRef = await addDoc(collection(db, 'goals'), goal);
      console.log(`Added goal with ID: ${docRef.id}`);
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  }
  
  console.log("All test goals added!");
}

// Trigger the email sending API
async function triggerEmailSending() {
  console.log("Triggering email sending API...");
  
  try {
    // Replace with your actual API URL
    const apiUrl = 'http://localhost:3000/api/get-email';
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log("API response:", data);
  } catch (error) {
    console.error("Error triggering email API:", error);
  }
}

// Run the tests
async function runTests() {
  try {
    // First add the test goals
    await addTestGoals();
    
    console.log("Waiting 5 seconds before triggering email API...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Then trigger the email sending
    await triggerEmailSending();
    
    console.log("Tests completed!");
  } catch (error) {
    console.error("Test error:", error);
  }
}

// Run the tests
runTests(); 