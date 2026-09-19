import type {
  Resource,
  Topic,
  TopicDifficulty,
  TopicRelation,
  TopicStatus,
} from "@/features/topics/types";
import {
  topicDifficulties,
  topicStatuses,
} from "@/features/topics/types";

export type TopicStoreData = {
  topics: Topic[];
  topicRelations: TopicRelation[];
  resources: Resource[];
};

export type TopicWriteFields = {
  title: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  difficulty: string;
  status?: string;
  prerequisiteIds: string[];
  relatedIds: string[];
};

export type InboxTopicWriteFields = {
  title: string;
  category?: string;
  difficulty: string;
  shortDescription?: string;
};

export type TopicWriteError = {
  field?: string;
  message: string;
};

export type TopicWriteResult =
  | { ok: true; store: TopicStoreData; topic: Topic }
  | { ok: false; error: TopicWriteError };

const DEFAULT_STATUS: TopicStatus = "to_learn";

export function slugifyTitle(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseTopicWrite(formData: FormData): TopicWriteFields {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    difficulty: String(formData.get("difficulty") ?? ""),
    status: String(formData.get("status") ?? ""),
    prerequisiteIds: formData.getAll("prerequisiteIds").map(String),
    relatedIds: formData.getAll("relatedIds").map(String),
  };
}

export function parseInboxTopicWrite(
  formData: FormData,
): InboxTopicWriteFields {
  return {
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? ""),
    difficulty: String(formData.get("difficulty") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
  };
}

function optionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

function isDifficulty(value: string): value is TopicDifficulty {
  return (topicDifficulties as readonly string[]).includes(value);
}

function isStatus(value: string): value is TopicStatus {
  return (topicStatuses as readonly string[]).includes(value);
}

export function relatedRelationId(leftTopicId: string, rightTopicId: string) {
  const [sourceTopicId, targetTopicId] = [leftTopicId, rightTopicId].toSorted();
  return `${sourceTopicId}-related-${targetTopicId}`;
}

function topicIds(store: TopicStoreData) {
  return new Set(store.topics.map((topic) => topic.id));
}

function validateFields(
  store: TopicStoreData,
  fields: TopicWriteFields,
  currentTopicId?: string,
): TopicWriteError | { slug: string; difficulty: TopicDifficulty; status: TopicStatus } {
  const title = fields.title.trim();

  if (!title) {
    return { field: "title", message: "Title is required." };
  }

  const slug = slugifyTitle(optionalText(fields.slug) ?? title);

  if (!slug) {
    return { field: "slug", message: "Slug must include at least one letter or number." };
  }

  const slugTaken = store.topics.some(
    (topic) => topic.slug === slug && topic.id !== currentTopicId,
  );

  if (slugTaken) {
    return { field: "slug", message: "That slug is already in use." };
  }

  if (!isDifficulty(fields.difficulty)) {
    return { field: "difficulty", message: "Choose a difficulty." };
  }

  const statusValue = optionalText(fields.status) ?? DEFAULT_STATUS;

  if (!isStatus(statusValue)) {
    return { field: "status", message: "Choose a status." };
  }

  return { slug, difficulty: fields.difficulty, status: statusValue };
}

function validateConnections(
  store: TopicStoreData,
  topicId: string,
  prerequisiteIds: string[],
  relatedIds: string[],
): TopicWriteError | undefined {
  const knownIds = topicIds(store);

  if (prerequisiteIds.includes(topicId) || relatedIds.includes(topicId)) {
    return { message: "A topic cannot connect to itself." };
  }

  const unknown = [...prerequisiteIds, ...relatedIds].find((id) => !knownIds.has(id));

  if (unknown) {
    return { message: "One of the selected topics no longer exists." };
  }

  return undefined;
}

function replaceConnections(
  relations: TopicRelation[],
  topicId: string,
  prerequisiteIds: string[],
  relatedIds: string[],
): TopicRelation[] {
  const kept = relations.filter((relation) => {
    if (relation.type === "related") {
      return (
        relation.sourceTopicId !== topicId && relation.targetTopicId !== topicId
      );
    }

    return relation.targetTopicId !== topicId;
  });

  const prerequisites = prerequisiteIds.map((sourceTopicId) => ({
    id: `${sourceTopicId}-before-${topicId}`,
    sourceTopicId,
    targetTopicId: topicId,
    type: "prerequisite" as const,
  }));

  const related = relatedIds.map((neighborId) => {
    const [sourceTopicId, targetTopicId] = [topicId, neighborId].toSorted();

    return {
      id: relatedRelationId(topicId, neighborId),
      sourceTopicId,
      targetTopicId,
      type: "related" as const,
    };
  });

  return [...kept, ...prerequisites, ...related];
}

function topicFromFields(
  fields: TopicWriteFields,
  slug: string,
  difficulty: TopicDifficulty,
  status: TopicStatus,
  id: string,
  createdAt: string,
  updatedAt: string,
): Topic {
  return {
    id,
    slug,
    title: fields.title.trim(),
    shortDescription: optionalText(fields.shortDescription),
    description: optionalText(fields.description),
    category: optionalText(fields.category),
    difficulty,
    status,
    createdAt,
    updatedAt,
  };
}

export function applyQuickAddInbox(
  store: TopicStoreData,
  fields: InboxTopicWriteFields,
  now = new Date().toISOString(),
): TopicWriteResult {
  return applyCreateTopic(
    store,
    {
      ...fields,
      status: "inbox",
      prerequisiteIds: [],
      relatedIds: [],
    },
    now,
  );
}

export function applyCreateTopic(
  store: TopicStoreData,
  fields: TopicWriteFields,
  now = new Date().toISOString(),
): TopicWriteResult {
  const parsed = validateFields(store, fields);

  if ("message" in parsed) {
    return { ok: false, error: parsed };
  }

  const topic = topicFromFields(
    fields,
    parsed.slug,
    parsed.difficulty,
    parsed.status,
    parsed.slug,
    now,
    now,
  );
  const prerequisiteIds = uniqueIds(fields.prerequisiteIds);
  const relatedIds = uniqueIds(fields.relatedIds);
  const connectionError = validateConnections(
    { ...store, topics: [...store.topics, topic] },
    topic.id,
    prerequisiteIds,
    relatedIds,
  );

  if (connectionError) {
    return { ok: false, error: connectionError };
  }

  return {
    ok: true,
    topic,
    store: {
      ...store,
      topics: [...store.topics, topic],
      topicRelations: replaceConnections(
        store.topicRelations,
        topic.id,
        prerequisiteIds,
        relatedIds,
      ),
    },
  };
}

export function applyUpdateTopic(
  store: TopicStoreData,
  topicId: string,
  fields: TopicWriteFields,
  now = new Date().toISOString(),
): TopicWriteResult {
  const current = store.topics.find((topic) => topic.id === topicId);

  if (!current) {
    return { ok: false, error: { message: "Topic not found." } };
  }

  const parsed = validateFields(store, fields, topicId);

  if ("message" in parsed) {
    return { ok: false, error: parsed };
  }

  const topic = topicFromFields(
    fields,
    parsed.slug,
    parsed.difficulty,
    parsed.status,
    current.id,
    current.createdAt,
    now,
  );
  const prerequisiteIds = uniqueIds(fields.prerequisiteIds);
  const relatedIds = uniqueIds(fields.relatedIds);
  const connectionError = validateConnections(
    store,
    topic.id,
    prerequisiteIds,
    relatedIds,
  );

  if (connectionError) {
    return { ok: false, error: connectionError };
  }

  return {
    ok: true,
    topic,
    store: {
      ...store,
      topics: store.topics.map((item) => (item.id === topicId ? topic : item)),
      topicRelations: replaceConnections(
        store.topicRelations,
        topic.id,
        prerequisiteIds,
        relatedIds,
      ),
    },
  };
}

export function incomingPrerequisiteIds(
  relations: TopicRelation[],
  topicId: string,
) {
  return relations
    .filter(
      (relation) =>
        relation.type === "prerequisite" && relation.targetTopicId === topicId,
    )
    .map((relation) => relation.sourceTopicId);
}

export function relatedTopicIds(relations: TopicRelation[], topicId: string) {
  return relations.flatMap((relation) => {
    if (relation.type !== "related") {
      return [];
    }

    if (relation.sourceTopicId === topicId) {
      return [relation.targetTopicId];
    }

    if (relation.targetTopicId === topicId) {
      return [relation.sourceTopicId];
    }

    return [];
  });
}

export function connectionCount(relations: TopicRelation[], topicId: string) {
  return relations.filter(
    (relation) =>
      relation.sourceTopicId === topicId || relation.targetTopicId === topicId,
  ).length;
}
