import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_COOKIE,
  isAdminSessionToken,
} from "@/lib/admin-session";

export async function assertAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;

  if (!(await isAdminSessionToken(token))) {
    redirect("/admin/login");
  }
}
