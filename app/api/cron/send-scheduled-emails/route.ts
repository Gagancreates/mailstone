import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

// Goal interface to define the shape of our data
interface Goal {
  name: string;
  email: string;
  goal: string;
  deadline: string;
  frequency: string;
  tone: string;
  lastSent: string | null;
  nextSend: string | null;
  status: string;
  completed: boolean;
}

interface SuccessResult {
  goalId: string;
  email: string;
  nextSend: string;
  messageId: string;
}

interface ErrorResult {
  goalId: string;
  error: string;
}

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Verify that this is a legitimate cron job request
function isValidCronRequest(request: Request): boolean {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  // In production, use a secure environment variable for this secret
  const cronSecret = process.env.CRON_SECRET;
  
  // Secret validation
  if (!cronSecret || secret !== cronSecret) {
    console.warn('Invalid cron secret provided');
    return false;
  }
  
  return true;
}

// Function to check if today matches the send schedule based on frequency
function shouldSendToday(frequency: string, lastSent: string | null, deadlineISO: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If never sent before, send today
  if (!lastSent) {
    return true;
  }
  
  // Convert deadline to Date object
  const deadlineDate = new Date(deadlineISO);
  deadlineDate.setHours(0, 0, 0, 0);
  
  // If it's the deadline day, always send
  if (today.getTime() === deadlineDate.getTime()) {
    return true;
  }
  
  const lastSentDate = new Date(lastSent);
  lastSentDate.setHours(0, 0, 0, 0);
  
  // Don't send if already sent today
  if (today.getTime() === lastSentDate.getTime()) {
    return false;
  }
  
  switch (frequency) {
    case 'daily':
      return true;
      
    case 'weekly':
      const daysSinceLastSent = Math.floor((today.getTime() - lastSentDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastSent >= 7;
      
    case 'biweekly':
      const daysSinceLastSentBi = Math.floor((today.getTime() - lastSentDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastSentBi >= 3;
      
    case 'monthly':
      const lastMonth = lastSentDate.getMonth();
      const currentMonth = today.getMonth();
      return lastMonth !== currentMonth;
      
    default:
      return false;
  }
}

// Calculate next send date based on frequency
function calculateNextSendDate(frequency: string): Date {
  const nextDate = new Date();
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 3);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }
  
  return nextDate;
}

// Process a single goal with rate limiting
async function processGoal(goal: Goal, goalId: string, baseUrl: string): Promise<{success: boolean, result?: SuccessResult, error?: string}> {
  try {
    console.log(`Processing goal ${goalId}: ${goal.goal}`);
    
    // Generate email content
    console.log('Calling get-email API...');
    const emailResponse = await fetch(`${baseUrl}/api/get-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: goal.name,
        email: goal.email,
        goal: goal.goal,
        deadline: goal.deadline,
        tone: goal.tone,
        frequency: goal.frequency
      })
    });
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Email generation failed:', errorText);
      throw new Error(`Failed to generate email: ${emailResponse.statusText}`);
    }
    
    const emailContent = await emailResponse.json();
    console.log('Email content generated successfully');
    
    // Send the email
    console.log('Calling send-email API...');
    const sendResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: goal.email,
        subject: `Reminder: Your Goal - ${goal.goal}`,
        html: emailContent.html
      })
    });
    
    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error('Email sending failed:', errorText);
      throw new Error(`Failed to send email: ${sendResponse.statusText}`);
    }
    
    const sendResult = await sendResponse.json();
    console.log('Email sent successfully', sendResult);
    
    // Calculate next send date
    const nextSendDate = calculateNextSendDate(goal.frequency);
    
    // Update goal in database
    await updateDoc(doc(db, 'goals', goalId), {
      lastSent: new Date().toISOString(),
      nextSend: nextSendDate.toISOString(),
      status: 'active'
    });
    
    return {
      success: true,
      result: {
        goalId,
        email: goal.email,
        nextSend: nextSendDate.toISOString(),
        messageId: sendResult.messageId
      }
    };
    
  } catch (err) {
    console.error(`Error processing goal ${goalId}:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

// Batch processor for goals with rate limiting
async function processBatch(goals: {id: string, data: Goal}[], baseUrl: string): Promise<{successes: SuccessResult[], errors: ErrorResult[]}> {
  const results = {
    successes: [] as SuccessResult[],
    errors: [] as ErrorResult[]
  };
  
  // Process goals sequentially to avoid overwhelming the API
  for (const goal of goals) {
    const result = await processGoal(goal.data, goal.id, baseUrl);
    
    if (result.success && result.result) {
      results.successes.push(result.result);
    } else {
      results.errors.push({
        goalId: goal.id,
        error: result.error || 'Unknown error'
      });
    }
    
    // Add a small delay between goals to avoid overwhelming APIs
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

// This function makes the GET route available to the Vercel Cron system
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  console.log('Cron job triggered at:', new Date().toISOString());
  console.log('Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
  
  // Verify this is a legitimate cron request
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Check if Brevo API key is configured
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Email configuration error: BREVO_API_KEY is not set' },
        { status: 500 }
      );
    }
    
    console.log('Running scheduled email check...');
    
    // Query for goals that are not completed
    const goalsRef = collection(db, 'goals');
    const goalsQuery = query(goalsRef, where('completed', '==', false));
    const goalsSnapshot = await getDocs(goalsQuery);
    
    if (goalsSnapshot.empty) {
      console.log('No pending goals found');
      return NextResponse.json({
        success: true,
        message: 'No pending goals found',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`Found ${goalsSnapshot.size} pending goals`);
    
    // Get the base URL for API calls
    const baseUrl = new URL(request.url).origin;
    console.log('Base URL for API calls:', baseUrl);
    
    // Filter goals that should be sent today
    const goalsToProcess = goalsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        data: doc.data() as Goal
      }))
      .filter(goal => shouldSendToday(
        goal.data.frequency, 
        goal.data.lastSent, 
        goal.data.deadline
      ));
    
    console.log(`${goalsToProcess.length} goals need emails today`);
    
    if (goalsToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No emails need to be sent today',
        timestamp: new Date().toISOString()
      });
    }
    
    // Process goals in batches
    const { successes, errors } = await processBatch(goalsToProcess, baseUrl);
    
    // Return response with results
    return NextResponse.json({
      success: true,
      emailsSent: successes,
      errors: errors,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Cron job failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 