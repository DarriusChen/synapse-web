import { assertAdmin } from "@/lib/admin-guard";

export default async function AdminTopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertAdmin();
  return children;
}
