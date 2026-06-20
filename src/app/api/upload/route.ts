import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/db/mongoose";
import { PendingUpload } from "@/lib/db/models/PendingUpload";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";
import { uploadResource } from "@/lib/storage/index";
import { auth, currentUser } from "@clerk/nextjs/server";

export const maxDuration = 60; // Allow long uploads

export async function POST(request: Request) {
  try {
    // 1. Authenticate user via Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 2. Find or create Mongo user profile
    let user = await User.findOne({ clerkId: userId }).lean();
    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: "User profile not found and could not be synced" }, { status: 403 });
      }
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || "Student";
      const existingUser = await User.findOne({ email }).lean();
      if (existingUser) {
        await User.updateOne({ email }, { $set: { clerkId: clerkUser.id } });
        user = existingUser;
        user.clerkId = clerkUser.id;
      } else {
        const newUser = await User.create({
          clerkId: clerkUser.id,
          email,
          name,
          image: clerkUser.imageUrl,
          emailVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
          role: "student",
          reputation: 0,
        });
        user = newUser.toObject();
      }
    }

    // 3. Simple in‑memory rate limiting (10 requests per minute per IP)
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 60 * 1000;
    const limit = 10;
    // Rate limit map stored on globalThis for serverless persistence within a single instance
    const rateLimitMap: Map<string, { count: number; start: number }> =
      (globalThis as any).__rateLimitMap || new Map();
    (globalThis as any).__rateLimitMap = rateLimitMap;
    const record = rateLimitMap.get(ip) || { count: 0, start: now };
    if (now - record.start > windowMs) {
      record.count = 1;
      record.start = now;
    } else {
      record.count += 1;
    }
    rateLimitMap.set(ip, record);
    if (record.count > limit) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // 4. Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const ignoreSimilar = formData.get("ignoreSimilar") === "true";

    // 5. Server‑side validation via zod
    const uploadData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      university: formData.get("university") as string,
      course: formData.get("course") as string,
      semester: parseInt(formData.get("semester") as string),
      subject: formData.get("subject") as string,
      year: parseInt(formData.get("year") as string),
      examType: formData.get("examType") as string | undefined,
      tags: (formData.get("tags") as string | null) || "",
    };
    const { uploadSchema } = await import("@/lib/validations");
    const validation = uploadSchema.safeParse(uploadData);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid form data", details: validation.error.issues }, { status: 400 });
    }
    const tags = uploadData.tags.split(",").map(t => t.trim()).filter(Boolean);

    // 6. Basic file checks (size & type)
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds the 25MB limit." }, { status: 400 });
    }
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file format. Only PDF, DOCX, PPTX, and Images are allowed." }, { status: 400 });
    }

    // 7. Generate SHA‑256 hash for duplicate detection
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 8. Exact duplicate checks
    const existingApproved = await Resource.findOne({ fileHash });
    if (existingApproved) {
      return NextResponse.json({ error: "EXACT_DUPLICATE", message: "This exact file already exists in the approved resources database." }, { status: 409 });
    }
    const existingPending = await PendingUpload.findOne({ fileHash });
    if (existingPending) {
      return NextResponse.json({ error: "EXACT_DUPLICATE", message: "This exact file is already pending approval." }, { status: 409 });
    }

    // 9. Similar duplicate check (metadata) – unless user opted to ignore
    if (!ignoreSimilar) {
      const similarQuery = {
        university: { $regex: new RegExp(`^${uploadData.university}$`, "i") },
        course: { $regex: new RegExp(`^${uploadData.course}$`, "i") },
        semester: uploadData.semester,
        subject: { $regex: new RegExp(`^${uploadData.subject}$`, "i") },
        year: uploadData.year,
        examType: uploadData.examType || { $exists: false },
      };
      const similarApproved = await Resource.findOne(similarQuery);
      const similarPending = await PendingUpload.findOne(similarQuery);
      if (similarApproved || similarPending) {
        return NextResponse.json({ error: "SIMILAR_DUPLICATE", message: "A resource with similar metadata already exists. Confirm upload?" }, { status: 409 });
      }
    }

    // 10. Upload file to storage (Cloudinary or GitHub)
    const { url, provider } = await uploadResource(buffer, file.name, file.type, {
      university: uploadData.university,
      course: uploadData.course,
      semester: uploadData.semester,
      subject: uploadData.subject,
      year: uploadData.year,
      examType: uploadData.examType || "",
    });

    // 11. Save the new resource (auto‑approved)
    const newResource = await Resource.create({
      title: uploadData.title,
      description: uploadData.description,
      type: uploadData.type,
      university: uploadData.university,
      course: uploadData.course,
      semester: uploadData.semester,
      subject: uploadData.subject,
      year: uploadData.year,
      examType: uploadData.examType || null,
      fileUrl: url,
      fileName: file.name,
      fileSize: file.size,
      fileHash,
      storageProvider: provider,
      uploadedBy: {
        userId: user._id,
        name: user.name || "Student",
        image: user.image,
        reputation: (user as any).reputation || 0,
      },
      status: "approved",
      tags,
    });

    // 12. Award reputation to uploader (+10)
    await User.findByIdAndUpdate(user._id, { $inc: { reputation: 10 } });

    return NextResponse.json({ success: true, resourceId: newResource._id });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
