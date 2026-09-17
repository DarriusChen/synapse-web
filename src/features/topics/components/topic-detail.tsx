import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import {
  resourceTypeIcons,
  topicStatusLabels,
  topicStatusSymbols,
} from "@/features/topics/lib/labels";
import type { TopicDetail } from "@/features/topics/lib/topic-detail";
import type { Resource, Topic } from "@/features/topics/types";

type TopicDetailViewProps = {
  detail: TopicDetail;
  backHref?: string;
  backLabel?: string;
};

function topicPath(slug: string, fromTopics?: boolean) {
  return fromTopics ? `/topics/${slug}?from=topics` : `/topics/${slug}`;
}

function TopicLinkList({
  label,
  topics,
  testId,
  fromTopics,
}: {
  label: string;
  topics: Topic[];
  testId: string;
  fromTopics?: boolean;
}) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <section className="topic-section" aria-labelledby={`${testId}-heading`}>
      <h2 id={`${testId}-heading`}>{label}</h2>
      <ul className="topic-link-list" data-testid={testId}>
        {topics.map((topic) => (
          <li key={topic.id}>
            <Link href={topicPath(topic.slug, fromTopics)}>{topic.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResourceList({
  label,
  items,
  testId,
}: {
  label: string;
  items: Resource[];
  testId: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="topic-section" aria-labelledby={`${testId}-heading`}>
      <h2 id={`${testId}-heading`}>{label}</h2>
      <ul className="resource-list" data-testid={testId}>
        {items.map((resource) => (
          <li key={resource.id}>
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
            >
              <span aria-hidden="true">{resourceTypeIcons[resource.type]}</span>
              <span>{resource.title}</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TopicDetailView({
  detail,
  backHref = "/#learning-map",
  backLabel = "Back to map",
}: TopicDetailViewProps) {
  const { topic, prerequisites, related, resources, notes } = detail;
  const fromTopics = backHref === "/topics";

  return (
    <article className="topic-detail" data-testid="topic-detail">
      <Link className="topic-back" href={backHref}>
        <ArrowLeft size={16} aria-hidden="true" />
        {backLabel}
      </Link>

      <header className="topic-detail__header">
        <p className="eyebrow">{topic.category}</p>
        <h1>{topic.title}</h1>
        {topic.shortDescription ? (
          <p className="topic-detail__subtitle">{topic.shortDescription}</p>
        ) : null}

        <div className="topic-detail__meta">
          <span className={`status status--${topic.status}`}>
            <span aria-hidden="true">{topicStatusSymbols[topic.status]}</span>
            {topicStatusLabels[topic.status]}
          </span>
          <span className={`difficulty difficulty--${topic.difficulty}`}>
            {topic.difficulty}
          </span>
        </div>
      </header>

      {topic.description ? (
        <section className="topic-section" aria-labelledby="about-heading">
          <h2 id="about-heading">About</h2>
          <p data-testid="topic-about">{topic.description}</p>
        </section>
      ) : null}

      <TopicLinkList
        label="Prerequisites"
        topics={prerequisites}
        testId="topic-prerequisites"
        fromTopics={fromTopics}
      />
      <TopicLinkList
        label="Related topics"
        topics={related}
        testId="topic-related"
        fromTopics={fromTopics}
      />
      <ResourceList
        label="Resources"
        items={resources}
        testId="topic-resources"
      />
      <ResourceList
        label="Study notes"
        items={notes}
        testId="topic-notes"
      />
    </article>
  );
}
