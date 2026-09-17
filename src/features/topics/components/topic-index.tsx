import Link from "next/link";

import {
  topicStatusLabels,
  topicStatusSymbols,
} from "@/features/topics/lib/labels";
import type { Topic } from "@/features/topics/types";

type TopicIndexProps = {
  topics: Topic[];
};

export function TopicIndex({ topics }: TopicIndexProps) {
  return (
    <section className="topic-index">
      <p className="eyebrow">Shared curriculum</p>
      <h1>Topics</h1>
      {topics.length === 0 ? (
        <p className="hero__description">No topics to browse yet.</p>
      ) : (
        <ul className="topic-list">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Link
                href={`/topics/${topic.slug}?from=topics`}
                data-testid={`topic-index-${topic.slug}`}
              >
                <strong>{topic.title}</strong>
                <span className={`status status--${topic.status}`}>
                  <span aria-hidden="true">
                    {topicStatusSymbols[topic.status]}
                  </span>
                  {topicStatusLabels[topic.status]}
                </span>
                <span className={`difficulty difficulty--${topic.difficulty}`}>
                  {topic.difficulty}
                </span>
                <span>{topic.category ?? "Uncategorized"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
