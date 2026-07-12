# AI Companion — Master Handover Document

> Paste this entire file (or its key sections) into a new chat to continue
> building without losing context. It captures everything: what we're building,
> what's done, what broke and how we fixed it, and what's next.

---

## 🔖 WHERE WE LEFT OFF (read this first)

**Last session (Phase 1 push) — what we achieved:**
- Chat history now persists to Postgres (sessions + messages tables, RLS).
- Built the **Chats list** screen (past conversations, tap to reopen, "New chat").
- Fixed session grouping so one conversation = one chat (was creating a new chat
  per message before).
- Built the **Profile** screen: display name (save/load), email, **Log out**,
  **Clear chat view** (view-only, DB retained).
- Redesigned the **login/signup** screen (gradient, glowing orb, fade-in, animated
  Log in ↔ Sign up switch, full-name field at signup).
- Fixed the Android keyboard issues (chat input + login email→password focus).
- Added an auth token-refresh guard (killed the 401s on load).
- Backend soft-delete endpoint `DELETE /sessions/{id}` (hides via `hidden_at`) —
  built, but its UI is NOT wired into the chats list yet.
- Committed & pushed to GitHub. ✅

**Also done (app identity + convenience):**
- Renamed the app to **"Saphin AI"** (app.json: name "Saphin AI", slug `saphin-ai`,
  android package `com.saphin.ai`, ios bundleId `com.saphin.ai`, splash bg `#2a2350`).
- Created a **custom app icon** (glowing purple orb on brand-purple) — replaced
  `frontend/assets/icon.png`, `splash-icon.png`, `adaptive-icon.png`, `favicon.png`.
  (Custom icon + "Saphin AI" name only show in a real build, NOT inside Expo Go.)
- Added **`start.bat`** in project root: double-click to launch backend + frontend
  in two windows automatically (local dev convenience only).

**State right now:** Phase 1 is ~90% done. The app is fully usable end-to-end:
log in → see your chats → open/continue any chat (loads from DB) → profile with
name/logout/clear. The AI still has NO memory yet (each message answered in
isolation — that's Phase 2). App is branded "Saphin AI" with its own icon.

**➡️ WHAT WE'RE DOING NEXT (this is why the new chat starts): FREE DEPLOYMENT to
send a real APK to friends.** See the new **§12 FREE DEPLOYMENT PLAN** below for the
full step-by-step. Short version: (1) host the FastAPI backend on a free service so
phones can reach it over the internet, (2) point the app at that URL, (3) use EAS
Build (free tier) to produce a standalone **.apk** with the "Saphin AI" name + icon,
(4) share the .apk file directly with friends (no Play Store, no $25 fee).

**➡️ NEXT STEP (start here in the new chat):** wire the long-press
**"Remove from list"** into `ChatsListScreen.tsx` (backend `DELETE /sessions/{id}`
+ `removeSession()` in api.ts already exist — just add long-press → confirm →
call → refresh). This is soft-delete only (rule 0.5) and also lets you clear the
old junk chat rows. After that: password reset, then Google/Apple sign-in, then
Phase 2 (memory).

---

## 0. CONTINUATION PROMPT (paste this first in the new chat)

We have already completed the planning phase (PRD, SRS, Roadmap, Architecture, etc.) AND most of Phase 1. Continue from where we left off.
From now on, optimize for token efficiency.
Rules:
- Prioritize building over explanations.
- Keep explanations under 5 sentences unless I specifically ask for more.
- Don't repeat information we've already agreed on.
- Don't ask for confirmation after every small step. Only stop if a decision will significantly affect the project.
- If there are no blockers, continue building automatically.
- Generate complete production-ready files, never partial snippets.
- Tell me the exact file path for every file.
- **ALWAYS tell me whether a command runs in the FRONTEND terminal or the BACKEND terminal, at the top of every command block. Never make me guess.**
- Generate one complete file at a time unless multiple files are required together.
- Keep the architecture clean, scalable, and beginner-friendly.
- Continue using our agreed tech stack:
  - Expo + React Native (TypeScript)
  - FastAPI
  - PostgreSQL
  - Supabase Authentication
  - AI Provider abstraction layer
- Automatically update documentation when major changes happen.
- At the end of every major milestone, generate a compact handover summary including:
  - Current project status
  - Files created/modified
  - Important architecture decisions
  - Remaining tasks
My goal is to maximize coding output while minimizing token usage and context limitations. Assume all previous planning decisions remain valid and continue building automatically unless you absolutely need clarification.

---

## ⚠️ 0.5 CRITICAL PRODUCT RULES — NEVER VIOLATE OR FORGET THESE

These are decisions I (the owner) made explicitly. Do not "improve" or reverse them.

1. **DATA IS NEVER DELETED FROM THE DATABASE BY THE USER.**
   - The user can clear/remove things from the APP VIEW only. The underlying rows
     in Postgres ALWAYS stay. Users do NOT have control over the database.
   - "Clear chat view" → only resets what's shown on screen; DB rows untouched.
   - "Remove from list" (chats) → **soft delete** via a `hidden_at` timestamp.
     The row and its messages STAY in the database, just hidden from the list.
   - There is **NO real/hard delete option** anywhere. Do not add one.
   - IMPORTANT LABELING RULE: because data is retained, never label a button
     "Delete my data" or anything implying permanent erasure. Use honest labels
     like "Clear chat view" / "Remove from list". (This keeps us honest and
     avoids app-store/privacy problems while still keeping all data server-side.)

2. **Log out means log out.** It only ends the session. It deletes nothing.

3. **Full name is collected AT SIGN UP** (not only editable later). It is also
   editable afterward in the Profile screen.

4. **Always tell me FRONTEND or BACKEND** for every terminal command.

---

## 0.6 MODEL USAGE PLAN (agreed workflow for this project)

- **Sonnet (medium)** = daily driver for ~85% of work (file generation, debugging,
  wiring, refactors, doc updates). Bump to **Sonnet high** only for a stubborn bug.
- **Opus (high)** = only at genuine architecture forks: Phase 2 memory system design,
  Phase 3 personality/reflection design, Phase 4 proactivity/notifications design.
- Pattern: **Opus decides the shape, Sonnet builds it.** Skip "extra" thinking for
  this project (it's mostly well-scoped codegen).
- Discipline: one milestone per chat, paste this handover (not whole logs), start a
  fresh chat each milestone to protect usage limits.

---

## 1. WHAT WE ARE BUILDING

A mobile **AI Companion** app — a warm, supportive AI that feels like a trusted
friend. It must always be warm/encouraging, never claim to be human or have real
feelings, and never foster unhealthy dependence. Privacy is core: user data is
private and never sold. (Per rule 0.5, "private" here means the user can hide/clear
things from their view; the owner retains data server-side.)

**Developer profile:** beginner, first app. Wants production-quality but
beginner-friendly. Works on **Windows**, project on Desktop.

---

## 2. TECH STACK (locked)

- **Frontend:** Expo + React Native (TypeScript), tested via Expo Go on a
  physical Android phone (QR code)
- **Backend:** FastAPI (Python 3.14), run with uvicorn
- **Database:** PostgreSQL (via Supabase) — **NOW in active use** for chat history
  and profiles (SQLAlchemy async + asyncpg)
- **Auth:** Supabase Authentication (email/password working; Google/Apple planned)
- **AI:** Provider abstraction layer. **Active provider = Groq** (free tier,
  `llama-3.3-70b-versatile`, via OpenAI-compatible SDK). Claude + Gemini
  providers also exist but are inactive.

---

## 3. ROADMAP (5 phases)

**Phase 1 — Foundation (NEARLY COMPLETE, ~90%):** project setup ✅, mobile UI ✅,
email/password auth ✅, secure backend ✅, AI chat ✅, **chat history persistence ✅**,
**chats list ✅**, **profile screen (name/email/logout) ✅**, **clear chat view ✅**,
**redesigned auth screen ✅**. Still open: Google login ⬜, Apple Sign-In ⬜,
Facebook ⬜ (optional), wire "Remove from list" into the chats list UI ⬜ (backend
endpoint already exists).

**Phase 2 — Memory:** long-term memory, structured memory system, memory
extraction, context injection. (NOTE: the AI currently has NO memory/context yet —
each message is answered in isolation. Feeding history into the prompt is Phase 2.)

**Phase 3 — Personality & Reflection:** emotional tone detection, motivation
mode, humor mode, journaling, mood summaries.

**Phase 4 — Proactivity:** push notifications, proactive check-ins, daily
reminders, goal tracking.

**Phase 5 — Advanced:** voice conversations, premium features, advanced
personalization.

**Future vision (guides architecture):** long-term relationship, milestone
recall, non-manipulative proactive check-ins, adapts to user's communication
style, multiple selectable personalities, swappable AI providers, clean
scalability (without over-engineering).

---

## 4. PROGRESS — HOW MUCH IS DONE

**Roughly: Phase 1 is ~90% complete.** Full authenticated AI chat loop works,
messages persist to Postgres, a chats list lets the user pick past conversations,
and there's a profile screen with name/logout/clear-chat plus a redesigned login.

**Working end-to-end right now:**
mobile app → email/password login (Supabase) → JWT attached to request →
FastAPI verifies JWT via Supabase JWKS → **saves user+assistant messages to
Postgres** → calls Groq → returns reply → shows on phone. On reopen, the user
sees a **"Your Chats"** list, taps one, and its messages **load from the DB**.
New messages stay grouped in ONE session. Session persists across app restarts.

---

## 5. PROJECT STRUCTURE (actual, on disk)

Root: `C:\Users\saphi\Desktop\Ai-Companion\`

```
Ai-Companion/
├── .gitignore
├── README.md
├── docs/
│   ├── PRD.md
│   ├── SRS.md
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md            # decision records D1–D7 (see §6)
│   ├── DATABASE.md                # NEW — chat_sessions/chat_messages/profiles schema
│   └── learning.md
├── backend/
│   ├── .env                       # REAL SECRETS (gitignored) — see §7
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt           # + sqlalchemy[asyncio]>=2.0, asyncpg>=0.29
│   └── app/
│       ├── __init__.py
│       ├── main.py                # FastAPI app, CORS, routers (health, chat, profile)
│       ├── core/
│       │   ├── __init__.py
│       │   └── config.py          # Settings from .env (+ database_url)
│       ├── models/
│       │   ├── __init__.py
│       │   ├── chat.py            # ChatRequest/Response, MessageOut, SessionOut
│       │   └── profile.py         # NEW — ProfileOut, ProfileUpdate
│       ├── db/                    # NEW package (SQLAlchemy async)
│       │   ├── __init__.py
│       │   ├── base.py            # DeclarativeBase
│       │   ├── session.py         # async engine + get_db() (asyncpg, SSL relaxed)
│       │   └── models.py          # ChatSession, ChatMessage, Profile ORM models
│       ├── ai/
│       │   ├── __init__.py
│       │   ├── base.py            # AIProvider ABC
│       │   ├── claude_provider.py # inactive
│       │   ├── gemini_provider.py # inactive
│       │   ├── groq_provider.py   # ACTIVE
│       │   └── provider_factory.py# returns GroqProvider() via get_ai_provider()
│       ├── auth/
│       │   ├── __init__.py
│       │   └── dependencies.py    # get_current_user_id via Supabase JWKS
│       ├── api/
│       │   ├── __init__.py
│       │   ├── health.py          # GET /health
│       │   ├── chat.py            # POST /chat, GET /sessions,
│       │   │                      #   GET /sessions/{id}/messages,
│       │   │                      #   DELETE /sessions/{id} (soft-hide)
│       │   └── profile.py         # NEW — GET /profile, PUT /profile
│       ├── repositories/
│       │   ├── __init__.py
│       │   ├── chat_repository.py    # NEW — sessions/messages data access + hide
│       │   └── profile_repository.py # NEW — profile get/upsert
│       └── services/__init__.py
└── frontend/
    ├── .env                       # EXPO_PUBLIC_ vars (gitignored)
    ├── .env.example
    ├── app.json                   # android: edgeToEdgeEnabled=false, softwareKeyboardLayoutMode="pan"
    ├── App.tsx                    # nav: Auth | ChatsList | Chat | Profile
    ├── index.js, package.json, tsconfig.json
    ├── assets/
    └── src/
        ├── types/chat.ts          # ChatMessage { id, role:'user'|'companion', text, createdAt }
        ├── components/
        │   ├── ChatBubble.tsx
        │   └── ChatInput.tsx
        ├── screens/
        │   ├── AuthScreen.tsx     # redesigned: gradient, orb, fade-in, signup full-name,
        │   │                      #   email→password focus via refs (no scroll needed)
        │   ├── ChatsListScreen.tsx# NEW — list of past chats + "New chat"
        │   ├── ChatScreen.tsx     # loads a session's messages, tracks session_id
        │   └── ProfileScreen.tsx  # NEW — display name, email, Save, Clear chat view, Log out
        └── services/
            ├── supabase.ts        # Supabase client (AsyncStorage session)
            └── api.ts             # auth-guarded fetch: chat, profile, sessions, messages, removeSession
```

Dependencies added this session (frontend): `expo-linear-gradient`.
(Do NOT install `react-native-keyboard-controller` — it conflicts with the current
React Native version. We solved the keyboard issue without it. See §9.)

---

## 6. ARCHITECTURE DECISIONS (D1–D10)

- **D1** Mobile: Expo/React Native.
- **D2** Backend: FastAPI.
- **D3** DB: PostgreSQL (Supabase).
- **D4** Auth: Supabase.
- **D5** AI behind abstraction layer (`AIProvider`; swap = 1 file).
- **D6** Active AI = **Groq** (`llama-3.3-70b-versatile`). Swap via `provider_factory.py`
  → `get_ai_provider()`.
- **D7** JWT verification via Supabase **JWKS/ES256**, httpx + browser User-Agent, cache 1h.
- **D8 (NEW)** DB access = **SQLAlchemy async + asyncpg**, connected through Supabase's
  **Session pooler**. Backend always filters by `user_id` from the verified JWT; RLS is a
  second defense layer. Repository pattern (`repositories/`) keeps SQL out of endpoints.
- **D9 (NEW)** **Sessions + messages** data model (scalable). One conversation = one
  `chat_session` row (title = first ~40 chars of the opening message); each turn is a
  `chat_message` (role `user`/`assistant`). Frontend maps `assistant`→`companion`.
- **D10 (NEW)** **Soft delete only** (see rule 0.5). Chats "removed from list" set a
  `hidden_at` timestamp and are filtered out of the list query; nothing is physically
  deleted. No hard-delete endpoint exists by design.

---

## 7. SECRETS / CONFIG (values live only in local .env files, NEVER committed)

**backend/.env** keys:
```
SUPABASE_URL=https://mlqbnmloighdifavttwx.supabase.co   # base URL, NO /rest/v1/
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
DATABASE_URL=postgresql+asyncpg://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres
ANTHROPIC_API_KEY=...          # placeholder/unused
GEMINI_API_KEY=...             # unused (region-blocked)
GROQ_API_KEY=gsk_...           # ACTIVE
ENVIRONMENT=development
```
DATABASE_URL notes: scheme MUST be `postgresql+asyncpg://` (plain `postgresql://`
makes SQLAlchemy try psycopg2 and crash). Any `@` INSIDE the password must be
URL-encoded as `%40`; the `@` before the host stays literal. Use the **Session
pooler** URI from Supabase → Connect.

**frontend/.env** keys:
```
EXPO_PUBLIC_SUPABASE_URL=https://mlqbnmloighdifavttwx.supabase.co   # NO /rest/v1/
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_API_URL=http://192.168.254.244:8000   # PC's LAN IP + :8000
```

Supabase uses **asymmetric JWT signing keys (ES256)**; JWKS at
`{SUPABASE_URL}/auth/v1/.well-known/jwks.json`. Email confirmation is ON (signup
requires clicking the email link; because of this there is no session immediately
after signup, so the full name is saved on first login instead — handled already).

GitHub: repo `https://github.com/Saphin18/ai-companion` (private).

---

## 8. HOW TO RUN (two terminals)

**Backend** (PowerShell, in `backend/`):
```
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0
```
Health: `http://127.0.0.1:8000/health` → `{"status":"ok"}`.

**Frontend** (separate PowerShell, in `frontend/`):
```
npx expo start -c
```
Scan QR with Expo Go. Phone + PC on same WiFi.

**Native config changes (app.json) require a FULL restart** (`npx expo start -c`
+ fully close Expo Go + re-scan). A shake-reload will NOT apply them.

**Windows note:** create/replace files via PowerShell here-strings:
`@'` ... `'@ | Set-Content -Path <path> -Encoding utf8`. Write plain content;
avoid bash-style quote escaping (`'"'"'`) — it corrupts files.

**Git workflow (run in project ROOT `C:\Users\saphi\Desktop\Ai-Companion`):**
`git add .` → `git commit -m "..."` → `git push`.

---

## 9. MISTAKES WE HIT & FIXES

(Earlier ones 1–11 from prior sessions still apply: two folders, Python 3.14 wheels,
quote-escaping, downloaded-file confusion, JWT/JWKS, provider swaps, nested git repo.)

**This session:**
12. **`ModuleNotFoundError: psycopg2`** — `DATABASE_URL` started with `postgresql://`,
    so SQLAlchemy chose the sync driver. Fix: use `postgresql+asyncpg://`.
13. **`AttributeError: get_provider`** — factory function is actually
    `get_ai_provider()`. Fixed the call in `api/chat.py`.
14. **Every message became its own chat** — old rows were created before session
    tracking existed. The fix (frontend now sends `session_id`, reuses it) means
    NEW conversations group into one session. Old junk rows can be hidden via
    "Remove from list" once that UI is wired.
15. **401 on `/sessions` right after login** — token not ready on first calls.
    Fixed in `api.ts` `authHeaders()` by refreshing the session if the access
    token is missing before the request.
16. **Type errors** — `ChatMessage` uses `role: 'user' | 'companion'` (not
    'assistant') and requires `createdAt`. Frontend maps server `assistant`→`companion`.
17. **Android keyboard covering inputs** — long saga. What did NOT work reliably:
    `KeyboardAvoidingView` alone on a centered layout, `ScrollView` on a centered
    layout, `softwareKeyboardLayoutMode:"pan"` with `edgeToEdgeEnabled:true`.
    `react-native-keyboard-controller` FAILED to install (peer-dep conflict with
    react-native 0.81.5 / reanimated) — do NOT use it.
    **What fixed it:** chat screen uses `behavior="height"` on Android; login screen
    wires `ref`s so Email's return key focuses Password (`onSubmitEditing` +
    `blurOnSubmit={false}`), so no scrolling is needed at all. app.json set to
    `edgeToEdgeEnabled:false` + `softwareKeyboardLayoutMode:"pan"`.

---

## 10. REMAINING TASKS (recommended order)

1. **Wire "Remove from list" into the chats list UI** (backend `DELETE /sessions/{id}`
   and `removeSession()` in api.ts already exist; just add long-press → confirm →
   call → refresh). Label it "Remove from list" (soft delete only — rule 0.5).
   This also lets you clear the old junk rows.
2. **Password reset** flow (Supabase `resetPasswordForEmail`).
3. **Google Sign-In**, then **Apple Sign-In** (Apple required by App Store when
   other social logins exist).
4. Optional profile polish: avatar/photo, change password.
5. Then **Phase 2 (memory)** — this is an Opus-high architecture task: schema,
   extraction, and injecting past messages/facts into the prompt (the AI currently
   has no memory at all).

**Immediate next step when resuming:** wire the long-press "Remove from list" into
`ChatsListScreen.tsx`.

---

## 11. DOC MAINTENANCE RULE

Update docs on every major milestone: PRD, SRS, ROADMAP, ARCHITECTURE, DATABASE,
API (to be created), DEPLOYMENT (later), LEARNING, and this handover. Deployment
guide + populated README come near launch.

---

## 12. FREE DEPLOYMENT PLAN — send a real "Saphin AI" APK to friends (NEXT TASK)

**Goal:** produce a standalone `Saphin AI.apk` (own name + icon) that friends install
directly on Android — no Play Store, no fees. Cost = **$0**.

**Why the backend must move first:** the app currently points at
`EXPO_PUBLIC_API_URL=http://192.168.254.244:8000` (the PC's LAN IP). That only works
on the home WiFi. A friend on mobile data can't reach it. So the FastAPI backend has
to be hosted on the public internet, then the app points at that public URL. The APK
is built AFTER the backend is public, because the URL gets baked into the build.

### Cost reality (confirm to the user, keep it honest)
- Backend hosting: **free tier** (Render / Railway / Fly.io). $0 to start.
- EAS Build (makes the APK): **free tier**, limited builds/month. $0.
- Supabase + Groq: already on free tiers. $0.
- Sharing an `.apk` directly with friends: **free** (no Play Store).
- ONLY paid if later publishing to stores: Google Play $25 one-time, Apple $99/year.
  NOT needed for the APK-to-friends goal.

### STEP-BY-STEP (recommended order)

**A. Prep the backend for hosting**
1. Add a `Procfile`/start command so the host runs uvicorn. On most hosts the start
   command is: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (host injects `$PORT`).
2. Ensure `requirements.txt` is complete (it includes fastapi, uvicorn, sqlalchemy,
   asyncpg, supabase, httpx, pyjwt, openai, pydantic-settings, python-dotenv, etc.).
3. Backend reads secrets from env vars already (pydantic-settings). Good — we set the
   same keys from `backend/.env` (SUPABASE_URL, DATABASE_URL, GROQ_API_KEY, etc.) as
   environment variables in the host's dashboard. DO NOT commit `.env`.
4. CORS is currently `allow_origins=["*"]` — fine for now.

**B. Deploy the backend (pick ONE free host)**
- **Render** (beginner-friendly): New → Web Service → connect the GitHub repo →
  root dir `backend` → build `pip install -r requirements.txt` → start
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT` → add env vars → deploy.
- Get the public URL, e.g. `https://saphin-ai-backend.onrender.com`.
- Test it: open `<public-url>/health` in a browser → should return `{"status":"ok"}`.
- NOTE (free tier): the server may "sleep" when idle and take ~30–60s to wake on the
  first request. Acceptable for sharing with friends; mention it to them.

**C. Point the app at the public backend**
1. In `frontend/.env`, change `EXPO_PUBLIC_API_URL` to the public URL (no trailing
   slash), e.g. `EXPO_PUBLIC_API_URL=https://saphin-ai-backend.onrender.com`.
2. Also add the same public URL in Supabase → Auth → URL config if needed for
   redirects (email confirmation still works as before).

**D. Build the APK with EAS**
1. Install + log in (frontend terminal): `npm install -g eas-cli` then `eas login`
   (create a free Expo account if needed — this is just the build service; the app is
   still your own standalone "Saphin AI", not Expo Go).
2. `eas build:configure` → creates `eas.json`.
3. In `eas.json`, set the build profile to produce an APK (not AAB) for direct sharing:
   a `preview` profile with `"android": { "buildType": "apk" }`.
4. Build: `eas build -p android --profile preview`.
5. EAS runs in the cloud and gives a **download link to the `.apk`**.

**E. Share with friends**
- Send them the `.apk` link/file. On their Android: tap the file → allow "install from
  unknown sources" → install. They'll see the **Saphin AI** icon and name.
- They sign up in-app (Supabase email confirmation on), then use it. Their data hits
  the public backend + Supabase.

### Decisions still to make when we start (ask the user)
- Which free host: **Render** (simplest) vs Railway vs Fly.io. Default recommendation:
  Render.
- Whether to turn OFF Supabase email confirmation for easier friend onboarding (currently
  ON — friends must click an email link before first login). Optional.

### Watch-outs / likely gotchas
- The `DATABASE_URL` on the host must keep the `postgresql+asyncpg://` scheme and the
  `%40` encoding for any `@` in the password (same rule as §7).
- The SSL context in `db/session.py` is relaxed for dev; fine for the pooler, keep as-is
  for now.
- Free hosts sleep on idle (first request slow) — expected, not a bug.
- After changing `frontend/.env`, the URL is baked at BUILD time — rebuild the APK if the
  backend URL changes.

**When resuming in the new chat, START WITH STEP A** (prep backend), then B→C→D→E.
The in-app feature work (Remove-from-list, memory, etc.) can continue after friends are
testing the APK, OR finish those first — user's choice. Deployment and feature work are
independent now.
