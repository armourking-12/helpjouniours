import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { PendingUpload } from "@/lib/db/models/PendingUpload";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";
import { Notification } from "@/lib/db/models/Notification";
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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "PendingUpload ID required" }, { status: 400 });
    }


    const pending = await PendingUpload.findById(id);
    if (!pending) {
      return NextResponse.json({ error: "PendingUpload not found" }, { status: 404 });
    }

    // 1. Create the approved Resource
    const newResource = await Resource.create({
      title: pending.title,
      description: pending.description,
      type: pending.type,
      university: pending.university,
      course: pending.course,
      semester: pending.semester,
      subject: pending.subject,
      year: pending.year,
      examType: pending.examType,
      fileUrl: pending.fileUrl,
      fileName: pending.fileName,
      fileSize: pending.fileSize,
      fileHash: pending.fileHash,
      thumbnailUrl: pending.thumbnailUrl,
      storageProvider: pending.storageProvider,
      uploadedBy: pending.uploadedBy,
      status: "approved",
      tags: pending.tags,
    });

    // 2. Increment Uploader's Reputation (+10)
    await User.findByIdAndUpdate(pending.uploadedBy.userId, {
      $inc: { reputation: 10 }
    });

    // 3. Send Notification to Uploader
    await Notification.create({
      userId: pending.uploadedBy.userId,
      title: "Upload Approved",
      message: `Your upload "${pending.title}" has been approved! You earned +10 reputation.`,
      type: "upload_approved",
      link: `/resources`, // Could link to specific resource page if dynamic pages exist
    });

    // 4. Delete the PendingUpload
    await PendingUpload.findByIdAndDelete(id);

    return NextResponse.json({ success: true, resourceId: newResource._id });
  } catch (error) {
    console.error("Approve API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
