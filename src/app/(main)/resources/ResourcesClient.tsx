"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Filter, FileText, Download, BookOpen, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";
import { RESOURCE_TYPES } from "@/lib/constants";

const typeColors: Record<string, string> = {
  PYQ: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Notes: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Assignment: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Lab File": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Practical File": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "Study Material": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

export function ResourcesClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeType, setActiveType] = useState<string>("");
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ["resources", debouncedQuery, activeType, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        type: activeType,
        page: page.toString(),
      });
      const res = await fetch(`/api/resources?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 60000,
  });

  const downloadMutation = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      // Open in new tab immediately for better UX
      window.open(url, "_blank");
      
      // Increment in background
      await fetch(`/api/resources/${id}/download`, { method: "POST" });
    },
  });

  const handleTypeToggle = (type: string) => {
    setActiveType(prev => prev === type ? "" : type);
    setPage(1);
  };

  const resources = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-1/4 top-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Resources"
            description="Discover thousands of academic resources shared by students across India. PYQs, notes, assignments, and more."
          >
            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by subject, university, or keyword..."
                  className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-4 text-base shadow-sm transition-all placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </PageHeader>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="mr-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Filter:
            </span>
            {RESOURCE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  activeType === type
                    ? "border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : "border-border text-muted-foreground hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No resources found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              {/* Resource Cards */}
              <AnimatedContainer variant="stagger">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {resources.map((resource: any) => (
                    <AnimatedItem key={resource._id}>
                      <div 
                        onClick={() => downloadMutation.mutate({ id: resource._id, url: resource.fileUrl })}
                        className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-lg flex flex-col h-full"
                      >
                        <div className="flex items-start justify-between">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${typeColors[resource.type] || "bg-muted text-muted-foreground"}`}>
                            {resource.type}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Download className="h-3 w-3" />
                            {resource.downloads?.toLocaleString() || 0}
                          </span>
                        </div>
                        <h3 className="mt-3 font-semibold leading-snug transition-colors group-hover:text-indigo-500 flex-1">
                          {resource.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            <BookOpen className="h-3 w-3" />
                            {resource.university}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Sem {resource.semester}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {resource.year}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                           <div className="flex items-center gap-2">
                             {resource.uploadedBy.image ? (
                               <img src={resource.uploadedBy.image} alt="" className="h-5 w-5 rounded-full" />
                             ) : (
                               <div className="h-5 w-5 rounded-full bg-indigo-500/20" />
                             )}
                             <span className="text-xs text-muted-foreground">{resource.uploadedBy.name}</span>
                           </div>
                           <span className="text-xs font-medium text-indigo-500 group-hover:underline">
                             Download
                           </span>
                        </div>
                      </div>
                    </AnimatedItem>
                  ))}
                </div>
              </AnimatedContainer>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center justify-center rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="inline-flex items-center justify-center rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
