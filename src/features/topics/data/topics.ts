import type {
  Resource,
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
  shortDescription: string,
  description: string,
): Topic {
  return {
    id: slug,
    slug,
    title,
    shortDescription,
    description,
    difficulty,
    status,
    category,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  };
}

export const topics = [
  topic(
    "ai-basics",
    "AI Basics",
    "beginner",
    "discussed",
    "Foundations",
    "What intelligent systems actually do",
    "A starting point for the group: how machines learn from data, why prediction is not understanding, and the vocabulary used across later topics.",
  ),
  topic(
    "machine-learning",
    "Machine Learning",
    "beginner",
    "discussed",
    "Foundations",
    "Learning patterns from examples",
    "Supervised, unsupervised, and the training loop: data, loss, and generalization. This is the path from rules to models that improve with examples.",
  ),
  topic(
    "neural-networks",
    "Neural Networks",
    "intermediate",
    "discussed",
    "Foundations",
    "Layers that compose representations",
    "Networks of simple units stacked into layers. Gradients, nonlinearities, and why depth changes what a model can represent.",
  ),
  topic(
    "transformer",
    "Transformer",
    "intermediate",
    "discussed",
    "Language Models",
    "Attention-based sequence architecture",
    "The architecture behind modern language models. Self-attention, residual stacks, and why transformers scaled when earlier sequence models stalled.",
  ),
  topic(
    "attention",
    "Attention",
    "intermediate",
    "discussed",
    "Language Models",
    "Weighting what matters in context",
    "A mechanism for relating tokens to each other. Query, key, and value projections, and how attention became the core of transformers.",
  ),
  topic(
    "tokenization",
    "Tokenization",
    "beginner",
    "discussed",
    "Language Models",
    "Turning text into model input",
    "How language is split into tokens before a model sees it. Vocabulary size, subword units, and the tradeoffs that show up later in prompting and RAG.",
  ),
  topic(
    "embedding",
    "Embedding",
    "intermediate",
    "discussed",
    "Retrieval",
    "Vectors that capture meaning",
    "Dense representations of text (and other data) in a space where similar items sit near each other. The foundation for search, clustering, and retrieval.",
  ),
  topic(
    "llm",
    "Large Language Models",
    "intermediate",
    "discussed",
    "Language Models",
    "Transformers trained at scale",
    "Language models trained on large corpora. Pretraining, next-token prediction, and the capabilities that emerge enough to support tools, RAG, and agents.",
  ),
  topic(
    "prompt-engineering",
    "Prompt Engineering",
    "beginner",
    "learning",
    "Applied AI",
    "Steering models with language",
    "How instructions, examples, and constraints change model behavior. Useful on its own, and closely tied to how we assemble context for a task.",
  ),
  topic(
    "vector-database",
    "Vector Database",
    "intermediate",
    "learning",
    "Retrieval",
    "Storing and searching embeddings",
    "Indexes built for nearest-neighbor lookup over embeddings. The storage layer that makes retrieval fast enough to sit in front of a language model.",
  ),
  topic(
    "rag",
    "RAG",
    "intermediate",
    "learning",
    "Applied AI",
    "Retrieval-Augmented Generation",
    "RAG combines retrieval with language model generation. Instead of answering from parameters alone, the model is given relevant documents at generation time.",
  ),
  topic(
    "agent",
    "AI Agents",
    "advanced",
    "to_learn",
    "Agents",
    "Models that act through tools",
    "Systems that plan, call tools, and iterate toward a goal. Agents sit on top of language models and retrieval, and they raise new questions about control and context.",
  ),
  topic(
    "mcp",
    "MCP",
    "advanced",
    "to_learn",
    "Agents",
    "Model Context Protocol",
    "A protocol for connecting models to tools and data sources in a consistent way. Useful once agents need more than one-off API wrappers.",
  ),
  topic(
    "context-engineering",
    "Context Engineering",
    "intermediate",
    "learning",
    "Applied AI",
    "Assembling what the model sees",
    "The craft of choosing, ordering, and constraining context: prompts, retrieved documents, memory, and tool results. Related to RAG, prompting, and agents without being any one of them.",
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

function resource(
  id: string,
  topicId: string,
  title: string,
  url: string,
  type: Resource["type"],
): Resource {
  return { id, topicId, title, url, type };
}

export const resources = [
  resource(
    "rag-hf-course",
    "rag",
    "Hugging Face Course",
    "https://huggingface.co/learn/nlp-course",
    "tutorial",
  ),
  resource(
    "rag-paper",
    "rag",
    "Original Paper",
    "https://arxiv.org/abs/2005.11401",
    "paper",
  ),
  resource(
    "rag-video",
    "rag",
    "RAG Explained",
    "https://www.youtube.com/watch?v=T-D1OfcDW1M",
    "video",
  ),
  resource(
    "rag-notes",
    "rag",
    "RAG Study Notes",
    "https://github.com/huggingface/blog/blob/main/rag.md",
    "notes",
  ),
  resource(
    "transformer-paper",
    "transformer",
    "Attention Is All You Need",
    "https://arxiv.org/abs/1706.03762",
    "paper",
  ),
  resource(
    "transformer-illustrated",
    "transformer",
    "The Illustrated Transformer",
    "https://jalammar.github.io/illustrated-transformer/",
    "tutorial",
  ),
  resource(
    "agent-anthropic",
    "agent",
    "Building Effective Agents",
    "https://www.anthropic.com/engineering/building-effective-agents",
    "website",
  ),
] satisfies Resource[];
