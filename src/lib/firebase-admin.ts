import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app: ReturnType<typeof initializeApp> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;

function ensureApp() {
  if (!app) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
}

export function getFirebaseAdminAuth() {
  ensureApp();
  if (!authInstance) {
    authInstance = getAuth(getApps()[0]);
  }
  return authInstance;
}

export function getFirebaseAdminDb() {
  ensureApp();
  if (!dbInstance) {
    dbInstance = getFirestore(getApps()[0]);
  }
  return dbInstance;
}
