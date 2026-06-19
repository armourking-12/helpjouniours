import { useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_HIERARCHY } from "@/lib/constants";
import type { UserRole } from "@/types";

/**
 * Hook for role-based access control.
 * Provides convenient methods to check user permissions.
 *
 * @example
 * ```tsx
 * const { canModerate, canAdmin, hasMinRole } = useRole();
 *
 * if (canModerate) {
 *   // Show moderation UI
 * }
 * ```
 */
export function useRole() {
  const { profile } = useAuth();

  const currentRole = profile?.role ?? "student";

  const hasMinRole = useCallback(
    (minimumRole: UserRole): boolean => {
      if (!profile) return false;
      return ROLE_HIERARCHY[profile.role] >= ROLE_HIERARCHY[minimumRole];
    },
    [profile]
  );

  const canModerate = useMemo(() => hasMinRole("moderator"), [hasMinRole]);
  const canAdmin = useMemo(() => hasMinRole("admin"), [hasMinRole]);
  const canSuperAdmin = useMemo(() => hasMinRole("super_admin"), [hasMinRole]);

  return {
    /** Current user role */
    currentRole,
    /** Check if user has at least the given role */
    hasMinRole,
    /** Whether the user can moderate (moderator+) */
    canModerate,
    /** Whether the user can admin (admin+) */
    canAdmin,
    /** Whether the user is super admin */
    canSuperAdmin,
  };
}
