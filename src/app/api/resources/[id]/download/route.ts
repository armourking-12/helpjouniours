import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";
import { Notification } from "@/lib/db/models/Notification";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const resource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Milestone gamification logic
    // Give uploader +5 reputation for every 50 downloads
    if (resource.downloads > 0 && resource.downloads % 50 === 0) {
      await User.findByIdAndUpdate(resource.uploadedBy.userId, {
        $inc: { reputation: 5 }
      });

      await Notification.create({
        userId: resource.uploadedBy.userId,
        title: "Download Milestone Reached!",
        message: `Your resource "${resource.title}" just reached ${resource.downloads} downloads! You earned +5 reputation.`,
        type: "milestone_reached",
        link: `/resources`,
      });
    }

    return NextResponse.json({ success: true, downloads: resource.downloads });
  } catch (error) {
    console.error("Download API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
