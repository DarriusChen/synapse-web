import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  relationFromRow,
  relationToRow,
  resourceFromRow,
  resourceToRow,
  topicFromRow,
  topicOwnedRelations,
  topicToRow,
  type ResourceRow,
  type TopicRelationRow,
  type TopicRow,
} from "@/features/topics/lib/topic-store-map";
import {
  applyCreateResource,
  applyCreateTopic,
  applyDeleteInboxTopic,
  applyDeleteResource,
  applyQuickAddInbox,
  applyResetTopicStatusToLearn,
  applyUpdateResource,
  applyUpdateTopic,
  type InboxTopicWriteFields,
  type ResourceWriteFields,
  type TopicStoreData,
  type TopicWriteFields,
} from "@/features/topics/lib/topic-write";
import type { Topic, TopicRelation } from "@/features/topics/types";

function throwIfError(message: string, error: { message: string } | null) {
  if (error) {
    throw new Error(`${message}: ${error.message}`);
  }
}

export async function readTopicStore(): Promise<TopicStoreData> {
  const supabase = createSupabaseServerClient();
  const [topicsResult, relationsResult, resourcesResult] = await Promise.all([
    supabase.from("topics").select("*"),
    supabase.from("topic_relations").select("*"),
    supabase.from("resources").select("*"),
  ]);

  throwIfError("Failed to load topics", topicsResult.error);
  throwIfError("Failed to load topic relations", relationsResult.error);
  throwIfError("Failed to load resources", resourcesResult.error);

  return {
    topics: ((topicsResult.data ?? []) as TopicRow[]).map(topicFromRow),
    topicRelations: ((relationsResult.data ?? []) as TopicRelationRow[]).map(
      relationFromRow,
    ),
    resources: ((resourcesResult.data ?? []) as ResourceRow[]).map(
      resourceFromRow,
    ),
  };
}

async function persistTopicConnections(
  topic: Topic,
  relations: TopicRelation[],
) {
  const supabase = createSupabaseServerClient();
  const owned = topicOwnedRelations(relations, topic.id).map(relationToRow);

  const upsertTopic = await supabase
    .from("topics")
    .upsert(topicToRow(topic), { onConflict: "id" });
  throwIfError("Failed to save topic", upsertTopic.error);

  const deleteIncomingPrereqs = await supabase
    .from("topic_relations")
    .delete()
    .eq("type", "prerequisite")
    .eq("target_topic_id", topic.id);
  throwIfError(
    "Failed to replace prerequisites",
    deleteIncomingPrereqs.error,
  );

  const deleteRelated = await supabase
    .from("topic_relations")
    .delete()
    .eq("type", "related")
    .or(`source_topic_id.eq.${topic.id},target_topic_id.eq.${topic.id}`);
  throwIfError("Failed to replace related topics", deleteRelated.error);

  if (owned.length === 0) {
    return;
  }

  const insertRelations = await supabase.from("topic_relations").insert(owned);
  throwIfError("Failed to save topic relations", insertRelations.error);
}

export async function createInboxTopic(fields: InboxTopicWriteFields) {
  const store = await readTopicStore();
  const result = applyQuickAddInbox(store, fields);

  if (!result.ok) {
    return result;
  }

  await persistTopicConnections(result.topic, result.store.topicRelations);
  return result;
}

export async function createTopicWithRelations(fields: TopicWriteFields) {
  const store = await readTopicStore();
  const result = applyCreateTopic(store, fields);

  if (!result.ok) {
    return result;
  }

  await persistTopicConnections(result.topic, result.store.topicRelations);
  return result;
}

export async function updateTopicWithRelations(
  topicId: string,
  fields: TopicWriteFields,
) {
  const store = await readTopicStore();
  const result = applyUpdateTopic(store, topicId, fields);

  if (!result.ok) {
    return result;
  }

  await persistTopicConnections(result.topic, result.store.topicRelations);
  return result;
}

export async function resetTopicStatusToLearn(topicId: string) {
  const store = await readTopicStore();
  const result = applyResetTopicStatusToLearn(store, topicId);

  if (!result.ok) {
    return result;
  }

  const supabase = createSupabaseServerClient();
  const upsertTopic = await supabase
    .from("topics")
    .upsert(topicToRow(result.topic), { onConflict: "id" });
  throwIfError("Failed to save topic", upsertTopic.error);
  return result;
}

export async function deleteInboxTopic(topicId: string) {
  const store = await readTopicStore();
  const result = applyDeleteInboxTopic(store, topicId);

  if (!result.ok) {
    return result;
  }

  const supabase = createSupabaseServerClient();
  const deleted = await supabase.from("topics").delete().eq("id", topicId);
  throwIfError("Failed to delete topic", deleted.error);
  return result;
}

export async function createTopicResource(fields: ResourceWriteFields) {
  const store = await readTopicStore();
  const result = applyCreateResource(store, fields);

  if (!result.ok) {
    return result;
  }

  const supabase = createSupabaseServerClient();
  const inserted = await supabase
    .from("resources")
    .insert(resourceToRow(result.resource));
  throwIfError("Failed to create resource", inserted.error);
  return result;
}

export async function updateTopicResource(
  resourceId: string,
  fields: ResourceWriteFields,
) {
  const store = await readTopicStore();
  const result = applyUpdateResource(store, resourceId, fields);

  if (!result.ok) {
    return result;
  }

  const supabase = createSupabaseServerClient();
  const updated = await supabase
    .from("resources")
    .update(resourceToRow(result.resource))
    .eq("id", resourceId);
  throwIfError("Failed to update resource", updated.error);
  return result;
}

export async function deleteTopicResource(resourceId: string) {
  const store = await readTopicStore();
  const result = applyDeleteResource(store, resourceId);

  if (!result.ok) {
    return result;
  }

  const supabase = createSupabaseServerClient();
  const deleted = await supabase
    .from("resources")
    .delete()
    .eq("id", resourceId);
  throwIfError("Failed to delete resource", deleted.error);
  return result;
}

