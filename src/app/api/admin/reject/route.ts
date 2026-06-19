import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { PendingUpload } from "@/lib/db/models/PendingUpload";
import { User } from "@/lib/db/models/User";
import { Notification } from "@/lib/db/models/Notification";
import { deleteResource } from "@/lib/storage/index";
import { auth } from "@clerk/nextjs/server";
import { ROLE_HIERARCHY } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Role Check
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user || ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.moderator) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { id, reason } = body;

    if (!id) {
      return NextResponse.json({ error: "PendingUpload ID required" }, { status: 400 });
    }


    const pending = await PendingUpload.findById(id);
    if (!pending) {
      return NextResponse.json({ error: "PendingUpload not found" }, { status: 404 });
    }

    // 1. Delete the physical file from Cloudinary/GitHub
    // For Cloudinary, we might need publicId, but our upload routes might not have saved it in PendingUpload.
    // If it's a URL, we'll try to extract the publicId in the deleteResource function.
    try {
      await deleteResource(pending.fileUrl, pending.storageProvider);
    } catch (e) {
      console.warn("Failed to delete physical resource, continuing DB cleanup...", e);
    }

    // 2. Decrement Uploader's Reputation (-5)
    await User.findByIdAndUpdate(pending.uploadedBy.userId, {
      $inc: { reputation: -5 }
    });

    // 3. Send Notification to Uploader
    const rejectionReason = reason ? `Reason: ${reason}` : "It did not meet our guidelines.";
    await Notification.create({
      userId: pending.uploadedBy.userId,
      title: "Upload Rejected",
      message: `Your upload "${pending.title}" was rejected. ${rejectionReason} You lost 5 reputation.`,
      type: "upload_rejected",
    });

    // 4. Delete the PendingUpload
    await PendingUpload.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reject API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
