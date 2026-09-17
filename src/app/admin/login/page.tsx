import { SiteHeader } from "@/components/site-header";
import { AdminLoginForm } from "@/features/admin/components/admin-login-form";
import { getVisibleTopicCount } from "@/features/topics/lib/topic-detail";
import { readTopicStore } from "@/features/topics/lib/topic-store";
import { safeAdminPath } from "@/lib/admin-session";

type AdminLoginPageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { from } = await searchParams;
  const store = await readTopicStore();

  return (
    <main className="topic-page">
      <SiteHeader
        active="admin"
        visibleTopicCount={getVisibleTopicCount(store.topics)}
      />
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
