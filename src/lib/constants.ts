// ============================================
// HelpJuniors.app — Application Constants
// ============================================

export const APP_NAME = "HelpJuniors";
export const APP_DESCRIPTION =
  "Your AI-powered student resource sharing platform. Upload, discover, and download PYQs, notes, assignments, and study materials.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://helpjuniors.app";

/** Navigation routes */
export const ROUTES = {
  home: "/",
  about: "/about",
  resources: "/resources",
  courses: "/courses",
  universities: "/universities",
  blog: "/blog",
  leaderboard: "/leaderboard",
  faq: "/faq",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  upload: "/upload",
  profile: "/profile",
  settings: "/settings",
} as const;

/** Main navbar links */
export const NAV_LINKS = [
  { label: "Home", href: ROUTES.home },
  { label: "Resources", href: ROUTES.resources },
  { label: "Courses", href: ROUTES.courses },
  { label: "Universities", href: ROUTES.universities },
  { label: "Leaderboard", href: ROUTES.leaderboard },
  { label: "Blog", href: ROUTES.blog },
] as const;

/** Footer link groups */
export const FOOTER_LINKS = {
  platform: [
    { label: "Resources", href: ROUTES.resources },
    { label: "Courses", href: ROUTES.courses },
    { label: "Universities", href: ROUTES.universities },
    { label: "Leaderboard", href: ROUTES.leaderboard },
  ],
  company: [
    { label: "About", href: ROUTES.about },
    { label: "Blog", href: ROUTES.blog },
    { label: "Contact", href: ROUTES.contact },
    { label: "FAQ", href: ROUTES.faq },
  ],
  legal: [
    { label: "Privacy Policy", href: ROUTES.privacy },
    { label: "Terms of Service", href: ROUTES.terms },
  ],
} as const;

/** Resource types */
export const RESOURCE_TYPES = [
  "PYQ",
  "Notes",
  "Assignment",
  "Lab File",
  "Practical File",
  "Study Material",
] as const;

/** Exam types */
export const EXAM_TYPES = [
  "Mid-Term",
  "End-Term",
  "Supplementary",
  "Internal",
  "Practical",
  "Viva",
  "Debarred",
  "Back",
] as const;

/** Semesters */
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** File upload constraints */
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Firestore collection names */
export const COLLECTIONS = {
  users: "users",
  resources: "resources",
  pendingUploads: "pendingUploads",
  notifications: "notifications",
  downloads: "downloads",
  leaderboard: "leaderboard",
  auditLogs: "auditLogs",
  reports: "reports",
  analytics: "analytics",
} as const;

/** User roles (ordered by privilege level) */
export const USER_ROLES = ["student", "moderator", "admin", "super_admin"] as const;

/** Role hierarchy — higher index = more privilege */
export const ROLE_HIERARCHY: Record<(typeof USER_ROLES)[number], number> = {
  student: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3,
} as const;

/** Resource statuses */
export const RESOURCE_STATUSES = ["pending", "approved", "rejected"] as const;

/** Routes that require authentication */
export const PROTECTED_ROUTES = ["/dashboard", "/upload", "/profile", "/settings"];

/** Routes that require moderator+ role */
export const MODERATOR_ROUTES = ["/moderation"];

/** Routes that require admin+ role */
export const ADMIN_ROUTES = ["/admin"];

/** Routes only accessible when NOT authenticated */
export const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

