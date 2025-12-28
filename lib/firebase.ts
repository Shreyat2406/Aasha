import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

/**
 * IMPORTANT:
 * - Do NOT gate Firebase behind `typeof window`
 * - Firebase SDK is App Router safe
 * - This guarantees db/auth are NEVER undefined
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

// Initialize app ONCE
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Export stable singletons
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

