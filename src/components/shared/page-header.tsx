"use client";

import { AnimatedContainer } from "./animated-container";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <AnimatedContainer
      variant="fadeUp"
      className={cn("py-12 md:py-16 lg:py-20", className)}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </AnimatedContainer>
  );
}
