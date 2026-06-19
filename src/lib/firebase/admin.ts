import {
  initializeApp,
  getApps,
  cert,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

/**
 * Firebase Admin SDK initialization (server-side only).
 *
 * Uses a service account for privileged operations:
 * - Verifying ID tokens in API routes
 * - Creating/managing users
 * - Server-side Firestore reads/writes
 * - Admin-level storage operations
 *
 * The service account JSON is stored as a base64-encoded env var
 * to avoid committing secrets to the repository.
 */
function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Option 1: Base64-encoded service account JSON (recommended for Vercel)
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (serviceAccountBase64) {
    const serviceAccount: ServiceAccount = JSON.parse(
      Buffer.from(serviceAccountBase64, "base64").toString("utf-8")
    );

    return initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  // Option 2: Individual env vars (fallback)
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  // Option 3: Default credentials (for local development with gcloud CLI)
  // This works when running `gcloud auth application-default login`
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminApp = initializeAdminApp();

/** Firebase Admin Auth instance */
export const adminAuth: Auth = getAuth(adminApp);

/** Firebase Admin Firestore instance */
export const adminDb: Firestore = getFirestore(adminApp);

/** Firebase Admin Storage instance */
export const adminStorage: Storage = getStorage(adminApp);

// ---------------------------------------------------------------------------
// Token Verification
// ---------------------------------------------------------------------------

/**
 * Verify a Firebase ID token from the client.
 * Use this in API routes to authenticate requests.
 *
 * @param idToken - The Firebase ID token from the client.
 * @returns The decoded token with user info (uid, email, etc.).
 * @throws If the token is invalid or expired.
 */
export async function verifyIdToken(idToken: string) {
  return adminAuth.verifyIdToken(idToken);
}

/**
 * Verify a session cookie.
 * Use this in middleware or API routes for cookie-based auth.
 *
 * @param sessionCookie - The session cookie value.
 * @param checkRevoked - Whether to check if the session was revoked.
 * @returns The decoded token claims.
 */
export async function verifySessionCookie(
  sessionCookie: string,
  checkRevoked = true
) {
  return adminAuth.verifySessionCookie(sessionCookie, checkRevoked);
}

/**
 * Create a session cookie from an ID token.
 * Used after client-side sign-in to establish a server-side session.
 *
 * @param idToken - The Firebase ID token from the client.
 * @param expiresIn - Session duration in milliseconds (max 14 days).
 * @returns The session cookie string.
 */
export async function createSessionCookie(
  idToken: string,
  expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days default
): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn });
}

/**
 * Revoke all refresh tokens for a user (force sign-out everywhere).
 */
export async function revokeUserTokens(uid: string): Promise<void> {
  return adminAuth.revokeRefreshTokens(uid);
}

// ---------------------------------------------------------------------------
// User Management (Admin)
// ---------------------------------------------------------------------------

/**
 * Get a user record by UID from Firebase Auth.
 */
export async function getAdminUser(uid: string) {
  return adminAuth.getUser(uid);
}

/**
 * Set custom claims on a user (e.g., admin role).
 */
export async function setUserClaims(
  uid: string,
  claims: Record<string, unknown>
): Promise<void> {
  return adminAuth.setCustomUserClaims(uid, claims);
}
