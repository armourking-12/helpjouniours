import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  getDocs,
  getDoc,
  doc,
  type DocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./firestore";
import { COLLECTIONS } from "@/lib/constants";
import type {
  Resource,
  PendingUpload,
  Notification,
  LeaderboardGlobal,
} from "@/types";

// ---------------------------------------------------------------------------
// Pagination Helpers
// ---------------------------------------------------------------------------

export interface PaginatedResult<T> {
  data: T[];
  lastVisible: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Generic paginated query to minimize reads.
 * Always passes `startAfter` cursor for deep pagination instead of offset.
 */
async function getPaginatedData<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  pageSize: number = 10,
  lastVisibleDoc: DocumentSnapshot | null = null
): Promise<PaginatedResult<T>> {
  const queryConstraints = [...constraints, limit(pageSize + 1)]; // +1 to check if there are more
  
  if (lastVisibleDoc) {
    queryConstraints.push(startAfter(lastVisibleDoc));
  }

  const q = query(collection(db, collectionName), ...queryConstraints);
  const snapshot = await getDocs(q);
  
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
  
  const hasMore = docs.length > pageSize;
  const data = hasMore ? docs.slice(0, pageSize) : docs;
  const lastVisible = data.length > 0 ? snapshot.docs[data.length - 1] : null;

  return { data, lastVisible, hasMore };
}

// ---------------------------------------------------------------------------
// Aggregation Queries (Zero-read counting)
// ---------------------------------------------------------------------------

/**
 * Get total count of resources (minimizes reads using getCountFromServer).
 * Costs 1 read per 1000 index entries instead of 1 read per document.
 */
export async function getResourceCount(
  university?: string,
  type?: string
): Promise<number> {
  const constraints: QueryConstraint[] = [];
  if (university) constraints.push(where("university", "==", university));
  if (type) constraints.push(where("type", "==", type));

  const q = query(collection(db, COLLECTIONS.resources), ...constraints);
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

// ---------------------------------------------------------------------------
// Resource Queries
// ---------------------------------------------------------------------------

/**
 * Get approved resources with pagination.
 */
export async function getResources(
  university?: string,
  semester?: number,
  subject?: string,
  pageSize: number = 10,
  lastVisibleDoc: DocumentSnapshot | null = null
) {
  const constraints: QueryConstraint[] = [];
  
  if (university) constraints.push(where("university", "==", university));
  if (semester) constraints.push(where("semester", "==", semester));
  if (subject) constraints.push(where("subject", "==", subject));
  
  // Sort by newest first
  constraints.push(orderBy("createdAt", "desc"));

  return getPaginatedData<Resource>(
    COLLECTIONS.resources,
    constraints,
    pageSize,
    lastVisibleDoc
  );
}

// ---------------------------------------------------------------------------
// Leaderboard Queries (Cached)
// ---------------------------------------------------------------------------

/**
 * Get the global leaderboard.
 * Fetches exactly 1 document containing the pre-calculated top users,
 * avoiding a costly query over the entire users collection.
 */
export async function getLeaderboard(): Promise<LeaderboardGlobal | null> {
  const docRef = doc(db, COLLECTIONS.leaderboard, "global");
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  return { id: snapshot.id, ...snapshot.data() } as LeaderboardGlobal;
}

// ---------------------------------------------------------------------------
// User-Specific Queries
// ---------------------------------------------------------------------------

/**
 * Get unread notifications for a user.
 */
export async function getUnreadNotifications(userId: string) {
  const q = query(
    collection(db, COLLECTIONS.notifications),
    where("userId", "==", userId),
    where("read", "==", false),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
}

/**
 * Get pending uploads for a specific user.
 */
export async function getUserPendingUploads(userId: string) {
  const q = query(
    collection(db, COLLECTIONS.pendingUploads),
    where("uploadedBy.uid", "==", userId),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PendingUpload));
}
