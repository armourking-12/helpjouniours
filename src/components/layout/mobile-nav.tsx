"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, ROUTES } from "@/lib/constants";
import { Logo } from "./logo";

import { useAuth } from "@/hooks/use-auth";
import { UserButton, SignInButton } from "@clerk/nextjs";

interface MobileNavProps {
  onClose: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { user, isClerkLoaded } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-x-0 top-16 z-40 overflow-hidden border-b border-border/40 bg-background/95 backdrop-blur-xl md:hidden"
    >
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: 0.1 }}
        className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4"
      >
        {NAV_LINKS.map((link, index) => {
          const isActive = pathname === link.href;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Link
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                )}
              </Link>
            </motion.div>
          );
        })}

        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
          {isClerkLoaded && (
            <>
              <Link
                href={ROUTES.upload}
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-500/20 dark:text-emerald-400"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Resource
              </Link>

              {user ? (
                <>
                  <Link
                    href={ROUTES.dashboard}
                    onClick={onClose}
                    className="flex w-full items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted"
                  >
                    Dashboard
                  </Link>
                  <div className="flex w-full items-center justify-center py-2">
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} />
                  </div>
                </>
              ) : (
                <SignInButton mode="modal">
                  <button
                    onClick={onClose}
                    className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:brightness-110"
                  >
                    Sign In
                  </button>
                </SignInButton>
              )}
            </>
          )}
        </div>
      </motion.nav>
    </motion.div>
  );
}
