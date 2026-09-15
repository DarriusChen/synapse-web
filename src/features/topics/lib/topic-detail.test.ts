import { describe, expect, it } from "vitest";

import { resources, topicRelations, topics } from "@/features/topics/data/topics";
import {
  getResourcesForTopic,
  getTopicBySlug,
  getTopicDetail,
  getTopicNeighbors,
} from "@/features/topics/lib/topic-detail";
import type { Resource, Topic, TopicRelation } from "@/features/topics/types";

describe("getTopicBySlug", () => {
  it("returns the seeded topic for a known slug", () => {
    expect(getTopicBySlug("rag")?.title).toBe("RAG");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getTopicBySlug("missing")).toBeUndefined();
  });
});

describe("getTopicNeighbors", () => {
  it("lists prerequisite sources for RAG, not topics that follow it", () => {
    const { prerequisites, related } = getTopicNeighbors("rag");
    const titles = prerequisites.map((topic) => topic.title);

    expect(titles).toEqual(
      expect.arrayContaining(["Embedding", "Vector Database", "Large Language Models"]),
    );
    expect(titles).not.toContain("AI Agents");
    expect(related.map((topic) => topic.title)).toEqual(["Context Engineering"]);
  });

  it("treats related edges as undirected", () => {
    const fromContext = getTopicNeighbors("context-engineering");
    const titles = fromContext.related.map((topic) => topic.title);

    expect(titles).toEqual(
      expect.arrayContaining(["Prompt Engineering", "RAG", "AI Agents"]),
    );
    expect(fromContext.prerequisites).toEqual([]);
  });

  it("ignores relations to unknown topics", () => {
    const extraRelation: TopicRelation = {
      id: "ghost-before-rag",
      sourceTopicId: "ghost",
      targetTopicId: "rag",
      type: "prerequisite",
    };

    const { prerequisites } = getTopicNeighbors(
      "rag",
      topics,
      [...topicRelations, extraRelation],
    );

    expect(prerequisites.some((topic) => topic.id === "ghost")).toBe(false);
  });
});

describe("getResourcesForTopic", () => {
  it("splits notes from other resources", () => {
    const { resources: links, notes } = getResourcesForTopic("rag");

    expect(links.map((resource) => resource.type)).toEqual(
      expect.arrayContaining(["tutorial", "paper", "video"]),
    );
    expect(notes).toHaveLength(1);
    expect(notes[0]?.title).toBe("RAG Study Notes");
  });

  it("returns empty groups when a topic has no resources", () => {
    expect(getResourcesForTopic("tokenization")).toEqual({
      resources: [],
      notes: [],
    });
  });
});

describe("getTopicDetail", () => {
  it("composes topic, neighbors, and resources", () => {
    const detail = getTopicDetail("rag");

    expect(detail?.topic.shortDescription).toBe("Retrieval-Augmented Generation");
    expect(detail?.prerequisites).toHaveLength(3);
    expect(detail?.related).toHaveLength(1);
    expect(detail?.resources.length).toBeGreaterThan(0);
    expect(detail?.notes).toHaveLength(1);
  });

  it("accepts alternate collections for tests", () => {
    const topic: Topic = {
      id: "solo",
      slug: "solo",
      title: "Solo",
      difficulty: "beginner",
      status: "to_learn",
      createdAt: "2026-09-10T00:00:00.000Z",
      updatedAt: "2026-09-10T00:00:00.000Z",
    };
    const resource: Resource = {
      id: "solo-notes",
      topicId: "solo",
      title: "Solo notes",
      url: "https://example.com/notes",
      type: "notes",
    };

    expect(
      getTopicDetail("solo", [topic], [], [resource])?.notes[0]?.title,
    ).toBe("Solo notes");
  });
});

describe("seed resources", () => {
  it("only attach to known topics", () => {
    const topicIds = new Set(topics.map((topic) => topic.id));

    resources.forEach((resource) => {
      expect(topicIds.has(resource.topicId)).toBe(true);
    });
  });
});
