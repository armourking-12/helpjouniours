import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    let user = await User.findOne({ clerkId: clerkUser.id }).lean();

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";

    // Auto-sync mechanism: If user doesn't exist by clerkId, try to find them by email.
    if (!user && email) {
      user = await User.findOne({ email }).lean();
      if (user) {
        // Link the existing account to this Clerk ID
        await User.updateOne({ email }, { $set: { clerkId: clerkUser.id } });
        user.clerkId = clerkUser.id;
      }
    }

    // If they STILL don't exist, create them now.
    if (!user) {
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || "Student";
      
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

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("User Profile API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
