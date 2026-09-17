import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { updateTopicAction } from "@/features/topics/actions";
import { TopicForm } from "@/features/topics/components/topic-form";
import { getTopicBySlug, getVisibleTopicCount } from "@/features/topics/lib/topic-detail";
import { readTopicStore } from "@/features/topics/lib/topic-store";
import {
  incomingPrerequisiteIds,
  relatedTopicIds,
} from "@/features/topics/lib/topic-write";

export const dynamic = "force-dynamic";

type EditTopicPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditTopicPage({ params }: EditTopicPageProps) {
  const { slug } = await params;
  const store = await readTopicStore();
  const topic = getTopicBySlug(slug, store.topics);

  if (!topic) {
    notFound();
  }

  return (
    <main className="topic-page">
      <SiteHeader
        active="admin"
        visibleTopicCount={getVisibleTopicCount(store.topics)}
      />

      <section className="admin-page">
        <Link className="topic-back" href="/admin/topics">
          Back to topics
        </Link>
        <p className="eyebrow">Topic management</p>
        <h1>Edit {topic.title}</h1>
        <TopicForm
          action={updateTopicAction}
          topics={store.topics}
          topic={topic}
          selectedPrerequisiteIds={incomingPrerequisiteIds(
            store.topicRelations,
            topic.id,
          )}
          selectedRelatedIds={relatedTopicIds(store.topicRelations, topic.id)}
          submitLabel="Save changes"
        />
      </section>
    </main>
  );
}
