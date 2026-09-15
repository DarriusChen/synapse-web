"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { LearningMapNode } from "@/features/learning-map/lib/build-learning-map";
import type { TopicStatus } from "@/features/topics/types";
import { cn } from "@/lib/utils";

const statusLabels: Record<TopicStatus, string> = {
  to_learn: "To learn",
  learning: "Learning",
  discussed: "Discussed",
  inbox: "Inbox",
};

const statusSymbols: Record<TopicStatus, string> = {
  to_learn: "○",
  learning: "◐",
  discussed: "●",
  inbox: "·",
};

export function TopicNode({
  data,
  selected,
}: NodeProps<LearningMapNode>) {
  const { topic, isCurrentArea } = data;

  return (
    <>
      <Handle type="target" id="in" position={Position.Left} className="topic-node__handle" />
      <Handle type="source" id="out" position={Position.Right} className="topic-node__handle" />
      <Handle type="source" id="from-top" position={Position.Top} className="topic-node__handle" />
      <Handle type="target" id="to-bottom" position={Position.Bottom} className="topic-node__handle" />

      <article
        className={cn(
          "topic-node",
          isCurrentArea && "topic-node--current",
          selected && "topic-node--selected",
        )}
        data-testid={`topic-node-${topic.id}`}
        aria-label={`${topic.title}, ${statusLabels[topic.status]}, ${topic.difficulty}`}
      >
        <div className="topic-node__meta">
          <span className={`status status--${topic.status}`}>
            <span aria-hidden="true">{statusSymbols[topic.status]}</span>
            {statusLabels[topic.status]}
          </span>
          {isCurrentArea ? (
            <span className="current-label">Current area</span>
          ) : null}
        </div>

        <h3>{topic.title}</h3>

        <div className="topic-node__footer">
          <span>{topic.category}</span>
          <span className={`difficulty difficulty--${topic.difficulty}`}>
            {topic.difficulty}
          </span>
        </div>
      </article>
    </>
  );
}
