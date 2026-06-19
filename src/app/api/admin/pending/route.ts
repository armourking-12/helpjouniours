import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { PendingUpload } from "@/lib/db/models/PendingUpload";
import { User } from "@/lib/db/models/User";
import { auth } from "@clerk/nextjs/server";
import { ROLE_HIERARCHY } from "@/lib/constants";

export async function GET(request: Request) {
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

    // Fetch pending uploads sorted by oldest first
    const pending = await PendingUpload.find({ status: "pending" })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, data: pending });
  } catch (error) {
    console.error("Fetch Pending API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
