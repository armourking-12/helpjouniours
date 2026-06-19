import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { Resource } from "@/lib/db/models/Resource";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch top 50 users by reputation
    const topUsers = await User.find({})
      .sort({ reputation: -1 })
      .limit(50)
      .select("name image reputation role createdAt")
      .lean();

    // For the UI, we might also want to know how many uploads they have.
    // To do this efficiently, we can aggregate or just do a quick count per user.
    // For a leaderboard of 50, Promise.all on counts is acceptable, or better, aggregation.
    
    const enrichedUsers = await Promise.all(
      topUsers.map(async (user: any) => {
        const uploadCount = await Resource.countDocuments({ "uploadedBy.userId": user._id, status: "approved" });
        return {
          id: user._id.toString(),
          name: user.name,
          image: user.image,
          reputation: user.reputation,
          role: user.role,
          totalUploads: uploadCount,
          joinedAt: user.createdAt,
        };
      })
    );

    return NextResponse.json({ success: true, data: enrichedUsers });
  } catch (error) {
    console.error("Leaderboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
