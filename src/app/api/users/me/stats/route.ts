import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { Resource } from "@/lib/db/models/Resource";
import { Notification } from "@/lib/db/models/Notification";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Fetch user data (for reputation)
    const user = await User.findOne({ clerkId }).select("_id reputation").lean();
    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const userId = user._id;

    // 2. Aggregate stats (total uploads, total downloads)
    const resources = await Resource.find({ "uploadedBy.userId": userId }).select("status downloads").lean();
    
    const approvedUploads = resources.filter(r => r.status === "approved").length;
    const pendingUploads = resources.filter(r => r.status === "pending").length;
    
    const totalDownloads = resources.reduce((acc, curr) => acc + (curr.downloads || 0), 0);

    // 3. Fetch recent notifications
    const recentNotifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const unreadCount = recentNotifications.filter(n => !n.read).length;

    return NextResponse.json({
      success: true,
      data: {
        reputation: user?.reputation || 0,
        approvedUploads,
        pendingUploads,
        totalDownloads,
        notifications: recentNotifications,
        unreadNotifications: unreadCount,
      }
    });

  } catch (error) {
    console.error("User Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
