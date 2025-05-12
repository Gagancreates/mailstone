import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the base URL for API calls
    const baseUrl = new URL(request.url).origin;
    
    // Get email from query params or use default
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'your-email@example.com';
    const tone = searchParams.get('tone') || 'friendly';
    
    console.log(`Sending test email to: ${email} with tone: ${tone}`);
    
    // Create test goal data
    const testGoal = {
      name: "Test User",
      email: email,
      goal: "Testing the MailGoal system",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      tone: tone,
      frequency: "weekly"
    };
    
    // Step 1: Generate email content
    console.log('Generating test email...');
    const emailResponse = await fetch(`${baseUrl}/api/get-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testGoal)
    });
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Email generation failed:', errorText);
      throw new Error(`Failed to generate test email: ${emailResponse.statusText}`);
    }
    
    const emailContent = await emailResponse.json();
    console.log('Email content generated successfully');
    
    // Step 2: Send the email
    console.log('Sending test email...');
    const sendResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `Test Email: MailGoal Reminder`,
        html: emailContent.html
      })
    });
    
    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error('Email sending failed:', errorText);
      throw new Error(`Failed to send test email: ${sendResponse.statusText}`);
    }
    
    const sendResult = await sendResponse.json();
    console.log('Test email sent successfully:', sendResult);
    
    return NextResponse.json({
      success: true,
      message: `Test email sent to ${email}`,
      emailContent: emailContent.html,
      sendResult
    });
    
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Test email failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 