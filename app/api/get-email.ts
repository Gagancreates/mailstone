import { NextResponse } from 'next/server';

interface EmailRequestData {
  name: string;
  email: string;
  goal: string;
  deadline: string;
  tone: string;
  frequency: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as EmailRequestData;
    const { name, goal, deadline, tone } = body;
    
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
    
    // Assemble the HTML email
    const html = `
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
    
    return NextResponse.json({ html });
    
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
