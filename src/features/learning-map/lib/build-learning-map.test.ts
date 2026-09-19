import { describe, expect, it } from "vitest";

import { buildLearningMap } from "@/features/learning-map/lib/build-learning-map";
import {
  topicRelations,
  topics,
} from "@/features/topics/data/topics";
import type { Topic, TopicRelation } from "@/features/topics/types";

describe("buildLearningMap", () => {
  it("builds a node for every visible seed topic", () => {
    const graph = buildLearningMap(topics, topicRelations);

    expect(graph.nodes).toHaveLength(topics.length);
    expect(graph.nodes.find((node) => node.id === "rag")?.data).toMatchObject({
      isCurrentArea: true,
      topic: { title: "RAG", status: "learning" },
    });
  });

  it("keeps every seed relationship connected to known topics", () => {
    const topicIds = new Set(topics.map((topic) => topic.id));

    topicRelations.forEach((relation) => {
      expect(topicIds.has(relation.sourceTopicId)).toBe(true);
      expect(topicIds.has(relation.targetTopicId)).toBe(true);
    });
  });

  it("shows inbox topics without edges, parked to the right of the curriculum", () => {
    const inboxTopic: Topic = {
      id: "future-topic",
      slug: "future-topic",
      title: "Future Topic",
      difficulty: "beginner",
      status: "inbox",
      createdAt: "2026-09-10T00:00:00.000Z",
      updatedAt: "2026-09-10T00:00:00.000Z",
    };
    const inboxRelation: TopicRelation = {
      id: "rag-before-future-topic",
      sourceTopicId: "rag",
      targetTopicId: inboxTopic.id,
      type: "prerequisite",
    };

    const graph = buildLearningMap(
      [...topics, inboxTopic],
      [...topicRelations, inboxRelation],
    );
    const inboxNode = graph.nodes.find((node) => node.id === inboxTopic.id);
    const maxCurriculumX = Math.max(
      ...graph.nodes
        .filter((node) => node.data.topic.status !== "inbox")
        .map((node) => node.position.x),
    );

    expect(inboxNode).toBeDefined();
    expect(graph.edges.some((edge) => edge.id === inboxRelation.id)).toBe(false);
    expect(inboxNode?.position.x).toBeGreaterThan(maxCurriculumX);
  });

  it("visually distinguishes prerequisite and related edges", () => {
    const graph = buildLearningMap(topics, topicRelations);
    const prerequisite = graph.edges.find(
      (edge) => edge.data?.relationType === "prerequisite",
    );
    const related = graph.edges.find(
      (edge) => edge.data?.relationType === "related",
    );

    expect(prerequisite?.markerEnd).toBeDefined();
    expect(prerequisite?.className).toContain("prerequisite");
    expect(related?.markerEnd).toBeUndefined();
    expect(related?.className).toContain("related");
  });

  it("keeps a linear prerequisite chain on one row", () => {
    const graph = buildLearningMap(topics, topicRelations);
    const chain = ["ai-basics", "machine-learning", "neural-networks", "transformer"];
    const rows = new Set(
      chain.map(
        (id) => graph.nodes.find((node) => node.id === id)?.position.y,
      ),
    );

    expect(rows.size).toBe(1);
  });

  it("parks related-only topics above their neighbors", () => {
    const graph = buildLearningMap(topics, topicRelations);
    const context = graph.nodes.find((node) => node.id === "context-engineering");
    const rag = graph.nodes.find((node) => node.id === "rag");
    const prompt = graph.nodes.find((node) => node.id === "prompt-engineering");

    expect(context?.position.x).toBe(rag?.position.x);
    expect(context?.position.y).toBeLessThan(rag?.position.y ?? 0);
    expect(context?.position.y).toBeLessThan(prompt?.position.y ?? 0);
  });

  it("routes related edges around the map instead of through stacked nodes", () => {
    const graph = buildLearningMap(topics, topicRelations);
    const ragRelated = graph.edges.find(
      (edge) => edge.id === "rag-related-context-engineering",
    );
    const promptRelated = graph.edges.find(
      (edge) => edge.id === "prompt-engineering-related-context-engineering",
    );
    const agentRelated = graph.edges.find(
      (edge) => edge.id === "agent-related-context-engineering",
    );

    expect(ragRelated).toMatchObject({
      sourceHandle: "from-top",
      targetHandle: "to-bottom",
      type: "straight",
    });
    expect(promptRelated).toMatchObject({
      sourceHandle: "out",
      targetHandle: "in",
    });
    expect(agentRelated).toMatchObject({
      source: "context-engineering",
      target: "agent",
      sourceHandle: "out",
      targetHandle: "in",
    });
  });
});
