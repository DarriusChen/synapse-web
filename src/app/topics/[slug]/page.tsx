import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { TopicDetailView } from "@/features/topics/components/topic-detail";
import {
  getTopicDetail,
  getTopicSlugs,
} from "@/features/topics/lib/topic-detail";

type TopicPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = getTopicDetail(slug);

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
  const detail = getTopicDetail(slug);

  if (!detail) {
    notFound();
  }

  return (
    <main className="topic-page">
      <SiteHeader />
      <TopicDetailView detail={detail} />
    </main>
  );
}
