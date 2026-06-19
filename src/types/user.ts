import type { USER_ROLES } from "@/lib/constants";

/** User role union type */
export type UserRole = (typeof USER_ROLES)[number];

/** Firebase user profile stored in Firestore */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  emailVerified: boolean;
  university: string | null;
  course: string | null;
  semester: number | null;
  reputation: number;
  totalUploads: number;
  totalDownloads: number;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Minimal user info for display (e.g., in cards, avatars) */
export interface UserSummary {
  uid: string;
  displayName: string;
  photoURL: string | null;
  reputation: number;
}
