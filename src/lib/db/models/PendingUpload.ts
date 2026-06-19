import mongoose, { Schema, Document } from "mongoose";

export interface IPendingUpload extends Document {
  title: string;
  description: string;
  type: string;
  university: string;
  course: string;
  semester: number;
  subject: string;
  year: number;
  examType?: string;
  fileUrl: string; // The primary download URL
  fileName: string;
  fileSize: number;
  fileHash: string; // SHA-256 to prevent duplicates
  thumbnailUrl?: string;
  storageProvider: "cloudinary" | "github";
  uploadedBy: {
    userId: mongoose.Types.ObjectId;
    name: string;
    image?: string;
    reputation: number;
  };
  status: "pending" | "approved" | "rejected";
  tags: string[];
  aiExtractedText?: string;
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PendingUploadSchema = new Schema<IPendingUpload>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    university: { type: String, required: true },
    course: { type: String, required: true },
    semester: { type: Number, required: true },
    subject: { type: String, required: true },
    year: { type: Number, required: true },
    examType: { type: String },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileHash: { type: String, required: true, unique: true },
    thumbnailUrl: { type: String },
    storageProvider: { type: String, enum: ["cloudinary", "github"], required: true },
    uploadedBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      image: { type: String },
      reputation: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    tags: [{ type: String }],
    aiExtractedText: { type: String },
    moderatorNotes: { type: String },
  },
  { timestamps: true }
);

// Index to optimize the admin dashboard fetching pending uploads
PendingUploadSchema.index({ status: 1, createdAt: 1 });

export const PendingUpload = mongoose.models.PendingUpload || mongoose.model<IPendingUpload>("PendingUpload", PendingUploadSchema);
