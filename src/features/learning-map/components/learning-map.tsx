"use client";

import { useCallback, useMemo, useState } from "react";
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
import {
  topicRelations,
  topics,
} from "@/features/topics/data/topics";

const nodeTypes = {
  topic: TopicNode,
};

export function LearningMap() {
  const graph = useMemo(
    () => buildLearningMap(topics, topicRelations),
    [],
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

  const selectedTopic = topics.find(
    (topic) => topic.id === selectedTopicId,
  );

  const handleNodeClick: NodeMouseHandler<LearningMapNode> = useCallback(
    (_event, node) => {
      setSelectedTopicId(node.id);
    },
    [],
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
      </div>

      <div className="map-canvas" data-testid="learning-map">
        <ReactFlow
          nodes={nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={() => setSelectedTopicId(null)}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          panOnDrag
          zoomOnPinch
          zoomOnScroll={false}
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
          <span>
            {selectedTopic
              ? `${selectedTopic.category} · ${selectedTopic.difficulty}`
              : "Click any node to focus it"}
          </span>
        </div>
      </div>
    </section>
  );
}
