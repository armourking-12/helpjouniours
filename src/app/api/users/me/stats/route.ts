import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { Resource } from "@/lib/db/models/Resource";
import { Notification } from "@/lib/db/models/Notification";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Fetch user data (for reputation)
    let user = await User.findOne({ clerkId }).select("_id reputation").lean();
    
    if (!user) {
      // Auto-sync mechanism: If user doesn't exist, create them
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: "User profile not found and could not sync" }, { status: 404 });
      }
      
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || "Student";
      
      let existingUser = await User.findOne({ email }).lean();
      if (existingUser) {
        await User.updateOne({ email }, { $set: { clerkId: clerkUser.id } });
        user = { _id: existingUser._id, reputation: existingUser.reputation || 0 };
      } else {
        const newUser = await User.create({
          clerkId: clerkUser.id,
          email,
          name,
          image: clerkUser.imageUrl,
          emailVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
          role: "student",
          reputation: 0,
        });
        user = { _id: newUser._id, reputation: 0 };
      }
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
