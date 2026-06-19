import type { RESOURCE_TYPES, EXAM_TYPES, RESOURCE_STATUSES } from "@/lib/constants";
import type { UserSummary } from "./user";

/** Resource type union */
export type ResourceType = (typeof RESOURCE_TYPES)[number];

/** Exam type union */
export type ExamType = (typeof EXAM_TYPES)[number];

/** Resource status union */
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

/** Academic resource stored in Firestore */
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  university: string;
  course: string;
  semester: number;
  subject: string;
  year: number;
  examType: ExamType | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  thumbnailUrl: string | null;
  uploadedBy: UserSummary;
  status: ResourceStatus;
  tags: string[];
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

/** Resource card display data */
export interface ResourceCard {
  id: string;
  title: string;
  type: ResourceType;
  university: string;
  subject: string;
  semester: number;
  year: number;
  downloads: number;
  uploadedBy: UserSummary;
  createdAt: string;
}
