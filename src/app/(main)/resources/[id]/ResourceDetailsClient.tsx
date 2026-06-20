"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Heart, Bookmark, Eye, Share2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ResourceDetailsClient({ initialResource }: { initialResource: any }) {
  const [resource, setResource] = useState(initialResource);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Record view on mount
    fetch(`/api/resources/${resource._id}/view`, { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.views > resource.views) {
          setResource((prev: any) => ({ ...prev, views: data.views }));
        }
      })
      .catch(console.error);
  }, [resource._id]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/resources/${resource._id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to like");
      return res.json();
    },
    onMutate: async () => {
      // Save previous state for rollback
      const previous = { hasLiked: resource.hasLiked, likesCount: resource.likesCount };
      // Optimistic update
      setResource((prev: any) => ({
        ...prev,
        hasLiked: !prev.hasLiked,
        likesCount: prev.hasLiked ? Math.max(0, prev.likesCount - 1) : prev.likesCount + 1
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Revert to previous state on failure
      if (context?.previous) {
        setResource((prev: any) => ({ ...prev, ...context.previous }));
      }
    },
    onSuccess: (data) => {
      // Sync with actual server state to prevent drift
      if (data.success) {
        setResource((prev: any) => ({
          ...prev,
          hasLiked: data.hasLiked,
          likesCount: data.likesCount,
        }));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/resources/${resource._id}/save`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onMutate: async () => {
      const previous = { hasSaved: resource.hasSaved };
      setResource((prev: any) => ({
        ...prev,
        hasSaved: !prev.hasSaved
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        setResource((prev: any) => ({ ...prev, ...context.previous }));
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        setResource((prev: any) => ({ ...prev, hasSaved: data.hasSaved }));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["savedResources"] });
    }
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      // Increment download securely in background
      fetch(`/api/resources/${resource._id}/download`, { method: "POST" })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["userStats"] });
        }).catch(console.error);

      let downloadUrl = resource.fileUrl;
      if (downloadUrl.includes("res.cloudinary.com")) {
        const parts = downloadUrl.split("/upload/");
        if (parts.length === 2) {
          downloadUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
        }
      }
      
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = resource.title ? resource.title.replace(/\s+/g, '_') : "helpjuniors_resource";
      a.target = "_blank"; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    onMutate: () => {
      setResource((prev: any) => ({ ...prev, downloads: prev.downloads + 1 }));
    }
  });

  return (
    <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
      {/* Main Info */}
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">{resource.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{resource.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-4 border-y border-border py-6">
          <div className="flex items-center gap-2">
            {resource.uploadedBy?.image ? (
              <img src={resource.uploadedBy.image} alt="" className="h-10 w-10 rounded-full border border-border" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-500/20" />
            )}
            <div>
              <p className="text-sm font-medium leading-none">{resource.uploadedBy?.name || "Unknown Student"}</p>
              <p className="text-xs text-muted-foreground mt-1">Uploaded {formatDistanceToNow(new Date(resource.createdAt))} ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Action Card */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-24 rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
          <button
            onClick={() => downloadMutation.mutate()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3.5 text-sm font-medium text-white transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
          >
            <Download className="h-5 w-5" />
            Download Resource
          </button>
          
          <div className="mt-6 flex justify-around border-t border-border pt-6">
            <button 
              onClick={() => likeMutation.mutate()}
              className="flex flex-col items-center gap-1.5 transition-colors group"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${resource.hasLiked ? "bg-rose-500/10 text-rose-500" : "bg-muted text-muted-foreground group-hover:bg-muted/80"}`}>
                <Heart className={`h-6 w-6 ${resource.hasLiked ? "fill-current" : ""}`} />
              </div>
              <span className={`text-xs font-medium ${resource.hasLiked ? "text-rose-500" : "text-muted-foreground"}`}>{resource.likesCount || 0} Likes</span>
            </button>
            <button 
              onClick={() => saveMutation.mutate()}
              className="flex flex-col items-center gap-1.5 transition-colors group"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${resource.hasSaved ? "bg-indigo-500/10 text-indigo-500" : "bg-muted text-muted-foreground group-hover:bg-muted/80"}`}>
                <Bookmark className={`h-6 w-6 ${resource.hasSaved ? "fill-current" : ""}`} />
              </div>
              <span className={`text-xs font-medium ${resource.hasSaved ? "text-indigo-500" : "text-muted-foreground"}`}>{resource.hasSaved ? "Saved" : "Save"}</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-muted/50 p-4">
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <Eye className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-lg font-bold">{resource.views?.toLocaleString() || 0}</span>
              <span className="text-xs text-muted-foreground">Views</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <Download className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-lg font-bold">{resource.downloads?.toLocaleString() || 0}</span>
              <span className="text-xs text-muted-foreground">Downloads</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{resource.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">University</span>
              <span className="font-medium text-right max-w-[150px] truncate" title={resource.university}>{resource.university}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Course</span>
              <span className="font-medium text-right max-w-[150px] truncate" title={resource.course}>{resource.course}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Semester</span>
              <span className="font-medium">{resource.semester}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Year</span>
              <span className="font-medium">{resource.year}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
