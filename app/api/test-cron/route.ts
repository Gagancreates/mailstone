import { NextResponse } from 'next/server';

// This endpoint is for development and testing only
// It should be removed or protected in production

export async function GET(request: Request) {
  try {
    // Determine if we're in development or production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Get the base URL for the request
    const baseUrl = new URL(request.url).origin;
    
    // Get the CRON_SECRET from environment variables
    const cronSecret = process.env.CRON_SECRET || 'test-secret-dev-only';
    
    // In production, add additional security checks
    if (!isDevelopment) {
      // Check for a dev-only parameter to prevent accidental use in production
      const { searchParams } = new URL(request.url);
      if (searchParams.get('dev_test') !== 'true') {
        return NextResponse.json(
          { error: 'This endpoint is for testing only and should not be used in production' },
          { status: 403 }
        );
      }
    }
    
    console.log('Manually triggering cron job...');
    
    // Call the cron job endpoint
    const cronResponse = await fetch(
      `${baseUrl}/api/cron/send-scheduled-emails?secret=${cronSecret}`,
      { method: 'GET' }
    );
    
    if (!cronResponse.ok) {
      const errorText = await cronResponse.text();
      throw new Error(`Cron job failed with status ${cronResponse.status}: ${errorText}`);
    }
    
    const result = await cronResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Cron job triggered successfully',
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error triggering cron job:', error);
    return NextResponse.json(
      { error: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 