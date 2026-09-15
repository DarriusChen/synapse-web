import type {
  Topic,
  TopicDifficulty,
  TopicRelation,
  TopicStatus,
} from "@/features/topics/types";

const seedTimestamp = "2026-09-10T00:00:00.000Z";

function topic(
  slug: string,
  title: string,
  difficulty: TopicDifficulty,
  status: TopicStatus,
  category: string,
): Topic {
  return {
    id: slug,
    slug,
    title,
    difficulty,
    status,
    category,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  };
}

export const topics = [
  topic("ai-basics", "AI Basics", "beginner", "discussed", "Foundations"),
  topic(
    "machine-learning",
    "Machine Learning",
    "beginner",
    "discussed",
    "Foundations",
  ),
  topic(
    "neural-networks",
    "Neural Networks",
    "intermediate",
    "discussed",
    "Foundations",
  ),
  topic(
    "transformer",
    "Transformer",
    "intermediate",
    "discussed",
    "Language Models",
  ),
  topic(
    "attention",
    "Attention",
    "intermediate",
    "discussed",
    "Language Models",
  ),
  topic(
    "tokenization",
    "Tokenization",
    "beginner",
    "discussed",
    "Language Models",
  ),
  topic(
    "embedding",
    "Embedding",
    "intermediate",
    "discussed",
    "Retrieval",
  ),
  topic(
    "llm",
    "Large Language Models",
    "intermediate",
    "discussed",
    "Language Models",
  ),
  topic(
    "prompt-engineering",
    "Prompt Engineering",
    "beginner",
    "learning",
    "Applied AI",
  ),
  topic(
    "vector-database",
    "Vector Database",
    "intermediate",
    "learning",
    "Retrieval",
  ),
  topic("rag", "RAG", "intermediate", "learning", "Applied AI"),
  topic("agent", "AI Agents", "advanced", "to_learn", "Agents"),
  topic("mcp", "MCP", "advanced", "to_learn", "Agents"),
  topic(
    "context-engineering",
    "Context Engineering",
    "intermediate",
    "learning",
    "Applied AI",
  ),
] satisfies Topic[];

function prerequisite(sourceTopicId: string, targetTopicId: string) {
  return {
    id: `${sourceTopicId}-before-${targetTopicId}`,
    sourceTopicId,
    targetTopicId,
    type: "prerequisite",
  } satisfies TopicRelation;
}

function related(sourceTopicId: string, targetTopicId: string) {
  return {
    id: `${sourceTopicId}-related-${targetTopicId}`,
    sourceTopicId,
    targetTopicId,
    type: "related",
  } satisfies TopicRelation;
}

export const topicRelations = [
  prerequisite("ai-basics", "machine-learning"),
  prerequisite("machine-learning", "neural-networks"),
  prerequisite("neural-networks", "transformer"),
  prerequisite("transformer", "attention"),
  prerequisite("transformer", "tokenization"),
  prerequisite("transformer", "embedding"),
  prerequisite("transformer", "llm"),
  prerequisite("llm", "prompt-engineering"),
  prerequisite("embedding", "vector-database"),
  prerequisite("embedding", "rag"),
  prerequisite("vector-database", "rag"),
  prerequisite("llm", "rag"),
  prerequisite("rag", "agent"),
  prerequisite("llm", "agent"),
  prerequisite("agent", "mcp"),
  related("prompt-engineering", "context-engineering"),
  related("rag", "context-engineering"),
  related("agent", "context-engineering"),
] satisfies TopicRelation[];
