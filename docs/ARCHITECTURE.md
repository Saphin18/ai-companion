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
   │ Expo / React    │ ─────► │    FastAPI       │ ─────► │  (Claude, via   │
   │ Native          │ ◄───── │    (Python)      │ ◄───── │  our own layer) │
   └─────────────────┘        └────────┬─────────┘        └─────────────────┘
                                        │
                                        │ reads / writes
                                        ▼
                              ┌──────────────────┐
                              │    SUPABASE      │
                              │  Auth + Postgres │
                              └──────────────────┘
```

- The **mobile app** never talks to the database or the AI directly. It only
  talks to **our backend**. This keeps secrets safe and logic in one place.
- The **backend** is the brain: it checks who the user is, saves messages, and
  asks the AI for replies.
- **Supabase** handles login/accounts and stores our data (PostgreSQL).
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

---

## 3. Planned folder structure

We create folders **only when we need them**, but here is the target shape so you
know where things will live:

```
ai-companion/
├── frontend/            # the Expo / React Native mobile app
├── backend/
│   └── app/
│       ├── api/         # HTTP endpoints (the "doors" into the backend)
│       ├── models/      # data shapes (what a User, Message look like)
│       ├── services/    # business logic (the "how")
│       ├── repositories/# talks to the database
│       ├── ai/          # the AIProvider abstraction layer
│       ├── auth/        # authentication glue
│       ├── core/        # config, settings, security helpers
│       └── main.py      # backend entry point
├── docs/                # all our documentation (already started)
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
- Build clean enough that scaling later is an *upgrade*, not a *rewrite*.
