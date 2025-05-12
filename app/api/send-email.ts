import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resendApiKey = process.env.RESEND_API_KEY || 're_TTZDqDTA_A5WoMnKJysvmMbAS9KB8zxpx';
const resend = new Resend(resendApiKey);

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
    
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    // Send the email using Resend
    const result = await resend.emails.send({
      from: from || 'MailGoal <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html
    });
    
    console.log('Email sent successfully:', result);
    
    return NextResponse.json({
      success: true,
      messageId: result.data?.id || 'unknown'
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}