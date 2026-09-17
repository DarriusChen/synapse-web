import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import {
  topicStatusLabels,
  topicStatusSymbols,
} from "@/features/topics/lib/labels";
import { getVisibleTopicCount } from "@/features/topics/lib/topic-detail";
import { readTopicStore } from "@/features/topics/lib/topic-store";
import { connectionCount } from "@/features/topics/lib/topic-write";

export const dynamic = "force-dynamic";

export default async function AdminTopicsPage() {
  const store = await readTopicStore();
  const topics = [...store.topics].toSorted((left, right) =>
    left.title.localeCompare(right.title),
  );

  return (
    <main className="topic-page">
      <SiteHeader
        active="admin"
        visibleTopicCount={getVisibleTopicCount(store.topics)}
      />

      <section className="admin-page">
        <div className="admin-page__header">
          <div>
            <p className="eyebrow">Topic management</p>
            <h1>Topics</h1>
          </div>
          <Link className="admin-page__action" href="/admin/topics/new">
            New topic
          </Link>
        </div>

        <ul className="admin-topic-list">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Link
                href={`/admin/topics/${topic.slug}`}
                data-testid={`admin-topic-${topic.slug}`}
              >
                <strong>{topic.title}</strong>
                <span>
                  {topicStatusSymbols[topic.status]}{" "}
                  {topicStatusLabels[topic.status]}
                </span>
                <span className="difficulty">{topic.difficulty}</span>
                <span>
                  {connectionCount(store.topicRelations, topic.id)} connections
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
