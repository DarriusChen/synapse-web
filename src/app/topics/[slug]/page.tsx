import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { TopicDetailView } from "@/features/topics/components/topic-detail";
import {
  getTopicDetail,
  getVisibleTopicCount,
} from "@/features/topics/lib/topic-detail";
import { readTopicStore } from "@/features/topics/lib/topic-store";

export const dynamic = "force-dynamic";

type TopicPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await readTopicStore();
  const detail = getTopicDetail(
    slug,
    store.topics,
    store.topicRelations,
    store.resources,
  );

  if (!detail) {
    return { title: "Topic not found" };
  }

  return {
    title: `${detail.topic.title} — Synapse`,
    description:
      detail.topic.shortDescription ??
      detail.topic.description ??
      `Learn about ${detail.topic.title} in the AI study group map.`,
  };
}

export default async function TopicPage({
  params,
  searchParams,
}: TopicPageProps) {
  const { slug } = await params;
  const { from } = await searchParams;
  const store = await readTopicStore();
  const detail = getTopicDetail(
    slug,
    store.topics,
    store.topicRelations,
    store.resources,
  );

  if (!detail) {
    notFound();
  }

  const fromTopics = from === "topics";

  return (
    <main className="topic-page">
      <SiteHeader
        active={fromTopics ? "topics" : undefined}
        visibleTopicCount={getVisibleTopicCount(store.topics)}
      />
      <TopicDetailView
        detail={detail}
        backHref={fromTopics ? "/topics" : "/#learning-map"}
        backLabel={fromTopics ? "Back to topics" : "Back to map"}
      />
    </main>
  );
}
