import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";
    const university = searchParams.get("university") || "";
    const sort = searchParams.get("sort") || "recent";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12;

    await connectToDatabase();

    // Build query
    const query: any = { status: "approved" };

    if (q) {
      // Simple regex search across title, subject, course, and tags
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { course: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    if (type) {
      query.type = type;
    }

    if (university) {
      query.university = { $regex: university, $options: "i" };
    }

    // Build sort
    let sortOptions: any = { createdAt: -1 };
    if (sort === "popular") sortOptions = { downloads: -1, views: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };

    // Execute
    const skip = (page - 1) * limit;
    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Resource.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: resources,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch Resources API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
