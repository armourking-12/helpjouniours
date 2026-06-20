"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { flushSync } from "react-dom";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isAnimating = useRef(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-md" />;
  }

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isAnimating.current) return;
    
    const isDark = resolvedTheme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Fallback for unsupported browsers or users who prefer reduced motion
    if (!document.startViewTransition || prefersReducedMotion) {
      setTheme(nextTheme);
      return;
    }

    isAnimating.current = true;

    // Calculate the circle radius from the click position
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    transition.ready.then(() => {
      const isGoingDark = nextTheme === "dark";

      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      // Base transition easing
      const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
      const duration = 600;

      // New View (Expanding Circle)
      document.documentElement.animate(
        {
          clipPath: isGoingDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration,
          easing,
          pseudoElement: isGoingDark
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)",
        }
      );

      // Old View (Fading & Scaling out smoothly)
      document.documentElement.animate(
        {
          opacity: [1, 0],
          transform: ["scale(1)", "scale(0.96)"],
        },
        {
          duration: duration - 100, // Finish slightly before the circle expands fully
          easing: "ease-in-out",
          pseudoElement: isGoingDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    });

    transition.finished.finally(() => {
      isAnimating.current = false;
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
