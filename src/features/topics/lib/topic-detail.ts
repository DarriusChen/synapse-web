import {
  resources as seedResources,
  topicRelations as seedRelations,
  topics as seedTopics,
} from "@/features/topics/data/topics";
import type { Resource, Topic, TopicRelation } from "@/features/topics/types";

export type TopicNeighbors = {
  prerequisites: Topic[];
  related: Topic[];
};

export type TopicResourceGroups = {
  resources: Resource[];
  notes: Resource[];
};

export type TopicDetail = {
  topic: Topic;
  prerequisites: Topic[];
  related: Topic[];
  resources: Resource[];
  notes: Resource[];
};

function topicsById(allTopics: Topic[]) {
  return new Map(allTopics.map((topic) => [topic.id, topic]));
}

export function getTopicBySlug(
  slug: string,
  allTopics: Topic[] = seedTopics,
): Topic | undefined {
  return allTopics.find((topic) => topic.slug === slug);
}

export function getTopicNeighbors(
  topicId: string,
  allTopics: Topic[] = seedTopics,
  relations: TopicRelation[] = seedRelations,
): TopicNeighbors {
  const lookup = topicsById(allTopics);
  const seenPrerequisites = new Set<string>();
  const seenRelated = new Set<string>();
  const prerequisites: Topic[] = [];
  const related: Topic[] = [];

  relations.forEach((relation) => {
    if (
      relation.type === "prerequisite" &&
      relation.targetTopicId === topicId
    ) {
      const neighbor = lookup.get(relation.sourceTopicId);

      if (neighbor && !seenPrerequisites.has(neighbor.id)) {
        seenPrerequisites.add(neighbor.id);
        prerequisites.push(neighbor);
      }
      return;
    }

    if (relation.type !== "related") {
      return;
    }

    const neighborId =
      relation.sourceTopicId === topicId
        ? relation.targetTopicId
        : relation.targetTopicId === topicId
          ? relation.sourceTopicId
          : null;

    if (!neighborId) {
      return;
    }

    const neighbor = lookup.get(neighborId);

    if (neighbor && !seenRelated.has(neighbor.id)) {
      seenRelated.add(neighbor.id);
      related.push(neighbor);
    }
  });

  return { prerequisites, related };
}

export function getResourcesForTopic(
  topicId: string,
  allResources: Resource[] = seedResources,
): TopicResourceGroups {
  const matching = allResources.filter((resource) => resource.topicId === topicId);

  return {
    resources: matching.filter((resource) => resource.type !== "notes"),
    notes: matching.filter((resource) => resource.type === "notes"),
  };
}

export function getTopicDetail(
  slug: string,
  allTopics: Topic[] = seedTopics,
  relations: TopicRelation[] = seedRelations,
  allResources: Resource[] = seedResources,
): TopicDetail | undefined {
  const topic = getTopicBySlug(slug, allTopics);

  if (!topic) {
    return undefined;
  }

  const neighbors = getTopicNeighbors(topic.id, allTopics, relations);
  const grouped = getResourcesForTopic(topic.id, allResources);

  return {
    topic,
    ...neighbors,
    ...grouped,
  };
}

export function getVisibleTopics(allTopics: Topic[] = seedTopics) {
  return allTopics.filter((topic) => topic.status !== "inbox");
}

export function getVisibleTopicCount(allTopics: Topic[] = seedTopics) {
  return getVisibleTopics(allTopics).length;
}

export function getTopicSlugs(allTopics: Topic[] = seedTopics) {
  return allTopics.map((topic) => topic.slug);
}
