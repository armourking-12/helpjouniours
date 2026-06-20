import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const aggregation = await Resource.aggregate([
      { $match: { status: "approved" } },
      { 
        $group: { 
          _id: { $toUpper: "$university" }, 
          name: { $first: "$university" },
          resources: { $sum: 1 },
          uniqueCourses: { $addToSet: { $toUpper: "$course" } }
        } 
      },
      {
        $project: {
          _id: 0,
          name: 1,
          resources: 1,
          courses: { $size: "$uniqueCourses" }
        }
      },
      { $sort: { resources: -1 } }
    ]);

    // Format for the frontend
    const universities = aggregation.map(item => ({
      name: item.name,
      location: "India", // We don't have location in DB, default to India
      resources: item.resources,
      courses: item.courses,
      abbr: item.name.split(' ').map((word: string) => word[0]).join('').substring(0, 3).toUpperCase()
    }));

    return NextResponse.json({ success: true, data: universities });
  } catch (error) {
    console.error("Universities API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch universities" },
      { status: 500 }
    );
  }
}
