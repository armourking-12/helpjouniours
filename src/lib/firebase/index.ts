/**
 * Firebase Client SDK barrel export.
 *
 * Import from "@/lib/firebase" for client-side usage.
 * Import from "@/lib/firebase/admin" for server-side (API routes) usage.
 */

// App
export { firebaseApp } from "./config";

// Auth
export {
  auth,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  resetPassword,
  sendVerificationEmail,
  checkEmailVerified,
  createSession,
  onAuthChange,
  getCurrentUser,
  getIdToken,
} from "./auth";

// Firestore
export {
  db,
  getDocument,
  getDocuments,
  createDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  getCollectionRef,
  getDocRef,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from "./firestore";

// Storage
export {
  storage,
  uploadFile,
  getFileUrl,
  deleteFile,
  generateResourcePath,
  generateAvatarPath,
  type UploadProgress,
} from "./storage";
