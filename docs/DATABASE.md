# Database Schema

Postgres (Supabase). Backend connects via SQLAlchemy async + asyncpg using the
Session pooler. Backend always filters by user_id from the verified JWT; RLS is
enabled as a second layer that protects any direct PostgREST/anon access.

## Phase 1

### chat_sessions
id           uuid  PK, default gen_random_uuid()
user_id      uuid  NOT NULL, indexed (NO FK to auth.users — see note below)
title        text  (first ~40 chars of the opening message)
pinned       bool  NOT NULL default false
hidden_at    timestamptz NULL (soft-delete / "Remove from list")
created_at   timestamptz default now()
updated_at   timestamptz default now() (bumped on each new message)

### chat_messages
id           uuid  PK, default gen_random_uuid()
session_id   uuid  FK -> chat_sessions(id) ON DELETE CASCADE
user_id      uuid  NOT NULL, indexed (NO FK to auth.users)
role         text  in (user, assistant)
content      text
created_at   timestamptz default now()

**IMPORTANT (rule 0.5 #1 / #5, D12):** chat_sessions and chat_messages use a plain
`user_id` column with **NO foreign key to auth.users**. Deleting the auth account
(DELETE /account) therefore does NOT cascade-delete chat data — chat rows are retained
in the DB by design; the freed email can re-signup as a fresh, empty account.
"Remove from list" is a soft delete (sets hidden_at); chat rows are never physically
deleted anywhere.

### profiles
id                uuid  PK (matches auth user id)
display_name      text  NULL
theme_preference  text  NOT NULL default 'system'   (Phase: theme)
avatar_url        text  NULL                         (Phase: avatar)
created_at        timestamptz default now()
updated_at        timestamptz default now(), onupdate now()

## Phase 2 — long-term memory

### user_memories
Stores durable facts the companion remembers about each user across all chats.

id           uuid  PK, default gen_random_uuid()
user_id      text  NOT NULL, indexed (Supabase auth uid as text)
category     text  NOT NULL default 'fact'  (fact | preference | goal | event | relationship)
content      text  NOT NULL  (one short third-person fact, e.g. "Has a dog named Max")
importance   int   NOT NULL default 3  (1 minor .. 5 core)
is_active    bool  NOT NULL default true  (soft-retire contradicted facts later)
created_at   timestamptz default now()
updated_at   timestamptz default now(), onupdate now()

Indexes: (user_id), (user_id, is_active).
RLS on with owner select/insert/update policies. Backend uses the pooler role and
filters by user_id from the JWT. Active facts are injected into the system prompt on
every message; new facts are extracted (best-effort Groq call) after each turn.

The full CREATE SQL lives in the Supabase SQL Editor history and in HANDOVER.md §D19.
