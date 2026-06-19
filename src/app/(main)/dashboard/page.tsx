"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Upload,
  FileText,
  Download,
  Star,
  Settings,
  LogOut,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { RoleGate } from "@/components/auth/protected-route";
import { useSearchParams } from "next/navigation";

function DashboardContent() {
  const { profile, logout, isEmailVerified, isAdmin, isModerator } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorizedError = searchParams.get("error") === "unauthorized";

  const stats = [
    {
      label: "Uploads",
      value: profile?.totalUploads ?? 0,
      icon: Upload,
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      label: "Downloads",
      value: profile?.totalDownloads ?? 0,
      icon: Download,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Reputation",
      value: profile?.reputation ?? 0,
      icon: Star,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Resources",
      value: profile?.totalUploads ?? 0,
      icon: FileText,
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  const getRoleBadge = () => {
    if (!profile) return null;
    const colors: Record<string, string> = {
      student: "bg-blue-500/10 text-blue-500",
      moderator: "bg-emerald-500/10 text-emerald-500",
      admin: "bg-amber-500/10 text-amber-500",
      super_admin: "bg-red-500/10 text-red-500",
    };
    const labels: Record<string, string> = {
      student: "Student",
      moderator: "Moderator",
      admin: "Admin",
      super_admin: "Super Admin",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${colors[profile.role]}`}
      >
        <Shield className="h-3 w-3" />
        {labels[profile.role]}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Unauthorized error */}
      {unauthorizedError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          You don&apos;t have permission to access that page.
        </motion.div>
      )}

      {/* Email verification warning */}
      {!isEmailVerified && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Your email is not verified.{" "}
          <button
            onClick={() => router.push("/verify-email")}
            className="font-medium underline hover:no-underline"
          >
            Verify now
          </button>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold md:text-3xl">
              Welcome back, {profile?.displayName?.split(" ")[0] ?? "Student"}
            </h1>
            {getRoleBadge()}
          </div>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s your activity overview
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/settings")}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border/50 bg-card p-5"
          >
            <div
              className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-md`}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Role-based sections */}
      <RoleGate minimumRole="moderator">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            <Shield className="h-5 w-5" />
            Moderation Panel
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You have moderator access. Pending resources and reports will appear
            here.
          </p>
        </motion.div>
      </RoleGate>

      <RoleGate minimumRole="admin">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-600 dark:text-amber-400">
            <Shield className="h-5 w-5" />
            Admin Panel
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You have admin access. User management and platform settings will
            appear here.
          </p>
        </motion.div>
      </RoleGate>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
