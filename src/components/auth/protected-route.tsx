"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_HIERARCHY } from "@/lib/constants";
import type { UserRole } from "@/types";
import { FullPageSpinner } from "@/components/shared/loading-spinner";

// ---------------------------------------------------------------------------
// ProtectedRoute — requires authentication
// ---------------------------------------------------------------------------

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Minimum role required to access this route */
  minimumRole?: UserRole;
  /** Whether email verification is required (default: false) */
  requireVerified?: boolean;
  /** Custom fallback while loading */
  fallback?: React.ReactNode;
}

/**
 * Wrap page content to enforce authentication and role requirements.
 *
 * @example
 * ```tsx
 * <ProtectedRoute minimumRole="moderator">
 *   <ModerationDashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  minimumRole = "student",
  requireVerified = false,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, profile, loading, isEmailVerified } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not authenticated → redirect to login
    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Email not verified → redirect to verification page
    if (requireVerified && !isEmailVerified) {
      router.push("/verify-email");
      return;
    }

    // Insufficient role → redirect to dashboard with error
    if (profile && ROLE_HIERARCHY[profile.role as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY[minimumRole]) {
      router.push("/dashboard?error=unauthorized");
      return;
    }
  }, [user, profile, loading, isEmailVerified, minimumRole, requireVerified, router]);

  // Show loading state
  if (loading) {
    return <>{fallback ?? <FullPageSpinner />}</>;
  }

  // Don't render until we confirm auth + role
  if (!user) return null;
  if (requireVerified && !isEmailVerified) return null;
  if (profile && ROLE_HIERARCHY[profile.role as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY[minimumRole]) return null;

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// RoleGate — conditionally render based on role (no redirect)
// ---------------------------------------------------------------------------

interface RoleGateProps {
  children: React.ReactNode;
  /** Minimum role required to see this content */
  minimumRole: UserRole;
  /** Optional fallback content for unauthorized users */
  fallback?: React.ReactNode;
}

/**
 * Conditionally render content based on user role.
 * Unlike ProtectedRoute, this does NOT redirect — it simply hides content.
 *
 * @example
 * ```tsx
 * <RoleGate minimumRole="admin" fallback={<p>Admin only</p>}>
 *   <AdminPanel />
 * </RoleGate>
 * ```
 */
export function RoleGate({
  children,
  minimumRole,
  fallback = null,
}: RoleGateProps) {
  const { profile, loading } = useAuth();

  if (loading) return null;

  if (!profile || ROLE_HIERARCHY[profile.role as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY[minimumRole]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
