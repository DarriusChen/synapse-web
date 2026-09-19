import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_COOKIE,
  isAdminSessionToken,
} from "@/lib/admin-session";

export async function hasAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return isAdminSessionToken(token);
}

export async function assertAdmin() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }
}
