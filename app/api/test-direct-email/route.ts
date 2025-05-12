import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get email from query params or use default
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required. Use ?email=your@email.com" },
        { status: 400 }
      );
    }
    
    console.log(`Attempting direct email test to: ${email}`);
    
    // Get Brevo API key
    const brevoApiKey = process.env.BREVO_API_KEY;
    
    if (!brevoApiKey) {
      return NextResponse.json(
        { error: "BREVO_API_KEY environment variable is not set" },
        { status: 500 }
      );
    }
    
    console.log(`Using Brevo API, key length: ${brevoApiKey.length}`);
    
    // Create a simple HTML email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a5568;">Direct Email Test</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #2d3748;">
          This is a direct test email from MailGoal to verify Brevo API is working properly.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #2d3748;">
          If you received this email, your email configuration is working correctly!
        </p>
        <p style="font-style: italic; color: #718096;">
          Time sent: ${new Date().toISOString()}
        </p>
      </div>
    `;
    
    // Create the text version
    const text = 'This is a direct test email from MailGoal to verify Brevo API is working properly.';
    
    // Create the email data
    const emailData = {
      sender: {
        name: "MailGoal",
        email: "noreply@mailgoal.app"
      },
      to: [
        {
          email: email
        }
      ],
      subject: "Direct Test Email from MailGoal",
      htmlContent: html,
      textContent: text
    };
    
    // Send a direct email
    console.log('Sending direct test email via Brevo API...');
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });
    
    // Check response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('Brevo API error:', errorData);
      throw new Error(`Brevo API error: ${errorData.message || response.statusText}`);
    }
    
    // Parse response
    const result = await response.json();
    console.log('Brevo API response:', result);
    
    return NextResponse.json({
      success: true,
      message: `Direct test email sent to ${email}`,
      messageId: result.messageId,
      details: {
        to: email,
        from: "noreply@mailgoal.app",
        subject: "Direct Test Email from MailGoal"
      }
    });
    
  } catch (error) {
    console.error('Error in direct email test:', error);
    return NextResponse.json(
      { 
        error: 'Direct email test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 