"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import {
  UploadCloud,
  Camera,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { generateFileHash } from "@/lib/utils/hash";
import { uploadSchema, type UploadFormData } from "@/lib/validations";
import { RESOURCE_TYPES, EXAM_TYPES } from "@/lib/constants";

type UploadStep = "selection" | "file_preview" | "ai_processing" | "form" | "success";
type UploadMode = "document" | "capture";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export function UploadSystem() {
  const router = useRouter();
  const { profile } = useAuth();

  // State
  const [step, setStep] = useState<UploadStep>("selection");
  const [mode, setMode] = useState<UploadMode | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  // Progress & Errors
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [similarWarning, setSimilarWarning] = useState<string | null>(null);
  const [ignoreSimilar, setIgnoreSimilar] = useState(false);

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  // ---------------------------------------------------------------------------
  // Core Functions
  // ---------------------------------------------------------------------------

  const checkHashCollision = async (hash: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/upload/check-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      });
      const data = await res.json();
      if (data.isDuplicate) {
        setDuplicateWarning(data.message);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const processFileForAI = async (selectedFile: File) => {
    const isImageOrPdf = selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf";
    
    if (isImageOrPdf) {
      setStep("ai_processing");
      await extractDataWithGemini(selectedFile);
    } else {
      // Direct to form for DOCX/PPTX
      setStep("form");
    }
  };

  const extractDataWithGemini = async (documentFile: File) => {
    setIsProcessing(true);
    try {
      // Convert file to Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(documentFile);
      const base64Data = await base64Promise;

      let result = null;
      let lastError = null;

      // Retry mechanism (up to 2 times)
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await fetch("/api/ai/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType: documentFile.type,
            }),
          });

          if (!response.ok) throw new Error(`AI Extraction failed on attempt ${attempt}`);

          result = await response.json();
          break; // Success, exit retry loop
        } catch (err) {
          lastError = err;
          console.warn(`Extraction attempt ${attempt} failed.`);
          if (attempt === 1) await new Promise(res => setTimeout(res, 1000));
        }
      }

      if (!result || !result.success) throw lastError;

      const data = result.data;

      // Auto-fill form
      if (data.title) setValue("title", data.title);
      if (data.description) setValue("description", data.description);
      if (data.university) setValue("university", data.university);
      if (data.course) setValue("course", data.course);
      if (data.semester) setValue("semester", Number(data.semester));
      if (data.subject) setValue("subject", data.subject);
      if (data.year) setValue("year", Number(data.year));
      
      if (data.examType) {
        const matchedType = EXAM_TYPES.find(
          t => t.toLowerCase().replace(/[^a-z]/g, "") === data.examType.toLowerCase().replace(/[^a-z]/g, "")
        );
        if (matchedType) setValue("examType", matchedType);
      }

      if (data.tags) setValue("tags", data.tags);
      setValue("type", "PYQ"); // Default

    } catch (err) {
      console.error(err);
      setError("AI extraction failed. You can fill the details manually.");
    } finally {
      setIsProcessing(false);
      setStep("form");
    }
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!file || !profile) return;

    try {
      setError(null);
      setSimilarWarning(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("ignoreSimilar", ignoreSimilar.toString());
      
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("type", data.type);
      formData.append("university", data.university);
      formData.append("course", data.course);
      formData.append("semester", data.semester.toString());
      formData.append("subject", data.subject);
      formData.append("year", data.year.toString());
      if (data.examType) formData.append("examType", data.examType);
      if (data.tags) formData.append("tags", data.tags);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        
        if (response.status === 409 && errData.error === "SIMILAR_DUPLICATE") {
          setSimilarWarning(errData.message);
          return;
        }
        
        throw new Error(errData.message || "Upload failed");
      }

      setStep("success");
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload file. Please try again.");
    }
  };

  // ---------------------------------------------------------------------------
  // File Drop Handlers
  // ---------------------------------------------------------------------------

  const handleFileDrop = async (selectedFile: File, selectedMode: UploadMode) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 25MB.");
      return;
    }

    setFile(selectedFile);
    setMode(selectedMode);
    setStep("file_preview");
    setError(null);
    setDuplicateWarning(null);
    setSimilarWarning(null);
    setIgnoreSimilar(false);

    // Hash file in background to check exact duplicates
    try {
      const hash = await generateFileHash(selectedFile);
      const isDuplicate = await checkHashCollision(hash);
      
      // If it's a capture, immediately proceed to AI after checking duplicate
      if (selectedMode === "capture") {
        if (!isDuplicate) {
          await processFileForAI(selectedFile);
        }
      }
    } catch (err) {
      console.error("Hashing failed:", err);
    }
  };

  const { getRootProps: getDocRootProps, getInputProps: getDocInputProps, isDragActive: isDocDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleFileDrop(files[0], "document"),
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
  });

  const { getRootProps: getCaptureRootProps, getInputProps: getCaptureInputProps, isDragActive: isCaptureDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleFileDrop(files[0], "capture"),
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  const cancelUpload = () => {
    setFile(null);
    setMode(null);
    setStep("selection");
    setDuplicateWarning(null);
    setSimilarWarning(null);
    setIgnoreSimilar(false);
    setError(null);
    reset();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: SELECTION MODE */}
        {step === "selection" && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {/* Option 1: Document Upload */}
            <div
              {...getDocRootProps()}
              className={`group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-all ${isDocDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-border hover:border-indigo-500/50 hover:bg-muted/50"}`}
            >
              <input {...getDocInputProps()} />
              <div className="rounded-full bg-indigo-500/10 p-4 text-indigo-500 transition-transform group-hover:scale-110">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Upload Document</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Drag & drop your PDF, DOCX, PPTX, or image files here.
                </p>
              </div>
            </div>

            {/* Option 2: Capture Paper */}
            <div
              {...getCaptureRootProps()}
              className={`group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-all ${isCaptureDragActive ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:border-emerald-500/50 hover:bg-muted/50"}`}
            >
              <input {...getCaptureInputProps()} capture="environment" />
              <div className="absolute right-4 top-4 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                AI Powered ✨
              </div>
              <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-500 transition-transform group-hover:scale-110">
                <Camera className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Capture Paper</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Take a photo of an exam paper. We&apos;ll extract the details automatically.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: FILE PREVIEW (Mainly for Document Mode) */}
        {step === "file_preview" && file && (
          <motion.div
            key="file_preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-indigo-500/10 p-3 text-indigo-500">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium line-clamp-1">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button onClick={cancelUpload} className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{duplicateWarning}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={cancelUpload} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={() => processFileForAI(file)}
                disabled={!!duplicateWarning}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
              >
                Continue to Details
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: AI PROCESSING */}
        {step === "ai_processing" && (
          <motion.div
            key="ai_processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="relative rounded-full bg-emerald-500/20 p-4 text-emerald-500">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
            <h3 className="text-lg font-medium">Analyzing Document with AI...</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Extracting university, course, subject, and other academic details to save you time.
            </p>
          </motion.div>
        )}

        {/* STEP 4: METADATA FORM */}
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-semibold">Resource Details</h2>
                <p className="text-sm text-muted-foreground">
                  {mode === "capture" || isProcessing
                    ? "Please review and edit the AI-extracted details below." 
                    : "Fill in the details to help others find your resource."}
                </p>
              </div>
              <button onClick={cancelUpload} disabled={isSubmitting} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {similarWarning && (
              <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Possible Duplicate Detected</p>
                    <p className="mt-1">{similarWarning}</p>
                    <label className="mt-3 flex items-center gap-2 cursor-pointer font-medium">
                      <input 
                        type="checkbox" 
                        checked={ignoreSimilar}
                        onChange={(e) => setIgnoreSimilar(e.target.checked)}
                        className="rounded border-amber-500 text-amber-500 focus:ring-amber-500" 
                      />
                      I confirm this is a unique resource. Ignore warning.
                    </label>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Title <span className="text-destructive">*</span></label>
                  <input
                    {...register("title")}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Data Structures Mid-Term 2023"
                  />
                  {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Description <span className="text-destructive">*</span></label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Briefly describe what this resource contains..."
                  />
                  {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
                </div>

                {/* Type */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Resource Type <span className="text-destructive">*</span></label>
                  <select
                    {...register("type")}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select type...</option>
                    {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type.message}</p>}
                </div>

                {/* University */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">University <span className="text-destructive">*</span></label>
                  <input
                    {...register("university")}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. MIT, Stanford, Delhi University"
                  />
                  {errors.university && <p className="mt-1 text-xs text-destructive">{errors.university.message}</p>}
                </div>

                {/* Course */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Course/Degree <span className="text-destructive">*</span></label>
                  <input
                    {...register("course")}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. B.Tech Computer Science"
                  />
                  {errors.course && <p className="mt-1 text-xs text-destructive">{errors.course.message}</p>}
                </div>

                {/* Subject */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Subject <span className="text-destructive">*</span></label>
                  <input
                    {...register("subject")}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Data Structures"
                  />
                  {errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>}
                </div>

                {/* Semester & Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Semester <span className="text-destructive">*</span></label>
                    <input
                      type="number"
                      {...register("semester", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      min={1} max={8}
                    />
                    {errors.semester && <p className="mt-1 text-xs text-destructive">{errors.semester.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Year <span className="text-destructive">*</span></label>
                    <input
                      type="number"
                      {...register("year", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      min={2000} max={new Date().getFullYear()}
                    />
                    {errors.year && <p className="mt-1 text-xs text-destructive">{errors.year.message}</p>}
                  </div>
                </div>

                {/* Exam Type (Optional) */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Exam Type <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <select
                    {...register("examType")}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select if applicable...</option>
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Tags <span className="text-muted-foreground font-normal">(Comma separated)</span></label>
                  <input
                    {...register("tags")}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. algorithms, trees, important"
                  />
                  {errors.tags && <p className="mt-1 text-xs text-destructive">{errors.tags.message}</p>}
                </div>
              </div>

              {/* Submit Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={cancelUpload}
                  disabled={isSubmitting}
                  className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!!similarWarning && !ignoreSimilar)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Uploading..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-xl"
          >
            <div className="mb-6 rounded-full bg-emerald-500/10 p-4 text-emerald-500">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold">Upload Successful!</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Thank you for contributing! Your resource has been sent to our moderators for review. It will appear publicly once approved.
            </p>
            <div className="mt-8 flex gap-4">
              <button
                onClick={cancelUpload}
                className="rounded-lg border border-border bg-background px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Upload Another
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-lg bg-indigo-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
