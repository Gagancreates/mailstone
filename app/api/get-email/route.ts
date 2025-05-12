import { NextResponse } from 'next/server';

interface EmailRequestData {
  name: string;
  email: string;
  goal: string;
  deadline: string;
  tone: string;
  frequency: string;
}

// Function to generate email using Gemini API
async function generateEmailWithGemini(data: EmailRequestData): Promise<string> {
  const { name, goal, deadline, tone } = data;
  
  // Parse the deadline
  const deadlineDate = new Date(deadline);
  const today = new Date();
  
  // Calculate days remaining
  const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Prepare the prompt for Gemini
  const timeContext = daysRemaining <= 0 
    ? "today is the deadline" 
    : daysRemaining === 1 
      ? "the deadline is tomorrow" 
      : `there are ${daysRemaining} days left until the deadline`;
  
  const prompt = `
    Write a motivational email to remind someone about their goal. Here are the details:
    
    Name: ${name}
    Goal: ${goal}
    Time Context: ${timeContext}
    
    Email Style:
    - Tone: ${tone} (be very ${tone} in your writing style)
    - Format: Professional email with greeting, body paragraphs, and sign-off
    - Length: Keep it concise yet motivational (150-200 words)
    
    Important Guidelines:
    - If the tone is "friendly", be encouraging, warm, and conversational
    - If the tone is "professional", be formal, structured, and business-like
    - If the tone is "motivational", be energetic, inspiring, and use powerful language
    - Include specific references to their goal: "${goal}"
    - Reference the time context: ${timeContext}
    - Include 1-2 specific actionable tips or encouragement related to achieving the goal
    - Sign off as "MailGoal Team"
    - Don't use placeholders like [Name] or [Goal] - the actual values are provided above
    
    The output should be HTML formatted with appropriate paragraph tags.
  `;
  
  try {
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the text from the response
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Format HTML properly
    const formattedHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${generatedText.replace(/\n\n/g, '</p><p style="font-size: 16px; line-height: 1.6; color: #2d3748;">').replace(/\n/g, '<br>')}
      </div>
    `;
    
    return formattedHtml;
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Fall back to template-based email if Gemini fails
    return generateFallbackEmail(data);
  }
}

// Fallback function to generate email when Gemini API fails
function generateFallbackEmail(data: EmailRequestData): string {
  const { name, goal, deadline, tone } = data;
  
  // Parse the deadline
  const deadlineDate = new Date(deadline);
  const today = new Date();
  
  // Calculate days remaining
  const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate email based on tone and days remaining
  let greeting, mainContent, motivation, closing;
  
  // Greeting based on tone
  if (tone === 'friendly') {
    greeting = `Hi ${name}!`;
  } else if (tone === 'professional') {
    greeting = `Dear ${name},`;
  } else if (tone === 'motivational') {
    greeting = `Hey there, ${name}!`;
  } else {
    greeting = `Hello ${name},`;
  }
  
  // Main content based on remaining days
  if (daysRemaining <= 0) {
    mainContent = `Today is the deadline for your goal: "${goal}". Have you accomplished what you set out to do?`;
  } else if (daysRemaining === 1) {
    mainContent = `Tomorrow is the deadline for your goal: "${goal}". This is your final push!`;
  } else {
    mainContent = `You have ${daysRemaining} days left to achieve your goal: "${goal}".`;
  }
  
  // Motivation based on tone
  if (tone === 'friendly') {
    motivation = `I believe in you! Keep going, you've got this.`;
  } else if (tone === 'professional') {
    motivation = `Consistent progress is key to success. Stay focused on your objectives.`;
  } else if (tone === 'motivational') {
    motivation = `Every step you take brings you closer to success. Push your limits and achieve greatness!`;
  } else {
    motivation = `Remember why you started. Your future self will thank you for the effort you put in today.`;
  }
  
  // Closing based on tone
  if (tone === 'friendly') {
    closing = `Cheering you on,<br>MailGoal Team`;
  } else if (tone === 'professional') {
    closing = `Best regards,<br>MailGoal Team`;
  } else if (tone === 'motivational') {
    closing = `Go crush it!<br>MailGoal Team`;
  } else {
    closing = `Wishing you success,<br>MailGoal Team`;
  }
  
  
  return`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4a5568;">${greeting}</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #2d3748;">
        ${mainContent}
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #2d3748;">
        ${motivation}
      </p>
      <p style="font-style: italic; color: #718096;">
        ${closing}
      </p>
    </div>
  `;
}

// Queue system to handle Gemini API rate limiting (2 requests per minute)
class RequestQueue {
  private queue: { data: EmailRequestData, resolve: (value: string) => void, reject: (reason?: any) => void }[] = [];
  private processing = false;
  private lastRequestTime = 0;
  
  async enqueue(data: EmailRequestData): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Add to queue
      this.queue.push({ data, resolve, reject });
      
      // Process queue if not already processing
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    
    // Get next item
    const item = this.queue.shift();
    if (!item) {
      this.processing = false;
      return;
    }
    
    try {
      // Check if we need to wait (rate limit: 2 requests per minute)
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minWaitTime = 30000; // 30 seconds between requests (2 per minute)
      
      if (timeSinceLastRequest < minWaitTime) {
        const waitTime = minWaitTime - timeSinceLastRequest;
        console.log(`Rate limiting: waiting ${waitTime}ms before next Gemini API request`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      // Process request
      this.lastRequestTime = Date.now();
      const result = await generateEmailWithGemini(item.data);
      item.resolve(result);
      
    } catch (error) {
      console.error('Error processing queue item:', error);
      // Fall back to template on error
      const fallbackEmail = generateFallbackEmail(item.data);
      item.resolve(fallbackEmail);
    }
    
    // Process next item with a small delay
    setTimeout(() => this.processQueue(), 100);
  }
}

// Create singleton queue
const requestQueue = new RequestQueue();

export async function POST(request: Request) {
  try {
    const body = await request.json() as EmailRequestData;
    
    console.log('Email generation request received for:', body.name);
    
    // Add request to queue and wait for result
    const html = await requestQueue.enqueue(body);
    
    console.log('Email content generated successfully');
    
    return NextResponse.json({ html });
    
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 