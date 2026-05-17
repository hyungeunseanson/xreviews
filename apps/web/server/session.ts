import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const USER_ROLES = ["user", "business", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers()
  });
}

export async function requireUser() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(role: UserRole | UserRole[]) {
  const session = await requireUser();
  const allowedRoles = Array.isArray(role) ? role : [role];
  const currentRole = session.user.role;

  if (!isUserRole(currentRole) || !allowedRoles.includes(currentRole)) {
    redirect("/account?error=forbidden");
  }

  return session;
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireBusinessOrAdmin() {
  return requireRole(["business", "admin"]);
}
