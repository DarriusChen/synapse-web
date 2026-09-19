"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { TopicNode } from "@/features/learning-map/components/topic-node";
import { QuickAddInboxForm } from "@/features/learning-map/components/quick-add-inbox-form";
import {
  buildLearningMap,
  type LearningMapNode,
} from "@/features/learning-map/lib/build-learning-map";
import type { Topic, TopicRelation } from "@/features/topics/types";

const nodeTypes = {
  topic: TopicNode,
};

type LearningMapProps = {
  topics: Topic[];
  topicRelations: TopicRelation[];
  isAdmin?: boolean;
};

export function LearningMap({
  topics,
  topicRelations,
  isAdmin = false,
}: LearningMapProps) {
  const router = useRouter();
  const graph = useMemo(
    () => buildLearningMap(topics, topicRelations),
    [topics, topicRelations],
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const nodes = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        selected: node.id === selectedTopicId,
      })),
    [graph.nodes, selectedTopicId],
  );

  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);
  const inboxCount = topics.filter(
    (topic) => topic.status === "inbox",
  ).length;

  const openTopic = useCallback(
    (slug: string) => {
      router.push(`/topics/${slug}`);
    },
    [router],
  );

  const handleNodeClick: NodeMouseHandler<LearningMapNode> = useCallback(
    (event, node) => {
      if (event.detail >= 2) {
        event.preventDefault();
        event.stopPropagation();
        openTopic(node.data.topic.slug);
        return;
      }

      setSelectedTopicId(node.id);
    },
    [openTopic],
  );

  const handleNodeDoubleClick: NodeMouseHandler<LearningMapNode> = useCallback(
    (event, node) => {
      event.preventDefault();
      event.stopPropagation();
      openTopic(node.data.topic.slug);
    },
    [openTopic],
  );

  return (
    <section className="map-shell" aria-labelledby="learning-map-title">
      <div className="map-toolbar">
        <div>
          <div className="map-toolbar__eyebrow">
            <span className="live-dot" aria-hidden="true" />
            Structured learning map
          </div>
          <h2 id="learning-map-title">Follow the ideas, not a syllabus.</h2>
        </div>

        <div className="map-toolbar__aside">
          <div className="relation-legend" aria-label="Relationship legend">
            <span>
              <i className="legend-line legend-line--arrow" aria-hidden="true" />
              Prerequisite
            </span>
            <span>
              <i className="legend-line legend-line--related" aria-hidden="true" />
              Related
            </span>
          </div>
          {isAdmin ? <QuickAddInboxForm inboxCount={inboxCount} /> : null}
        </div>
      </div>

      <div className="map-canvas" data-testid="learning-map">
        <ReactFlow
          nodes={nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onPaneClick={() => setSelectedTopicId(null)}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          panOnDrag
          zoomOnPinch
          zoomOnScroll
          zoomOnDoubleClick={false}
          preventScrolling
          minZoom={0.35}
          maxZoom={1.35}
          fitView
          fitViewOptions={{ padding: 0.16, minZoom: 0.55, maxZoom: 0.82 }}
          proOptions={{ hideAttribution: true }}
          aria-label="AI topic learning map"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.1}
            color="var(--map-dot)"
          />
          <Controls
            position="bottom-left"
            showInteractive={false}
            aria-label="Map zoom controls"
          />
        </ReactFlow>

        <div className="map-selection" aria-live="polite">
          <span className="map-selection__label">Selected</span>
          <strong data-testid="selected-topic">
            {selectedTopic?.title ?? "Choose a topic"}
          </strong>
          <span className="map-selection__meta">
            {selectedTopic
              ? selectedTopic.status === "inbox"
                ? "Inbox · not connected yet"
                : `${selectedTopic.category} · ${selectedTopic.difficulty}`
              : "Click any node to focus it"}
          </span>
          {selectedTopic ? (
            <Link
              className="map-selection__open"
              href={`/topics/${selectedTopic.slug}`}
              data-testid="open-topic"
            >
              Open topic
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
