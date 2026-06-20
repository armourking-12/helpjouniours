import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { Resource } from "@/lib/db/models/Resource";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId }).populate("savedResources").lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const savedResources = user.savedResources || [];

    // Format like normal resources but mark them as saved
    const formatted = savedResources.map((res: any) => {
      const { likes, viewedBy, ...safeResource } = res;
      return {
        ...safeResource,
        hasSaved: true,
        hasLiked: Array.isArray(res.likes) && res.likes.some((uid: any) => uid.toString() === user._id.toString()),
        likesCount: Array.isArray(res.likes) ? res.likes.length : 0
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error("Saved Resources API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
