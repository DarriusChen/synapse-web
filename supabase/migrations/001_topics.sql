create table public.topics (
  id text primary key,
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  category text,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  status text not null check (status in ('to_learn', 'learning', 'discussed', 'inbox')),
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table public.topic_relations (
  id text primary key,
  source_topic_id text not null references public.topics (id) on delete cascade,
  target_topic_id text not null references public.topics (id) on delete cascade,
  type text not null check (type in ('prerequisite', 'related')),
  check (source_topic_id <> target_topic_id)
);

create table public.resources (
  id text primary key,
  topic_id text not null references public.topics (id) on delete cascade,
  title text not null,
  url text not null,
  type text not null check (
    type in ('notes', 'paper', 'video', 'tutorial', 'repository', 'website')
  )
);

create index topic_relations_source_idx on public.topic_relations (source_topic_id);
create index topic_relations_target_idx on public.topic_relations (target_topic_id);
create index resources_topic_idx on public.resources (topic_id);

alter table public.topics enable row level security;
alter table public.topic_relations enable row level security;
alter table public.resources enable row level security;
