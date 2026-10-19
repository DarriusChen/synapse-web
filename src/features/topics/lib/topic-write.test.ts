import { describe, expect, it } from "vitest";

import { buildLearningMap } from "@/features/learning-map/lib/build-learning-map";
import { topicRelations, topics } from "@/features/topics/data/topics";
import {
  applyCreateResource,
  applyCreateTopic,
  applyDeleteInboxTopic,
  applyDeleteResource,
  applyQuickAddInbox,
  applyResetTopicStatusToLearn,
  applyUpdateResource,
  applyUpdateTopic,
  incomingPrerequisiteIds,
  parseInboxTopicWrite,
  parseResourceWrite,
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

  it("builds an ASCII slug when the title is Chinese", () => {
    const slug = slugifyTitle("注意力機制");

    expect(slug).toMatch(/^topic-[a-z0-9]+$/);
    expect(slugifyTitle("注意力機制")).toBe(slug);
    expect(slugifyTitle("軟體專案架構：前後端與資料庫")).toMatch(/^topic-[a-z0-9]+$/);
    expect(slugifyTitle("RAG 檢索增強生成")).toMatch(/^rag-[a-z0-9]+$/);
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

  it("creates an inbox topic from a Chinese title", () => {
    const result = applyQuickAddInbox(seedStore, {
      title: "注意力機制",
      difficulty: "beginner",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.topic.slug).toBe(slugifyTitle("注意力機制"));
    expect(result.topic.id).toBe(result.topic.slug);
    expect(result.topic.slug).toMatch(/^topic-[a-z0-9]+$/);
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

describe("applyResetTopicStatusToLearn", () => {
  it("resets discussed topics without changing connections", () => {
    const before = seedStore.topicRelations.filter(
      (relation) =>
        relation.sourceTopicId === "llm" || relation.targetTopicId === "llm",
    );
    const result = applyResetTopicStatusToLearn(
      seedStore,
      "llm",
      "2026-09-21T00:00:00.000Z",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.topic.status).toBe("to_learn");
    expect(result.topic.updatedAt).toBe("2026-09-21T00:00:00.000Z");
    expect(
      result.store.topicRelations.filter(
        (relation) =>
          relation.sourceTopicId === "llm" || relation.targetTopicId === "llm",
      ),
    ).toEqual(before);
  });

  it("rejects inbox topics", () => {
    const store: TopicStoreData = {
      ...seedStore,
      topics: seedStore.topics.map((topic) =>
        topic.id === "llm" ? { ...topic, status: "inbox" } : topic,
      ),
    };
    const result = applyResetTopicStatusToLearn(store, "llm");

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.error.field).toBe("status");
  });
});

describe("applyDeleteInboxTopic", () => {
  it("removes an inbox topic and anything connected to it", () => {
    const store: TopicStoreData = {
      ...seedStore,
      topics: seedStore.topics.map((topic) =>
        topic.id === "llm" ? { ...topic, status: "inbox" } : topic,
      ),
      resources: [
        {
          id: "llm-note",
          topicId: "llm",
          title: "Notes",
          url: "https://example.com",
          type: "notes",
        },
      ],
    };
    const result = applyDeleteInboxTopic(store, "llm");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.store.topics.some((topic) => topic.id === "llm")).toBe(false);
    expect(
      result.store.topicRelations.some(
        (relation) =>
          relation.sourceTopicId === "llm" || relation.targetTopicId === "llm",
      ),
    ).toBe(false);
    expect(result.store.resources).toEqual([]);
  });

  it("rejects curriculum topics", () => {
    const result = applyDeleteInboxTopic(seedStore, "llm");

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.error.field).toBe("status");
  });
});

describe("parseResourceWrite", () => {
  it("reads resource write fields from form data", () => {
    const formData = new FormData();
    formData.set("topicId", "rag");
    formData.set("title", "RAG Study Notes");
    formData.set("url", "https://example.com/rag-notes");
    formData.set("type", "notes");

    expect(parseResourceWrite(formData)).toEqual({
      topicId: "rag",
      title: "RAG Study Notes",
      url: "https://example.com/rag-notes",
      type: "notes",
    });
  });
});

describe("applyCreateResource", () => {
  it("creates a valid resource and generates collision-safe ids", () => {
    const first = applyCreateResource(seedStore, {
      topicId: "rag",
      title: "  Original Paper  ",
      url: "  https://arxiv.org/abs/2005.11401  ",
      type: "paper",
    });

    expect(first.ok).toBe(true);
    if (!first.ok) {
      return;
    }

    expect(first.resource).toEqual({
      id: "rag-original-paper",
      topicId: "rag",
      title: "Original Paper",
      url: "https://arxiv.org/abs/2005.11401",
      type: "paper",
    });
    expect(first.store.resources).toEqual([first.resource]);

    const second = applyCreateResource(first.store, {
      topicId: "rag",
      title: "Original Paper",
      url: "https://example.com/paper-2",
      type: "paper",
    });

    expect(second.ok).toBe(true);
    if (!second.ok) {
      return;
    }

    expect(second.resource.id).toBe("rag-original-paper-2");
    expect(second.store.resources).toHaveLength(2);
  });

  it("rejects unknown topicId, empty title, invalid URLs, and unknown resource types", () => {
    const unknownTopic = applyCreateResource(seedStore, {
      topicId: "missing-topic",
      title: "Resource",
      url: "https://example.com",
      type: "website",
    });
    expect(unknownTopic.ok).toBe(false);

    const emptyTitle = applyCreateResource(seedStore, {
      topicId: "rag",
      title: "   ",
      url: "https://example.com",
      type: "website",
    });
    expect(emptyTitle).toEqual({
      ok: false,
      error: { field: "title", message: "Resource title is required." },
    });

    const malformedUrl = applyCreateResource(seedStore, {
      topicId: "rag",
      title: "Docs",
      url: "not-a-url",
      type: "website",
    });
    expect(malformedUrl).toEqual({
      ok: false,
      error: {
        field: "url",
        message: "Enter a valid http:// or https:// URL.",
      },
    });

    const jsUrl = applyCreateResource(seedStore, {
      topicId: "rag",
      title: "Docs",
      url: "javascript:alert(1)",
      type: "website",
    });
    expect(jsUrl).toEqual({
      ok: false,
      error: {
        field: "url",
        message: "Enter a valid http:// or https:// URL.",
      },
    });

    const badType = applyCreateResource(seedStore, {
      topicId: "rag",
      title: "Docs",
      url: "https://example.com",
      type: "podcast",
    });
    expect(badType).toEqual({
      ok: false,
      error: { field: "type", message: "Choose a resource type." },
    });
  });
});

describe("applyUpdateResource and applyDeleteResource", () => {
  const storeWithResource: TopicStoreData = {
    ...seedStore,
    resources: [
      {
        id: "rag-notes",
        topicId: "rag",
        title: "Old Notes",
        url: "https://example.com/old",
        type: "notes",
      },
    ],
  };

  it("updates an existing resource's title, url, and type", () => {
    const result = applyUpdateResource(storeWithResource, "rag-notes", {
      topicId: "rag",
      title: "Updated Tutorial",
      url: "https://example.com/tutorial",
      type: "tutorial",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.resource).toEqual({
      id: "rag-notes",
      topicId: "rag",
      title: "Updated Tutorial",
      url: "https://example.com/tutorial",
      type: "tutorial",
    });
    expect(result.store.resources).toEqual([result.resource]);
  });

  it("rejects updating or deleting a non-existent resource", () => {
    const updateMissing = applyUpdateResource(
      storeWithResource,
      "missing-id",
      {
        topicId: "rag",
        title: "Title",
        url: "https://example.com",
        type: "notes",
      },
    );
    expect(updateMissing.ok).toBe(false);

    const deleteMissing = applyDeleteResource(storeWithResource, "missing-id");
    expect(deleteMissing.ok).toBe(false);
  });

  it("deletes an existing resource from the store", () => {
    const result = applyDeleteResource(storeWithResource, "rag-notes");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.resource.id).toBe("rag-notes");
    expect(result.topic.id).toBe("rag");
    expect(result.store.resources).toEqual([]);
  });
});

