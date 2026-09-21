import Link from "next/link";

import { ResetToLearnMenu } from "@/features/topics/components/reset-to-learn-button";
import {
  topicStatusLabels,
  topicStatusSymbols,
} from "@/features/topics/lib/labels";
import {
  canResetTopicStatusToLearn,
  connectionCount,
} from "@/features/topics/lib/topic-write";
import type { Topic, TopicRelation } from "@/features/topics/types";

type AdminTopicListProps = {
  topics: Topic[];
  relations: TopicRelation[];
  actionLabel: "Organize" | "Edit";
};

export function AdminTopicList({
  topics,
  relations,
  actionLabel,
}: AdminTopicListProps) {
  return (
    <ul className="admin-topic-list">
      {topics.map((topic) => (
        <li key={topic.id}>
          <div className="admin-topic-list__item">
            <Link
              className="admin-topic-list__hit"
              href={`/admin/topics/${topic.slug}`}
              data-testid={`admin-topic-${topic.slug}`}
            >
              <span className="sr-only">{actionLabel} {topic.title}</span>
            </Link>
            <strong>{topic.title}</strong>
            <span className="admin-topic-list__status">
              <span className="admin-topic-list__status-label">
                {topicStatusSymbols[topic.status]}{" "}
                {topicStatusLabels[topic.status]}
              </span>
              {canResetTopicStatusToLearn(topic.status) ? (
                <ResetToLearnMenu
                  topicId={topic.id}
                  topicSlug={topic.slug}
                  topicTitle={topic.title}
                />
              ) : (
                <span className="admin-topic-list__status-mark" aria-hidden="true" />
              )}
            </span>
            <span className="difficulty">{topic.difficulty}</span>
            <span>{connectionCount(relations, topic.id)} connections</span>
            <span className="admin-topic-list__action">{actionLabel}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
