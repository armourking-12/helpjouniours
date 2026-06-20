import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";
import { deleteResource } from "@/lib/storage/index";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json({ error: "Forbidden: You can only delete your own resources" }, { status: 403 });
    }

    // Delete from storage
    try {
      await deleteResource(resource.fileUrl, resource.storageProvider);
    } catch (storageError) {
      console.warn("Failed to delete physical resource from storage, continuing DB cleanup...", storageError);
    }

    // Delete from DB
    await Resource.findByIdAndDelete(id);

    // If the resource was approved and the user is deleting it themselves, 
    // remove the reputation they gained to prevent upload-delete reputation farming.
    if (isOwner && resource.status === "approved") {
      await User.findByIdAndUpdate(user._id, { $inc: { reputation: -10 } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Resource API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
