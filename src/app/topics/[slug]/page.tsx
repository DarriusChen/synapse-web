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

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
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

  return (
    <main className="topic-page">
      <SiteHeader visibleTopicCount={getVisibleTopicCount(store.topics)} />
      <TopicDetailView detail={detail} />
    </main>
  );
}
