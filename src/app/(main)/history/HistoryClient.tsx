"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Download, Eye, Heart, Bookmark, Loader2, FileText, BookOpen, Clock } from "lucide-react";

const typeColors: Record<string, string> = {
  "Previous Year Question": "bg-indigo-500/10 text-indigo-500",
  "Handwritten Notes": "bg-emerald-500/10 text-emerald-500",
  "Assignment Solution": "bg-amber-500/10 text-amber-500",
  "Lab File": "bg-purple-500/10 text-purple-500",
  "Study Material": "bg-rose-500/10 text-rose-500",
};

export function HistoryClient() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/history");
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to like");
      return res.json();
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["history"] });
      const previousData = queryClient.getQueryData(["history"]);
      
      queryClient.setQueryData(["history"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((res: any) => 
            res._id === id ? { 
              ...res, 
              hasLiked: !res.hasLiked,
              likesCount: res.hasLiked ? Math.max(0, res.likesCount - 1) : res.likesCount + 1 
            } : res
          )
        };
      });
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["history"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}/save`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["history"] });
      const previousData = queryClient.getQueryData(["history"]);
      
      queryClient.setQueryData(["history"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((res: any) => 
            res._id === id ? { ...res, hasSaved: !res.hasSaved } : res
          )
        };
      });
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["history"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["savedResources"] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const resources = data?.data || [];

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center bg-card">
        <Clock className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No viewing history yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">When you view study materials, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource: any) => (
        <div 
          key={resource._id}
          onClick={() => router.push(`/resources/${resource._id}`)}
          className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-lg flex flex-col h-full"
        >
          <div className="flex items-start justify-between">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${typeColors[resource.type] || "bg-muted text-muted-foreground"}`}>
              {resource.type}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                {resource.views?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Download className="h-3 w-3" />
                {resource.downloads?.toLocaleString() || 0}
              </span>
            </div>
          </div>
          <div className="flex items-start justify-between mt-3">
            <h3 className="font-semibold leading-snug transition-colors group-hover:text-indigo-500 flex-1 pr-2">
              {resource.title}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); likeMutation.mutate(resource._id); }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors ${resource.hasLiked ? "bg-rose-500/10 text-rose-500" : "hover:bg-muted text-muted-foreground"}`}
              >
                <Heart className={`h-4 w-4 ${resource.hasLiked ? "fill-current" : ""}`} />
                <span className="text-xs font-medium">{resource.likesCount || 0}</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); saveMutation.mutate(resource._id); }}
                className={`p-1.5 rounded-full transition-colors ${resource.hasSaved ? "bg-indigo-500/10 text-indigo-500" : "hover:bg-muted text-muted-foreground"}`}
              >
                <Bookmark className={`h-4 w-4 ${resource.hasSaved ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              {resource.university}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
