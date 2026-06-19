"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { ROLE_HIERARCHY } from "@/lib/constants";
import type { UserRole } from "@/types";

interface AuthContextValue {
  user: any | null; // Clerk User
  profile: any | null; // MongoDB User Profile
  loading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (minimumRole: UserRole) => boolean;
  isModerator: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isEmailVerified: boolean;
  isClerkLoaded: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { signOut } = useClerkAuth();

  // Fetch MongoDB Profile
  const { data: mongoData, isLoading: isMongoLoading, error, refetch } = useQuery({
    queryKey: ["mongoUser", clerkUser?.id],
    queryFn: async () => {
      if (!clerkUser) return null;
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch mongo profile");
      return res.json();
    },
    enabled: !!clerkUser,
  });

  const profile = mongoData?.data || null;
  const loading = !isClerkLoaded || (!!clerkUser && isMongoLoading);
  const typedError = error as Error | null;

  const refreshProfile = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const hasRole = useCallback(
    (minimumRole: UserRole): boolean => {
      if (!profile || !profile.role) return false;
      return ROLE_HIERARCHY[profile.role as keyof typeof ROLE_HIERARCHY] >= ROLE_HIERARCHY[minimumRole];
    },
    [profile]
  );

  const isModerator = useMemo(() => hasRole("moderator"), [hasRole]);
  const isAdmin = useMemo(() => hasRole("admin"), [hasRole]);
  const isSuperAdmin = useMemo(() => hasRole("super_admin"), [hasRole]);
  
  // Check if primary email is verified in Clerk
  const isEmailVerified = useMemo(() => {
    if (!clerkUser) return false;
    return clerkUser.emailAddresses.some(email => email.verification?.status === "verified");
  }, [clerkUser]);

  return (
    <AuthContext.Provider
      value={{
        user: clerkUser,
        profile,
        loading,
        error: typedError,
        logout,
        refreshProfile,
        hasRole,
        isModerator,
        isAdmin,
        isSuperAdmin,
        isEmailVerified,
        isClerkLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
