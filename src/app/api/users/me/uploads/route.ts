import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";

export const dynamic = "force-dynamic";

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

    const uploads = await Resource.find({ "uploadedBy.userId": user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: uploads });
  } catch (error) {
    console.error("My Uploads API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
