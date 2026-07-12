# Database Schema (Phase 1)

Postgres (Supabase). Backend connects via SQLAlchemy async + asyncpg using the
Session pooler. Backend always filters by user_id from the verified JWT; RLS is
enabled as a second layer that protects any direct PostgREST/anon access.

## chat_sessions
- id           uuid  PK, default gen_random_uuid()
- user_id      uuid  FK -> auth.users(id) ON DELETE CASCADE
- title        text  (first ~40 chars of the opening message)
- created_at   timestamptz default now()
- updated_at   timestamptz default now() (bumped on each new message)

## chat_messages
- id           uuid  PK
- session_id   uuid  FK -> chat_sessions(id) ON DELETE CASCADE
- user_id      uuid  FK -> auth.users(id) ON DELETE CASCADE
- role         text  CHECK in (user, assistant)
- content      text
- created_at   timestamptz default now()

Deleting a user cascades to their sessions and messages (privacy principle).
The full CREATE SQL lives in the Supabase SQL Editor history and in this repo.
