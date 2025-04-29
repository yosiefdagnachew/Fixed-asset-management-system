import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@/types/auth";

export async function apiMiddleware(
  req: NextRequest,
  requiredRole?: Role | Role[]
) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (requiredRole) {
    const userRole = token.role as Role;
    const hasRole = Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;

    if (!hasRole) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
  }

  return null;
} 