import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/lib/db/models/User";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find resources where this user's clerkId is in the viewedBy array
    const viewedResources = await Resource.find({ viewedBy: clerkId })
      .sort({ updatedAt: -1 })
      .lean();

    // Format like normal resources
    const formatted = viewedResources.map((res: any) => {
      const { likes, viewedBy, ...safeResource } = res;
      return {
        ...safeResource,
        hasSaved: Array.isArray(user.savedResources) && user.savedResources.some((rid: any) => rid.toString() === res._id.toString()),
        hasLiked: Array.isArray(likes) && likes.some((uid: any) => uid.toString() === user._id.toString()),
        likesCount: Array.isArray(likes) ? likes.length : 0
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
