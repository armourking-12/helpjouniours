"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Mail, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  sendVerificationEmail,
  checkEmailVerified,
} from "@/lib/firebase/auth";
import { ROUTES } from "@/lib/constants";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading, refreshProfile } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Redirect if no user or already verified
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Poll for verification every 3 seconds
  useEffect(() => {
    if (!user || isVerified) return;

    const interval = setInterval(async () => {
      const verified = await checkEmailVerified();
      if (verified) {
        setIsVerified(true);
        await refreshProfile();
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, isVerified, refreshProfile]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    try {
      setIsSending(true);
      await sendVerificationEmail();
      setCooldown(60);
    } catch {
      // Already sent too many emails
      setCooldown(60);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-xl">
        {isVerified ? (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10"
            >
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </motion.div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Email verified!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your email has been verified successfully. You&apos;re all set!
            </p>
            <button
              onClick={() => router.push(ROUTES.dashboard)}
              className="group mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
              <Mail className="h-8 w-8 text-indigo-500" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Verify your email
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve sent a verification email to
            </p>
            <p className="mt-1 font-medium text-foreground">{user?.email}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Click the link in the email to verify your account. This page will
              update automatically.
            </p>

            {/* Checking animation */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-indigo-500" />
              Waiting for verification...
            </div>

            {/* Resend */}
            <div className="mt-6 border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email?
              </p>
              <button
                onClick={handleResend}
                disabled={isSending || cooldown > 0}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-indigo-500 hover:text-indigo-600 disabled:text-muted-foreground disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isSending ? "animate-spin" : ""}`} />
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : isSending
                    ? "Sending..."
                    : "Resend verification email"}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
