"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { LearningMapNode } from "@/features/learning-map/lib/build-learning-map";
import {
  topicStatusLabels,
  topicStatusSymbols,
} from "@/features/topics/lib/labels";
import { cn } from "@/lib/utils";

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
          topic.status === "discussed" && "topic-node--discussed",
          topic.status === "to_learn" && "topic-node--to-learn",
          isCurrentArea && "topic-node--current",
          selected && "topic-node--selected",
        )}
        data-testid={`topic-node-${topic.id}`}
        aria-label={`${topic.title}, ${topicStatusLabels[topic.status]}, ${topic.difficulty}`}
      >
        <div className="topic-node__meta">
          <span className={`status status--${topic.status}`}>
            <span aria-hidden="true">{topicStatusSymbols[topic.status]}</span>
            {topicStatusLabels[topic.status]}
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
