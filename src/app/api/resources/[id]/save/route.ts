import { NextResponse } from "next/server";
import mongoose from "mongoose";
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

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resource = await Resource.findById(id).lean();
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Toggle logic
    const hasSaved = user.savedResources.some((rid: any) => rid.toString() === id);

    if (hasSaved) {
      // Remove save
      user.savedResources = user.savedResources.filter((rid: any) => rid.toString() !== id);
    } else {
      // Add save
      user.savedResources.push(new mongoose.Types.ObjectId(id));
    }

    await user.save();

    return NextResponse.json({
      success: true,
      hasSaved: !hasSaved,
    });
  } catch (error) {
    console.error("Save API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
