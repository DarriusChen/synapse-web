import type {
  Resource,
  Topic,
  TopicRelation,
} from "@/features/topics/types";

export type TopicRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  difficulty: Topic["difficulty"];
  status: Topic["status"];
  created_at: string;
  updated_at: string;
};

export type TopicRelationRow = {
  id: string;
  source_topic_id: string;
  target_topic_id: string;
  type: TopicRelation["type"];
};

export type ResourceRow = {
  id: string;
  topic_id: string;
  title: string;
  url: string;
  type: Resource["type"];
};

function optional(value: string | null | undefined) {
  return value ? value : undefined;
}

export function topicFromRow(row: TopicRow): Topic {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: optional(row.short_description),
    description: optional(row.description),
    category: optional(row.category),
    difficulty: row.difficulty,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function topicToRow(topic: Topic): TopicRow {
  return {
    id: topic.id,
    slug: topic.slug,
    title: topic.title,
    short_description: topic.shortDescription ?? null,
    description: topic.description ?? null,
    category: topic.category ?? null,
    difficulty: topic.difficulty,
    status: topic.status,
    created_at: topic.createdAt,
    updated_at: topic.updatedAt,
  };
}

export function relationFromRow(row: TopicRelationRow): TopicRelation {
  return {
    id: row.id,
    sourceTopicId: row.source_topic_id,
    targetTopicId: row.target_topic_id,
    type: row.type,
  };
}

export function relationToRow(relation: TopicRelation): TopicRelationRow {
  return {
    id: relation.id,
    source_topic_id: relation.sourceTopicId,
    target_topic_id: relation.targetTopicId,
    type: relation.type,
  };
}

export function resourceFromRow(row: ResourceRow): Resource {
  return {
    id: row.id,
    topicId: row.topic_id,
    title: row.title,
    url: row.url,
    type: row.type,
  };
}

export function topicOwnedRelations(
  relations: TopicRelation[],
  topicId: string,
) {
  return relations.filter((relation) => {
    if (relation.type === "related") {
      return (
        relation.sourceTopicId === topicId || relation.targetTopicId === topicId
      );
    }

    return relation.targetTopicId === topicId;
  });
}
