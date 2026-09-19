# AI Study Group Web App — V1 Product Spec

## 1. Product Overview

Build a lightweight collaborative learning web app for an AI study group.

The app should help members:

1. Understand the overall AI learning landscape.
2. See the recommended learning path.
3. Explore relationships between topics.
4. Open shared notes and learning resources quickly.
5. Add new topics flexibly as the study group discovers new things.

The central concept is a **visual Learning Map backed by a topic graph**.

This is not intended to be a full LMS, Notion replacement, or social platform.

---

# 2. V1 Goal

The V1 should make the following core loop possible:

```text
Open app
→ Explore Learning Map
→ Select Topic
→ Understand topic context
→ Open related notes/resources
→ Discover related topics
```

Organizer workflow:

```text
Discover new topic
→ Add topic
→ Connect it to existing topics
→ Topic appears in Learning Map
```

The V1 should prioritize:

- visual clarity
- fast navigation
- flexible topic relationships
- low management overhead
- polished UI

---

# 3. Primary Users

## 3.1 Study Group Member

Can:

- view the Learning Map
- browse topics
- view topic details
- follow learning resources
- open shared notes

No authentication is required for normal members in V1.

## 3.2 Organizer / Admin

Can eventually:

- create topics
- edit topics
- create relationships
- add resources
- organize topics

Admin functionality may be added progressively across later vertical slices.

---

# 4. Core Concepts

## 4.1 Topic

A Topic is the primary knowledge unit.

Examples:

- Transformer
- Attention
- Embedding
- RAG
- Vector Database
- Agent
- MCP
- Context Engineering

Each topic should contain enough metadata to explain where it sits in the learning landscape.

### Topic fields

```ts
type Topic = {
  id: string
  slug: string
  title: string
  shortDescription?: string
  description?: string

  category?: string

  difficulty:
    | "beginner"
    | "intermediate"
    | "advanced"

  status:
    | "to_learn"
    | "learning"
    | "discussed"
    | "inbox"

  createdAt: string
  updatedAt: string
}
```

---

# 5. Topic Relationships

The knowledge structure must NOT be implemented as a strict tree.

Topics form a graph.

A topic may have multiple prerequisites and multiple related topics.

Example:

```text
Embedding ──────┐
                ↓
Vector DB ───→ RAG ───→ Agent
                ↑
Search ─────────┘
```

Supported relationship types in V1:

```ts
type TopicRelationType =
  | "prerequisite"
  | "related"
```

Data model:

```ts
type TopicRelation = {
  id: string
  sourceTopicId: string
  targetTopicId: string
  type: TopicRelationType
}
```

Semantics:

### prerequisite

```text
A → B
```

means:

> A should generally be understood before B.

Example:

```text
Embedding → RAG
```

### related

Means two topics are conceptually related but there is no strict learning order.

Example:

```text
RAG ↔ Context Engineering
```

---

# 6. Learning Map

The Learning Map is the primary experience of the application.

It should visually display:

- topics as nodes
- topic relationships as edges
- learning direction
- topic status
- topic difficulty
- current learning area

The Learning Map should feel closer to:

- React Flow
- Linear
- Obsidian graph
- modern developer tools

rather than an academic LMS.

---

# 7. Learning Path vs Knowledge Graph

The internal data structure is a graph.

The UI should eventually support two conceptual views:

## Learning Path

A structured view emphasizing recommended learning order.

Example:

```text
AI Basics
   ↓
Machine Learning
   ↓
Neural Networks
   ↓
Transformer
   ↓
LLM
   ↓
RAG
   ↓
Agent
```

## Knowledge Map

A freer graph-based view emphasizing topic relationships.

For V1, the first implementation can focus primarily on the structured Learning Map.

Do NOT implement multiple personalized learning paths in V1.

---

# 8. Topic Status

Topics support four statuses:

```text
To Learn
Learning
Discussed
Inbox
```

Suggested visual meaning:

```text
○ To Learn
◐ Learning
● Discussed
□ Inbox
```

`Inbox` topics appear on the Learning Map as unconnected nodes in a dedicated lane, visually distinct from the curriculum. They are omitted from the public topic list until organized. Connecting them on the map (drag-to-relate) is deferred.

---

# 9. Resources and Notes

Topics may link to external resources.

Do NOT build a rich-text editor in V1.

External tools remain the source of truth for shared notes.

Examples:

- Notion
- Google Docs
- HackMD
- GitHub
- YouTube
- Papers
- tutorials

Resource model:

```ts
type Resource = {
  id: string
  topicId: string
  title: string
  url: string

  type:
    | "notes"
    | "paper"
    | "video"
    | "tutorial"
    | "repository"
    | "website"
}
```

Suggested UI icons:

```text
📝 Notes
📄 Paper
🎥 Video
📖 Tutorial
💻 Repository
🌐 Website
```

---

# 10. V1 Information Architecture

Required routes:

```text
/
Learning Map

/topics/[slug]
Topic Detail
```

Planned later in V1 development:

```text
/admin/topics
Topic Management

/admin/topics/new
Create Topic
```

The first vertical slice does not need admin pages.

---

# 11. Home Page

The home page should contain:

## Header

Example:

```text
AI Study Group

Explore
Learning Map
Topics
```

Keep navigation minimal.

---

## Hero / Context Area

Suggested content:

```text
AI Study Group

Learn AI together,
one topic at a time.

Explore the map and see how ideas connect.
```

Keep the hero compact.

The Learning Map should remain the main visual focus.

---

# 12. Topic Node Design

Each node should display at minimum:

```text
Topic title
Status
Difficulty
```

Example:

```text
┌────────────────────┐
│ ● Discussed        │
│                    │
│ RAG                │
│                    │
│ Intermediate       │
└────────────────────┘
```

Nodes should:

- be clickable
- support hover state
- clearly show selected state
- remain readable at normal desktop zoom
- avoid unnecessary text

---

# 13. Topic Detail Page

Route:

```text
/topics/[slug]
```

The page should eventually contain:

```text
Topic title
Full name / subtitle
Difficulty
Status

About

Prerequisites

Related Topics

Resources

Shared Notes
```

Example:

```text
RAG
Retrieval-Augmented Generation

Intermediate
● Discussed

ABOUT

RAG combines retrieval with language
model generation.

PREREQUISITES

Embedding
Vector Database

RELATED TOPICS

Agent
Context Engineering

RESOURCES

📖 Hugging Face Course
📄 Original Paper
🎥 RAG Explained

STUDY NOTES

📝 RAG Study Notes
```

Topic Detail is implemented in VS-02, not VS-01.

---

# 14. Technology Stack

Use:

```text
Next.js
TypeScript
App Router

Tailwind CSS
shadcn/ui

React Flow

Supabase
PostgreSQL
```

Optional:

```text
Lucide React
Framer Motion
```

Framer Motion should not be required for initial functionality.

---

# 15. Architecture Principles

## Keep domain logic separate from UI

Avoid embedding topic graph logic directly inside React components.

Suggested structure:

```text
src/
  app/
  components/
  features/
    topics/
    learning-map/
  lib/
  types/
```

---

## Prefer server-side data fetching where reasonable

Use Server Components for page-level data fetching unless React Flow requires client-side behavior.

React Flow itself will be a Client Component.

---

## Avoid premature abstraction

Do not implement:

- plugin systems
- generic CMS architecture
- event sourcing
- complex graph database systems
- excessive repository/service layers

PostgreSQL relations are sufficient.

---

# 16. V1 Initial Data

Provide seed data so the application is visually meaningful immediately.

Suggested initial topics:

```text
AI Basics
Machine Learning
Neural Networks
Transformer
Attention
Tokenization
Embedding
LLM
Prompt Engineering
Vector Database
RAG
Agent
MCP
Context Engineering
```

Suggested relationships:

```text
AI Basics
→ Machine Learning

Machine Learning
→ Neural Networks

Neural Networks
→ Transformer

Transformer
→ Attention

Transformer
→ Tokenization

Transformer
→ Embedding

Transformer
→ LLM

LLM
→ Prompt Engineering

Embedding
→ Vector Database

Embedding
→ RAG

Vector Database
→ RAG

LLM
→ RAG

RAG
→ Agent

LLM
→ Agent

Agent
→ MCP
```

Related relationships may include:

```text
Prompt Engineering ↔ Context Engineering
RAG ↔ Context Engineering
Agent ↔ Context Engineering
```

---

# 17. Responsive Design

Primary target:

```text
Desktop
Tablet
```

Mobile should remain usable, but mobile-first optimization is not required for V1.

On smaller screens:

- map should support pan and zoom
- controls should remain accessible
- avoid forcing entire graph to fit viewport width

---

# 18. Design Direction

The product should feel:

- modern
- technical
- calm
- exploratory
- premium
- slightly futuristic

Avoid:

- generic dashboard appearance
- LMS/course platform aesthetics
- excessive gradients
- glowing cyberpunk visuals
- large marketing hero sections
- excessive cards
- childish gamification

Prioritize:

- whitespace
- typography
- subtle borders
- restrained shadows
- smooth interactions
- map as the hero visual

---

# 19. V1 Non-Goals

Do NOT implement these unless explicitly requested later:

```text
Authentication for study group members
Personal learning progress
Comments
Discussion threads
Voting
AI-generated summaries
AI-generated relations
AI recommendations
Personalized learning paths
Notifications
Calendar
In-app note editor
Real-time collaboration
Complex permissions
Multiple organizations
```

---

# 20. V1 Vertical Slices

Development should proceed incrementally.

## VS-01 — Learning Map Read Flow

```text
Open app
→ render learning map
→ inspect nodes
→ inspect relationships
→ click topic
```

## VS-02 — Topic Detail

```text
Click topic
→ open topic page
→ inspect topic information
→ follow related topics/resources
```

## VS-03 — Topic Management

```text
Admin
→ create topic
→ connect topic
→ save
→ topic appears on map
```

## VS-04 — Topic Inbox

```text
Quick Add
→ create incomplete topic
→ save to inbox
→ appear on map as an unconnected node
→ organize later
```

## VS-05 — Resources / Notes

```text
Add external resource
→ associate with topic
→ render on topic page
```

---

# 21. Definition of V1 Complete

V1 is considered complete when:

1. Users can explore a useful visual Learning Map.
2. Topic relationships are clearly visible.
3. Clicking a topic opens useful topic information.
4. Topics can link to external notes/resources.
5. Organizers can create and connect topics without editing code.
6. New topics appear correctly in the map.
7. The UI feels polished enough to use during an actual study group session.