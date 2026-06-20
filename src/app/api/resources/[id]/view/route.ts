import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get unique identifier: either userId or IP address
    const { userId } = await auth();
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown-ip";
    const identifier = userId || ip;

    await connectToDatabase();

    const resource = await Resource.findById(id);
    
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Initialize viewedBy if it doesn't exist
    if (!resource.viewedBy) {
      resource.viewedBy = [];
    }

    // Check if the identifier has already viewed this resource
    if (!resource.viewedBy.includes(identifier)) {
      resource.viewedBy.push(identifier);
      resource.views += 1;
      await resource.save();
    }

    return NextResponse.json({ success: true, views: resource.views });
  } catch (error) {
    console.error("View API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
