# Testing Guide for MailGoal Email System

## Prerequisites
Before testing the email system, ensure you have:

1. Set up Firebase (Firestore) with proper configuration
2. Obtained a Gemini API key
3. Set up an email account for Nodemailer (Gmail recommended)
4. Added the necessary environment variables to `.env.local`:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

   # Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Email Configuration for Nodemailer
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password_here
   ```

## Testing Steps

### 1. Manual Testing with the Form

1. Start your Next.js development server:
   ```
   npm run dev
   ```

2. Open your application in the browser (http://localhost:3000)

3. Fill out the goal form with test data:
   - Name: Test User
   - Email: Your actual email (to receive the test email)
   - Goal: Complete project testing
   - Deadline: Choose a date within the next week
   - Frequency: Daily (for quicker testing)
   - Tone: Choose one of the available tones (Elon Musk, Steve Jobs, etc.)

4. Submit the form

5. Verify that the data was saved in Firebase (check your Firestore console)

### 2. Testing the Email API

1. With your Next.js server running, manually trigger the email API:
   - Open a browser and go to http://localhost:3000/api/get-email
   - Or use curl: `curl http://localhost:3000/api/get-email`

2. Check the server logs for:
   - "Starting email check process"
   - "Found X incomplete goals"
   - "Adding user X to email queue"
   - "Starting to process queue with X items"
   - "Generated email content"
   - "Email sent to X"

3. Check your email inbox for the received email

### 3. Testing Different Tones

To test all the different tone options:

1. Submit 5 different goals through the form, each with a different tone:
   - Elon Musk
   - Steve Jobs
   - Sam Altman
   - Naval Ravikant
   - Your Future Self

2. Trigger the email API as described above

3. Compare the emails received to verify the tone differences

### 4. Testing the Queue System

To test the queue system and rate limiting:

1. Submit multiple goals with the same email (at least 3-4)
2. Trigger the email API
3. Observe in the server logs:
   - Queue processing messages
   - 30-second delays between email generations
   - Emails being sent in sequence

### 5. Debugging Common Issues

If testing fails, check:

1. **Firebase Connection**:
   - Verify Firebase credentials
   - Check server logs for Firebase connection errors

2. **Gemini API**:
   - Verify your API key is correct
   - Check if you're hitting rate limits (2 requests/minute)

3. **Email Sending**:
   - Verify your email and password are correct
   - For Gmail, ensure you're using an App Password
   - Check if your email provider blocks automated emails

4. **Next.js API Route**:
   - Check for errors in server logs
   - Verify the API route is accessible

## Verifying Success

Your email system is working correctly if:

1. Goals are saved to Firestore
2. The API identifies goals needing reminders
3. Emails are generated in the correct tone
4. Emails are sent to the specified address
5. Database is updated with lastSent and nextSend dates
6. Rate limiting works (30-second gaps between emails)

Remember that you're limited to 2 requests per minute with the Gemini API, so space out your tests accordingly. 