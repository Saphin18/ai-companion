# Saphin AI — MASTER HANDOVER (the ONE file)

> **This single file replaces every previous handover file and every kickoff file.**
> Paste ONLY this into a new chat. It contains the whole project from day one to now:
> what we're building, every architecture decision, every file and its exact path, every
> secret/config location, every bug we hit and how we fixed it, the exact code contracts
> that keep tripping people up, and what's left to do.
>
> Nothing is repeated between sections — if a topic has a home, that's the only place it lives.

---

# SECTION 0 — READ THIS FIRST

## 0.1 Where we are RIGHT NOW

**The app is fully built through Phase 5 and shipped as a working APK.**

Latest session (Phase 4 + Phase 5) — everything below is DONE, TESTED, COMMITTED, PUSHED,
and BUILT into an APK that finished successfully on EAS:

- **Phase 4 — Proactivity: COMPLETE.** AI-written daily check-in push notifications
  (remote, cron-triggered), local reminders, and goal tracking injected into chat.
  Backend LIVE on Render, cron job running every 15 min on cron-job.org.
- **Phase 5 — Navigation redesign: COMPLETE.** Claude/ChatGPT-style home (hamburger menu +
  greeting + real chat input bar), left slide-in drawer holding all navigation + chat history,
  and a new About screen.
- **APK build:** finished successfully (`Phase 5: drawer navigation, home redesign, home input,
  About screen`, commit `8c84ffc`, build 41m 20s, all steps green including `expo doctor`).

**IMMEDIATE NEXT STEP:** install the APK on the phone and smoke-test the things that
**only work in a real build** (they cannot be tested in Expo Go):
1. No more red `expo-notifications` error on launch.
2. Daily check-in toggle **stays ON** after leaving and returning to Profile.
3. Permission prompt appears -> Allow -> a real AI-written check-in push arrives.
4. A local reminder actually buzzes at its set time.
5. Re-verify drawer, home input, rename/pin/remove on the real device.

After that, remaining work is optional polish (see SECTION 12).

## 0.2 CONTINUATION PROMPT (paste after this file in a new chat)

```
We have completed planning, Phase 1, Phase 2, Phase 3, Phase 4, and Phase 5. Continue from
where we left off. Optimize for token efficiency.

Rules:
- Prioritize building over explanations.
- Keep explanations short unless I ask for more.
- Don't repeat information we've already agreed on.
- Don't ask for confirmation after every small step. Only stop if a decision significantly
  affects the project.
- If there are no blockers, continue building automatically.
- Generate complete production-ready files, never partial snippets.
- Tell me the exact file path for every file.
- ALWAYS label FRONTEND or BACKEND at the top of every command block. Never make me guess.
- Give me full copy-paste PowerShell commands I can paste straight into the terminal.
- Keep the architecture clean, scalable, and beginner-friendly.
- Tech stack is locked: Expo + React Native (TypeScript), FastAPI, PostgreSQL (Supabase),
  Supabase Auth, AI provider abstraction layer.
- Automatically update documentation when major changes happen.
```

## 0.3 HOW TO GIVE ME ANSWERS (owner's working rules — DO NOT FORGET)

I'm a beginner on **Windows**, working in **PowerShell**. On EVERY answer:

1. **Label every command block `FRONTEND` or `BACKEND`.** Never make me guess which terminal.
2. **Give me full copy-paste PowerShell commands.** Not "open the file and change line 12."
   I want to paste one block and be done. Use the here-string pattern:
   ```powershell
   @'
   ...file content...
   '@ | Set-Content -Path "path\to\file.ts" -Encoding utf8
   ```
3. **For files that ALREADY exist with my code in them** (`main.py`, `chat.py`, `App.tsx`,
   `ProfileScreen.tsx`, etc.), do NOT blind-overwrite — that wipes my work. Ask me to show you
   the file first (`Get-Content <path>`), then give me the complete corrected file as one command.
   Seeing the real file before rewriting is what prevents broken imports.
4. **Complete files, never "change line X" snippets.** I get lost finding lines.
5. **Step-by-step** (Step 1, Step 2...), command and code together.
6. **Test before building.** Always run `npx tsc --noEmit` before an `eas build`. A build takes
   20-90 minutes; a type-check takes 10 seconds.
7. **Don't rush me.** If I'm asking design questions, answer them and show me samples/previews
   before writing code. Don't push me toward a decision I haven't made yet.
8. **If I say I'm scared of something being "hard,"** don't talk me out of what I want — explain
   the real risk honestly, then help me do it carefully. You're here to fix bugs with me.
9. Never assume something works in the real APK because it worked in Expo Go — remind me to re-test.
10. Terminals: **ROOT** = `C:\Users\saphi\Desktop\Ai-Companion`, **FRONTEND** = `frontend\`,
    **BACKEND** = `backend\`.
11. When a doc file is requested, deliver it as a downloadable file for `docs\`.

## 0.4 CRITICAL PRODUCT RULES — NEVER VIOLATE OR REVERSE THESE

These are explicit owner decisions. Do not "improve" them.

1. **CHAT DATA IS NEVER DELETED FROM THE DATABASE BY THE USER.**
   - "Remove from list" = **soft delete** via a `hidden_at` timestamp. The row and its
     messages STAY in Postgres, just hidden from the list.
   - There is **NO hard-delete of chat rows** anywhere. Do not add one.
   - **Labeling rule:** never label a chat action "Delete my data" or imply permanent
     erasure. Use honest labels like "Remove from list".

2. **Log out means log out.** It only ends the session. It deletes nothing.

3. **Full name is collected AT SIGN UP** (and editable later in Profile). Because email
   confirmation is ON, the name is stored in auth metadata at signup and written to the
   profile on first login (see SECTION 11 #22).

4. **Always tell me FRONTEND or BACKEND** for every terminal command.

5. **ACCOUNT DELETION — the ONE permanent delete.**
   - "Delete my account" in Profile permanently deletes the **Supabase auth user** (login)
     via a backend admin call.
   - It does **NOT** delete chat data. `chat_sessions` / `chat_messages` use a plain
     `user_id` column with **no FK to auth.users**, so rows remain.
   - Effect: the email becomes reusable; re-signup = brand-new account with an empty chat
     list. Old chats stay in the DB, orphaned. Intentional.
   - UI requires **double confirmation** (custom dark two-step dialog, red confirm).

6. **PASSWORD RESET & CHANGE PASSWORD = backend-hosted HTML pages**, not app deep links
   (`/reset-password`, `/confirmed` served by FastAPI). Works from any browser. Do not
   "improve" into an in-app deep link without asking.
   - Change password **requires the current password** (verified via `signInWithPassword`),
     with a "Forgot password?" link bottom-right as an escape hatch. Keep this layout.

7. **BIOMETRIC LOGIN LIVES IN TWO PLACES.** Profile has the enable/disable toggle
   ("Fingerprint login"); the **login screen** has the fingerprint button beside "Log in"
   (only when enabled). This mirrors the owner's bank app. Do NOT move it to an
   auto-lock-on-open model.

8. **BIOMETRIC STORAGE = OPTION B (store password).** On enable, the app stores
   **email + password** in `expo-secure-store` (encrypted keystore) and logs in fresh each
   time via `signInWithPassword`. The owner was told the tradeoff and chose this "always works
   like a banking app" option over storing the session token. Do not silently switch.
   - Must stay: changing the password refreshes the stored password; deleting the account
     wipes stored creds; a stale password falls back to the password screen.

9. **PROACTIVITY MUST BE NON-MANIPULATIVE (Phase 4).** The daily check-in is **OFF by
   default**, the user picks the time, and there are **no streaks, no guilt, no "you haven't
   talked in X days" pressure**. One tap to turn off. Never add engagement-bait mechanics.

10. **`newArchEnabled` MUST stay `false`** in `app.json`. New Arch breaks the Android keyboard
    layout (SECTION 11 #26). Expo Go will WARN that it's disabled — **ignore that warning**,
    it only applies to Expo Go, not the real build.

11. **Log out and Delete account live in Profile ONLY** — not in the navigation drawer
    (owner's explicit Phase 5 decision).

## 0.5 MODEL USAGE PLAN

- **Sonnet** = daily driver for ~85% of work (file generation, debugging, wiring, refactors).
- **Opus** = genuine architecture forks only (Phase 2 memory design, Phase 3 personality design,
  Phase 4 proactivity design, Phase 5 navigation design).
- Pattern: **Opus decides the shape, Sonnet builds it.**
- Discipline: one milestone per chat; paste this handover (not whole logs); start a fresh chat
  each milestone to protect usage limits.

---

# SECTION 1 — THE PROJECT

## 1.1 What we are building

A mobile **AI Companion** app ("Saphin AI") — a warm, supportive AI that feels like a trusted
friend. It must always be warm and encouraging, never claim to be human or have real feelings,
and never foster unhealthy dependence. Privacy is core: user data is private and never sold.
(Per rule 0.4 #1, "private" means the user can hide/clear chats from their view; the owner
retains chat data server-side.)

**Developer profile:** beginner, first app, wants production quality but beginner-friendly.
Windows, project on Desktop, PowerShell.

## 1.2 Tech stack (LOCKED)

- **Frontend:** Expo + React Native (TypeScript), SDK 54. Tested via Expo Go on a physical
  Android phone; standalone APK built via EAS. **`newArchEnabled` stays `false`.**
- **Backend:** FastAPI (Python), uvicorn. Local dev on Python 3.14; **Render pinned to
  3.12.7** via `backend/.python-version`.
- **Backend hosting:** **Render free tier** — LIVE at `https://saphin-ai-backend.onrender.com`.
  Auto-deploys from GitHub `main`, root dir `backend`. **Free instance sleeps on idle (~50s
  cold start).**
- **Database:** PostgreSQL via Supabase (SQLAlchemy async + asyncpg, Session pooler).
- **Auth:** Supabase Authentication (email/password + email confirmation).
- **Storage:** Supabase Storage — public bucket `avatars`.
- **Email:** Custom SMTP via **Brevo** (free tier, 300/day) wired into Supabase Auth.
- **AI:** Provider abstraction layer. **Active = Groq** (`llama-3.3-70b-versatile`).
  Claude + Gemini providers exist but are inactive.
- **Push notifications:** Expo Push API (`https://exp.host/--/api/v2/push/send`).
- **Scheduler:** **cron-job.org** (free) hitting a secret-guarded backend endpoint every 15 min.
- **Build:** EAS Build. Expo account `saphinpraja`, project `@saphinpraja/saphin-ai`,
  projectId `e8d6e6eb-b1bf-4e21-af8b-885612a4b999`.

## 1.3 Roadmap — status of all phases

**Phase 1 — Foundation: 100% COMPLETE + DEPLOYED.**
Project setup, mobile UI, email/password auth, secure backend, AI chat, chat history
persistence, chats list, profile screen, redesigned auth screen, confirm password +
show/hide + email-exists detection, per-chat Pin/Rename/Remove, display-name save fix,
permanent account deletion, backend deployed public (Render), custom SMTP (Brevo), APK built,
theme toggle, avatar photo, delete-account dialog restyle, keyboard fix, friendly confirm page,
password reset, change password, biometric fingerprint login, auth+profile scroll fixes.
*Still open (optional):* Google login, Apple Sign-In.

**Phase 2 — Memory: 100% COMPLETE + LIVE + tested on real APK.**
Two-tier memory (D19). Backend-only — no rebuild was needed.

**Phase 3 — Personality & Reflection: COMPLETE.** (D22, full detail SECTION 9)
Tone detection + mood logging, personality modes, responding journal, creator identity,
tappable links. *Dropped by owner:* weekly mood-summary recap.
Backend was LIVE; frontend shipped in the Phase 4/5 APK build.

**Phase 4 — Proactivity: COMPLETE.** (D23, full detail SECTION 10)
AI-written daily check-in push, local reminders, goal tracking.

**Phase 5 — Navigation & UX redesign: COMPLETE.** (D24, full detail SECTION 10)
Drawer navigation, home redesign, home chat input, About screen.
*(Note: the original roadmap called Phase 5 "Advanced: voice, premium, personalization." Those
are now deferred — see SECTION 12. "Phase 5" here means the navigation redesign.)*

**Future vision (guides architecture):** long-term relationship, milestone recall,
non-manipulative proactive check-ins, adapts to the user's communication style, multiple
selectable personalities, swappable AI providers, clean scalability without over-engineering.

---

# SECTION 2 — PROJECT STRUCTURE (complete, current on disk)

Root: `C:\Users\saphi\Desktop\Ai-Companion\`

```
Ai-Companion/
├── .gitignore                       # ignores .env, node_modules, venv
├── README.md
├── docs/
│   ├── PRD.md  SRS.md  ROADMAP.md
│   ├── ARCHITECTURE.md              # decision records D1–D24
│   ├── DATABASE.md                  # schema
│   ├── HANDOVER.md                  # THIS FILE
│   └── learning.md
│
├── backend/
│   ├── .env                         # REAL SECRETS (gitignored) — see SECTION 5
│   ├── .env.example
│   ├── Procfile                     # web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
│   ├── .python-version              # 3.12.7 (pins Render)
│   ├── requirements.txt             # incl. sqlalchemy[asyncio]>=2.0, asyncpg>=0.29, httpx
│   ├── venv/                        # activate: .\venv\Scripts\Activate.ps1
│   └── app/
│       ├── main.py                  # FastAPI app, CORS, registers ALL routers
│       ├── core/config.py           # Settings (pydantic-settings) — LOWERCASE field names
│       ├── db/
│       │   ├── base.py
│       │   ├── session.py           # async engine + get_db()
│       │   └── models.py            # ALL ORM models (see 3.1)
│       ├── models/                  # Pydantic schemas
│       │   ├── chat.py              # ChatRequest/Response, MessageOut, SessionOut, SessionUpdate
│       │   ├── profile.py           # ProfileOut / ProfileUpdate
│       │   ├── memory.py            # Phase 2
│       │   ├── mood.py              # Phase 3
│       │   ├── journal.py           # Phase 3
│       │   ├── reminder.py          # Phase 4 — ReminderCreate, ReminderOut
│       │   ├── goal.py              # Phase 4 — GoalCreate, GoalUpdate, GoalOut
│       │   └── push.py              # Phase 4 — PushTokenIn
│       ├── ai/
│       │   ├── base.py              # AIProvider ABC
│       │   ├── claude_provider.py   # inactive
│       │   ├── gemini_provider.py   # inactive
│       │   ├── groq_provider.py     # ACTIVE — builds the system prompt
│       │   ├── provider_factory.py  # get_ai_provider()
│       │   ├── memory_extractor.py  # Phase 2 — best-effort fact extraction
│       │   ├── mood_detector.py     # Phase 3 — best-effort tone classifier
│       │   ├── journal_reflector.py # Phase 3 — best-effort journal reflection
│       │   └── checkin_writer.py    # Phase 4 — best-effort daily check-in line
│       ├── auth/dependencies.py     # get_current_user_id via Supabase JWKS
│       ├── services/
│       │   ├── __init__.py
│       │   └── expo_push.py         # Phase 4 — send_push() via Expo Push API
│       ├── api/
│       │   ├── health.py            # GET /health
│       │   ├── chat.py              # POST /chat + session endpoints
│       │   ├── profile.py           # GET /profile, PUT /profile (partial), DELETE /account
│       │   ├── confirmed.py         # GET /confirmed — styled HTML page
│       │   ├── reset_password.py    # GET /reset-password — HTML form
│       │   ├── journal.py           # Phase 3 — POST/GET /journal
│       │   ├── reminders.py         # Phase 4 — POST/GET /reminders, DELETE /reminders/{id}
│       │   ├── goals.py             # Phase 4 — POST/GET /goals, PATCH /goals/{id}
│       │   ├── push.py              # Phase 4 — POST /push/register
│       │   └── internal.py          # Phase 4 — POST /internal/run-checkins (cron, secret-guarded)
│       └── repositories/
│           ├── chat_repository.py
│           ├── profile_repository.py
│           ├── memory_repository.py
│           ├── mood_repository.py
│           ├── journal_repository.py
│           ├── reminder_repository.py    # Phase 4
│           ├── goal_repository.py        # Phase 4
│           ├── push_repository.py        # Phase 4
│           └── checkin_repository.py     # Phase 4
│
└── frontend/
    ├── .env                         # EXPO_PUBLIC_* (gitignored)
    ├── .env.example
    ├── app.json                     # newArchEnabled:false, edgeToEdgeEnabled:false,
    │                                #   softwareKeyboardLayoutMode:"resize", name "Saphin AI"
    ├── eas.json                     # preview + production = APK, env baked in
    ├── App.tsx                      # root: auth gate, view switching, push registration, back handler
    ├── index.js  package.json  tsconfig.json
    ├── assets/                      # icon set + wallpapers/img1.jpg … img5.jpg
    └── src/
        ├── types/chat.ts            # ChatMessage { id, role:'user'|'companion', text, createdAt }
        ├── context/
        │   └── ThemeContext.tsx     # 1-LINE SHIM: export * from "../theme/ThemeContext"  (DO NOT DELETE)
        ├── theme/                   # the theme engine (D20) — see SECTION 8
        │   ├── types.ts
        │   ├── registry.ts          # THE one file to edit to add a theme
        │   ├── ThemeContext.tsx     # provider: themeId x mode, cross-fade, app-wide Background
        │   ├── themes/
        │   │   ├── default/index.ts
        │   │   ├── onePiece/index.ts + Background.tsx   # "Grand Line" + animated waves
        │   │   └── nature/index.ts + Background.tsx     # photo wallpapers (D21)
        │   └── components/index.tsx # ThemedBackground/Button/Card/Input/Loader + ThemePicker
        ├── components/
        │   ├── ChatBubble.tsx       # theme tokens + tappable URLs
        │   └── ChatInput.tsx
        ├── screens/
        │   ├── AuthScreen.tsx       # login/signup, forgot password, fingerprint button, ScrollView
        │   ├── LockScreen.tsx       # used by App.tsx when biometric lock is active
        │   ├── ChatsListScreen.tsx  # Phase 5: this is now the HOME + DRAWER (see 10.2)
        │   ├── ChatScreen.tsx       # messages + input; accepts optional initialMessage
        │   ├── ProfileScreen.tsx    # name, theme, personality, DAILY CHECK-IN, security, danger zone
        │   ├── JournalScreen.tsx    # Phase 3
        │   ├── RemindersScreen.tsx  # Phase 4
        │   ├── GoalsScreen.tsx      # Phase 4
        │   └── AboutScreen.tsx      # Phase 5
        └── services/
            ├── supabase.ts          # Supabase client (AsyncStorage session)
            ├── api.ts               # ALL backend calls (see 3.6)
            ├── biometrics.ts        # expo-local-authentication + expo-secure-store
            └── notifications.ts     # Phase 4 — permissions, push token, local scheduling
```

**Frontend packages installed:** `expo-linear-gradient`, `@react-native-async-storage/async-storage`,
`expo-image-picker`, `expo-local-authentication`, `expo-secure-store`, `expo-image`,
`expo-notifications`, `@react-native-community/datetimepicker`, `@expo/vector-icons`, `expo-font`.

**Do NOT install** `react-native-keyboard-controller` (peer-dep conflict). Be cautious with any
native module in managed Expo (e.g. `react-native-image-crop-picker` needs a dev build).

---

# SECTION 3 — EXACT CODE CONTRACTS (READ BEFORE WRITING ANY CODE)

**This section exists because guessing these wrong caused most of our wasted time.** These are
the real names in the real files. Do not assume; use these.

## 3.1 ORM models — `backend/app/db/models.py`

| Model | Table | user id column | Notes |
|---|---|---|---|
| `ChatSession` | `chat_sessions` | `user_id` **UUID** | + `title`, `pinned`, `hidden_at` |
| `ChatMessage` | `chat_messages` | `user_id` **UUID** | FK `session_id` -> chat_sessions |
| `Profile` | `profiles` | **`id`** IS the user id | **There is NO `user_id` column on Profile** |
| `UserMemory` | `user_memories` | `user_id` **text** | |
| `MoodLog` | `mood_logs` | `user_id` **text** | |
| `JournalEntry` | `journal_entries` | `user_id` **text** | |
| `PushToken` | `push_tokens` | `user_id` **text** | unique (user_id, token) |
| `Reminder` | `reminders` | `user_id` **text** | |
| `Goal` | `goals` | `user_id` **text** | |

**The two biggest traps:**
- `Profile.id` is the user id. Writing `Profile.user_id` = crash. (Cost us a bug in Phase 4.)
- Everything from Phase 2 onward stores `user_id` as **text**, but `chat_sessions` /
  `chat_messages` use **UUID**. When calling a Phase 2+ repo from an endpoint, wrap it:
  `str(user_id)`.

`Profile` columns in full: `id`, `display_name`, `theme_preference`, `theme_id`,
`personality_mode`, `avatar_url`, `checkin_enabled`, `checkin_hour`, `checkin_minute`,
`checkin_tz_offset_minutes`, `last_checkin_date`, `created_at`, `updated_at`.

## 3.2 Backend settings — `backend/app/core/config.py`

**Field names are LOWERCASE.** It's `settings.groq_api_key`, NOT `settings.GROQ_API_KEY`.

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""
    database_url: str
    groq_api_key: str
    anthropic_api_key: str = ""
    gemini_api_key: str = ""
    environment: str = "development"
    cron_secret: str = ""        # Phase 4
```

## 3.3 Standard backend endpoint shape

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.auth.dependencies import get_current_user_id

router = APIRouter()

@router.post("/thing")
async def create_thing(
    payload: ThingCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await repo.create_thing(db, str(user_id), ...)   # str() for text-id tables
```

`get_current_user_id` returns a **`uuid.UUID`**.

## 3.4 Frontend theme tokens — `theme.*`

These are the ONLY valid theme fields. Do not invent `theme.isDark ? "#fff" : "#000"` colors —
use the tokens so the app stays themeable:

```
background  surface  surfaceAlt  textPrimary  textSecondary
accent  accentText  border  danger
bubbleUser  bubbleUserText  bubbleCompanion  bubbleCompanionText
overlay  isDark
```
Optional per theme: `fonts`, `shape`, `wallpaper`, `wallpaperOverlay`, `wallpaperPosition`.

Import: `import { useTheme } from "../context/ThemeContext";` (the shim) — both paths work.

## 3.5 `frontend/src/services/biometrics.ts` — the ONLY exports

```
isBiometricAvailable()   isBiometricEnabled()   enableBiometric(email, password)
disableBiometric()       getStoredCredentials()  authenticateBiometric()
```
There is **no** `getBiometricSetting` and **no** `setBiometricEnabled`. An old `App.tsx`
imported those non-existent names and it silently sat there until a `tsc` run caught it.

## 3.6 `frontend/src/services/api.ts` — all exported functions

```
sendChatMessage(message, sessionId) -> { reply, session_id }
getProfile()  updateProfile(displayName)  updateThemePreference(mode)
updateThemeId(themeId)  updatePersonalityMode(mode)  updateAvatarUrl(url)  uploadAvatar(localUri)
listSessions()  loadSessionMessages(sessionId)  renameSession(id, title)
setSessionPinned(id, pinned)  removeSession(id)  deleteAccount()
createJournalEntry(content)  listJournalEntries()
registerPushToken(token, platform)  updateCheckinSettings(settings)
createReminder(input)  listReminders()  deleteReminder(id)
createGoal(input)  listGoals(status?)  updateGoal(id, patch)
```
Types exported: `ChatReply`, `ThemeMode`, `ProfileData`, `SessionSummary`, `ServerMessage`,
`JournalEntry`, `CheckinSettings`, `Reminder`, `Goal`.

Internal helper `patchProfile(patch)` does `PUT /profile` with partial fields (D15) — all the
`update*` helpers route through it.

## 3.7 `frontend/src/services/notifications.ts` — exports (Phase 4)

```
ensureAndroidChannel()      # must run before any Android notification shows
requestPermission()         # -> boolean
getExpoPushToken()          # -> string | null  (uses projectId e8d6e6eb-…)
scheduleLocalReminder({ title, body, date, repeatsDaily })  # -> notification id
cancelLocal(notifId)
```
Also sets `Notifications.setNotificationHandler` at module load so notifications show in
foreground.

## 3.8 `ChatScreen.tsx` props

```ts
type Props = {
  sessionId: string | null;
  onBack: () => void;
  initialMessage?: string | null;   // Phase 5 — auto-sends once, new chats only
};
```
Passing `sessionId = null` shows the welcome message and lets `handleSend` create the session on
the first message. **This is why Phase 5's home input was low-risk** — the home doesn't create a
chat, it just hands the text to ChatScreen.

## 3.9 `ChatsListScreen.tsx` props (Phase 5 — it is now the HOME)

```ts
type Props = {
  onOpenChat: (sessionId: string | null) => void;
  onStartChatWithMessage: (text: string) => void;
  onOpenProfile: () => void;
  onOpenJournal: () => void;
  onOpenReminders: () => void;
  onOpenGoals: () => void;
  onOpenAbout: () => void;
};
```

## 3.10 `App.tsx` view union

```ts
type View3 =
  | { name: "list" }
  | { name: "chat"; sessionId: string | null; initialMessage?: string | null }
  | { name: "profile" } | { name: "journal" } | { name: "reminders" }
  | { name: "goals" }   | { name: "about" };
```

---

# SECTION 4 — ARCHITECTURE DECISIONS (D1–D24)

- **D1** Mobile: Expo/React Native (one codebase, JS, easy phone testing).
- **D2** Backend: FastAPI (Python, AI-friendly, auto API docs).
- **D3** DB: PostgreSQL (relational: users -> sessions -> messages).
- **D4** Auth: Supabase (pre-built secure auth + Postgres in one).
- **D5** AI behind an abstraction layer (`AIProvider` interface; swapping = 1 file).
- **D6** Active AI = **Groq** (`llama-3.3-70b-versatile`). Anthropic needed billing; Gemini's
  free tier is zero-quota in this region. Swap via `provider_factory.get_ai_provider()`.
- **D7** JWT verification via Supabase **JWKS/ES256** (not the legacy shared secret, which no
  longer signs new tokens). Fetch public keys with httpx + a browser User-Agent (Supabase edge
  blocks default clients), cache 1h.
- **D8** DB access = **SQLAlchemy async + asyncpg** through Supabase's **Session pooler**. The
  backend always filters by `user_id` from the verified JWT; RLS is a second defense layer.
  Repository pattern keeps SQL out of endpoints.
- **D9** **Sessions + messages** data model. One conversation = one `chat_session` (title = first
  ~40 chars of the opening message); each turn = a `chat_message` (role `user`/`assistant`).
  Frontend maps `assistant` -> `companion`.
- **D10** **Soft delete for chats** (rule 0.4 #1). "Remove from list" sets `hidden_at`.
- **D11** **Custom SMTP via Brevo** for Supabase Auth emails (free 300/day).
- **D12** **Permanent account deletion that preserves chat data** (rule 0.4 #5). `DELETE /account`
  calls Supabase's admin delete-user API with the service role key.
- **D13** **Theme system with token palettes + dual persistence.** Tokens + dark/light palettes +
  a `system` mode following `useColorScheme()`. Persists to **AsyncStorage** (instant, no flicker)
  AND **`profiles.theme_preference`** (cross-device). Local cache wins on conflict.
- **D14** **Avatars in Supabase Storage.** Public bucket `avatars`, one file per user at
  `avatars/<user_id>/avatar.jpg` (upsert). Public URL saved to `profiles.avatar_url` with a
  `?v=timestamp` cache-buster.
- **D15** **Partial profile updates.** `PUT /profile` uses `payload.model_dump(exclude_unset=True)`
  so the client can update one field without wiping others. Repo helper `update_profile_fields()`.
  **Every profile-ish feature since has ridden on this** (theme, personality, check-in settings).
- **D16** **Auth flows use backend-hosted HTML pages, not app deep links.** `/confirmed` and
  `/reset-password` are plain HTML from FastAPI. The reset page reads the Supabase recovery token
  from the URL hash and calls `PUT /auth/v1/user` with the anon key + Bearer token.
  `SUPABASE_URL`/`SUPABASE_ANON_KEY` are injected from Render env at request time.
- **D17** **Change password = verify-then-update.** `signInWithPassword` to verify, then
  `updateUser({ password })`. If biometrics are on, the new password is re-stored.
- **D18** **Biometric login = local credential lock (Option B).** `expo-local-authentication`
  gates; `expo-secure-store` holds email + password. APK-only (native modules).
- **D19 (Phase 2 — Memory)** **Two-tier memory.** Short-term = last 20 messages of the current
  session fed back as real chat history. Long-term = durable facts in `user_memories`
  (`category`, `content`, `importance`, `is_active`) injected into the system prompt. After each
  turn a **best-effort** Groq extractor pulls NEW facts; any failure is swallowed so chat never
  breaks. No vector DB. Backend-only => no APK rebuild.
  **This "best-effort side-call + table + prompt injection" pattern is the template every later
  AI feature copies.**
- **D20 (Theme engine)** **Registry-pattern multi-theme system.** `themeId x mode` resolved via a
  `THEMES` registry; each theme may supply an app-wide `Background` slot. Persists to AsyncStorage
  + `profiles.theme_id`. Adding a theme = one registry line.
- **D21 (Nature-photo wallpapers)** Photo renders in the theme's app-wide `Background` slot (NOT
  inside ChatScreen); the nature palette sets `background:"transparent"` so the photo shows through
  every screen. Uses `expo-image` (`contentPosition` per-photo alignment) + `expo-linear-gradient`
  (top/bottom legibility). Photos bundled via `require(...)`.
- **D22 (Phase 3 — Personality & Reflection)** Three layered features, all mirroring D19.
  (a) Tone detection -> `mood_logs` + live prompt injection. (b) Personality modes ->
  `profiles.personality_mode` injected **before** the tone nudge (style = base, mood = adjustment).
  (c) Responding journal -> `journal_entries` + best-effort reflection.
  **Creator identity** in the base prompt: only when asked who made/created/owns it, the companion
  names **Saphin Praja** + `https://saphinpraja.vercel.app/`.
- **D23 (Phase 4 — Proactivity)** **Hybrid proactivity** — each feature uses the mechanism that
  actually suits it:
  - **Daily check-in = REMOTE push.** An external cron (cron-job.org, every 15 min) POSTs to a
    secret-guarded `/internal/run-checkins`; that call both **wakes the sleeping Render free
    instance** and runs the job. The endpoint finds users whose chosen local time has arrived and
    who haven't been sent today, writes a fresh personal line via a best-effort Groq call
    (`checkin_writer.py`, using active goals), and sends it via the Expo Push API. OFF by default;
    no streaks or guilt (rule 0.4 #9).
  - **Reminders = LOCAL.** `expo-notifications` schedules on-device, so timing is exact and works
    while the server sleeps. Mirrored to a `reminders` table for reinstall-survival and so the
    companion knows about them. **Remote push would make reminders WORSE** — don't "upgrade" them.
  - **Goals = PROMPT INJECTION** (reuses D19). Active `goals` rows are folded into
    `memory_context` in `chat.py`, so no provider signature change was needed.
- **D24 (Phase 5 — Navigation redesign)** **Custom lightweight drawer, no navigation library.**
  The app's navigation is a `useState` view-union in `App.tsx` (3.10); adding
  `@react-navigation/drawer` would have meant a rewrite + a new native dependency. Instead the
  drawer is an `Animated` sliding panel **inside `ChatsListScreen`**, which now serves as the
  home. Crucially, the chat list's rename/pin/remove logic and both modals were **preserved
  character-for-character** and simply re-rendered inside the drawer — that's why nothing broke.
  Opens on hamburger tap only (no edge-swipe: avoids gesture conflicts). The back button is
  handled **inside ChatsListScreen** because App.tsx can't see the drawer's state.

---

# SECTION 5 — SECRETS / CONFIG (values live in .env + host dashboards, NEVER committed)

## backend/.env (same keys also set in Render -> Environment)
```
SUPABASE_URL=https://mlqbnmloighdifavttwx.supabase.co    # base URL, NO /rest/v1/
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...     # REQUIRED on Render for DELETE /account
SUPABASE_JWT_SECRET=...
DATABASE_URL=postgresql+asyncpg://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres
GROQ_API_KEY=gsk_...              # ACTIVE
ENVIRONMENT=production            # production on Render, development locally
CRON_SECRET=...                   # Phase 4 — must MATCH the cron-job.org header exactly
```

**DATABASE_URL rules:** scheme MUST be `postgresql+asyncpg://` (plain `postgresql://` makes
SQLAlchemy try psycopg2 and crash). Any `@` **inside the password** must be URL-encoded as `%40`;
the `@` before the host stays literal. Use the **Session pooler** URI from Supabase -> Connect.

**SECURITY TODO:** the Supabase DB password was exposed in a chat transcript. Rotate it
(Supabase -> Settings -> Database -> reset password), then update `DATABASE_URL` **both** locally
and in Render. Same applies to `CRON_SECRET` — regenerate it and update it in Render AND
cron-job.org.

## frontend/.env
```
EXPO_PUBLIC_SUPABASE_URL=https://mlqbnmloighdifavttwx.supabase.co   # NO /rest/v1/
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_API_URL=https://saphin-ai-backend.onrender.com          # no trailing slash
```
`EXPO_PUBLIC_*` are baked in at **BUILD** time. Because `.env` is gitignored and EAS builds
from git, these are **also duplicated in `frontend/eas.json`** under each profile's `env` block
(the anon key is public by design). **If the backend URL ever changes, the APK must be rebuilt.**

## frontend/eas.json
```
"buildType": "apk", "distribution": "internal",
env: { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY }
"cli": { "appVersionSource": "local" }
```

## Supabase Auth config
- Email confirmation is **ON** (no session immediately after signup -> the full name is saved on
  first login, SECTION 11 #22).
- **Site URL** = `https://saphin-ai-backend.onrender.com/confirmed`
- **Redirect URLs** allow-list MUST contain BOTH:
  `https://saphin-ai-backend.onrender.com/reset-password` AND
  `https://saphin-ai-backend.onrender.com/confirmed`
  (the reset link silently fails with "invalid/expired" if `/reset-password` isn't listed)
- **Custom SMTP** under Auth -> Emails -> SMTP (Brevo, D11).
- Asymmetric JWT signing (ES256); JWKS at `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`.

## Supabase Storage
Public bucket **`avatars`**, policies:
```sql
create policy "avatars public read" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "avatars user upload" on storage.objects for insert to authenticated
  with check ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );
create policy "avatars user update" on storage.objects for update to authenticated
  using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );
```

## Brevo (email)
Account `prajasaphin18@gmail.com`; host `smtp-relay.brevo.com`, port 587 (fallback 2525),
login `b1bea5001@smtp-brevo.com`, **SMTP key** (not the account password) generated in Brevo.
If sending breaks, regenerate the key and update it in Supabase.

## Render
Service `saphin-ai-backend`, region Oregon, root dir `backend`, build
`pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`,
**Free** instance, auto-deploy from `main`, Service ID `srv-d99kdlnaqgkc738augh0`.

## cron-job.org (Phase 4)
- Title: `Saphin check-ins`
- URL: `https://saphin-ai-backend.onrender.com/internal/run-checkins`  (**https**, not http)
- Method: **POST** (set under the ADVANCED tab)
- Schedule: **every 15 minutes** (`*/15 * * * *`), timezone UTC
- Header (ADVANCED tab): `X-Cron-Secret: <same value as CRON_SECRET on Render>`
- "Requires HTTP authentication" must be **OFF** (that's a different mechanism — not used)
- Verified: TEST RUN returned **200 OK** with `{"sent":0}`

## Expo / EAS / GitHub
Expo account `saphinpraja`, project `@saphinpraja/saphin-ai`,
projectId `e8d6e6eb-b1bf-4e21-af8b-885612a4b999`.
GitHub: `https://github.com/Saphin18/ai-companion` (private).

---

# SECTION 6 — HOW TO RUN

Three terminals. Always know which one you're in.
- **ROOT** = `C:\Users\saphi\Desktop\Ai-Companion` (git)
- **FRONTEND** = `...\frontend` (expo, eas, npx tsc)
- **BACKEND** = `...\backend` (uvicorn)

**Local backend (BACKEND):**
```powershell
cd C:\Users\saphi\Desktop\Ai-Companion\backend
.\venv\Scripts\Activate.ps1        # you'll see (venv) appear — REQUIRED or uvicorn isn't found
uvicorn app.main:app --reload
```
Health local: `http://127.0.0.1:8000/health` -> `{"status":"ok"}`
Health public: `https://saphin-ai-backend.onrender.com/health`
(You usually DON'T need the local backend — the app points at Render.)

**To test endpoints with curl you need TWO windows** — the server holds one window; run curl
in a second. Running curl in the server's window (or pressing Ctrl+C first) gives
"Could not connect."

**Frontend / Expo Go (FRONTEND):**
```powershell
cd C:\Users\saphi\Desktop\Ai-Companion\frontend
npx expo start          # add -c to clear the Metro cache
```
`package.json` lives in `frontend`, NOT root. `-c` printing "Bundler cache is empty, rebuilding"
is normal, not an error.

**Native config changes (app.json) require a FULL restart:** `npx expo start -c` + fully close
Expo Go (swipe from recents) + re-scan the QR. A shake-reload does NOT apply app.json changes.

**Type-check before every build (FRONTEND):**
```powershell
npx tsc --noEmit        # must print NOTHING
npx expo-doctor         # should say 18/18 checks passed
```

**Build the APK (FRONTEND):**
```powershell
eas build -p android --profile preview
```
Runs on Expo's servers (~20-90 min incl. queue); you can close the terminal, the link stays valid.
A local `npx expo start` can run at the same time without interfering.

**Git (ROOT):**
```powershell
cd C:\Users\saphi\Desktop\Ai-Companion
git add -A
git commit -m "..."
git push origin main
```
Pushing `backend/` auto-redeploys Render (~3-5 min). Frontend changes do NOT trigger a deploy;
they hot-reload in Expo, and ship only via an APK rebuild.
`eas build` uploads **local files**, not GitHub — so a push isn't required to build, but do it
anyway as backup.

**Writing files from PowerShell (the pattern that works):**
```powershell
@'
...content...
'@ | Set-Content -Path "path\file.ts" -Encoding utf8
```
For surgical edits to an existing file, read -> `.Replace(old, new)` -> write, and guard it:
```powershell
$c = Get-Content -Raw -Path $p
if ($c.Contains($old)) { $c = $c.Replace($old,$new); Set-Content -Path $p -Value $c -Encoding utf8; Write-Host "APPLIED" }
else { Write-Host "NO MATCH - do not save" }
```
`.Replace()` **fails silently** if the text doesn't match exactly — always verify afterwards
with `Select-String`.

---

# SECTION 7 — DATABASE (all tables + all SQL ever run)

Convention: everything from Phase 2 onward stores `user_id` as **text**, has RLS **enabled with
no policies** (backend-only access — the backend filters by the verified JWT), and uses
`gen_random_uuid()` primary keys.

```sql
-- ===== Phase 1 =====
-- chat_sessions (user_id uuid, title, pinned, hidden_at, created_at, updated_at)
-- chat_messages (session_id FK, user_id uuid, role, content, created_at)
-- profiles      (id uuid PK = the user id, display_name, created_at, updated_at)

alter table public.profiles
  add column if not exists theme_preference text not null default 'system',
  add column if not exists avatar_url text;

-- ===== Phase 2 (memory) =====
create table if not exists public.user_memories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  category text not null default 'fact',
  content text not null,
  importance int not null default 3,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_memories_user_id_idx on public.user_memories (user_id);
alter table public.user_memories enable row level security;

-- ===== Theme engine (D20) =====
alter table public.profiles
  add column if not exists theme_id text not null default 'default';

-- ===== Phase 3 =====
create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  session_id uuid,
  mood text not null,
  intensity int not null default 3,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists mood_logs_user_id_idx on public.mood_logs (user_id);
alter table public.mood_logs enable row level security;

alter table public.profiles
  add column if not exists personality_mode text not null default 'balanced';

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  content text not null,
  reflection text,
  created_at timestamptz not null default now()
);
create index if not exists journal_entries_user_id_idx on public.journal_entries (user_id);
alter table public.journal_entries enable row level security;

-- ===== Phase 4 =====
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  token text not null,
  platform text,
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);
create index if not exists push_tokens_user_id_idx on public.push_tokens (user_id);
alter table public.push_tokens enable row level security;

alter table public.profiles
  add column if not exists checkin_enabled boolean not null default false,
  add column if not exists checkin_hour int not null default 9,
  add column if not exists checkin_minute int not null default 0,
  add column if not exists checkin_tz_offset_minutes int not null default 0,
  add column if not exists last_checkin_date date;

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  remind_at timestamptz,
  repeats_daily boolean not null default false,
  local_notif_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists reminders_user_id_idx on public.reminders (user_id);
alter table public.reminders enable row level security;

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  detail text,
  status text not null default 'active',      -- active | done | archived
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists goals_user_id_idx on public.goals (user_id);
alter table public.goals enable row level security;
```

---

# SECTION 8 — THEME SYSTEM (D20 + D21) — full detail

*(This was originally a separate `THEME_SYSTEM_KICKOFF.md`; it is fully merged here. That file
is obsolete — delete it.)*

## Original vision vs what shipped
Originally: multiple **anime-INSPIRED** themes (One Piece, Naruto, Demon Slayer, AoT, DBZ,
Spy x Family, Violet Evergarden, Your Lie in April) using ONLY original colors/art — no
copyrighted characters, logos, or official images.
**Owner then rejected the cartoon look.** Direction changed to **nature-photo wallpapers**.
"Grand Line" (One Piece palette + animated waves) stays registered as the one surviving
anime-inspired theme. The rest of the anime list is dropped.

**Copyright guidance (important if adding photos):** Pinterest / Google Images are NOT safe (the
specific photo is copyrighted even if the subject isn't). Use **Unsplash / Pexels / Pixabay**
(free for commercial use, no attribution) or the owner's own photos. Prefer darker/calmer images;
add a soft dark overlay for legibility; avoid recognizable faces, logos, and protected landmarks.

## Token contract — `frontend/src/theme/types.ts`
```ts
export type ThemeMode = "dark" | "light" | "system";
export type ThemeVariant = {
  background: string; surface: string; surfaceAlt: string;
  textPrimary: string; textSecondary: string;
  accent: string; accentText: string; border: string; danger: string;
  bubbleUser: string; bubbleUserText: string;
  bubbleCompanion: string; bubbleCompanionText: string;
  overlay: string; isDark: boolean;
  fonts?: { regular?: string; medium?: string; bold?: string; display?: string };
  shape?: { buttonRadius?: number; cardRadius?: number; bubbleRadius?: number; inputRadius?: number };
  wallpaper?: any; wallpaperOverlay?: string; wallpaperPosition?: "top"|"center"|"bottom";
};
export type ThemeDefinition = {
  id: string; name: string; description: string; emoji?: string;
  light: ThemeVariant; dark: ThemeVariant;
  Background?: React.ComponentType<{ isDark: boolean }>;
  Loader?: React.ComponentType;
};
```

## Build stages (all DONE)
- **Stage 0 — Engine:** `types.ts`, `registry.ts`, `ThemeContext.tsx`, `themes/default/` (original
  colors migrated losslessly). Backend `theme_id` column + `updateThemeId()` in api.ts. App looked
  identical; engine live.
- **Stage 1 — Components + picker + 300ms cross-fade** on theme change.
- **Stage 2 — "Grand Line"** (One Piece palette, ocean-navy + straw-hat-red + gold, light+dark).
- **Stage 3 — Animated waves** using RN's built-in `Animated` (no extra package, runs in Expo Go).
- **D21 — Nature photos:** `themes/nature/index.ts` holds one `nature(...)` line per photo
  (id, name, emoji, description, `require(img)`, position, overlay). `Background.tsx` =
  photo + whole-screen dim + top/bottom `LinearGradient` for legibility, `pointerEvents="none"`.

## Tuning cheatsheet (`themes/nature/index.ts`)
- `"center"/"top"/"bottom"` = which part of the photo shows (uses `expo-image`'s
  `contentPosition`; RN's built-in `<Image>` can't do this — that's why `expo-image` was added).
- Raise overlay alpha (`0.15` -> `0.30`) = darker, more readable text; lower = brighter photo.
- Add a photo = drop the file in `assets/wallpapers/` + one `nature(...)` line.
- Remove one = delete its line. **If you delete a `.jpg` you MUST delete its `require` line** or
  the bundler crashes.

## Open polish (optional)
Owner's verdict: **img2, img3, img4 + Grand Line are the keepers**; img1 (pale stone) and img5
(swans) are weak. Owner chose NOT to trim — all 5 still ship. Also: some source photos are
multi-MB; resize to ~1080-1440px / ~300-600 KB if load ever feels slow on cheap phones.

Notes for future theme work: custom fonts = `expo-font` (adds app size). Heavy animation =
`react-native-reanimated` / Lottie (can lag cheap phones; keep optional/per-theme) — NOT used yet.
Any native module means: keep `newArchEnabled:false`, commit, rebuild, re-test on the REAL APK.

---

# SECTION 9 — PHASE 3 DETAIL (D22)

**Owner decisions locked:**
- Personality = **"both"**: the user picks a style AND detected mood nudges the tone on top.
- Styles = all four: Balanced, Motivator, Humor, Calm.
- Journal = full "diary that responds": user writes, companion writes ONE short caring reflection.
- **Dropped:** the weekly mood-summary / recap report.
- Creator identity: names **Saphin Praja** + `https://saphinpraja.vercel.app/`, only when asked.

**Stage 3A — tone detection.** After building memory/personality context and BEFORE generating the
reply, `chat.py` calls `detect_mood(message)` — a best-effort Groq classifier returning
`{mood, intensity 1-5, note}` or `None`. The tone is injected ("adapt your warmth... never state
you detected their mood"). After the reply commits, the reading is logged to `mood_logs` in its
own try/except. Adds ONE small Groq call per message (slightly slower, fail-safe).
Tappable links: `ChatBubble.tsx` splits text on a URL regex and renders `http(s)://` matches via
`Linking.openURL`, trimming trailing punctuation.

**Stage 3B — personality modes.** `chat.py` holds `PERSONALITY_PROMPTS` for
`motivator`/`humor`/`calm` (`balanced` = no block), injected **before** the tone nudge.
Profile has a pill row that saves instantly and rolls back on error.

**Stage 3C — responding journal.** `POST /journal` -> `journal_reflector.generate_reflection()`
(best-effort, gentle default) -> save -> return. `GET /journal` lists newest-first.

**Prompt-assembly order in `groq_provider.py` (current, including Phase 4):**
`base persona + creator block -> memory (+ GOALS folded in) -> personality -> tone`

**Testing done:** emotional message -> gentler reply; upbeat message -> matched energy;
"who made you?" -> Saphin Praja + tappable portfolio link, unrelated messages don't mention it;
personality pills change the voice; journal entry saves, reflection appears, entries persist.

---

# SECTION 10 — PHASE 4 & PHASE 5 DETAIL

## 10.1 Phase 4 — Proactivity (D23)

### Owner decisions
- Wanted **AI-written** notifications ("not the same notification all the time") -> remote push
  for the check-in, not a canned local message.
- Build **all three** features (check-in, reminders, goals) in one go so they share one rebuild.
- Check-in message style: one warm line, freshly generated.

### How the check-in actually works
1. cron-job.org POSTs `/internal/run-checkins` every 15 min with the `X-Cron-Secret` header.
   *This call also wakes the sleeping Render free instance* — that's why no paid tier is needed.
2. The endpoint rejects anything without a matching `settings.cron_secret` (403).
3. For each profile with `checkin_enabled = true`:
   - `target = ((checkin_hour*60 + checkin_minute) + checkin_tz_offset_minutes) % 1440`
   - `local_now = utc_now - timedelta(minutes=offset)`; skip if `last_checkin_date == local_today`
   - fire if `0 <= (utc_minute_of_day - target) % 1440 <= 15` (window matches the 15-min cadence)
   - `generate_checkin(active_goal_titles)` -> Groq (best-effort, gentle default on failure)
   - `send_push(token, "Saphin AI", line, {"type":"checkin"})` for each of the user's tokens
   - `set_last_checkin_date(...)` so it can't double-send
4. Tapping the notification opens a fresh chat (`App.tsx` listens for `data.type === "checkin"`).

**Timezone note:** JS `getTimezoneOffset()` returns `UTC - local` in minutes (Kathmandu UTC+5:45
-> **-345**). Store it verbatim; the math above depends on that sign.

### Reminders (local)
`RemindersScreen` -> title + time picker + optional "repeat daily" -> on save:
`requestPermission()` -> `ensureAndroidChannel()` -> `scheduleLocalReminder(...)` ->
`POST /reminders` (stores the returned `local_notif_id` so delete can cancel it). If the time has
already passed today and it isn't daily, it schedules for tomorrow.

### Goals (prompt injection)
`GoalsScreen` -> add/list/mark done. `chat.py` loads `active_goal_titles()` and folds them into
`memory_context` (so `generate_reply`'s signature never changed) with "gently support and
encourage these when relevant, never nag."

### Robustness fix worth keeping
`persistCheckin` in ProfileScreen **saves the user's preference FIRST, always**, then does
push-token registration as a separate best-effort step. Earlier the order was reversed, so a
failed token fetch abandoned the save and the toggle silently flipped back off. Only a genuine
save failure reverts the toggle now.

### Files added/changed in Phase 4
**Backend NEW:** `models/reminder.py`, `models/goal.py`, `models/push.py`,
`repositories/reminder_repository.py`, `repositories/goal_repository.py`,
`repositories/push_repository.py`, `repositories/checkin_repository.py`,
`ai/checkin_writer.py`, `services/__init__.py`, `services/expo_push.py`,
`api/reminders.py`, `api/goals.py`, `api/push.py`, `api/internal.py`.
**Backend MODIFIED:** `db/models.py` (+PushToken, Reminder, Goal, +5 Profile check-in columns),
`core/config.py` (+`cron_secret`), `main.py` (+4 routers), `api/chat.py` (goal injection).
**Frontend NEW:** `services/notifications.ts`, `screens/RemindersScreen.tsx`,
`screens/GoalsScreen.tsx`.
**Frontend MODIFIED:** `services/api.ts` (+push/reminders/goals/check-in helpers + types),
`screens/ProfileScreen.tsx` (DAILY CHECK-IN section), `App.tsx` (push registration + tap handler).

### Verified working
- Wrong secret -> `{"detail":"forbidden"}`; correct secret -> `{"sent":0}` (local AND live).
- cron-job.org TEST RUN -> **200 OK**, `x-render-origin-server: uvicorn`.
- Goals + reminders save and list correctly in Expo Go.

## 10.2 Phase 5 — Navigation redesign (D24)

### What the owner asked for (after showing Claude + ChatGPT as references)
- Home like Claude/ChatGPT: mostly empty, hamburger top-left, avatar top-right, a greeting, and a
  **real** chat input at the bottom ("Option B" — type on home, it opens the chat and auto-sends).
- Chat history moves into the **left drawer** along with all navigation.
- Log out + Delete account stay in **Profile**, NOT the drawer.
- The owner explicitly rejected a hint line like "tap for menu" as looking unpolished.

### Final layout
- **Home** (`ChatsListScreen`): hamburger (left) - avatar (right -> Profile) - "Hey {firstName},
  how are you feeling today?" - rounded input bar with an up-arrow send button.
- **Drawer:** "Saphin AI" title -> **New chat** -> divider -> Journal, Reminders, Goals,
  About -> divider -> **Recents** (the chat list, with long-press pin/rename/remove).
- **Profile:** completely unchanged.

### Why it was safe
The chat list's `handleTogglePin`, `openRename`, `submitRename`, `handleRemove` and both modals
were copied **verbatim** into the new file; only the surrounding layout changed. Tap vs long-press
are separate gestures on separate elements, so the drawer can't interfere.

### The one bug found in testing (and its fix)
**Back button while the drawer was open exited the app** instead of closing the drawer — because
`App.tsx`'s back handler only knows about *screens*, and the drawer's state lives inside
`ChatsListScreen`. Fixed by registering a second `BackHandler` **inside ChatsListScreen**:
```ts
useEffect(() => {
  const onBack = () => { if (drawerOpen) { closeDrawer(); return true; } return false; };
  const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
  return () => sub.remove();
}, [drawerOpen]);
```
RN runs the most recently registered handler first, so the home's handler wins while it's mounted.
**Verified working.**

### Files added/changed in Phase 5
**NEW:** `screens/AboutScreen.tsx`.
**REWRITTEN:** `screens/ChatsListScreen.tsx` (home + drawer), `App.tsx` (about view,
`onStartChatWithMessage`, `onOpenAbout`).
**MODIFIED:** `screens/ChatScreen.tsx` (optional `initialMessage` + one-shot auto-send).

### Verified working in Expo Go
Home layout, avatar -> Profile, typing on home -> chat opens and auto-sends -> companion replies,
drawer slide + backdrop close, all four drawer destinations, tapping a recent chat,
long-press -> pin/rename/remove all functioning, back button closes the drawer.

---

# SECTION 11 — MISTAKES WE HIT & FIXES (the full list)

## Early / setup
1. **Two `Ai-Companion` folders** (Users vs Desktop) — files split across both. Fixed with
   robocopy /MOVE into one Desktop folder; deleted the empty leftover.
2. **Python 3.14 too new** — `pydantic-core` had no prebuilt wheel and tried to compile Rust.
   Fixed by loosening pins (`>=` not `==`) so pip grabbed compatible versions.
3. **bash quote-escaping in PowerShell** — `'"'"'` got written literally into `chat.py`, causing
   SyntaxErrors. Write plain content.
4. **`del App.js` then files went to the wrong folder** — same root cause as #1.
5. **Downloaded files piled up in Downloads** — confusing. Switched fully to terminal file creation.
6. **JWT 401 `InvalidAlgorithmError`** — Supabase uses ES256; our code forced HS256. Fixed via JWKS.
7. **JWKS fetch 401/404** — (a) an `apikey` header broke it; (b) `SUPABASE_URL` had a trailing
   `/rest/v1/`. Fixed: remove `/rest/v1/` from BOTH .env files, fetch with a browser User-Agent.
8. **Anthropic 401 invalid x-api-key** — no billing. Switched provider.
9. **Gemini 429 limit:0** — free tier is zero-quota in this region, even with a new project.
10. **Groq worked** -> 200 OK. Lesson: the abstraction layer made each swap a one-file change.
11. **Git nested repo** — Expo created `frontend/.git`, treated as a submodule. Fixed:
    `git rm -r --cached frontend -f` + delete `frontend/.git`, re-add. Verified `.env` was never
    staged before committing.

## Phase 1
12. **`ModuleNotFoundError: psycopg2`** — `DATABASE_URL` started with `postgresql://`. Use
    `postgresql+asyncpg://`.
13. **`AttributeError: get_provider`** — the factory is `get_ai_provider()`.
14. **Every message became its own chat** — old rows predate session tracking. New conversations
    group correctly; old junk rows can be hidden via "Remove from list".
15. **401 on `/sessions` right after login** — token not ready; `authHeaders()` now refreshes the
    session if the access token is missing before the request.
16. **Type errors** — `ChatMessage` uses `role: 'user' | 'companion'` and requires `createdAt`;
    frontend maps server `assistant` -> `companion`.
17. **Android keyboard covering inputs** — early fix (`behavior="height"` + pan) superseded by #26.

## Deployment
18. **Render build OK but crash at startup** — `requirements.txt` missing `sqlalchemy`/`asyncpg`.
    Added `sqlalchemy[asyncio]>=2.0.0` and `asyncpg>=0.29.0`.
19. **Python 3.14 wheels missing on Render** — added `backend/.python-version` = `3.12.7`.
20. **`git add backend/Procfile` "did not match"** — ran `git add` inside `backend/`, doubling the
    path. Add relative to CWD, or from the repo root.
21. **Duplicate env-var typo** — `EXPO_PUBLIC_API_URL=EXPO_PUBLIC_API_URL=https://...`.
22. **Display name never saved** — no session at signup (email confirmation ON), so the profile
    write was lost. Fix: pass `options.data.full_name` in `signUp` (auth metadata), then copy into
    the profile on first `SIGNED_IN`.
23. **500 on PATCH /sessions/{id} (`MissingGreenlet`)** — DB-generated `updated_at` was stale on
    the ORM object; sync serialization attempted async IO. Fix: `await db.refresh(session)` before
    building `SessionOut`. **Always read the Render log.**
24. **Custom SMTP: 0 logs in Brevo, signup 500** — wrong SMTP password. Generate a fresh Brevo
    **SMTP key** (not the account password), login `...@smtp-brevo.com`, port 587 (fallback 2525).
25. **"localhost can't be reached" after email confirm** — Supabase Site URL pointed at localhost.

## Keyboard / UI
26. **THE KEYBOARD BUG (the big one — took many tries).** Symptoms: input flung to the top with a
    big gap; header disappeared; keyboard covered input. **Root cause:** `newArchEnabled: true`
    (added later by `eas build:configure`) changed Android keyboard/`KeyboardAvoidingView`
    behavior, AND we were **double-lifting** (KeyboardAvoidingView + OS resize/pan at once).
    **THE FIX — keep ALL of these:**
    - `app.json` -> `"newArchEnabled": false`
    - `app.json` -> `android.edgeToEdgeEnabled: false`
    - `app.json` -> `android.softwareKeyboardLayoutMode: "resize"`
    - `ChatScreen.tsx` -> **NO KeyboardAvoidingView on Android** (plain `<View>`, input anchored
      at the bottom, let the OS `resize` lift it). iOS keeps
      `KeyboardAvoidingView behavior="padding"`.
    - **Rule: never stack two keyboard lifters — one only.**
    - Any app.json change needs a FULL restart (SECTION 6).
27. **Gallery crop unreliable / "CROP" not "Done".** `expo-image-picker` `allowsEditing` crops fine
    from the **camera**, but Samsung's **gallery** editor sometimes skips crop or auto-saves, and
    its screen is the phone's own UI (which we CANNOT restyle or rename). A custom crop screen
    needs a native crop package + dev build (risky). Decision: accept it; the avatar auto-fits the
    circle with `resizeMode="cover"`.
28. **`git commit` said "nothing to commit"** — already committed earlier. Check `git status` +
    `git log --oneline -3` before panic-recommitting.
29. **New backend route 404s right after `git push`** — (a) Render's free redeploy takes ~3-5 min
    (plus queue), so the OLD code is briefly live; (b) the **browser caches the 404**. Diagnosis
    that works every time: open `/openapi.json` and Ctrl+F the route name. Listed -> it IS live,
    hard-refresh (Ctrl+F5 / incognito). Not listed -> the deploy hasn't finished (check Render ->
    Events) or didn't trigger (Manual Deploy). **Don't re-edit correct code while waiting.**
30. **Password-reset link "invalid/expired" with a valid token** — the URL wasn't on Supabase's
    **Redirect URLs** allow-list. Site URL and Redirect URLs are SEPARATE boxes with separate jobs
    (Site URL = default confirm landing; Redirect URLs = allow-list for links).
31. **Expo Go can't test native features.** Biometrics, true keyboard `resize` behavior, fonts,
    animation, and (Phase 4) notifications are **APK-only truth**. A cloud EAS build and a local
    `npx expo start` can run at the same time without interfering.
32. **AuthScreen doubling/ghosting (2x overlapped screen)** — same #26 double-lift bug, missed on
    Auth after ChatScreen was fixed. Same fix.
33. **"Can't scroll to reach a field/button"** — a statically-centered screen has nothing to
    scroll, so when the keyboard covers the bottom, fields are unreachable. Fix: wrap the body in a
    `ScrollView` (`flexGrow:1`, `justifyContent:'center'`, `keyboardShouldPersistTaps:'handled'`),
    header fixed outside it. Applied to AuthScreen; **the owner found and fixed the identical issue
    on ProfileScreen themselves — keep the owner's Profile version.**
    **Do NOT wrap a FlatList screen (ChatScreen) this way** — a FlatList is already a scroller and
    nesting them is invalid in React Native.

## Theme system
34. **`SyntaxError: biometrics.ts:53:38`** (owner-fixed) — the `getStoredCredentials()` return-type
    annotation. If it recurs, look there.
35. **"Can't scroll" after adding the Theme card** (owner-fixed) — same family as #33.
36. **`-c` prints "Bundler cache is empty, rebuilding"** — NOT an error; that's the point of `-c`.
    Metro rebuilds from scratch (~30-60s, no QR for a moment). Only worry after a couple minutes.
37. **Two `ThemeContext.tsx` files — DON'T delete the old one.** The engine moved to
    `src/theme/ThemeContext.tsx`; the old `src/context/ThemeContext.tsx` must stay as a 1-line shim
    (`export * from "../theme/ThemeContext";`) because every screen still imports the old path.
38. **Animated background only showed on Profile** — screens painting a solid `backgroundColor`
    cover the app-wide `Background`. Fix: set that screen's root to `backgroundColor:"transparent"`.

## Phase 3
39. **Wrong filename in an instruction** — `ChatListScreen` vs the real `ChatsListScreen`
    (note the **s**) made Notepad create an empty 0 KB file. Delete it and use the correct name.
40. **"Something went wrong" on first Expo launch after many edits** — stale Metro cache. Fix:
    `npx expo start -c` **from the `frontend` folder** (package.json lives there, not root).
    No code was actually broken.

## Phase 4 / 5 (most recent session)
41. **Guessed API names that didn't exist.** Wrote `settings.GROQ_API_KEY` (it's lowercase) and
    `Profile.user_id` (it's `Profile.id`), and imported `getBiometricSetting` /
    `setBiometricEnabled` from biometrics (they don't exist). **Cause: writing code against a
    remembered API instead of the real file.** -> This is why SECTION 3 exists. Read the file first.
42. **`Add-Content` glued `CRON_SECRET` onto the end of `DATABASE_URL`** because `.env` had no
    trailing newline — so the app read one giant DATABASE_URL and `CRON_SECRET` was never set
    (the endpoint returned 403 even with the right secret). Fix: rewrite the file with a proper
    line break. **Always verify a .env edit with `Get-Content .env | Select-String KEY`.**
43. **Stale env after editing `.env`** — `--reload` doesn't always pick up new env vars. Do a
    **full** Ctrl+C restart of uvicorn.
44. **UTF-8 / emoji corruption.** Files ended up with `â€¹ Back` and mangled emoji instead of `‹`
    and 🙂. Three rules that fix it permanently:
    - Always write files with `-Encoding utf8`.
    - **Never paste raw emoji into a PowerShell command** — the console mangles them and the
      command itself throws a parse error. Build them from code points instead:
      `[char]::ConvertFromUtf32(0x1F642)` for 🙂, `[char]0x2039` for `‹`.
    - Detect corruption with: `Select-String -Pattern "â€|ðŸ|Ã©|Â "`.
45. **Replacing curly quotes with plain `"` broke a string** — the replacement quote closed the
    surrounding double-quoted JS string. Use single quotes inside a double-quoted string.
46. **`uvicorn: command not recognized`** — the venv wasn't activated in that window. Run
    `.\venv\Scripts\Activate.ps1` first; look for `(venv)` in the prompt.
47. **curl "Could not connect"** — curl was run in the same window as the server (or after Ctrl+C
    stopped it). Server in window 1, curl in window 2.
48. **`expo doctor` failed the build** with: missing peer dependency `expo-font` (required by
    `@expo/vector-icons`), duplicate `expo-font` versions, and an `expo` patch mismatch.
    Fix: `npx expo install expo-font expo` -> `npm dedupe` -> `npx expo-doctor` (18/18 passed).
    **Lesson: run `npx expo-doctor` BEFORE `eas build`, not after waiting in the queue.**
49. **Expo Go shows a red `expo-notifications` error** — "Android Push notifications ... removed
    from Expo Go with SDK 53." **This is expected and unfixable in Expo Go.** It disappears in the
    real APK. Related: the check-in toggle **can't stay ON in Expo Go** because the token call
    crashes there — also expected, not a bug.
50. **Expo Go warns "New Architecture is always enabled in Expo Go, but disabled in your config —
    remove newArchEnabled: false."** **Ignore this. Do NOT remove it** (rule 0.4 #10).

---

# SECTION 12 — WHAT'S LEFT (all optional)

Nothing is blocking. Everything below is polish or a new feature area.

**Immediate:**
- Install and smoke-test the new APK (see 0.1).
- Rotate the exposed Supabase DB password + `CRON_SECRET` (SECTION 5).

**Optional polish:**
- Trim the wallpaper picker to img2/img3/img4 + Grand Line; resize multi-MB photos.
- Reminder **editing** (currently create/delete only) and recurrence beyond "daily".
- Quiet hours for the check-in; per-reminder timezone handling after travel.
- Add edge-swipe to open the drawer (deliberately omitted to avoid gesture conflicts).
- Rich push (images/actions).

**Optional features:**
- **Google Sign-In**, then **Apple Sign-In** (Apple is required by the App Store once another
  social login exists).
- Custom avatar crop screen (needs a native crop package + dev build — risky, see #27).
- **Publish to Google Play** ($25 one-time) to remove the "unknown source" sideload warning.
- Original "Phase 5 — Advanced": **voice conversations**, premium features, deeper personalization.
- Goal progress %/streaks — **deliberately NOT built** (rule 0.4 #9, non-manipulative).

---

# SECTION 13 — SHIPPING THE APK TO FRIENDS

**Cost reality:** Render free $0, EAS Build free tier $0, Supabase/Groq/Brevo free $0, sharing an
APK directly $0. Only paid if publishing: Google Play $25 one-time, Apple $99/year. (iOS on a real
iPhone needs the $99 Apple Developer account + TestFlight/UDID; Android is free forever.)

**Process:** build -> EAS returns a download link -> open the link on the phone (or send the .apk)
-> Android warns "unknown source" -> Install anyway -> they see the **Saphin AI** icon and name.
Friends sign up in-app (confirm password + email confirmation via Brevo), click the email link,
then log in. **Mention the ~50s cold start** on the first request after the server has been idle.

**One-time EAS setup already done:** `npm i -g eas-cli`, `eas login`, `eas build:configure`
(linked `@saphinpraja/saphin-ai`, wrote projectId into app.json), `eas.json` set to APK + env.
The keystore was auto-generated in the cloud. (Ignore any `adb ENOENT` error at the end — that's
just the optional "run on emulator" step; the APK is already built.)

**Watch-outs before/after any build:**
- `SUPABASE_SERVICE_ROLE_KEY` MUST be in Render's env (for `DELETE /account`).
- `DATABASE_URL` must keep `postgresql+asyncpg://` and `%40` for any `@` in the password.
- If the backend URL changes -> **rebuild the APK** (baked at build time).
- If email stops sending -> regenerate the Brevo SMTP key and update Supabase.
- **`newArchEnabled` must stay `false`** or the keyboard bug returns.
- The custom icon + "Saphin AI" name only appear in the real build, never in Expo Go.
- Biometrics, notifications, and true keyboard behavior are **APK-only** truth.
- After any backend push a new route 404s briefly and the browser caches it (#29).
- Supabase **Redirect URLs** must list both `/reset-password` and `/confirmed`.

**Pre-build checklist (FRONTEND):**
```powershell
npx tsc --noEmit        # must print nothing
npx expo-doctor         # must be 18/18
git add -A ; git commit -m "..." ; git push origin main
eas build -p android --profile preview
```

---

# SECTION 14 — DOC MAINTENANCE RULE

Update on every major milestone: PRD, SRS, ROADMAP, ARCHITECTURE (decision records),
DATABASE, API, DEPLOYMENT, LEARNING — **and this handover**.

**Handover rule learned the hard way:** describing what a file *does* is not enough. Future
chats break when they guess exact names. **Whenever a shared contract changes** (an ORM column, a
settings field, an exported function, a component prop, a theme token), update **SECTION 3** in the
same session. SECTION 3 is the single highest-value part of this document.

A `DEPLOYMENT.md` capturing Render + Brevo + cron-job.org + EAS setup is still worth creating.
A populated README comes near launch.

**Files this document replaces (safe to delete):** every older `HANDOVER (n).md`, and
`THEME_SYSTEM_KICKOFF.md`, and `PHASE_4_KICKOFF.md`.

---
---

# SECTION 15 — PHASE 4 FULLY VERIFIED + FCM PUSH SETUP (added 19 July 2026)

> **This section was APPENDED after the rest of the document. Nothing above was changed.**
> Where it contradicts an earlier section, **this section wins** — it is newer.
>
> **Headline: Phase 4 is now 100% verified working end-to-end on the real APK.** An AI-written
> daily check-in notification was received on the phone at the exact set time, showing the
> **purple Saphin AI icon** (not Expo Go's blue one). Screenshot-confirmed 19 July 2026, 7:47 pm.

## 15.0 What this section covers

After the Phase 4/5 APK shipped, three separate bugs were found and fixed — stacked on top of
each other, which is why it took a long debugging chain. All three are now resolved:

1. **The check-in toggle wouldn't stay ON** → Pydantic schema gap (15.1)
2. **Push never reached the real APK** → missing Firebase/FCM credentials (15.2)
3. **Check-ins never fired on schedule** → the cron job had auto-disabled itself (15.3)

## 15.1 BUG 1 — Check-in toggle silently not saving (FIXED, backend-only)

**Symptom:** toggle Daily check-in ON in Profile, leave the screen, come back → it's OFF again.
Happened in the APK *and* Expo Go. No error message; the request returned 200 OK.

**Root cause:** Phase 4 added `checkin_enabled`, `checkin_hour`, `checkin_minute`,
`checkin_tz_offset_minutes`, `last_checkin_date` to the **ORM** (`db/models.py`) but NOT to the
**Pydantic schemas** in `backend/app/models/profile.py`. Pydantic **silently drops unknown
fields**, so `payload.model_dump(exclude_unset=True)` returned `{}` → nothing was written → and
`ProfileOut` didn't return the fields either, so the app read `undefined` → `?? false` → OFF.

**This is the single most important lesson of the session:** an ORM column is not enough. If a
field must travel over the API, it must ALSO exist in the Pydantic In/Out schema.

**Fix — `backend/app/models/profile.py` now reads:**
```python
"""Request/response schemas for the profile API."""
from datetime import date
from pydantic import BaseModel, ConfigDict


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    display_name: str | None = None
    theme_preference: str = "system"
    theme_id: str = "default"
    personality_mode: str = "balanced"
    avatar_url: str | None = None
    # Phase 4 — daily check-in settings
    checkin_enabled: bool = False
    checkin_hour: int = 9
    checkin_minute: int = 0
    checkin_tz_offset_minutes: int = 0
    last_checkin_date: date | None = None


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    theme_preference: str | None = None
    theme_id: str | None = None
    personality_mode: str | None = None
    avatar_url: str | None = None
    # Phase 4 — daily check-in settings
    checkin_enabled: bool | None = None
    checkin_hour: int | None = None
    checkin_minute: int | None = None
    checkin_tz_offset_minutes: int | None = None
```
Note `last_checkin_date` is deliberately **absent from `ProfileUpdate`** — only the server writes
it. Backend-only change; pushed to Render, no APK rebuild needed.

## 15.2 BUG 2 — Remote push never reached the standalone APK (FIXED via Firebase/FCM)

**Symptom:** `POST /internal/run-checkins` returned `{"sent":1}` and a notification DID arrive —
but with the **blue Expo Go icon**, never the app's own. `push_tokens` had only ONE row, whose
timestamp matched an Expo Go session.

**Root cause:** on Android, a **standalone app must have its own FCM (Firebase Cloud Messaging)
credentials** to receive remote push. Expo Go ships with Expo's own credentials, which is why it
worked there. The APK had none, so `getExpoPushToken()` threw inside the app,
`notifications.ts` caught it silently (by design), and no token was ever saved.

⚠️ **Do not confuse this with the keystore.** The "Prepare credentials" step in the EAS build log
is the *signing keystore* — a completely different thing. `eas credentials` showed:
`Push Notifications (FCM V1): None assigned yet`.

### The full setup that fixed it (do this once per project; future builds inherit it)

**A. Firebase project**
1. https://console.firebase.google.com → **Create a project** → name `Saphin AI`
   (Google Analytics can be off; if the wizard insists, picking an existing account is harmless).
2. On the project page → **+ Add app** → **Android**.
3. **Android package name must match `app.json` exactly: `com.saphin.ai`.** Leave SHA-1 blank.
4. **Register app** → **Download `google-services.json`**.
5. Click Next/Next/Continue to console — **ignore every Gradle/Android-Studio instruction**,
   Expo handles that.

**B. Service account key (the secret Expo needs in order to SEND)**
6. Firebase → **gear icon ⚙️ → Project settings → Service accounts** tab.
7. **Generate new private key** → Generate key → a JSON file downloads
   (e.g. `saphin-ai-firebase-adminsdk-fbsvc-xxxxxxx.json`).
   *(The Google Cloud "IAM → Service accounts" page is NOT needed — it's a side page.)*

**C. Put the files in place (FRONTEND)**
```powershell
cd C:\Users\saphi\Desktop\Ai-Companion\frontend
Move-Item "$env:USERPROFILE\Downloads\google-services.json" -Destination "google-services.json" -Force
Move-Item "$env:USERPROFILE\Downloads\saphin-ai-firebase-adminsdk-*.json" -Destination "fcm-service-account.json" -Force
Add-Content -Path "..\.gitignore" -Value "`r`n# Firebase FCM service account (SECRET)`r`nfrontend/fcm-service-account.json`r`n"
```

**D. Point app.json at the config file** — inside the `android` block:
```json
"package": "com.saphin.ai",
"googleServicesFile": "./google-services.json"
```

**E. Verify the secret is NOT staged (ROOT) — never skip this**
```powershell
git status --short      # fcm-service-account.json must NOT appear
```

**F. Upload the key to Expo (FRONTEND)**
```powershell
eas credentials
```
→ **Android** → **preview** (that's the profile the APK is built with; `production` is unused)
→ **Google Service Account**
→ **Manage your Google Service Account Key for Push Notifications (FCM V1)**
→ **Set up a Google Service Account Key for Push Notifications (FCM V1)**
→ it auto-detects `fcm-service-account.json` → **yes**

Success looks like:
```
✔ Uploaded Google Service Account Key.
✔ Google Service Account Key assigned to com.saphin.ai for FCM V1
```
and the summary flips from `None assigned yet` to showing Project ID `saphin-ai`.

**G. Rebuild** — FCM only takes effect in a NEW build:
```powershell
npx tsc --noEmit ; npx expo-doctor
cd C:\Users\saphi\Desktop\Ai-Companion
git add -A ; git commit -m "Add Firebase FCM config for push notifications" ; git push origin main
cd frontend ; eas build -p android --profile preview
```
Then **download and install the new APK** — the old installed app never updates itself.

### File / secret rules that came out of this
- `frontend/google-services.json` → **committed to git. Safe.** It only identifies the app.
- `frontend/fcm-service-account.json` → **SECRET, gitignored, never commit, never paste in chat.**
- Both live in the `frontend` folder.
- Firebase project: **`saphin-ai`**, Android package **`com.saphin.ai`**, Spark (free) plan,
  service account `firebase-adminsdk-fbsvc@saphin-ai.iam.gserviceaccount.com`.

## 15.3 BUG 3 — The cron job had auto-disabled itself (FIXED)

**Symptom:** after everything above was correct, check-ins still never fired on time. Manual curl
worked; the schedule did nothing.

**Root cause:** the cron-job.org dashboard read **`0 enabled cronjobs / 1 disabled / 1 failed`**,
with the failure reason **"Failed (output too large)"** and *"Next Runs: No upcoming executions."*

Two things combined:
- **"Save responses in job history" was ON.** cron-job.org stores each response and enforces a
  size limit; exceeding it is counted as a **failure**.
- The **"disable the cronjob because of too many failures"** notification/safety toggle was ON,
  so after repeated "failures" cron-job.org **switched the job off entirely**.

**Fix (cron-job.org → Cronjobs → Saphin check-ins → Edit):**
- **Enable job: ON**
- **Save responses in job history: OFF**  ← this is what caused the failures
- Schedule: **Every 1 minute** (`* * * * *`)
- **SAVE**, then confirm the Dashboard shows **1 enabled cronjob** and Next Runs lists times
  one minute apart.

⚠️ **Diagnostic rule for the future: if scheduled check-ins stop, check the cron-job.org DASHBOARD
FIRST.** A disabled job is invisible from the app and the database — everything else looks
perfectly healthy.

## 15.4 Timing change — check-ins are now minute-accurate

Owner asked for exact-time delivery. Two coordinated changes:

1. **cron-job.org schedule: every 15 minutes → every 1 minute** (`* * * * *`).
2. **`backend/app/api/internal.py`: the fire window narrowed from 15 minutes to 2.**
   ```python
   if not (0 <= (now_min - target) % 1440 <= 2):
       continue
   ```

**Consequences to remember:**
- A check-in now lands within ~1 minute of the chosen time.
- The Render free instance is now pinged 1,440×/day, so it effectively **stays awake** — a bonus
  side effect is no more ~50-second cold starts anywhere in the app. Render's free 750 h/month
  covers one always-on service (a month is ~730 h), so this fits — **but do not add a second
  always-on free service.**
- ⚠️ **A manual curl test now only works within 2 minutes of the set time.** Outside that window
  it correctly returns `{"sent":0}`. This is not a bug — it confused us for a while.

## 15.5 How `last_checkin_date` behaves (owner asked — no manual work needed)

- It's the "already sent today" guard. After sending, the server writes today's local date so the
  user can never get two check-ins in one day.
- **It clears itself naturally** — tomorrow's date won't match, so the check is free again.
- **The user never needs to touch Supabase.** Clearing it by hand was ONLY a testing shortcut to
  re-fire on the same evening.
- Real-world behaviour when the time is changed: if today's check-in hasn't fired yet, the new
  time applies today; if it already fired, the new time applies **tomorrow**. That's correct,
  non-spammy behaviour — don't "fix" it.

## 15.6 The correct way to test a check-in end-to-end

1. cron-job.org dashboard → confirm **1 enabled cronjob** with upcoming runs.
2. In the app: Profile → Daily check-in **ON** → **Allow** the OS permission prompt →
   set the time **~3 minutes in the future** → go Back (it saves).
3. Supabase → `profiles` → confirm `checkin_enabled = TRUE`, the hour/minute match, and
   `checkin_tz_offset_minutes = -345` (Nepal). Clear `last_checkin_date` to **NULL** *(testing only)*.
4. Supabase → `push_tokens` → confirm a row exists whose `updated_at` matches **today** (the APK's
   token, not an old Expo Go one).
5. Put the phone down and wait — the 1-minute cron fires it. No curl needed.
6. **The pass/fail tell: the notification icon.** **Purple Saphin AI = the real app (SUCCESS).**
   Blue Expo Go = it only reached Expo Go.

Manual trigger (only inside the 2-minute window):
```powershell
curl.exe -X POST https://saphin-ai-backend.onrender.com/internal/run-checkins -H "X-Cron-Secret: <CRON_SECRET>"
```
`{"sent":1}` = sent · `{"sent":0}` = declined (disabled / already sent today / outside window).

## 15.7 Housekeeping: duplicate notifications

Both the old **Expo Go** token and the new **APK** token were registered for the same user, so a
check-in arrived **twice** (once purple, once blue). Harmless but untidy.

**Fix:** Supabase → `push_tokens` → delete the **older Expo Go row** (identify it by the older
`updated_at`), keep the newest one. If Expo Go is used again for testing, a new Expo Go token will
reappear and can be deleted again. There is currently no automatic cleanup of stale tokens —
a possible future improvement is to delete a token when Expo returns `DeviceNotRegistered`.

## 15.8 Reminders — NOT a bug (investigated and confirmed)

The "Repeat every day" switch resetting to OFF after adding a reminder is **correct behaviour**.
It is part of the *compose form*, not a saved setting — the title box clears too. The reminder
itself saves correctly (verified: rows showing "Every day - 19:27" / "23:20"), and local
notifications fire **exactly on time** (verified: "Go to work" arrived at 7:27).

A change was briefly made to remove `setDaily(false)` from `add()` so the switch would persist —
then **reverted at the owner's request**. `RemindersScreen.tsx` is back to original behaviour
(one `setDaily(false)` inside `add()`). Don't re-apply it without asking.

## 15.9 AMENDMENTS to earlier sections (add-only; these supersede)

**To SECTION 2 (project structure)** — new files in `frontend/`:
```
frontend/google-services.json        # Firebase config, COMMITTED (safe)
frontend/fcm-service-account.json    # Firebase private key, GITIGNORED (SECRET)
```

**To SECTION 3 (exact code contracts)** — `ProfileOut` / `ProfileUpdate` now include the Phase 4
check-in fields exactly as listed in 15.1. Any code touching check-in settings must use them.

**To SECTION 5 (secrets/config)** — additions:
- Firebase project `saphin-ai`, Spark plan, Android package `com.saphin.ai`.
- `frontend/fcm-service-account.json` is a **secret** (gitignored).
- EAS `preview` profile now has **FCM V1 Google Service Account Key assigned**.
- cron-job.org job is **every 1 minute**, "Save responses in job history" must stay **OFF**.

**To SECTION 6 (how to run)** — add to the pre-build checklist: confirm
`git status --short` does not list `fcm-service-account.json`.

**To SECTION 0.1 (status)** — the five smoke-test items listed there are now **DONE and passing**:
no Expo Go error in the APK, the toggle persists, permission prompt works, a real AI-written push
arrives on time with the app's own icon, and local reminders fire exactly on time.

## 15.10 NEW MISTAKES (continuing SECTION 11's numbering)

51. **ORM column added but Pydantic schema not updated** → the API silently accepted and discarded
    the fields, returning 200 OK the whole time (15.1). **Whenever a field must cross the API,
    add it to BOTH `db/models.py` AND the Pydantic In/Out schema.** Silent data loss with a
    success response is the nastiest failure mode in this project so far.
52. **cron-job.org silently disabled the job** after "output too large" failures caused by
    "Save responses in job history" (15.3). Everything else looked healthy, so this cost a lot of
    time. **Check the cron dashboard FIRST when scheduled work stops.**
53. **Confusing the EAS keystore with FCM credentials.** The build log's "Prepare credentials" is
    about *signing*, not *push*. Push status is only visible via `eas credentials` →
    `Push Notifications (FCM V1)`.
54. **Testing push in Expo Go and believing it proves the APK works.** Expo Go has its own push
    credentials; a token registered from Expo Go tells you nothing about the standalone app.
    **The notification icon is the ground truth** — purple = real app, blue = Expo Go.
55. **Manual curl returning `{"sent":0}` after the window was narrowed to 2 minutes** — looked like
    a failure, was actually correct behaviour (15.4).
56. **PowerShell mangles inline JSON in curl** (`bad range in position 24`) when using
    `-d "{\"to\":\"...\"}"`. Don't fight it — test push via the app or the backend endpoint instead.
57. **Pasting secrets into chat.** The Supabase DB password and `CRON_SECRET` both ended up in
    transcripts and now need rotating. When a terminal shows key material, describe it instead of
    pasting. (The owner correctly blacked out the FCM key in a screenshot — do that.)

## 15.11 WHAT'S NEXT (status confirmed 19 July 2026)

**Phases 1–5 are all COMPLETE and verified.** No new phase has been started.

SECTION 12's list still stands and is still all optional. Updated only where today changed things:

**Done since SECTION 12 was written:** install + smoke-test the APK ✅, and remote push now works ✅.

**Still outstanding / recommended next:**
- 🔴 **Rotate the exposed secrets** — Supabase DB password (update `DATABASE_URL` locally AND on
  Render) and `CRON_SECRET` (update on Render AND cron-job.org). Highest-priority housekeeping.
- Delete the stale Expo Go row from `push_tokens` (15.7).
- Consider adding the FCM key to the `production` EAS profile too, so a future Play Store build
  has push ready (only `preview` has it now).
- Everything else in SECTION 12 (Google/Apple Sign-In, Play Store publishing, voice conversations,
  reminder editing, quiet hours, drawer edge-swipe, wallpaper trimming) remains untouched and
  optional.

**Nothing is blocking. The app is feature-complete for its current scope and working on real
devices.**

## 15.12 Small details recovered from the older handover versions (completeness check)

A keyword audit of all 7 previous handover files against this document found only two details that
hadn't carried over. Recorded here so nothing from the original notes is lost:

- **Password reset — exact frontend call.** The "Forgot password?" link on `AuthScreen` calls
  `supabase.auth.resetPasswordForEmail(email, { redirectTo: "https://saphin-ai-backend.onrender.com/reset-password" })`.
  The same call is reused inside `ProfileScreen`'s change-password dialog as an escape hatch.
  (The flow itself is D16 / SECTION 11 #30; this is just the precise function name.)
- **Fingerprint icon.** The biometric button on the login screen uses `@expo/vector-icons` →
  `Ionicons name="finger-print"` (ships with Expo; this is why `@expo/vector-icons` — and therefore
  its `expo-font` peer dependency, SECTION 11 #48 — is in the project at all).
- **Abandoned design note:** an earlier `LockScreen.tsx` **auto-lock-on-app-open** draft was
  written and then abandoned in favour of the login-screen fingerprint button as the single entry
  point (rule 0.4 #7). `LockScreen.tsx` still exists and is still rendered by `App.tsx` when a
  biometric lock is active, so don't delete the file — but don't expand it into a full auto-lock
  model without asking.

Everything else from all previous versions (setup history, Phase 1–3 build logs, theme staging,
deployment steps, every numbered mistake) is already present in SECTIONS 0–14 above.
