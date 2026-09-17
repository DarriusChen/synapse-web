-- Seed from data/topics-store.json. Run after 001_topics.sql.
-- Safe to re-run: inserts are skipped when the primary key already exists.

insert into public.topics (
  id, slug, title, short_description, description, category, difficulty, status, created_at, updated_at
) values
  ('ai-basics', 'ai-basics', 'AI Basics', 'What intelligent systems actually do', 'A starting point for the group: how machines learn from data, why prediction is not understanding, and the vocabulary used across later topics.', 'Foundations', 'beginner', 'discussed', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('machine-learning', 'machine-learning', 'Machine Learning', 'Learning patterns from examples', 'Supervised, unsupervised, and the training loop: data, loss, and generalization. This is the path from rules to models that improve with examples.', 'Foundations', 'beginner', 'discussed', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('neural-networks', 'neural-networks', 'Neural Networks', 'Layers that compose representations', 'Networks of simple units stacked into layers. Gradients, nonlinearities, and why depth changes what a model can represent.', 'Foundations', 'intermediate', 'discussed', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('transformer', 'transformer', 'Transformer', 'Attention-based sequence architecture', 'The architecture behind modern language models. Self-attention, residual stacks, and why transformers scaled when earlier sequence models stalled.', 'Language Models', 'intermediate', 'discussed', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('attention', 'attention', 'Attention', 'Weighting what matters in context', 'A mechanism for relating tokens to each other. Query, key, and value projections, and how attention became the core of transformers.', 'Language Models', 'intermediate', 'discussed', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('tokenization', 'tokenization', 'Tokenization', 'Turning text into model input', 'How language is split into tokens before a model sees it. Vocabulary size, subword units, and the tradeoffs that show up later in prompting and RAG.', 'Language Models', 'beginner', 'discussed', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('embedding', 'embedding', 'Embedding', 'Vectors that capture meaning', 'Dense representations of text (and other data) in a space where similar items sit near each other. The foundation for search, clustering, and retrieval.', 'Retrieval', 'intermediate', 'discussed', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('llm', 'llm', 'Large Language Models', 'Transformers trained at scale', 'Language models trained on large corpora. Pretraining, next-token prediction, and the capabilities that emerge enough to support tools, RAG, and agents.', 'Language Models', 'intermediate', 'discussed', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('prompt-engineering', 'prompt-engineering', 'Prompt Engineering', 'Steering models with language', 'How instructions, examples, and constraints change model behavior. Useful on its own, and closely tied to how we assemble context for a task.', 'Applied AI', 'beginner', 'learning', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('vector-database', 'vector-database', 'Vector Database', 'Storing and searching embeddings', 'Indexes built for nearest-neighbor lookup over embeddings. The storage layer that makes retrieval fast enough to sit in front of a language model.', 'Retrieval', 'intermediate', 'learning', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('rag', 'rag', 'RAG', 'Retrieval-Augmented Generation', 'RAG combines retrieval with language model generation. Instead of answering from parameters alone, the model is given relevant documents at generation time.', 'Applied AI', 'intermediate', 'learning', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('agent', 'agent', 'AI Agents', 'Models that act through tools', 'Systems that plan, call tools, and iterate toward a goal. Agents sit on top of language models and retrieval, and they raise new questions about control and context.', 'Agents', 'advanced', 'to_learn', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('mcp', 'mcp', 'MCP', 'Model Context Protocol', 'A protocol for connecting models to tools and data sources in a consistent way. Useful once agents need more than one-off API wrappers.', 'Agents', 'advanced', 'to_learn', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z'),
  ('context-engineering', 'context-engineering', 'Context Engineering', 'Assembling what the model sees', 'The craft of choosing, ordering, and constraining context: prompts, retrieved documents, memory, and tool results. Related to RAG, prompting, and agents without being any one of them.', 'Applied AI', 'intermediate', 'learning', '2026-09-10T00:00:00.000Z', '2026-09-10T00:00:00.000Z')
on conflict (id) do nothing;

insert into public.topic_relations (
  id, source_topic_id, target_topic_id, type
) values
  ('ai-basics-before-machine-learning', 'ai-basics', 'machine-learning', 'prerequisite'),
  ('machine-learning-before-neural-networks', 'machine-learning', 'neural-networks', 'prerequisite'),
  ('neural-networks-before-transformer', 'neural-networks', 'transformer', 'prerequisite'),
  ('transformer-before-attention', 'transformer', 'attention', 'prerequisite'),
  ('transformer-before-tokenization', 'transformer', 'tokenization', 'prerequisite'),
  ('transformer-before-embedding', 'transformer', 'embedding', 'prerequisite'),
  ('transformer-before-llm', 'transformer', 'llm', 'prerequisite'),
  ('llm-before-prompt-engineering', 'llm', 'prompt-engineering', 'prerequisite'),
  ('embedding-before-vector-database', 'embedding', 'vector-database', 'prerequisite'),
  ('embedding-before-rag', 'embedding', 'rag', 'prerequisite'),
  ('vector-database-before-rag', 'vector-database', 'rag', 'prerequisite'),
  ('llm-before-rag', 'llm', 'rag', 'prerequisite'),
  ('rag-before-agent', 'rag', 'agent', 'prerequisite'),
  ('llm-before-agent', 'llm', 'agent', 'prerequisite'),
  ('agent-before-mcp', 'agent', 'mcp', 'prerequisite'),
  ('prompt-engineering-related-context-engineering', 'prompt-engineering', 'context-engineering', 'related'),
  ('rag-related-context-engineering', 'rag', 'context-engineering', 'related'),
  ('agent-related-context-engineering', 'agent', 'context-engineering', 'related')
on conflict (id) do nothing;

insert into public.resources (
  id, topic_id, title, url, type
) values
  ('rag-hf-course', 'rag', 'Hugging Face Course', 'https://huggingface.co/learn/nlp-course', 'tutorial'),
  ('rag-paper', 'rag', 'Original Paper', 'https://arxiv.org/abs/2005.11401', 'paper'),
  ('rag-video', 'rag', 'RAG Explained', 'https://www.youtube.com/watch?v=T-D1OfcDW1M', 'video'),
  ('rag-notes', 'rag', 'RAG Study Notes', 'https://github.com/huggingface/blog/blob/main/rag.md', 'notes'),
  ('transformer-paper', 'transformer', 'Attention Is All You Need', 'https://arxiv.org/abs/1706.03762', 'paper'),
  ('transformer-illustrated', 'transformer', 'The Illustrated Transformer', 'https://jalammar.github.io/illustrated-transformer/', 'tutorial'),
  ('agent-anthropic', 'agent', 'Building Effective Agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'website')
on conflict (id) do nothing;
