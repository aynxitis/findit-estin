import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let _adminDb: Firestore | undefined;
let _adminAuth: Auth | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  
  // Check if already initialized
  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  // Check for required environment variables
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin SDK environment variables are not configured");
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });

  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}

export function getAdminAuth(): Auth {
  if (!_adminAuth) {
    _adminAuth = getAuth(getAdminApp());
  }
  return _adminAuth;
}

// Lazy-initialized exports for backwards compatibility
export const adminDb = {
  collection: (...args: Parameters<Firestore["collection"]>) => getAdminDb().collection(...args),
};

export const adminAuth = {
  verifyIdToken: (...args: Parameters<Auth["verifyIdToken"]>) => getAdminAuth().verifyIdToken(...args),
  getUser: (...args: Parameters<Auth["getUser"]>) => getAdminAuth().getUser(...args),
};
