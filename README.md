# Synapse

Synapse is a collaborative learning map for AI study groups. It brings topics, prerequisites, and related concepts together in a visual map so members can understand the recommended learning path, browse notes and resources, and keep the shared curriculum organized.

## Features

- Visual AI learning map
- Topic list with category and status filters
- Topic details, prerequisites, related topics, and learning resources
- Password-protected admin area
- Topic and relationship management
- PostgreSQL storage powered by Supabase

## Tech Stack

- Next.js 16 (App Router)
- React 19 and TypeScript
- Supabase
- React Flow
- Tailwind CSS 4
- Vitest and Testing Library

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the Supabase database

Create a Supabase project, then run the following files in the Supabase SQL Editor in order:

1. `supabase/migrations/001_topics.sql`
2. `supabase/seed.sql`

The seed file adds a collection of AI topics, relationships, and sample resources. It is safe to run more than once.

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=choose-a-strong-password
```

`SUPABASE_SERVICE_ROLE_KEY` grants elevated access. Keep it in server-side environment variables only, and never commit it to Git or expose it to the browser.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin area is available at [http://localhost:3000/admin/topics](http://localhost:3000/admin/topics); sign in with the value of `ADMIN_PASSWORD`.

## Available Scripts

```bash
npm run dev        # Start the development server
npm run build      # Create a production build
npm run start      # Start the production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks
npm test           # Run the test suite
```

## Routes

- `/` — Learning map
- `/topics` — Topic directory
- `/topics/[slug]` — Topic details
- `/admin/login` — Admin sign-in
- `/admin/topics` — Topic management
- `/admin/topics/new` — Create a topic

## Project Structure

```text
src/
├── app/                    # Pages and layouts
├── components/             # Shared UI
├── features/
│   ├── admin/              # Admin authentication
│   ├── learning-map/       # Map rendering and layout
│   └── topics/             # Topic data, forms, and details
└── lib/                    # Supabase, sessions, and shared utilities
supabase/
├── migrations/             # Database schema
└── seed.sql                # Sample development data
```

For more product context and the complete V1 scope, see [AI Study Group Web App — V1 Product Spec.md](AI%20Study%20Group%20Web%20App%20—%20V1%20Product%20Spec.md).
