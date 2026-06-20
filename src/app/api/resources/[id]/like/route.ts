import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Toggle logic
    const hasLiked = resource.likes.some((uid: any) => uid.toString() === user._id.toString());

    if (hasLiked) {
      // Remove like
      resource.likes = resource.likes.filter((uid: any) => uid.toString() !== user._id.toString());
    } else {
      // Add like
      resource.likes.push(user._id);
    }

    await resource.save();

    return NextResponse.json({
      success: true,
      hasLiked: !hasLiked,
      likesCount: resource.likes.length,
    });
  } catch (error) {
    console.error("Like API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
