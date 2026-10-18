"use client";

import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";

import { TopicNode } from "@/features/learning-map/components/topic-node";
import {
  buildLearningMap,
  type LearningMapNode,
} from "@/features/learning-map/lib/build-learning-map";
import type { Topic, TopicRelation } from "@/features/topics/types";

const nodeTypes = {
  topic: TopicNode,
};

type LearningMapCanvasProps = {
  topics: Topic[];
  topicRelations: TopicRelation[];
  selectedTopicId: string | null;
  onSelectTopic: (topicId: string | null) => void;
  onOpenTopic: (slug: string) => void;
};

export function LearningMapCanvas({
  topics,
  topicRelations,
  selectedTopicId,
  onSelectTopic,
  onOpenTopic,
}: LearningMapCanvasProps) {
  const graph = useMemo(
    () => buildLearningMap(topics, topicRelations),
    [topics, topicRelations],
  );
  const nodes = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        selected: node.id === selectedTopicId,
      })),
    [graph.nodes, selectedTopicId],
  );

  const handleNodeClick: NodeMouseHandler<LearningMapNode> = (event, node) => {
    if (event.detail >= 2) {
      event.preventDefault();
      event.stopPropagation();
      onOpenTopic(node.data.topic.slug);
      return;
    }

    onSelectTopic(node.id);
  };

  const handleNodeDoubleClick: NodeMouseHandler<LearningMapNode> = (
    event,
    node,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onOpenTopic(node.data.topic.slug);
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={graph.edges}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onPaneClick={() => onSelectTopic(null)}
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
  );
}
