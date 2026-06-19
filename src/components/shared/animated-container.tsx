"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

const containerVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  },
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

interface AnimatedContainerProps {
  children: React.ReactNode;
  variant?: keyof typeof containerVariants;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "main" | "ul";
  viewport?: boolean;
}

export function AnimatedContainer({
  children,
  variant = "fadeUp",
  delay = 0,
  className,
  as = "div",
  viewport = true,
}: AnimatedContainerProps) {
  const Component = motion.create(as);
  const variants = containerVariants[variant];

  return (
    <Component
      variants={variants}
      initial="hidden"
      {...(viewport
        ? { whileInView: "visible", viewport: { once: true, margin: "-50px" } }
        : { animate: "visible" })}
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </Component>
  );
}

/** Wrapper for stagger children animations */
export function AnimatedItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={childVariants} className={cn(className)}>
      {children}
    </motion.div>
  );
}
