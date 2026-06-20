import mongoose, { Schema, Document } from "mongoose";

export interface IResource extends Document {
  title: string;
  description: string;
  type: string;
  university: string;
  course: string;
  semester: number;
  subject: string;
  year: number;
  examType?: string;
  fileUrl: string; // The primary download URL (Cloudinary or GitHub)
  fileName: string;
  fileSize: number;
  fileHash: string; // SHA-256 to prevent duplicates
  thumbnailUrl?: string; // Cloudinary auto-generated thumbnail
  storageProvider: "cloudinary" | "github"; // Track where it's stored
  uploadedBy: {
    userId: mongoose.Types.ObjectId;
    name: string;
    image?: string;
    reputation: number;
  };
  status: "pending" | "approved" | "rejected";
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  downloads: number;
  views: number;
  viewedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
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
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    viewedBy: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes for query optimization ("low effort to work" but extremely fast)
ResourceSchema.index({ status: 1, createdAt: -1 }); // Used for default feed sorting
ResourceSchema.index({ type: 1, status: 1 }); // Used for fast filtering by type
ResourceSchema.index({ university: 1, course: 1, subject: 1 }); // Used for fast filtering
ResourceSchema.index({ "uploadedBy.userId": 1 }); // Used for user profile lookups
ResourceSchema.index({ downloads: -1, views: -1 }); // Used for popular sorting

export const Resource = mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema);
