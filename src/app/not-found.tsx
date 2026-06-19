import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <span className="text-[8rem] font-black leading-none text-muted-foreground/10 md:text-[12rem]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10">
            <FileQuestion className="h-10 w-10 text-indigo-500" />
          </div>
        </div>
      </div>
      <h1 className="mt-4 text-2xl font-bold md:text-3xl">Page Not Found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s
        get you back on track.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href={ROUTES.resources}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          Browse Resources
        </Link>
      </div>
    </div>
  );
}
