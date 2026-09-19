import { describe, expect, it } from "vitest";

import { buildLearningMap } from "@/features/learning-map/lib/build-learning-map";
import { topicRelations, topics } from "@/features/topics/data/topics";
import {
  applyCreateTopic,
  applyQuickAddInbox,
  applyUpdateTopic,
  incomingPrerequisiteIds,
  parseInboxTopicWrite,
  parseTopicWrite,
  relatedRelationId,
  slugifyTitle,
  type TopicStoreData,
} from "@/features/topics/lib/topic-write";

const seedStore: TopicStoreData = {
  topics,
  topicRelations,
  resources: [],
};

const fineTuningFields = {
  title: "Fine-tuning",
  difficulty: "advanced",
  status: "to_learn",
  shortDescription: "Adapting a trained model",
  description: "Updating model weights on a narrower dataset.",
  category: "Applied AI",
  prerequisiteIds: ["llm"],
  relatedIds: ["prompt-engineering"],
};

describe("slugifyTitle", () => {
  it("builds a URL-safe slug from a title", () => {
    expect(slugifyTitle("Fine-tuning & LoRA")).toBe("fine-tuning-lora");
  });
});

describe("parseTopicWrite", () => {
  it("reads repeated relation fields from form data", () => {
    const formData = new FormData();
    formData.set("title", "Fine-tuning");
    formData.set("difficulty", "advanced");
    formData.append("prerequisiteIds", "llm");
    formData.append("relatedIds", "rag");
    formData.append("relatedIds", "agent");

    expect(parseTopicWrite(formData)).toMatchObject({
      title: "Fine-tuning",
      prerequisiteIds: ["llm"],
      relatedIds: ["rag", "agent"],
    });
  });
});

describe("parseInboxTopicWrite", () => {
  it("reads the lightweight inbox fields", () => {
    const formData = new FormData();
    formData.set("title", "Mixture of Experts");
    formData.set("category", "Model Architecture");
    formData.set("difficulty", "advanced");
    formData.set("shortDescription", "Sparse expert routing.");

    expect(parseInboxTopicWrite(formData)).toEqual({
      title: "Mixture of Experts",
      category: "Model Architecture",
      difficulty: "advanced",
      shortDescription: "Sparse expert routing.",
    });
  });
});

describe("applyCreateTopic", () => {
  it("rejects a missing title", () => {
    const result = applyCreateTopic(seedStore, {
      ...fineTuningFields,
      title: "  ",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("title");
    }
  });

  it("rejects a slug that is already used", () => {
    const result = applyCreateTopic(seedStore, {
      ...fineTuningFields,
      title: "Copy",
      slug: "rag",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("slug");
    }
  });

  it("rejects self-relations", () => {
    const result = applyCreateTopic(seedStore, {
      ...fineTuningFields,
      relatedIds: ["fine-tuning"],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/itself/i);
    }
  });

  it("defaults status to to_learn and appears on the map with connections", () => {
    const result = applyCreateTopic(
      seedStore,
      {
        ...fineTuningFields,
        status: "",
      },
      "2026-09-17T00:00:00.000Z",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.topic.status).toBe("to_learn");
    expect(result.topic.slug).toBe("fine-tuning");

    const graph = buildLearningMap(result.store.topics, result.store.topicRelations);
    const nodeIds = graph.nodes.map((node) => node.id);
    const edgeIds = graph.edges.map((edge) => edge.id);

    expect(nodeIds).toContain("fine-tuning");
    expect(edgeIds).toContain("llm-before-fine-tuning");
    expect(edgeIds).toContain(
      relatedRelationId("fine-tuning", "prompt-engineering"),
    );
  });
});

describe("applyQuickAddInbox", () => {
  it("rejects a missing title", () => {
    const result = applyQuickAddInbox(seedStore, {
      title: "  ",
      difficulty: "beginner",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("title");
    }
  });

  it("creates an unconnected inbox topic that appears on the map", () => {
    const result = applyQuickAddInbox(
      seedStore,
      {
        title: "Mixture of Experts",
        category: "Model Architecture",
        difficulty: "advanced",
        shortDescription: "Sparse expert routing.",
      },
      "2026-09-20T00:00:00.000Z",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.topic).toMatchObject({
      id: "mixture-of-experts",
      slug: "mixture-of-experts",
      status: "inbox",
      category: "Model Architecture",
      difficulty: "advanced",
      shortDescription: "Sparse expert routing.",
    });
    expect(
      result.store.topicRelations.some(
        (relation) =>
          relation.sourceTopicId === result.topic.id ||
          relation.targetTopicId === result.topic.id,
      ),
    ).toBe(false);

    const graph = buildLearningMap(result.store.topics, result.store.topicRelations);
    const node = graph.nodes.find((item) => item.id === result.topic.id);
    const maxCurriculumX = Math.max(
      ...graph.nodes
        .filter((item) => item.data.topic.status !== "inbox")
        .map((item) => item.position.x),
    );

    expect(node).toBeDefined();
    expect(graph.edges.some((edge) => edge.source === result.topic.id)).toBe(
      false,
    );
    expect(graph.edges.some((edge) => edge.target === result.topic.id)).toBe(
      false,
    );
    expect(node?.position.x).toBeGreaterThan(maxCurriculumX);
  });
});

describe("applyUpdateTopic", () => {
  it("keeps outgoing prerequisites while replacing incoming ones", () => {
    const result = applyUpdateTopic(seedStore, "llm", {
      title: "Large Language Models",
      slug: "llm",
      difficulty: "intermediate",
      status: "discussed",
      shortDescription: "Transformers trained at scale",
      description: "Updated description.",
      category: "Language Models",
      prerequisiteIds: ["tokenization"],
      relatedIds: ["rag"],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(incomingPrerequisiteIds(result.store.topicRelations, "llm")).toEqual([
      "tokenization",
    ]);
    expect(
      result.store.topicRelations.some(
        (relation) =>
          relation.type === "prerequisite" &&
          relation.sourceTopicId === "llm" &&
          relation.targetTopicId === "rag",
      ),
    ).toBe(true);
    expect(
      result.store.topicRelations.some(
        (relation) =>
          relation.type === "related" &&
          [relation.sourceTopicId, relation.targetTopicId].includes("llm") &&
          [relation.sourceTopicId, relation.targetTopicId].includes("rag"),
      ),
    ).toBe(true);
  });
});
