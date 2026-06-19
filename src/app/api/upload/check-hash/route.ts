import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { PendingUpload } from "@/lib/db/models/PendingUpload";
import { Resource } from "@/lib/db/models/Resource";

export async function POST(request: Request) {
  try {
    const { hash } = await request.json();
    
    if (!hash) {
      return NextResponse.json({ error: "Hash required" }, { status: 400 });
    }

    await connectToDatabase();

    const existingApproved = await Resource.findOne({ fileHash: hash });
    if (existingApproved) {
      return NextResponse.json({ isDuplicate: true, message: "This file already exists in our database." });
    }

    const existingPending = await PendingUpload.findOne({ fileHash: hash });
    if (existingPending) {
      return NextResponse.json({ isDuplicate: true, message: "This file is already pending approval." });
    }

    return NextResponse.json({ isDuplicate: false });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
