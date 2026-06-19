import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyIdToken, setUserClaims, adminDb } from "@/lib/firebase/admin";
import { ROLE_HIERARCHY, COLLECTIONS } from "@/lib/constants";
import type { UserRole } from "@/types";

/**
 * PUT /api/auth/role
 *
 * Update a user's role. Only admins and super_admins can change roles.
 * Admins can promote/demote up to moderator. Super admins can set any role.
 *
 * Body: { targetUid: string, newRole: UserRole }
 * Headers: Authorization: Bearer <idToken>
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify caller's identity
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing authorization" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    const callerClaims = await verifyIdToken(idToken);

    // Get caller's profile from Firestore to check their role
    const callerDoc = await adminDb
      .collection(COLLECTIONS.users)
      .doc(callerClaims.uid)
      .get();

    if (!callerDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Caller profile not found" },
        { status: 404 }
      );
    }

    const callerProfile = callerDoc.data() as { role: UserRole };
    const callerLevel = ROLE_HIERARCHY[callerProfile.role];

    // Must be admin or higher to change roles
    if (callerLevel < ROLE_HIERARCHY.admin) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { targetUid, newRole } = body as {
      targetUid: string;
      newRole: UserRole;
    };

    if (!targetUid || !newRole) {
      return NextResponse.json(
        { success: false, error: "Missing targetUid or newRole" },
        { status: 400 }
      );
    }

    // Validate role
    if (!(newRole in ROLE_HIERARCHY)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    const newRoleLevel = ROLE_HIERARCHY[newRole];

    // Admins can only set roles below their own level
    if (newRoleLevel >= callerLevel && callerProfile.role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot assign a role equal or higher than your own",
        },
        { status: 403 }
      );
    }

    // Can't modify a user with equal or higher role (unless super_admin)
    const targetDoc = await adminDb
      .collection(COLLECTIONS.users)
      .doc(targetUid)
      .get();

    if (!targetDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Target user not found" },
        { status: 404 }
      );
    }

    const targetProfile = targetDoc.data() as { role: UserRole };
    const targetLevel = ROLE_HIERARCHY[targetProfile.role];

    if (targetLevel >= callerLevel && callerProfile.role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot modify a user with equal or higher role",
        },
        { status: 403 }
      );
    }

    // Update role in Firestore
    await adminDb
      .collection(COLLECTIONS.users)
      .doc(targetUid)
      .update({
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

    // Set custom claims for the user (accessible in ID tokens)
    await setUserClaims(targetUid, { role: newRole });

    return NextResponse.json({
      success: true,
      data: { uid: targetUid, role: newRole },
    });
  } catch (error) {
    console.error("Role update failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update role" },
      { status: 500 }
    );
  }
}
