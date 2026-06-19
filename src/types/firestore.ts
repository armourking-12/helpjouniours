import type { ResourceType, ExamType, ResourceStatus } from "./resource";
import type { UserRole, UserSummary } from "./user";

/**
 * Upload pending moderation.
 * Includes raw/extracted text from AI processing.
 */
export interface PendingUpload {
  id: string;
  title: string | null;
  description: string | null;
  type: ResourceType | null;
  university: string | null;
  course: string | null;
  semester: number | null;
  subject: string | null;
  year: number | null;
  examType: ExamType | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  thumbnailUrl: string | null;
  uploadedBy: UserSummary;
  status: ResourceStatus;
  tags: string[];
  aiExtractedText?: string;
  moderatorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Notification type union */
export type NotificationType =
  | "upload_approved"
  | "upload_rejected"
  | "milestone_reached"
  | "system_alert";

/** Notification model */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

/** Record of a resource download to track analytics and prevent abuse */
export interface DownloadRecord {
  id: string;
  resourceId: string;
  userId: string;
  downloadedAt: string;
}

/** Aggregated leaderboard entries (stored as an array in a single document to minimize reads) */
export interface LeaderboardGlobal {
  id: "global";
  topUsers: Array<{
    uid: string;
    displayName: string;
    photoURL: string | null;
    reputation: number;
    rank: number;
  }>;
  lastUpdated: string;
}

/** Audit log for moderator/admin actions */
export interface AuditLog {
  id: string;
  adminId: string;
  action: "approve_resource" | "reject_resource" | "change_role" | "delete_user";
  targetId: string;
  details?: Record<string, any>;
  createdAt: string;
}
