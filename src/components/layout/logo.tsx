import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { GraduationCap } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const sizeConfig = {
  sm: { icon: "h-5 w-5", text: "text-lg" },
  md: { icon: "h-6 w-6", text: "text-xl" },
  lg: { icon: "h-8 w-8", text: "text-2xl" },
};

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const config = sizeConfig[size];

  return (
    <Link
      href={ROUTES.home}
      className={cn("group flex items-center gap-2 transition-opacity hover:opacity-80", className)}
    >
      <div className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-1.5 shadow-md shadow-indigo-500/20 transition-shadow group-hover:shadow-lg group-hover:shadow-indigo-500/30">
        <GraduationCap className={cn(config.icon, "text-white")} />
      </div>
      {showText && (
        <span className={cn(config.text, "font-bold tracking-tight")}>
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
            Help
          </span>
          <span className="text-foreground">Juniors</span>
        </span>
      )}
    </Link>
  );
}
