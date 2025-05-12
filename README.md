# MailGoal App

An application that sends motivational emails to help users achieve their goals.

## Firebase Setup

The app uses Firebase/Firestore for data storage. You need to set up Firebase correctly for the app to work:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup steps to create your project
4. Give your project a name and follow the prompts

### 2. Enable Firestore

1. In your Firebase console, select your project
2. Navigate to "Firestore Database" from the left sidebar
3. Click "Create database"
4. Choose either production or test mode
5. Select a database location close to your users
6. Click "Enable"

### 3. Register a Web App

1. In your Firebase project, click on the gear icon near "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to create a new web app
5. Register the app with a nickname
6. Copy the Firebase configuration object

### 4. Set Environment Variables

Create a `.env.local` file in the project root with your Firebase configuration:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Set Up Firestore Database Rules

1. Go to Firestore Database in your Firebase console
2. Click on the "Rules" tab
3. Update the rules to secure your database:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /goals/{goalId} {
      allow read, write: if true;  // For development - change for production
    }
  }
}
```

## Local Development

1. Install dependencies:
```
npm install
```

2. Run the development server:
```
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Troubleshooting

### Common Issues

1. **"Cloud Firestore API has not been used in project X before or it is disabled"**
   - Solution: Go to [Google Cloud Console](https://console.cloud.google.com)
   - Select your project
   - Search for "Firestore API" and enable it
   - Wait a few minutes for changes to take effect

2. **Firebase connection errors**
   - Verify your `.env.local` file contains correct credentials
   - Ensure you have proper internet connectivity
   - Check Firebase console to confirm your project is active

3. **Permission denied errors**
   - Check your Firestore rules
   - Verify your application's authentication state if using auth
   - Ensure the Firebase API key has not been restricted

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
