import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, type, university, course, semester, subject, year } = body;

    const { id } = await params;
    await connectToDatabase();

    const user = await User.findOne({ clerkId }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Check if the user is the owner or an admin
    const isOwner = resource.uploadedBy.userId.toString() === user._id.toString();
    const isAdmin = user.role === "admin" || user.role === "super_admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You don't own this resource" }, { status: 403 });
    }

    // Update fields
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (type) resource.type = type;
    if (university) resource.university = university;
    if (course) resource.course = course;
    if (semester) resource.semester = Number(semester);
    if (subject) resource.subject = subject;
    if (year) resource.year = Number(year);

    // Note: We leave the `status` unchanged, so if it was approved, it remains approved.
    
    await resource.save();

    return NextResponse.json({
      success: true,
      message: "Resource updated successfully",
      data: resource
    });
  } catch (error) {
    console.error("Edit Resource API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
