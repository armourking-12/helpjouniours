"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  onAuthChange,
  signOut as firebaseSignOut,
  createSession,
} from "@/lib/firebase/auth";
import { getDocument, setDocument } from "@/lib/firebase/firestore";
import { COLLECTIONS, ROLE_HIERARCHY } from "@/lib/constants";
import type { UserProfile, UserRole } from "@/types";

// ---------------------------------------------------------------------------
// Context Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** Firebase Auth user (null if not signed in) */
  user: User | null;
  /** Firestore user profile (null if not loaded or not signed in) */
  profile: UserProfile | null;
  /** True while checking initial auth state */
  loading: boolean;
  /** Auth error, if any */
  error: Error | null;
  /** Sign out the current user */
  logout: () => Promise<void>;
  /** Refresh the user profile from Firestore */
  refreshProfile: () => Promise<void>;
  /** Check if user has at least the given role */
  hasRole: (minimumRole: UserRole) => boolean;
  /** Check if user is a moderator or higher */
  isModerator: boolean;
  /** Check if user is an admin or higher */
  isAdmin: boolean;
  /** Check if user is super admin */
  isSuperAdmin: boolean;
  /** Whether the user's email is verified */
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch the user profile from Firestore.
   * If the profile doesn't exist, create a default one.
   */
  const fetchProfile = useCallback(async (firebaseUser: User) => {
    try {
      const existingProfile = await getDocument<UserProfile>(
        COLLECTIONS.users,
        firebaseUser.uid
      );

      if (existingProfile) {
        // Sync email verification status
        if (existingProfile.emailVerified !== firebaseUser.emailVerified) {
          const { setDocument: setDoc } = await import("@/lib/firebase/firestore");
          await setDoc(
            COLLECTIONS.users,
            firebaseUser.uid,
            { emailVerified: firebaseUser.emailVerified },
            true
          );
          existingProfile.emailVerified = firebaseUser.emailVerified;
        }
        setProfile(existingProfile);
      } else {
        // First-time sign-in: create a default profile
        const newProfile: Omit<UserProfile, "id"> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "Student",
          photoURL: firebaseUser.photoURL || null,
          role: "student",
          emailVerified: firebaseUser.emailVerified,
          university: null,
          course: null,
          semester: null,
          reputation: 0,
          totalUploads: 0,
          totalDownloads: 0,
          bio: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDocument(COLLECTIONS.users, firebaseUser.uid, newProfile, false);
        setProfile(newProfile as UserProfile);
      }
    } catch (err) {
      console.error("Failed to fetch/create user profile:", err);
      setError(err instanceof Error ? err : new Error("Failed to load profile"));
    }
  }, []);

  /**
   * Refresh the user profile from Firestore.
   */
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user);
  }, [user, fetchProfile]);

  /**
   * Check if the current user has at least the given role.
   */
  const hasRole = useCallback(
    (minimumRole: UserRole): boolean => {
      if (!profile) return false;
      return ROLE_HIERARCHY[profile.role] >= ROLE_HIERARCHY[minimumRole];
    },
    [profile]
  );

  /**
   * Derived role checks.
   */
  const isModerator = useMemo(() => hasRole("moderator"), [hasRole]);
  const isAdmin = useMemo(() => hasRole("admin"), [hasRole]);
  const isSuperAdmin = useMemo(() => hasRole("super_admin"), [hasRole]);
  const isEmailVerified = useMemo(
    () => user?.emailVerified ?? false,
    [user]
  );

  /**
   * Sign out and clear state.
   */
  const logout = useCallback(async () => {
    try {
      await firebaseSignOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Failed to sign out:", err);
      setError(err instanceof Error ? err : new Error("Failed to sign out"));
    }
  }, []);

  /**
   * Listen to Firebase Auth state changes.
   */
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await fetchProfile(firebaseUser);
        // Create server session on auth state change
        try {
          await createSession();
        } catch {
          // Session creation can fail silently on initial load
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        logout,
        refreshProfile,
        hasRole,
        isModerator,
        isAdmin,
        isSuperAdmin,
        isEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook to access auth state from any client component.
 * Must be used within an AuthProvider.
 *
 * @example
 * ```tsx
 * const { user, profile, loading, logout, hasRole, isAdmin } = useAuth();
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
