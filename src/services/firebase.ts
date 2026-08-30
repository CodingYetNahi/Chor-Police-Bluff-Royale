import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== ''
);

if (isFirebaseConfigured) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    authInstance = getAuth(app);
    firestoreInstance = getFirestore(app);
  } catch (error) {
    console.warn('Firebase initialization note: using local game engine mode.', error);
  }
}

export const auth = authInstance;
export const db = firestoreInstance;

export async function initAnonymousAuth(): Promise<string | null> {
  if (authInstance) {
    try {
      const userCred = await signInAnonymously(authInstance);
      return userCred.user.uid;
    } catch (e) {
      console.warn('Anonymous sign-in fallback active:', e);
    }
  }
  return null;
}
