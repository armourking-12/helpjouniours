import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type Firestore,
  type DocumentData,
  type QueryConstraint,
  type DocumentReference,
  type DocumentSnapshot,
  type QuerySnapshot,
  type WithFieldValue,
  type UpdateData,
} from "firebase/firestore";
import { firebaseApp } from "./config";

/** Firestore instance (singleton) */
export const db: Firestore = getFirestore(firebaseApp);

// ---------------------------------------------------------------------------
// Generic CRUD Helpers
// ---------------------------------------------------------------------------

/**
 * Get a single document by ID from a collection.
 * @returns The document data with its ID, or null if it doesn't exist.
 */
export async function getDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string
): Promise<(T & { id: string }) | null> {
  const docRef = doc(db, collectionName, documentId);
  const docSnap: DocumentSnapshot = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
}

/**
 * Get multiple documents from a collection with optional query constraints.
 * @param collectionName - The Firestore collection name.
 * @param constraints - Optional array of query constraints (where, orderBy, limit, etc.).
 * @returns An array of documents with their IDs.
 */
export async function getDocuments<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const collectionRef = collection(db, collectionName);
  const q = constraints.length > 0
    ? query(collectionRef, ...constraints)
    : query(collectionRef);

  const querySnap: QuerySnapshot = await getDocs(q);

  return querySnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as (T & { id: string })[];
}

/**
 * Create a new document with an auto-generated ID.
 * @returns The new document reference.
 */
export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: WithFieldValue<T>
): Promise<DocumentReference> {
  const collectionRef = collection(db, collectionName);
  return addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Create or overwrite a document with a specific ID.
 * Useful for user profiles where the doc ID matches the user UID.
 */
export async function setDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: WithFieldValue<T>,
  merge = true
): Promise<void> {
  const docRef = doc(db, collectionName, documentId);
  return setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge }
  );
}

/**
 * Update specific fields of an existing document.
 */
export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: UpdateData<T>
): Promise<void> {
  const docRef = doc(db, collectionName, documentId);
  return updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a document by ID.
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  const docRef = doc(db, collectionName, documentId);
  return deleteDoc(docRef);
}

// ---------------------------------------------------------------------------
// Query Builder Helpers (re-exports for convenience)
// ---------------------------------------------------------------------------

export { where, orderBy, limit, startAfter, serverTimestamp, collection, doc, query };

// ---------------------------------------------------------------------------
// Collection Reference Helpers
// ---------------------------------------------------------------------------

/**
 * Get a typed collection reference.
 */
export function getCollectionRef(collectionName: string) {
  return collection(db, collectionName);
}

/**
 * Get a typed document reference.
 */
export function getDocRef(collectionName: string, documentId: string) {
  return doc(db, collectionName, documentId);
}
