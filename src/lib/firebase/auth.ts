import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type Auth,
  type User,
  type UserCredential,
} from "firebase/auth";
import { firebaseApp } from "./config";

/** Firebase Auth instance (singleton) */
export const auth: Auth = getAuth(firebaseApp);

/** Google Auth Provider (singleton) */
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ---------------------------------------------------------------------------
// Email/Password Authentication
// ---------------------------------------------------------------------------

/**
 * Sign in with email and password.
 * @returns The authenticated user credential.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new account with email and password.
 * Sets the displayName and sends a verification email.
 * @returns The created user credential.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);
  return credential;
}

// ---------------------------------------------------------------------------
// Google Authentication
// ---------------------------------------------------------------------------

/**
 * Sign in with Google popup.
 * @returns The authenticated user credential.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

// ---------------------------------------------------------------------------
// Email Verification
// ---------------------------------------------------------------------------

/**
 * Send an email verification to the current user.
 */
export async function sendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No user signed in");
  return sendEmailVerification(user);
}

/**
 * Check if the current user's email is verified.
 * Reloads the user first to get the latest state.
 */
export async function checkEmailVerified(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  await user.reload();
  return user.emailVerified;
}

// ---------------------------------------------------------------------------
// Session Management
// ---------------------------------------------------------------------------

/**
 * Sign out the current user and clear the server session cookie.
 */
export async function signOut(): Promise<void> {
  // Clear the server-side session cookie
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch {
    // Silently fail — client-side sign-out is more important
  }
  return firebaseSignOut(auth);
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Create a server-side session after sign-in.
 * Called internally after successful authentication.
 */
export async function createSession(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const idToken = await user.getIdToken();
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

// ---------------------------------------------------------------------------
// Auth State
// ---------------------------------------------------------------------------

/**
 * Subscribe to auth state changes.
 * @returns An unsubscribe function.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current user (may be null if not authenticated).
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Get the ID token for the current user (for API calls).
 * @param forceRefresh - Force token refresh even if not expired.
 * @returns The ID token string, or null if no user is signed in.
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}
