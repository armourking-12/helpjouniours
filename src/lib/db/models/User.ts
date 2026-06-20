import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId?: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  // Custom fields
  role: "student" | "moderator" | "admin" | "super_admin";
  reputation: number;
  savedResources: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    role: {
      type: String,
      enum: ["student", "moderator", "admin", "super_admin"],
      default: "student",
    },
    reputation: { type: Number, default: 0 },
    savedResources: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
