"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, FileText, Download, Loader2, User as UserIcon } from "lucide-react";
import Image from "next/image";

type PendingUpload = {
  _id: string;
  title: string;
  description: string;
  type: string;
  university: string;
  course: string;
  semester: number;
  subject: string;
  year: number;
  examType?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: {
    name: string;
    image?: string;
    reputation: number;
  };
  createdAt: string;
};

export function PendingQueue() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: uploads = [], isLoading } = useQuery<PendingUpload[]>({
    queryKey: ["pendingUploads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pending");
      if (!res.ok) throw new Error("Failed to fetch pending uploads");
      const data = await res.json();
      return data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to approve");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUploads"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason }),
      });
      if (!res.ok) throw new Error("Failed to reject");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUploads"] });
      setRejectingId(null);
      setRejectReason("");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
        <div className="rounded-full bg-muted p-4 text-muted-foreground">
          <Check className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
        <p className="mt-1 text-sm text-muted-foreground">There are no pending uploads requiring moderation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {uploads.map((upload) => (
          <motion.div
            key={upload._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-start md:justify-between"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between md:justify-start md:gap-4">
                <h4 className="font-semibold text-lg">{upload.title}</h4>
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-500">
                  {upload.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{upload.description}</p>
              
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-muted px-2 py-1">{upload.university}</span>
                <span className="rounded-md bg-muted px-2 py-1">{upload.course} (Sem {upload.semester})</span>
                <span className="rounded-md bg-muted px-2 py-1">{upload.subject}</span>
                <span className="rounded-md bg-muted px-2 py-1">{upload.year}</span>
                {upload.examType && <span className="rounded-md bg-muted px-2 py-1">{upload.examType}</span>}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {upload.uploadedBy.image ? (
                    <Image src={upload.uploadedBy.image} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <div className="rounded-full bg-muted p-0.5"><UserIcon className="h-4 w-4" /></div>
                  )}
                  <span>{upload.uploadedBy.name}</span>
                  <span className="text-amber-500 font-medium">({upload.uploadedBy.reputation} rep)</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{formatDistanceToNow(new Date(upload.createdAt))} ago</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{(upload.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 md:w-48">
              <a 
                href={upload.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
              >
                <Download className="h-4 w-4" /> Preview File
              </a>
              
              {rejectingId === upload._id ? (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Reason for rejection..." 
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setRejectingId(null)}
                      className="flex-1 rounded-md border border-border py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => rejectMutation.mutate({ id: upload._id, reason: rejectReason })}
                      disabled={rejectMutation.isPending}
                      className="flex-1 rounded-md bg-destructive py-1.5 text-xs font-medium text-white hover:bg-destructive/90 disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => approveMutation.mutate(upload._id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button 
                    onClick={() => setRejectingId(upload._id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-destructive py-2 text-sm font-medium text-white transition-colors hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
