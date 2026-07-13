# Architecture

**Project:** AI Companion
**Status:** Approved

This document explains the shape of the system and *why* it's shaped that way.
The "Decision Records" below are how professional teams remember why they chose
what they chose (the real term is **ADR — Architecture Decision Record**).

---

## 1. The big picture

```
   ┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
   │   MOBILE APP    │  HTTPS │   BACKEND API    │        │   AI PROVIDER   │
   │ Expo / React    │ ─────► │    FastAPI       │ ─────► │  (Groq, via     │
   │ Native          │ ◄───── │    (Python)      │ ◄───── │  our own layer) │
   └─────────────────┘        └────────┬─────────┘        └─────────────────┘
                                        │
                                        │ reads / writes
                                        ▼
                              ┌──────────────────┐
                              │    SUPABASE      │
                              │  Auth + Postgres │
                              │  + Storage       │
                              └──────────────────┘
```

- The **mobile app** never talks to the database or the AI directly. It only
  talks to **our backend**. This keeps secrets safe and logic in one place.
- The **backend** is the brain: it checks who the user is, saves messages,
  remembers facts about the user, and asks the AI for replies.
- **Supabase** handles login/accounts, stores our data (PostgreSQL), and hosts
  profile photos (Storage).
- The **AI provider** sits behind our own interface so it can be swapped.

---

## 2. Decision Records (Decision → Why → Alternatives rejected)

**D1 — Mobile: Expo (React Native)**
Why: one codebase for iOS + Android; test on a real phone via QR code; uses
JavaScript (huge community). Rejected: *Flutter* (adds a new language, Dart);
*native Swift/Kotlin* (building the app twice).

**D2 — Backend: FastAPI (Python)**
Why: Python is beginner-friendly and the home of AI tooling; FastAPI
auto-generates interactive API docs. Rejected: *Node/Express* (splits language
from our AI work); *NestJS* (heavy and opinionated for a first project).

**D3 — Database: PostgreSQL**
Why: our data is relational (users → messages → sessions → memories); Postgres
enforces those links and scales cleanly. Rejected: *MongoDB* (document-based;
we'd hand-manage relationships); *SQLite* (doesn't scale to real users).

**D4 — Auth: Supabase Auth**
Why: pre-built, battle-tested email/password + Google + Apple, plus password
reset and session expiry (exactly our SRS); and it *is* PostgreSQL underneath.
Rejected: *building auth from scratch* (dangerous — risks leaking passwords);
*Firebase Auth* (bundles a document DB, fights D3).

**D5 — AI behind an abstraction layer**
Why: chat code calls our own `AIProvider` interface, not a vendor SDK directly —
so we can swap providers by changing one file, test with a fake AI, and control
tone in one place. Rejected: *calling the AI API directly from chat code*
(scatters provider-specific code everywhere; the exact rewrite trap we're
avoiding).

**D6 — Active AI provider: Groq (llama-3.3-70b-versatile)**
Why: Anthropic required paid billing; Google Gemini's free tier returned a
zero quota in our region; Groq offers a genuinely free, globally available tier
with an OpenAI-compatible API. Thanks to D5, switching cost one new provider
file plus one line in `provider_factory.py`. Rejected (for now): *Anthropic*
(billing), *Gemini* (regional free-tier block), *Ollama* (works but uses local
machine resources). Any of these can be re-enabled later by swapping the factory
line.

**D7 — Supabase JWT verification via JWKS**
Why: Supabase migrated to asymmetric ES256 signing keys published at a JWKS
endpoint, so a static shared-secret check no longer works. We fetch and cache
Supabase's public keys (via httpx with a browser-like User-Agent, since the edge
network blocks default clients) and verify tokens against them. Rejected:
*legacy shared-secret HS256* (no longer signs new tokens).

**D8 — DB access: SQLAlchemy async + asyncpg via the Session pooler**
Why: async keeps the API non-blocking; the repository pattern keeps SQL out of
endpoints. Backend always filters by `user_id` from the verified JWT; RLS is a
second defense layer. Rejected: *raw SQL in endpoints* (scatters DB logic);
*sync psycopg2* (blocks the event loop).

**D9 — Sessions + messages data model**
Why: one conversation = one `chat_session` (title = first ~40 chars of the
opening message); each turn is a `chat_message` (role user/assistant). Frontend
maps `assistant` → `companion`. Clean history + a browsable chats list.

**D10 — Soft delete for chats (rule 0.5 #1)**
Why: "Remove from list" sets `hidden_at` and filters out of the list query; chat
rows are NEVER physically deleted. The owner retains chat data server-side.
Rejected: *hard delete* (violates the retention rule).

**D11 — Custom SMTP via Brevo for Supabase Auth emails**
Why: Supabase's built-in sender (~3–4/hour) was too limited for real users;
Brevo's free tier (300/day) sends confirmation/reset emails reliably. SMTP creds
live in Supabase Auth → Emails → SMTP.

**D12 — Permanent account deletion that preserves chat data (rule 0.5 #5)**
Why: `DELETE /account` calls Supabase's admin delete-user API with the service
role key. Chat tables use a plain `user_id` column with **NO FK to auth.users**,
so chat rows survive; the login is freed for a fresh re-signup. This is the ONLY
permanent delete and it never touches chat rows.

**D13 — Theme system with token palettes + dual persistence**
Why: `ThemeContext` exposes design tokens with dark & light palettes and a
`system` mode. Choice persists to AsyncStorage (instant on launch, no flicker)
AND Supabase `profiles.theme_preference` (cross-device). Local cache wins over
server so an in-app toggle is never overridden.

**D14 — Avatars in Supabase Storage**
Why: public bucket `avatars`, one file per user at
`avatars/<user_id>/avatar.jpg` (upsert overwrites old). Public URL saved to
`profiles.avatar_url` with a `?v=timestamp` cache-buster. RLS: public read,
authenticated insert/update scoped to the user's own folder.

**D15 — Partial profile updates**
Why: `PUT /profile` uses `model_dump(exclude_unset=True)` so the client can
update just name, just theme, or just avatar without wiping the others.

**D16 — Auth flows use backend-hosted HTML pages, not app deep links**
Why: the email-confirmation page (`GET /confirmed`) and password-reset page
(`GET /reset-password`) are plain HTML served by FastAPI. The reset page reads
the Supabase recovery token from the URL hash and calls Supabase's
`PUT /auth/v1/user` directly with the anon key (public by design). Zero app-side
deep-link plumbing; works from any browser. Supabase Site URL → `/confirmed`;
Redirect URLs allow-list must include both `/confirmed` and `/reset-password`.

**D17 — Change password = verify-then-update**
Why: verify the current password via `signInWithPassword` (fails → wrong
password), then `updateUser({ password })`. A "Forgot password?" link in the
dialog sends the reset email as an escape hatch. If biometrics are on, the new
password is re-stored so fingerprint login keeps working.

**D18 — Biometric login = local credential lock (Option B)**
Why: `expo-local-authentication` gates access; `expo-secure-store`
(hardware-backed encrypted keystore) holds email + password. The login screen
shows a fingerprint button (visible only when enabled + device-capable + creds
present) that scans → `signInWithPassword` with stored creds. Chosen over
storing the session token (Option A) for bank-app behavior that always works
even after token expiry. Native modules ⇒ APK-only. Does NOT auto-lock on
foreground; the login-screen button is the single entry point.

**D19 — Two-tier memory, no vector DB**
Why: the companion must remember the user across chats. (1) **Short-term:** the
last 20 messages of the current session are fed back to Groq as a real
multi-turn message array, so it follows the thread. (2) **Long-term:** after
each turn a best-effort Groq extraction call pulls durable facts into
`user_memories`; active facts are injected wholesale into the system prompt on
every message. No embeddings/retrieval — the per-user memory set stays small
enough to inject in full, which keeps it free and beginner-friendly. Extraction
failures never break chat (wrapped in try/except, returns []). Rejected (for
now): *pgvector + embedding retrieval* (added cost/complexity, unnecessary until
memory grows large — a clean future upgrade thanks to the repository pattern).

---

## 3. Folder structure (actual)

```
ai-companion/
├── frontend/            # the Expo / React Native mobile app
├── backend/
│   └── app/
│       ├── api/         # HTTP endpoints (chat, profile, health, confirmed, reset_password)
│       ├── models/      # Pydantic data shapes (chat, profile, memory)
│       ├── repositories/# talks to the database (chat, profile, memory)
│       ├── ai/          # AIProvider layer (base, groq ACTIVE, memory_extractor, factory)
│       ├── auth/        # authentication glue (JWKS verification)
│       ├── db/          # engine, session, Base, ORM models
│       ├── core/        # config, settings
│       └── main.py      # backend entry point
├── docs/                # all our documentation
├── .gitignore
├── README.md
└── LICENSE
```

---

## 4. Core architectural principles

- The mobile app **never** holds database credentials or AI keys — only the
  backend does.
- Every layer has **one job** (endpoints route, services decide, repositories
  store). This is "separation of concerns."
- Providers (AI, and even auth) are reachable through interfaces so they can be
  swapped without rewrites.
- Build clean enough that scaling later is an *upgrade*, not a *rewrite* — the
  memory system (D19) is the proof: adding vector retrieval later is a new
  repository method, not a rewrite.
