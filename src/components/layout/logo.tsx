import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const sizeConfig = {
  sm: { container: "w-6 h-6", text: "text-lg" },
  md: { container: "w-8 h-8", text: "text-xl" },
  lg: { container: "w-10 h-10", text: "text-2xl" },
};

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const config = sizeConfig[size];

  return (
    <Link
      href={ROUTES.home}
      className={cn("group flex items-center gap-2 transition-opacity hover:opacity-80", className)}
    >
      <div className={cn("relative flex items-center justify-center transition-transform group-hover:scale-105", config.container)}>
        <Image 
          src="/icons.png" 
          alt="HelpJuniors Logo" 
          fill
          sizes="(max-width: 768px) 40px, 40px"
          className="object-contain drop-shadow-sm"
          priority
        />
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
