import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Try to create a dummy user
    const newUser = await User.create({
      clerkId: "test_clerk_id_" + Date.now(),
      email: "test_" + Date.now() + "@example.com",
      name: "Test User",
      emailVerified: true,
      role: "student",
      reputation: 0,
    });

    return NextResponse.json({ success: true, data: newUser });
  } catch (error: any) {
    console.error("Test DB Error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
