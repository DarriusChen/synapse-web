export const topicDifficulties = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type TopicDifficulty = (typeof topicDifficulties)[number];

export const topicStatuses = [
  "to_learn",
  "learning",
  "discussed",
  "inbox",
] as const;

export type TopicStatus = (typeof topicStatuses)[number];

export type Topic = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  difficulty: TopicDifficulty;
  status: TopicStatus;
  createdAt: string;
  updatedAt: string;
};

export const topicRelationTypes = ["prerequisite", "related"] as const;

export type TopicRelationType = (typeof topicRelationTypes)[number];

export type TopicRelation = {
  id: string;
  sourceTopicId: string;
  targetTopicId: string;
  type: TopicRelationType;
};
