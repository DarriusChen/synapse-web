"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  equalHex,
  safeAdminPath,
} from "@/lib/admin-session";

export type AdminLoginState = {
  error: string;
} | null;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function loginAdminAction(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const secret = process.env.ADMIN_PASSWORD;

  if (!secret) {
    return { error: "ADMIN_PASSWORD is not configured." };
  }

  const password = String(formData.get("password") ?? "");
  const submitted = await createAdminSessionToken(password);
  const expected = await createAdminSessionToken(secret);

  if (!equalHex(submitted, expected)) {
    return { error: "That password is incorrect." };
  }

  (await cookies()).set(ADMIN_COOKIE, expected, cookieOptions());
  redirect(safeAdminPath(String(formData.get("from") ?? "")));
}

export async function logoutAdminAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
