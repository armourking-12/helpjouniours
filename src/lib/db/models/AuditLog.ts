import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: "approve_resource" | "reject_resource" | "change_role" | "delete_user";
  targetId: mongoose.Types.ObjectId | string;
  details?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["approve_resource", "reject_resource", "change_role", "delete_user"],
      required: true,
    },
    targetId: { type: Schema.Types.Mixed, required: true },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
