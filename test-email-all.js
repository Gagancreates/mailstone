// Test script to send emails to all users in the database
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, connectFirestoreEmulator } = require('firebase/firestore');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  // Removed measurementId as it might be causing issues if it's undefined
};

// Show Firebase config for debugging (redacted for security)
console.log('Firebase config check:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Missing',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Missing'
});

// Check for email configuration
console.log('Email config check:', {
  emailUser: process.env.EMAIL_USER ? 'Set' : 'Missing',
  emailPassword: process.env.EMAIL_PASSWORD ? 'Set' : 'Missing'
});

// Initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  // Connect to emulator if in development environment
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
    const port = parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080', 10);
    connectFirestoreEmulator(db, host, port);
    console.log(`Connected to Firestore emulator at ${host}:${port}`);
  }

  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Generate a simple test email
  function generateTestEmail(name, goal, deadline) {
    const subject = `Test Email: Reminder for ${goal}`;
    const body = `
Hello ${name},

This is a test email from MailGoal to remind you about your goal:

Goal: ${goal}
Deadline: ${new Date(deadline).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}

This email was automatically generated by the test script.

Best regards,
MailGoal Team
`;

    return { subject, body };
  }

  // Main function to send emails to all users
  async function sendTestEmailsToAllUsers() {
    try {
      console.log('Starting test email process...');
      
      // Get all goals from Firestore
      console.log('Fetching goals from Firestore collection: goals');
      const goalsRef = collection(db, 'goals');
      const querySnapshot = await getDocs(goalsRef);
      
      console.log(`Found ${querySnapshot.size} goals in the database`);
      
      if (querySnapshot.size === 0) {
        console.log('No goals found in the database. No emails will be sent.');
        return;
      }
      
      // Debug: Print out first goal data as sample (with email redacted for privacy)
      const firstGoal = querySnapshot.docs[0].data();
      console.log('Sample goal data structure:', {
        ...firstGoal,
        email: firstGoal.email ? `${firstGoal.email.slice(0, 3)}...` : 'undefined',
        goal: firstGoal.goal || 'undefined',
        deadline: firstGoal.deadline || 'undefined',
        name: firstGoal.name || 'undefined'
      });
      
      // Prepare and send emails for each user with a goal
      const sendPromises = [];
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        console.log(`Processing goal for ${data.email}: ${data.goal}`);
        
        const { subject, body } = generateTestEmail(data.name, data.goal, data.deadline);
        
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: data.email,
          subject: subject,
          text: body,
        };
        
        // Add to promises
        sendPromises.push(
          transporter.sendMail(mailOptions)
            .then(() => {
              console.log(`✅ Test email sent to ${data.email}`);
              return { success: true, email: data.email };
            })
            .catch((error) => {
              console.error(`❌ Failed to send test email to ${data.email}:`, error);
              return { success: false, email: data.email, error: error.message };
            })
        );
      });
      
      // Wait for all emails to be sent
      const results = await Promise.all(sendPromises);
      
      // Summarize results
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log('\n==== Email Test Summary ====');
      console.log(`Total goals: ${querySnapshot.size}`);
      console.log(`Emails sent successfully: ${successful}`);
      console.log(`Emails failed: ${failed}`);
      console.log('===========================\n');
    } catch (error) {
      console.error('Error in send test emails function:', error);
    }
  }

  // Run the main function
  sendTestEmailsToAllUsers()
    .then(() => console.log('Test email process completed.'))
    .catch((error) => console.error('Fatal error in test script:', error));

} catch (error) {
  console.error('Firebase initialization error:', error);
} 