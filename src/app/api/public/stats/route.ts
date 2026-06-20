import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { Resource } from "@/lib/db/models/Resource";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch total users
    const totalUsers = await User.countDocuments();

    // Fetch total resources (approved only)
    const totalResources = await Resource.countDocuments({ status: "approved" });

    // Sum all downloads across all resources
    const downloadsAggregation = await Resource.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, totalDownloads: { $sum: "$downloads" } } }
    ]);
    
    const totalDownloads = downloadsAggregation.length > 0 ? downloadsAggregation[0].totalDownloads : 0;

    // Optional: Count unique universities, but that might be heavy. Let's just return a static number or estimate based on distinct values if small.
    const universitiesList = await Resource.distinct("university", { status: "approved" });
    const totalUniversities = Math.max(universitiesList.length, 1); // at least 1

    return NextResponse.json({
      success: true,
      data: {
        users: totalUsers,
        resources: totalResources,
        downloads: totalDownloads,
        universities: totalUniversities
      }
    });
  } catch (error) {
    console.error("Public Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch public stats" },
      { status: 500 }
    );
  }
}
