AASHA Cyber Safety App – Setup Guide

1️⃣ Clone the Repository
git clone https://github.com/yourusername/aasha-cyber-safety-app.git
cd aasha-cyber-safety-app

2️⃣ Install Dependencies

Use your preferred package manager:

pnpm install
# or
npm install
# or
yarn


Ensure node >= 18 and pnpm/npm/yarn is installed.

3️⃣ Environment Variables

Create a .env.local in the root folder with your Firebase and Gemini API keys:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "...", "project_id": "...", ...}'
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key


Important: Keep .env.local secret. Do not commit it.

4️⃣ Firebase Setup

Go to Firebase Console
 → Create a new project.

Enable Authentication → Email/Password.

Create a Firestore database in production or test mode.

Copy your Firebase config to .env.local.

Optional: Add Firebase security rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}

5️⃣ Running Locally

Start the development server:

pnpm dev
# or npm run dev
# or yarn dev


Visit http://localhost:3000
.

6️⃣ Vercel Deployment

Push the project to GitHub/GitLab/Bitbucket.

Go to Vercel Dashboard
 → New Project → Import Git Repository.

Add Environment Variables (same as .env.local) in Vercel project settings.

Click Deploy.

Your app will be live at: https://your-project.vercel.app.

7️⃣ Features Overview

/auth → Sign up / Sign in

/chat → AI Chat with AASHA

/learn → Learning modules and quizzes

/scan → Scan URLs or files for cyber threats

/profile → View points, level, and stats

Theme Toggle → Switch between light/dark mode

8️⃣ Notes

Ensure Gemini API Key is valid for chat functionality.

Scan feature uses Firebase and frontend checks; make sure Firestore rules allow the current user.

Clear cache or rebuild if encountering Turbopack/Next.js build issues:

rm -rf .next
pnpm dev


✅ This guide ensures anyone can clone, run locally, and deploy AASHA on Vercel.