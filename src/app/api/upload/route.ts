import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/db/mongoose";
import { PendingUpload } from "@/lib/db/models/PendingUpload";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";
import { uploadResource } from "@/lib/storage/index";
import { auth } from "@clerk/nextjs/server";

export const maxDuration = 60; // Allow long uploads

export async function POST(request: Request) {
  try {
    // 1. Authenticate user via Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch Mongo user profile for reputation tracking
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const ignoreSimilar = formData.get("ignoreSimilar") === "true";
    
    // Metadata
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const university = formData.get("university") as string;
    const course = formData.get("course") as string;
    const semester = parseInt(formData.get("semester") as string);
    const subject = formData.get("subject") as string;
    const year = parseInt(formData.get("year") as string);
    const examType = formData.get("examType") as string;
    const tagsRaw = formData.get("tags") as string;
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

    if (!file || !title || !description || !type || !university || !course || !semester || !subject || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. (Removed duplicate DB connection)

    // 4. Generate Hash
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 5. Exact Duplicate Check (Hash)
    const existingApproved = await Resource.findOne({ fileHash });
    if (existingApproved) {
      return NextResponse.json(
        { error: "EXACT_DUPLICATE", message: "This exact file already exists in the approved resources database." },
        { status: 409 }
      );
    }
    const existingPending = await PendingUpload.findOne({ fileHash });
    if (existingPending) {
      return NextResponse.json(
        { error: "EXACT_DUPLICATE", message: "This exact file is already pending approval." },
        { status: 409 }
      );
    }

    // 6. Similar Duplicate Check (Metadata)
    if (!ignoreSimilar) {
      const similarQuery = {
        university: { $regex: new RegExp(`^${university}$`, "i") },
        course: { $regex: new RegExp(`^${course}$`, "i") },
        semester,
        subject: { $regex: new RegExp(`^${subject}$`, "i") },
        year,
        examType: examType || { $exists: false }
      };

      const similarApproved = await Resource.findOne(similarQuery);
      const similarPending = await PendingUpload.findOne(similarQuery);

      if (similarApproved || similarPending) {
        return NextResponse.json(
          { 
            error: "SIMILAR_DUPLICATE", 
            message: "A resource for this specific university, course, subject, year, and exam type already exists. Are you sure you want to upload this?" 
          },
          { status: 409 }
        );
      }
    }

    // 7. Upload to Storage (Cloudinary/GitHub)
    const { url, provider } = await uploadResource(
      buffer,
      file.name,
      file.size,
      { university, course, semester, subject, year, examType }
    );

    // 8. Save to MongoDB
    const pendingUpload = await PendingUpload.create({
      title,
      description,
      type,
      university,
      course,
      semester,
      subject,
      year,
      examType: examType || null,
      fileUrl: url,
      fileName: file.name,
      fileSize: file.size,
      fileHash,
      storageProvider: provider,
      uploadedBy: {
        userId: user.id,
        name: user.name || "Student",
        image: user.image,
        reputation: (user as any).reputation || 0,
      },
      status: "pending",
      tags,
    });

    return NextResponse.json({ success: true, pendingUploadId: pendingUpload._id });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
