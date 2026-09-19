import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { createTopicAction } from "@/features/topics/actions";
import { TopicForm } from "@/features/topics/components/topic-form";
import { getVisibleTopicCount } from "@/features/topics/lib/topic-detail";
import { readTopicStore } from "@/features/topics/lib/topic-store";

export const dynamic = "force-dynamic";

export default async function NewTopicPage() {
  const store = await readTopicStore();

  return (
    <main className="topic-page">
      <SiteHeader
        active="admin"
        visibleTopicCount={getVisibleTopicCount(store.topics)}
      />

      <section className="admin-page">
        <Link className="topic-back" href="/admin/topics">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to topics
        </Link>
        <p className="eyebrow">Topic management</p>
        <h1>Create topic</h1>
        <TopicForm
          action={createTopicAction}
          topics={store.topics}
          submitLabel="Save topic"
        />
      </section>
    </main>
  );
}
