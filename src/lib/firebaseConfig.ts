/**
 * Firebase project configuration
 * 
 * Works out-of-the-box locally, on Google AI Studio, and when deployed to Vercel/Netlify.
 * Values can also be overridden via Vite environment variables (VITE_FIREBASE_*).
 */

export interface FirebaseAppConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

export const defaultFirebaseConfig: FirebaseAppConfig = {
  projectId: "gen-lang-client-0798635784",
  appId: "1:949465815653:web:92a0e1553f337a159d848c",
  apiKey: "AIzaSyCj4D3Nw-DvJIRLfVWnYgyiqz3jVCFv9gU",
  authDomain: "gen-lang-client-0798635784.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-oramentofamliapl-874e8cf5-0645-4c23-b33a-a2b322a74b32",
  storageBucket: "gen-lang-client-0798635784.firebasestorage.app",
  messagingSenderId: "949465815653",
  measurementId: "",
  oAuthClientId: "949465815653-giup63lj0sabn9pgm73q72kl6u7o3ic2.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

export const firebaseConfig: FirebaseAppConfig = {
  projectId: (import.meta.env?.VITE_FIREBASE_PROJECT_ID as string) || defaultFirebaseConfig.projectId,
  appId: (import.meta.env?.VITE_FIREBASE_APP_ID as string) || defaultFirebaseConfig.appId,
  apiKey: (import.meta.env?.VITE_FIREBASE_API_KEY as string) || defaultFirebaseConfig.apiKey,
  authDomain: (import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN as string) || defaultFirebaseConfig.authDomain,
  firestoreDatabaseId: (import.meta.env?.VITE_FIREBASE_DATABASE_ID as string) || defaultFirebaseConfig.firestoreDatabaseId,
  storageBucket: (import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET as string) || defaultFirebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || defaultFirebaseConfig.messagingSenderId,
  measurementId: (import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID as string) || defaultFirebaseConfig.measurementId,
  oAuthClientId: (import.meta.env?.VITE_FIREBASE_OAUTH_CLIENT_ID as string) || defaultFirebaseConfig.oAuthClientId,
  recaptchaSiteKey: (import.meta.env?.VITE_FIREBASE_RECAPTCHA_SITE_KEY as string) || defaultFirebaseConfig.recaptchaSiteKey,
};

export default firebaseConfig;
