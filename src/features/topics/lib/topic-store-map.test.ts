import { describe, expect, it } from "vitest";

import {
  relationFromRow,
  relationToRow,
  resourceFromRow,
  topicFromRow,
  topicOwnedRelations,
  topicToRow,
} from "@/features/topics/lib/topic-store-map";
import type { Topic, TopicRelation } from "@/features/topics/types";

const topic: Topic = {
  id: "lora",
  slug: "lora",
  title: "LoRA",
  shortDescription: "Low-rank adapters",
  description: "A parameter-efficient fine-tuning method.",
  category: "Applied AI",
  difficulty: "advanced",
  status: "to_learn",
  createdAt: "2026-09-17T00:00:00.000Z",
  updatedAt: "2026-09-17T00:00:00.000Z",
};

describe("topic row mapping", () => {
  it("round-trips optional fields through snake_case rows", () => {
    expect(topicFromRow(topicToRow(topic))).toEqual(topic);
  });

  it("drops empty optional columns", () => {
    expect(
      topicFromRow({
        ...topicToRow(topic),
        short_description: null,
        description: null,
        category: null,
      }).shortDescription,
    ).toBeUndefined();
  });
});

describe("relation and resource mapping", () => {
  it("maps relation ids in both directions", () => {
    const relation: TopicRelation = {
      id: "llm-before-lora",
      sourceTopicId: "llm",
      targetTopicId: "lora",
      type: "prerequisite",
    };

    expect(relationFromRow(relationToRow(relation))).toEqual(relation);
  });

  it("maps resource topic ids", () => {
    expect(
      resourceFromRow({
        id: "rag-paper",
        topic_id: "rag",
        title: "Original Paper",
        url: "https://arxiv.org/abs/2005.11401",
        type: "paper",
      }).topicId,
    ).toBe("rag");
  });
});

describe("topicOwnedRelations", () => {
  it("keeps incoming prerequisites and related edges, not outgoing prerequisites", () => {
    const relations: TopicRelation[] = [
      {
        id: "llm-before-rag",
        sourceTopicId: "llm",
        targetTopicId: "rag",
        type: "prerequisite",
      },
      {
        id: "rag-before-agent",
        sourceTopicId: "rag",
        targetTopicId: "agent",
        type: "prerequisite",
      },
      {
        id: "rag-related-context-engineering",
        sourceTopicId: "rag",
        targetTopicId: "context-engineering",
        type: "related",
      },
    ];

    expect(topicOwnedRelations(relations, "rag").map((relation) => relation.id)).toEqual(
      ["llm-before-rag", "rag-related-context-engineering"],
    );
  });
});
