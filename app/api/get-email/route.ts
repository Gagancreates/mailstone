import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Create a queue for handling Gemini API requests
interface QueueItem {
  email: string;
  name: string;
  goal: string;
  deadline: string;
  tone: string;
  frequency: string;
  documentId: string;
}

let processingQueue = false;
const emailQueue: QueueItem[] = [];

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to determine if a reminder should be sent based on frequency and last sent date
function shouldSendReminder(lastSent: string | null, frequency: string, nextSend: string | null): boolean {
  const currentDate = new Date();
  
  // If nextSend is set, check if we've reached that date
  if (nextSend) {
    const nextSendDate = new Date(nextSend);
    return currentDate >= nextSendDate;
  }
  
  // If no lastSent, this is the first time sending
  if (!lastSent) return true;

  const lastSentDate = new Date(lastSent);
  const diffTime = currentDate.getTime() - lastSentDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  switch (frequency) {
    case 'daily':
      return diffDays >= 1;
    case 'weekly':
      return diffDays >= 7;
    case 'biweekly':
      return diffDays >= 14;
    case 'monthly':
      return diffDays >= 30;
    default:
      return false;
  }
}

// Function to calculate the next send date based on frequency
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
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 1); // Default to daily
  }
  
  return nextDate;
}

// Function to format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Process the queue with rate limiting
async function processQueue() {
  if (processingQueue || emailQueue.length === 0) return;
  
  processingQueue = true;
  console.log(`Starting to process queue with ${emailQueue.length} items`);

  try {
    while (emailQueue.length > 0) {
      const item = emailQueue.shift();
      if (!item) continue;

      await generateAndSendEmail(item);
      
      // Wait for 30 seconds between requests to respect the rate limit
      if (emailQueue.length > 0) {
        console.log(`Waiting 30 seconds before processing next queue item. Remaining: ${emailQueue.length}`);
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  } catch (error) {
    console.error('Error processing queue:', error);
  } finally {
    processingQueue = false;
    console.log('Queue processing completed');
  }
}

// Generate email content using Gemini API and send it
async function generateAndSendEmail({ email, name, goal, deadline, tone, frequency, documentId }: QueueItem) {
  try {
    // Format the deadline for display
    const formattedDeadline = formatDate(deadline);
    
    // Create a prompt for Gemini based on the user's tone preference
    let promptIntro = '';
    let persona = '';
    
    switch (tone) {
      case 'Elon Musk':
        promptIntro = 'Write an email reminder in the style of Elon Musk';
        persona = 'Use Elon Musk\'s direct, visionary tone with occasional references to innovation, Mars, or the future. Include some of his speech patterns like short, declarative sentences and bold statements.';
        break;
      case 'Steve Jobs':
        promptIntro = 'Write an email reminder in the style of Steve Jobs';
        persona = 'Use Steve Jobs\' persuasive, perfection-focused tone with mentions of design, elegance, or simplicity. Be precise and include his characteristic "one more thing" approach or references to making a dent in the universe.';
        break;
      case 'Sam Altman':
        promptIntro = 'Write an email reminder in the style of Sam Altman';
        persona = 'Use Sam Altman\'s thoughtful, analytical tone with references to scaling, growth, or potential. Be optimistic yet practical, and include his balanced approach to ambitious goals.';
        break;
      case 'Naval Ravikant':
        promptIntro = 'Write an email reminder in the style of Naval Ravikant';
        persona = 'Use Naval Ravikant\'s philosophical, wisdom-oriented tone with references to wealth creation, knowledge, or personal leverage. Include some of his aphoristic style and focus on principles.';
        break;
      case 'Your Future Self':
        promptIntro = 'Write an email reminder as if it\'s from the recipient\'s successful future self';
        persona = 'Write from the perspective of the recipient after they\'ve accomplished their goals and looking back. Be encouraging, wise, and emphasize the importance of the current actions for future success.';
        break;
      default:
        promptIntro = 'Write a professional email reminder';
        persona = 'Use a balanced, professional tone suitable for a workplace reminder.';
    }

    const prompt = `${promptIntro} to ${name} about completing their goal: "${goal}" by the deadline of ${formattedDeadline}.

${persona}

The email should:
1. Have a clear subject line
2. Address the recipient by name
3. Remind them about their goal in the specified style
4. Mention the deadline
5. Encourage them to take action
6. Include a sign-off that matches the persona

Format the email with proper line breaks and paragraphs, ready to be sent via email (include subject line separate from body).`;

    // Call Gemini API to generate the email
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const emailContent = result.response.text();
    
    console.log('Generated email content:', emailContent);
    
    // Parse the generated content to extract subject and body
    let subject = 'Reminder: Goal Deadline Approaching';
    let body = emailContent;
    
    // Try to extract subject line if available
    // Look for patterns like "Subject:" or "SUBJECT:" at the beginning of a line
    const subjectMatch = emailContent.match(/^Subject:(.+?)(\n|$)/im) || 
                        emailContent.match(/^SUBJECT:(.+?)(\n|$)/im);
    
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      // Remove the subject line from the email body
      body = emailContent.replace(/^Subject:.+?(\n|$)/im, '').trim();
      body = body.replace(/^SUBJECT:.+?(\n|$)/im, '').trim();
    }
    
    // If no explicit subject was found, look for the first line that might be a subject
    if (subject === 'Reminder: Goal Deadline Approaching' && !subjectMatch) {
      const lines = emailContent.split('\n');
      if (lines.length > 0 && lines[0].length < 100) {
        subject = lines[0].trim();
        body = lines.slice(1).join('\n').trim();
      }
    }

    console.log('Parsed email subject:', subject);
    console.log('Parsed email body length:', body.length);

    // Send the email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);

    // Calculate the next send date based on frequency
    const nextSendDate = calculateNextSendDate(frequency);

    // Update the database to record when this reminder was sent and when the next one should be
    await updateDoc(doc(db, 'goals', documentId), {
      lastSent: new Date().toISOString(),
      nextSend: nextSendDate.toISOString(),
      status: 'sent'
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to generate or send email for ${email}:`, error);
    return false;
  }
}

export async function GET() {
  try {
    const currentDate = new Date();
    console.log('Starting email check process at', currentDate.toISOString());
    
    // Get all non-completed goals from Firestore
    const goalsRef = collection(db, 'goals');
    const q = query(
      goalsRef,
      where('completed', '==', false)
      // Removed the orderBy to avoid needing a composite index
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} incomplete goals`);
    
    // Check each goal to see if a reminder needs to be sent
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      
      // Check if we should send a reminder based on frequency, last sent date, and next send date
      if (shouldSendReminder(data.lastSent, data.frequency, data.nextSend)) {
        console.log(`Adding user ${data.email} to email queue`);
        
        // Add to the queue
        emailQueue.push({
          email: data.email,
          name: data.name,
          goal: data.goal,
          deadline: data.deadline,
          tone: data.tone,
          frequency: data.frequency,
          documentId: docSnapshot.id
        });
      }
    });
    
    // If the queue has items and isn't already being processed, start processing
    if (emailQueue.length > 0 && !processingQueue) {
      // Start processing the queue asynchronously
      processQueue().catch(err => console.error('Queue processing error:', err));
    }
    
    return NextResponse.json({ 
      message: `Processing ${emailQueue.length} emails in the queue`,
      queueLength: emailQueue.length
    });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: "Error processing email reminders: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Scheduled function to run this endpoint
export async function POST() {
  // This can be called by a cron job or webhook
  return await GET();
}
