import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { TopicIndex } from "@/features/topics/components/topic-index";
import {
  getVisibleTopicCount,
  getVisibleTopics,
} from "@/features/topics/lib/topic-detail";
import { readTopicStore } from "@/features/topics/lib/topic-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Topics — Synapse",
  description: "Browse the AI study group curriculum as a read-only topic list.",
};

export default async function TopicsPage() {
  const store = await readTopicStore();
  const topics = [...getVisibleTopics(store.topics)].toSorted((left, right) =>
    left.title.localeCompare(right.title),
  );

  return (
    <main className="topic-page">
      <SiteHeader
        active="topics"
        visibleTopicCount={getVisibleTopicCount(store.topics)}
      />
      <TopicIndex topics={topics} />
    </main>
  );
}
