import { SiteHeader } from "@/components/site-header";
import { AdminLoginForm } from "@/features/admin/components/admin-login-form";
import { safeAdminPath } from "@/lib/admin-session";

type AdminLoginPageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { from } = await searchParams;

  return (
    <main className="topic-page">
      <SiteHeader active="admin" />
      <section className="admin-page">
        <p className="eyebrow">Organizer access</p>
        <h1>Admin sign in</h1>
        <p className="hero__description">
          Topic management is limited to organizers.
        </p>
        <AdminLoginForm from={safeAdminPath(from)} />
      </section>
    </main>
  );
}
