import { NextResponse } from 'next/server';

// For free Resend accounts, we can only send to the verified email
const VERIFIED_EMAIL = 'mailstone.email@gmail.com';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Define email interface
interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json() as EmailRequest;
    const { to, subject, html, from } = body;
    
    console.log(`Preparing to send email to ${to} with subject: ${subject}`);
    
    // Get the Brevo API key
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      return NextResponse.json(
        { error: "BREVO_API_KEY environment variable is not set" },
        { status: 500 }
      );
    }
    
    // Validate inputs
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, or html" },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid recipient email format" },
        { status: 400 }
      );
    }
    
    // Check for free account email restrictions
    // In development or if using free account in production:
    if (!process.env.RESEND_DOMAIN_VERIFIED && to.toLowerCase() !== VERIFIED_EMAIL.toLowerCase()) {
      // In production, this is an error
      if (isProduction) {
        console.error(`Cannot send to ${to} - only ${VERIFIED_EMAIL} is allowed with free Resend account`);
        return NextResponse.json({
          error: "Email sending restricted: With a free Resend account, you can only send to your verified email address. Please verify a domain with Resend for production use.",
          verifiedEmail: VERIFIED_EMAIL
        }, { status: 403 });
      }
      
      // In development, we'll log a warning but allow it to continue for testing UI/flows
      console.warn(`⚠️ WARNING: In production, you can only send to ${VERIFIED_EMAIL} with a free Resend account`);
      console.warn('This email would not be sent in production without domain verification');
    }
    
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    // Create the email data
    const emailData = {
      sender: {
        name: "MailGoal",
        email: from || "noreply@mailgoal.app"
      },
      to: [
        {
          email: to
        }
      ],
      subject: subject,
      htmlContent: html,
      textContent: html.replace(/<[^>]*>/g, '') // Simple HTML to text conversion
    };
    
    console.log('Email data prepared:', {
      to: emailData.to[0].email,
      from: emailData.sender.email,
      subject: emailData.subject
    });
    
    // Send the email using Brevo API directly
    console.log('Sending email via Brevo API...');
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
      messageId: result.messageId || 'message-sent',
      details: {
        to: to,
        from: emailData.sender.email,
        subject: subject
      }
    });
    
  } catch (error) {
    console.error('Error sending email - Full details:', error);
    
    // Try to get more details for debugging
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = `${error.name}: ${error.message}`;
      if ('cause' in error) {
        console.error('Error cause:', error.cause);
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to send email: ' + errorMessage },
      { status: 500 }
    );
  }
} 