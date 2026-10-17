# Saphin AI â€” MASTER HANDOVER (the ONE file)

> âš ï¸ **ALWAYS SCROLL TO THE LAST SECTION FIRST.** New work is ADDED to the bottom of this file,
> never merged into the middle. The newest section at the very end is the CURRENT status and
> OVERRIDES everything above it wherever they conflict. Read the last section first, then come
> back up here for the stable reference material (architecture, contracts, secrets, bugs).

---

## SETTLED - DO NOT RE-RAISE THESE

> Everything in this list was carried as an open RED item through several sessions
> **after it had already been done**, because the sections that raised it are
> append-only and nobody ever closed it anywhere a later session would look. Each
> session then spent the owner's time asking about finished work. If you find one of
> these flagged as outstanding further down, that text is a HISTORICAL RECORD of what
> was true when that section was written - it is not a task.

| Item | Status | How it was confirmed |
|---|---|---|
| Supabase DB password rotation | **DONE** (owner, before Oct 17 2026) | `/health` returns ok, so `DATABASE_URL` connects; `.env` never committed; `git grep` finds the live password in no tracked file |
| `CRON_SECRET` rotation | **DONE** (owner, verified Oct 17 2026) | wrong secret -> 403, real secret -> 200 `{"sent":0}`, so local `.env` and Render match |

**Still genuinely unverifiable from a session:** whether **cron-job.org** holds the same
`CRON_SECRET` - it is a third copy behind the owner's login. The signal is behavioural:
if the daily check-in notification still arrives, it matches.

**Before adding ANY security or config item to an outstanding list, check it here first,
and prefer a live probe over trusting this document.** That is how both of the above
were closed. Full detail in SECTION 5.

> **This single file replaces every previous handover file and every kickoff file.**
> Paste ONLY this into a new chat. It contains the whole project from day one to now:
> what we're building, every architecture decision, every file and its exact path, every
> secret/config location, every bug we hit and how we fixed it, the exact code contracts
> that keep tripping people up, and what's left to do.
>
> Nothing is repeated between sections â€” if a topic has a home, that's the only place it lives.

---

# SECTION 0 â€” READ THIS FIRST

## 0.1 Where we are RIGHT NOW

**The app is built through Phase 6 and now has a LIVE WEB VERSION at saphinai.vercel.app.
Phases 1-5 are shipped and verified on the real APK. Phase 6 (attachments) is complete.
A web version using Expo Web was built and deployed to Vercel in Section 19.**

> **SECTION 19 is the NEWEST section and WINS over anything above it where they
> conflict.** It covers the web version (Expo Web + Vercel deployment) and a
> timing re-fix for the home-screen mic shortcut (#68). Read Section 19 first,
> then come back here for stable reference material.
>
> **Web deploy commands (from frontend/):**
> ```
> npx expo export --platform web
> vercel dist --prod
> ```

---

**The app is fully built through Phase 5 and shipped as a working APK.**

Latest session (Phase 4 + Phase 5) â€” everything below is DONE, TESTED, COMMITTED, PUSHED,
and BUILT into an APK that finished successfully on EAS:

- **Phase 4 â€” Proactivity: COMPLETE.** AI-written daily check-in push notifications
  (remote, cron-triggered), local reminders, and goal tracking injected into chat.
  Backend LIVE on Render, cron job running every 15 min on cron-job.org.
- **Phase 5 â€” Navigation redesign: COMPLETE.** Claude/ChatGPT-style home (hamburger menu +
  greeting + real chat input bar), left slide-in drawer holding all navigation + chat history,
  and a new About screen.
- **APK build:** finished successfully (`Phase 5: drawer navigation, home redesign, home input, About screen`, commit `8c84ffc`, build 41m 20s, all steps green including `expo doctor`).

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

## 0.3 HOW TO GIVE ME ANSWERS (owner's working rules â€” DO NOT FORGET)

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
   `ProfileScreen.tsx`, etc.), do NOT blind-overwrite â€” that wipes my work. Ask me to show you
   the file first (`Get-Content <path>`), then give me the complete corrected file as one command.
   Seeing the real file before rewriting is what prevents broken imports.
4. **Complete files, never "change line X" snippets.** I get lost finding lines.
5. **Step-by-step** (Step 1, Step 2...), command and code together.
6. **Test before building.** Always run `npx tsc --noEmit` before an `eas build`. A build takes
   20-90 minutes; a type-check takes 10 seconds.
7. **Don't rush me.** If I'm asking design questions, answer them and show me samples/previews
   before writing code. Don't push me toward a decision I haven't made yet.
8. **If I say I'm scared of something being "hard,"** don't talk me out of what I want â€” explain
   the real risk honestly, then help me do it carefully. You're here to fix bugs with me.
9. Never assume something works in the real APK because it worked in Expo Go â€” remind me to re-test.
10. Terminals: **ROOT** = `C:\Users\saphi\Desktop\Ai-Companion`, **FRONTEND** = `frontend\`,
    **BACKEND** = `backend\`.
11. When a doc file is requested, deliver it as a downloadable file for `docs\`.

## 0.4 CRITICAL PRODUCT RULES â€” NEVER VIOLATE OR REVERSE THESE

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
5. **ACCOUNT DELETION â€” the ONE permanent delete.**

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
    layout (SECTION 11 #26). Expo Go will WARN that it's disabled â€” **ignore that warning**,
    it only applies to Expo Go, not the real build.
11. **Log out and Delete account live in Profile ONLY** â€” not in the navigation drawer
    (owner's explicit Phase 5 decision).

## 0.5 MODEL USAGE PLAN

- **Sonnet** = daily driver for ~85% of work (file generation, debugging, wiring, refactors).
- **Opus** = genuine architecture forks only (Phase 2 memory design, Phase 3 personality design,
  Phase 4 proactivity design, Phase 5 navigation design).
- Pattern: **Opus decides the shape, Sonnet builds it.**
- Discipline: one milestone per chat; paste this handover (not whole logs); start a fresh chat
  each milestone to protect usage limits.

---

# SECTION 1 â€” THE PROJECT

## 1.1 What we are building

A mobile **AI Companion** app ("Saphin AI") â€” a warm, supportive AI that feels like a trusted
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
- **Backend hosting:** **Render free tier** â€” LIVE at `https://saphin-ai-backend.onrender.com`.
  Auto-deploys from GitHub `main`, root dir `backend`. **Free instance sleeps on idle (~50s
  cold start).**
- **Database:** PostgreSQL via Supabase (SQLAlchemy async + asyncpg, Session pooler).
- **Auth:** Supabase Authentication (email/password + email confirmation).
- **Storage:** Supabase Storage â€” public bucket `avatars`.
- **Email:** Custom SMTP via **Brevo** (free tier, 300/day) wired into Supabase Auth.
- **AI:** Provider abstraction layer. **Active = Groq** (`llama-3.3-70b-versatile`).
  Claude + Gemini providers exist but are inactive.
- **Push notifications:** Expo Push API (`https://exp.host/--/api/v2/push/send`).
- **Scheduler:** **cron-job.org** (free) hitting a secret-guarded backend endpoint every 15 min.
- **Build:** EAS Build. Expo account `saphinpraja`, project `@saphinpraja/saphin-ai`,
  projectId `e8d6e6eb-b1bf-4e21-af8b-885612a4b999`.

## 1.3 Roadmap â€” status of all phases

**Phase 1 â€” Foundation: 100% COMPLETE + DEPLOYED.**
Project setup, mobile UI, email/password auth, secure backend, AI chat, chat history
persistence, chats list, profile screen, redesigned auth screen, confirm password +
show/hide + email-exists detection, per-chat Pin/Rename/Remove, display-name save fix,
permanent account deletion, backend deployed public (Render), custom SMTP (Brevo), APK built,
theme toggle, avatar photo, delete-account dialog restyle, keyboard fix, friendly confirm page,
password reset, change password, biometric fingerprint login, auth+profile scroll fixes.
*Still open (optional):* Google login, Apple Sign-In.

**Phase 2 â€” Memory: 100% COMPLETE + LIVE + tested on real APK.**
Two-tier memory (D19). Backend-only â€” no rebuild was needed.

**Phase 3 â€” Personality & Reflection: COMPLETE.** (D22, full detail SECTION 9)
Tone detection + mood logging, personality modes, responding journal, creator identity,
tappable links. *Dropped by owner:* weekly mood-summary recap.
Backend was LIVE; frontend shipped in the Phase 4/5 APK build.

**Phase 4 â€” Proactivity: COMPLETE.** (D23, full detail SECTION 10)
AI-written daily check-in push, local reminders, goal tracking.

**Phase 5 â€” Navigation & UX redesign: COMPLETE.** (D24, full detail SECTION 10)
Drawer navigation, home redesign, home chat input, About screen.
*(Note: the original roadmap called Phase 5 "Advanced: voice, premium, personalization." Those
are now deferred â€” see SECTION 12. "Phase 5" here means the navigation redesign.)*

**Future vision (guides architecture):** long-term relationship, milestone recall,
non-manipulative proactive check-ins, adapts to the user's communication style, multiple
selectable personalities, swappable AI providers, clean scalability without over-engineering.

---

# SECTION 2 â€” PROJECT STRUCTURE (complete, current on disk)

Root: `C:\Users\saphi\Desktop\Ai-Companion\`

```
Ai-Companion/
â”œâ”€â”€ .gitignore                       # ignores .env, node_modules, venv
â”œâ”€â”€ README.md
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ PRD.md  SRS.md  ROADMAP.md
â”‚   â”œâ”€â”€ ARCHITECTURE.md              # decision records D1â€“D24
â”‚   â”œâ”€â”€ DATABASE.md                  # schema
â”‚   â”œâ”€â”€ HANDOVER.md                  # THIS FILE
â”‚   â””â”€â”€ learning.md
â”‚
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ .env                         # REAL SECRETS (gitignored) â€” see SECTION 5
â”‚   â”œâ”€â”€ .env.example
â”‚   â”œâ”€â”€ Procfile                     # web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
â”‚   â”œâ”€â”€ .python-version              # 3.12.7 (pins Render)
â”‚   â”œâ”€â”€ requirements.txt             # incl. sqlalchemy[asyncio]>=2.0, asyncpg>=0.29, httpx
â”‚   â”œâ”€â”€ venv/                        # activate: .\venv\Scripts\Activate.ps1
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ main.py                  # FastAPI app, CORS, registers ALL routers
â”‚       â”œâ”€â”€ core/config.py           # Settings (pydantic-settings) â€” LOWERCASE field names
â”‚       â”œâ”€â”€ db/
â”‚       â”‚   â”œâ”€â”€ base.py
â”‚       â”‚   â”œâ”€â”€ session.py           # async engine + get_db()
â”‚       â”‚   â””â”€â”€ models.py            # ALL ORM models (see 3.1)
â”‚       â”œâ”€â”€ models/                  # Pydantic schemas
â”‚       â”‚   â”œâ”€â”€ chat.py              # ChatRequest/Response, MessageOut, SessionOut, SessionUpdate
â”‚       â”‚   â”œâ”€â”€ profile.py           # ProfileOut / ProfileUpdate
â”‚       â”‚   â”œâ”€â”€ memory.py            # Phase 2
â”‚       â”‚   â”œâ”€â”€ mood.py              # Phase 3
â”‚       â”‚   â”œâ”€â”€ journal.py           # Phase 3
â”‚       â”‚   â”œâ”€â”€ reminder.py          # Phase 4 â€” ReminderCreate, ReminderOut
â”‚       â”‚   â”œâ”€â”€ goal.py              # Phase 4 â€” GoalCreate, GoalUpdate, GoalOut
â”‚       â”‚   â””â”€â”€ push.py              # Phase 4 â€” PushTokenIn
â”‚       â”œâ”€â”€ ai/
â”‚       â”‚   â”œâ”€â”€ base.py              # AIProvider ABC
â”‚       â”‚   â”œâ”€â”€ claude_provider.py   # inactive
â”‚       â”‚   â”œâ”€â”€ gemini_provider.py   # inactive
â”‚       â”‚   â”œâ”€â”€ groq_provider.py     # ACTIVE â€” builds the system prompt
â”‚       â”‚   â”œâ”€â”€ provider_factory.py  # get_ai_provider()
â”‚       â”‚   â”œâ”€â”€ memory_extractor.py  # Phase 2 â€” best-effort fact extraction
â”‚       â”‚   â”œâ”€â”€ mood_detector.py     # Phase 3 â€” best-effort tone classifier
â”‚       â”‚   â”œâ”€â”€ journal_reflector.py # Phase 3 â€” best-effort journal reflection
â”‚       â”‚   â””â”€â”€ checkin_writer.py    # Phase 4 â€” best-effort daily check-in line
â”‚       â”œâ”€â”€ auth/dependencies.py     # get_current_user_id via Supabase JWKS
â”‚       â”œâ”€â”€ services/
â”‚       â”‚   â”œâ”€â”€ __init__.py
â”‚       â”‚   â””â”€â”€ expo_push.py         # Phase 4 â€” send_push() via Expo Push API
â”‚       â”œâ”€â”€ api/
â”‚       â”‚   â”œâ”€â”€ health.py            # GET /health
â”‚       â”‚   â”œâ”€â”€ chat.py              # POST /chat + session endpoints
â”‚       â”‚   â”œâ”€â”€ profile.py           # GET /profile, PUT /profile (partial), DELETE /account
â”‚       â”‚   â”œâ”€â”€ confirmed.py         # GET /confirmed â€” styled HTML page
â”‚       â”‚   â”œâ”€â”€ reset_password.py    # GET /reset-password â€” HTML form
â”‚       â”‚   â”œâ”€â”€ journal.py           # Phase 3 â€” POST/GET /journal
â”‚       â”‚   â”œâ”€â”€ reminders.py         # Phase 4 â€” POST/GET /reminders, DELETE /reminders/{id}
â”‚       â”‚   â”œâ”€â”€ goals.py             # Phase 4 â€” POST/GET /goals, PATCH /goals/{id}
â”‚       â”‚   â”œâ”€â”€ push.py              # Phase 4 â€” POST /push/register
â”‚       â”‚   â””â”€â”€ internal.py          # Phase 4 â€” POST /internal/run-checkins (cron, secret-guarded)
â”‚       â””â”€â”€ repositories/
â”‚           â”œâ”€â”€ chat_repository.py
â”‚           â”œâ”€â”€ profile_repository.py
â”‚           â”œâ”€â”€ memory_repository.py
â”‚           â”œâ”€â”€ mood_repository.py
â”‚           â”œâ”€â”€ journal_repository.py
â”‚           â”œâ”€â”€ reminder_repository.py    # Phase 4
â”‚           â”œâ”€â”€ goal_repository.py        # Phase 4
â”‚           â”œâ”€â”€ push_repository.py        # Phase 4
â”‚           â””â”€â”€ checkin_repository.py     # Phase 4
â”‚
â””â”€â”€ frontend/
    â”œâ”€â”€ .env                         # EXPO_PUBLIC_* (gitignored)
    â”œâ”€â”€ .env.example
    â”œâ”€â”€ app.json                     # newArchEnabled:false, edgeToEdgeEnabled:false,
    â”‚                                #   softwareKeyboardLayoutMode:"resize", name "Saphin AI"
    â”œâ”€â”€ eas.json                     # preview + production = APK, env baked in
    â”œâ”€â”€ App.tsx                      # root: auth gate, view switching, push registration, back handler
    â”œâ”€â”€ index.js  package.json  tsconfig.json
    â”œâ”€â”€ assets/                      # icon set + wallpapers/img1.jpg â€¦ img5.jpg
    â””â”€â”€ src/
        â”œâ”€â”€ types/chat.ts            # ChatMessage { id, role:'user'|'companion', text, createdAt }
        â”œâ”€â”€ context/
        â”‚   â””â”€â”€ ThemeContext.tsx     # 1-LINE SHIM: export * from "../theme/ThemeContext"  (DO NOT DELETE)
        â”œâ”€â”€ theme/                   # the theme engine (D20) â€” see SECTION 8
        â”‚   â”œâ”€â”€ types.ts
        â”‚   â”œâ”€â”€ registry.ts          # THE one file to edit to add a theme
        â”‚   â”œâ”€â”€ ThemeContext.tsx     # provider: themeId x mode, cross-fade, app-wide Background
        â”‚   â”œâ”€â”€ themes/
        â”‚   â”‚   â”œâ”€â”€ default/index.ts
        â”‚   â”‚   â”œâ”€â”€ onePiece/index.ts + Background.tsx   # "Grand Line" + animated waves
        â”‚   â”‚   â””â”€â”€ nature/index.ts + Background.tsx     # photo wallpapers (D21)
        â”‚   â””â”€â”€ components/index.tsx # ThemedBackground/Button/Card/Input/Loader + ThemePicker
        â”œâ”€â”€ components/
        â”‚   â”œâ”€â”€ ChatBubble.tsx       # theme tokens + tappable URLs
        â”‚   â””â”€â”€ ChatInput.tsx
        â”œâ”€â”€ screens/
        â”‚   â”œâ”€â”€ AuthScreen.tsx       # login/signup, forgot password, fingerprint button, ScrollView
        â”‚   â”œâ”€â”€ LockScreen.tsx       # used by App.tsx when biometric lock is active
        â”‚   â”œâ”€â”€ ChatsListScreen.tsx  # Phase 5: this is now the HOME + DRAWER (see 10.2)
        â”‚   â”œâ”€â”€ ChatScreen.tsx       # messages + input; accepts optional initialMessage
        â”‚   â”œâ”€â”€ ProfileScreen.tsx    # name, theme, personality, DAILY CHECK-IN, security, danger zone
        â”‚   â”œâ”€â”€ JournalScreen.tsx    # Phase 3
        â”‚   â”œâ”€â”€ RemindersScreen.tsx  # Phase 4
        â”‚   â”œâ”€â”€ GoalsScreen.tsx      # Phase 4
        â”‚   â””â”€â”€ AboutScreen.tsx      # Phase 5
        â””â”€â”€ services/
            â”œâ”€â”€ supabase.ts          # Supabase client (AsyncStorage session)
            â”œâ”€â”€ api.ts               # ALL backend calls (see 3.6)
            â”œâ”€â”€ biometrics.ts        # expo-local-authentication + expo-secure-store
            â””â”€â”€ notifications.ts     # Phase 4 â€” permissions, push token, local scheduling
```

**Frontend packages installed:** `expo-linear-gradient`, `@react-native-async-storage/async-storage`,
`expo-image-picker`, `expo-local-authentication`, `expo-secure-store`, `expo-image`,
`expo-notifications`, `@react-native-community/datetimepicker`, `@expo/vector-icons`, `expo-font`.

**Do NOT install** `react-native-keyboard-controller` (peer-dep conflict). Be cautious with any
native module in managed Expo (e.g. `react-native-image-crop-picker` needs a dev build).

---

# SECTION 3 â€” EXACT CODE CONTRACTS (READ BEFORE WRITING ANY CODE)

**This section exists because guessing these wrong caused most of our wasted time.** These are
the real names in the real files. Do not assume; use these.

## 3.1 ORM models â€” `backend/app/db/models.py`

| Model            | Table               | user id column                  | Notes                                               |
| ---------------- | ------------------- | ------------------------------- | --------------------------------------------------- |
| `ChatSession`  | `chat_sessions`   | `user_id` **UUID**      | +`title`, `pinned`, `hidden_at`               |
| `ChatMessage`  | `chat_messages`   | `user_id` **UUID**      | FK`session_id` -> chat_sessions                   |
| `Profile`      | `profiles`        | **`id`** IS the user id | **There is NO `user_id` column on Profile** |
| `UserMemory`   | `user_memories`   | `user_id` **text**      |                                                     |
| `MoodLog`      | `mood_logs`       | `user_id` **text**      |                                                     |
| `JournalEntry` | `journal_entries` | `user_id` **text**      |                                                     |
| `PushToken`    | `push_tokens`     | `user_id` **text**      | unique (user_id, token)                             |
| `Reminder`     | `reminders`       | `user_id` **text**      |                                                     |
| `Goal`         | `goals`           | `user_id` **text**      |                                                     |

**The two biggest traps:**

- `Profile.id` is the user id. Writing `Profile.user_id` = crash. (Cost us a bug in Phase 4.)
- Everything from Phase 2 onward stores `user_id` as **text**, but `chat_sessions` /
  `chat_messages` use **UUID**. When calling a Phase 2+ repo from an endpoint, wrap it:
  `str(user_id)`.

`Profile` columns in full: `id`, `display_name`, `theme_preference`, `theme_id`,
`personality_mode`, `avatar_url`, `checkin_enabled`, `checkin_hour`, `checkin_minute`,
`checkin_tz_offset_minutes`, `last_checkin_date`, `created_at`, `updated_at`.

## 3.2 Backend settings â€” `backend/app/core/config.py`

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

## 3.4 Frontend theme tokens â€” `theme.*`

These are the ONLY valid theme fields. Do not invent `theme.isDark ? "#fff" : "#000"` colors â€”
use the tokens so the app stays themeable:

```
background  surface  surfaceAlt  textPrimary  textSecondary
accent  accentText  border  danger
bubbleUser  bubbleUserText  bubbleCompanion  bubbleCompanionText
overlay  isDark
```

Optional per theme: `fonts`, `shape`, `wallpaper`, `wallpaperOverlay`, `wallpaperPosition`.

Import: `import { useTheme } from "../context/ThemeContext";` (the shim) â€” both paths work.

## 3.5 `frontend/src/services/biometrics.ts` â€” the ONLY exports

```
isBiometricAvailable()   isBiometricEnabled()   enableBiometric(email, password)
disableBiometric()       getStoredCredentials()  authenticateBiometric()
```

There is **no** `getBiometricSetting` and **no** `setBiometricEnabled`. An old `App.tsx`
imported those non-existent names and it silently sat there until a `tsc` run caught it.

## 3.6 `frontend/src/services/api.ts` â€” all exported functions

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

Internal helper `patchProfile(patch)` does `PUT /profile` with partial fields (D15) â€” all the
`update*` helpers route through it.

## 3.7 `frontend/src/services/notifications.ts` â€” exports (Phase 4)

```
ensureAndroidChannel()      # must run before any Android notification shows
requestPermission()         # -> boolean
getExpoPushToken()          # -> string | null  (uses projectId e8d6e6eb-â€¦)
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
  initialMessage?: string | null;   // Phase 5 â€” auto-sends once, new chats only
};
```

Passing `sessionId = null` shows the welcome message and lets `handleSend` create the session on
the first message. **This is why Phase 5's home input was low-risk** â€” the home doesn't create a
chat, it just hands the text to ChatScreen.

## 3.9 `ChatsListScreen.tsx` props (Phase 5 â€” it is now the HOME)

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

# SECTION 4 â€” ARCHITECTURE DECISIONS (D1â€“D24)

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
- **D19 (Phase 2 â€” Memory)** **Two-tier memory.** Short-term = last 20 messages of the current
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
- **D22 (Phase 3 â€” Personality & Reflection)** Three layered features, all mirroring D19.
  (a) Tone detection -> `mood_logs` + live prompt injection. (b) Personality modes ->
  `profiles.personality_mode` injected **before** the tone nudge (style = base, mood = adjustment).
  (c) Responding journal -> `journal_entries` + best-effort reflection.
  **Creator identity** in the base prompt: only when asked who made/created/owns it, the companion
  names **Saphin Praja** + `https://saphinpraja.vercel.app/`.
- **D23 (Phase 4 â€” Proactivity)** **Hybrid proactivity** â€” each feature uses the mechanism that
  actually suits it:
  - **Daily check-in = REMOTE push.** An external cron (cron-job.org, every 15 min) POSTs to a
    secret-guarded `/internal/run-checkins`; that call both **wakes the sleeping Render free
    instance** and runs the job. The endpoint finds users whose chosen local time has arrived and
    who haven't been sent today, writes a fresh personal line via a best-effort Groq call
    (`checkin_writer.py`, using active goals), and sends it via the Expo Push API. OFF by default;
    no streaks or guilt (rule 0.4 #9).
  - **Reminders = LOCAL.** `expo-notifications` schedules on-device, so timing is exact and works
    while the server sleeps. Mirrored to a `reminders` table for reinstall-survival and so the
    companion knows about them. **Remote push would make reminders WORSE** â€” don't "upgrade" them.
  - **Goals = PROMPT INJECTION** (reuses D19). Active `goals` rows are folded into
    `memory_context` in `chat.py`, so no provider signature change was needed.
- **D24 (Phase 5 â€” Navigation redesign)** **Custom lightweight drawer, no navigation library.**
  The app's navigation is a `useState` view-union in `App.tsx` (3.10); adding
  `@react-navigation/drawer` would have meant a rewrite + a new native dependency. Instead the
  drawer is an `Animated` sliding panel **inside `ChatsListScreen`**, which now serves as the
  home. Crucially, the chat list's rename/pin/remove logic and both modals were **preserved
  character-for-character** and simply re-rendered inside the drawer â€” that's why nothing broke.
  Opens on hamburger tap only (no edge-swipe: avoids gesture conflicts). The back button is
  handled **inside ChatsListScreen** because App.tsx can't see the drawer's state.

---

# SECTION 5 â€” SECRETS / CONFIG (values live in .env + host dashboards, NEVER committed)

## backend/.env (same keys also set in Render -> Environment)

```
SUPABASE_URL=https://mlqbnmloighdifavttwx.supabase.co    # base URL, NO /rest/v1/
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...     # REQUIRED on Render for DELETE /account
SUPABASE_JWT_SECRET=...
DATABASE_URL=postgresql+asyncpg://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres
GROQ_API_KEY=gsk_...              # ACTIVE
ENVIRONMENT=production            # production on Render, development locally
CRON_SECRET=...                   # Phase 4 â€” must MATCH the cron-job.org header exactly
```

**DATABASE_URL rules:** scheme MUST be `postgresql+asyncpg://` (plain `postgresql://` makes
SQLAlchemy try psycopg2 and crash). Any `@` **inside the password** must be URL-encoded as `%40`;
the `@` before the host stays literal. Use the **Session pooler** URI from Supabase -> Connect.

**SECURITY - Supabase DB password: DONE, do not re-raise.** It was exposed in a chat
transcript around Session 17 and **the owner rotated it** (confirmed Oct 17, 2026).
Sessions 18-23 each carried it forward as an open RED item because nobody ever closed it
here, so every session re-flagged work that was already done and spent the owner's time
on it again.

Verified this session: `backend/.env` is gitignored and was never committed, and the live
password appears in no tracked file (`git grep` for the actual string returns nothing).

**If you are a future session: this item is CLOSED.** Do not put it on an outstanding list
again. The RED entries in Sections 12, 15 and 18 are historical records of what was true
when those sessions were written - they are not live tasks.

**SECURITY - `CRON_SECRET`: DONE, verified live Oct 17, 2026.**
The owner rotated this too. Confirmed empirically rather than taken on trust:

```
# wrong secret  -> HTTP 403   (endpoint is guarded, zero side effects)
# real secret   -> HTTP 200 {"sent":0}   (local .env matches Render)
curl -X POST https://saphin-ai-backend.onrender.com/internal/run-checkins \
     -H "X-Cron-Secret: $SECRET"
```

`/health` also returned `{"status":"ok"}`, which only happens when `DATABASE_URL`
connects - independent confirmation that the rotated DB password is correct in Render.

**The one thing that CANNOT be verified from a session:** cron-job.org holds the same
secret in a third place and needs the owner's login. Render matching local does not prove
cron-job.org matches. The signal is behavioural - **if the daily check-in notification
still arrives, cron-job.org matches.** If check-ins ever stop silently with no other
symptom, a secret mismatch there is the first thing to check.

**Calling run-checkins by hand is safe.** The secret is checked before anything else, so a
wrong one is side-effect free; and a correct one only sends to profiles whose local
check-in window is currently open and whose `last_checkin_date` is not today. cron-job.org
already makes this exact call 96 times a day.

**DEPLOYMENT MARKER (Session 24).** `run-checkins` now returns `{"sent": N, "pruned": M}`.
The old version returned `{"sent": N}` only. Hitting the endpoint therefore tells you
which build is live on Render without reading any logs.

**DATABASE_URL rules still apply when editing it:** scheme MUST be `postgresql+asyncpg://`,
and any `@` inside the password must be URL-encoded as `%40`. Use the **Session pooler**
URI from Supabase -> Connect.

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
- "Requires HTTP authentication" must be **OFF** (that's a different mechanism â€” not used)
- Verified: TEST RUN returned **200 OK** with `{"sent":0}`

## Expo / EAS / GitHub

Expo account `saphinpraja`, project `@saphinpraja/saphin-ai`,
projectId `e8d6e6eb-b1bf-4e21-af8b-885612a4b999`.
GitHub: `https://github.com/Saphin18/ai-companion` (private).

---

# SECTION 6 â€” HOW TO RUN

Three terminals. Always know which one you're in.

- **ROOT** = `C:\Users\saphi\Desktop\Ai-Companion` (git)
- **FRONTEND** = `...\frontend` (expo, eas, npx tsc)
- **BACKEND** = `...\backend` (uvicorn)

**Local backend (BACKEND):**

```powershell
cd C:\Users\saphi\Desktop\Ai-Companion\backend
.\venv\Scripts\Activate.ps1        # you'll see (venv) appear â€” REQUIRED or uvicorn isn't found
uvicorn app.main:app --reload
```

Health local: `http://127.0.0.1:8000/health` -> `{"status":"ok"}`
Health public: `https://saphin-ai-backend.onrender.com/health`
(You usually DON'T need the local backend â€” the app points at Render.)

**To test endpoints with curl you need TWO windows** â€” the server holds one window; run curl
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
`eas build` uploads **local files**, not GitHub â€” so a push isn't required to build, but do it
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

`.Replace()` **fails silently** if the text doesn't match exactly â€” always verify afterwards
with `Select-String`.

---

# SECTION 7 â€” DATABASE (all tables + all SQL ever run)

Convention: everything from Phase 2 onward stores `user_id` as **text**, has RLS **enabled with
no policies** (backend-only access â€” the backend filters by the verified JWT), and uses
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

# SECTION 8 â€” THEME SYSTEM (D20 + D21) â€” full detail

*(This was originally a separate `THEME_SYSTEM_KICKOFF.md`; it is fully merged here. That file
is obsolete â€” delete it.)*

## Original vision vs what shipped

Originally: multiple **anime-INSPIRED** themes (One Piece, Naruto, Demon Slayer, AoT, DBZ,
Spy x Family, Violet Evergarden, Your Lie in April) using ONLY original colors/art â€” no
copyrighted characters, logos, or official images.
**Owner then rejected the cartoon look.** Direction changed to **nature-photo wallpapers**.
"Grand Line" (One Piece palette + animated waves) stays registered as the one surviving
anime-inspired theme. The rest of the anime list is dropped.

**Copyright guidance (important if adding photos):** Pinterest / Google Images are NOT safe (the
specific photo is copyrighted even if the subject isn't). Use **Unsplash / Pexels / Pixabay**
(free for commercial use, no attribution) or the owner's own photos. Prefer darker/calmer images;
add a soft dark overlay for legibility; avoid recognizable faces, logos, and protected landmarks.

## Token contract â€” `frontend/src/theme/types.ts`

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

- **Stage 0 â€” Engine:** `types.ts`, `registry.ts`, `ThemeContext.tsx`, `themes/default/` (original
  colors migrated losslessly). Backend `theme_id` column + `updateThemeId()` in api.ts. App looked
  identical; engine live.
- **Stage 1 â€” Components + picker + 300ms cross-fade** on theme change.
- **Stage 2 â€” "Grand Line"** (One Piece palette, ocean-navy + straw-hat-red + gold, light+dark).
- **Stage 3 â€” Animated waves** using RN's built-in `Animated` (no extra package, runs in Expo Go).
- **D21 â€” Nature photos:** `themes/nature/index.ts` holds one `nature(...)` line per photo
  (id, name, emoji, description, `require(img)`, position, overlay). `Background.tsx` =
  photo + whole-screen dim + top/bottom `LinearGradient` for legibility, `pointerEvents="none"`.

## Tuning cheatsheet (`themes/nature/index.ts`)

- `"center"/"top"/"bottom"` = which part of the photo shows (uses `expo-image`'s
  `contentPosition`; RN's built-in `<Image>` can't do this â€” that's why `expo-image` was added).
- Raise overlay alpha (`0.15` -> `0.30`) = darker, more readable text; lower = brighter photo.
- Add a photo = drop the file in `assets/wallpapers/` + one `nature(...)` line.
- Remove one = delete its line. **If you delete a `.jpg` you MUST delete its `require` line** or
  the bundler crashes.

## Open polish (optional)

Owner's verdict: **img2, img3, img4 + Grand Line are the keepers**; img1 (pale stone) and img5
(swans) are weak. Owner chose NOT to trim â€” all 5 still ship. Also: some source photos are
multi-MB; resize to ~1080-1440px / ~300-600 KB if load ever feels slow on cheap phones.

Notes for future theme work: custom fonts = `expo-font` (adds app size). Heavy animation =
`react-native-reanimated` / Lottie (can lag cheap phones; keep optional/per-theme) â€” NOT used yet.
Any native module means: keep `newArchEnabled:false`, commit, rebuild, re-test on the REAL APK.

---

# SECTION 9 â€” PHASE 3 DETAIL (D22)

**Owner decisions locked:**

- Personality = **"both"**: the user picks a style AND detected mood nudges the tone on top.
- Styles = all four: Balanced, Motivator, Humor, Calm.
- Journal = full "diary that responds": user writes, companion writes ONE short caring reflection.
- **Dropped:** the weekly mood-summary / recap report.
- Creator identity: names **Saphin Praja** + `https://saphinpraja.vercel.app/`, only when asked.

**Stage 3A â€” tone detection.** After building memory/personality context and BEFORE generating the
reply, `chat.py` calls `detect_mood(message)` â€” a best-effort Groq classifier returning
`{mood, intensity 1-5, note}` or `None`. The tone is injected ("adapt your warmth... never state
you detected their mood"). After the reply commits, the reading is logged to `mood_logs` in its
own try/except. Adds ONE small Groq call per message (slightly slower, fail-safe).
Tappable links: `ChatBubble.tsx` splits text on a URL regex and renders `http(s)://` matches via
`Linking.openURL`, trimming trailing punctuation.

**Stage 3B â€” personality modes.** `chat.py` holds `PERSONALITY_PROMPTS` for
`motivator`/`humor`/`calm` (`balanced` = no block), injected **before** the tone nudge.
Profile has a pill row that saves instantly and rolls back on error.

**Stage 3C â€” responding journal.** `POST /journal` -> `journal_reflector.generate_reflection()`
(best-effort, gentle default) -> save -> return. `GET /journal` lists newest-first.

**Prompt-assembly order in `groq_provider.py` (current, including Phase 4):**
`base persona + creator block -> memory (+ GOALS folded in) -> personality -> tone`

**Testing done:** emotional message -> gentler reply; upbeat message -> matched energy;
"who made you?" -> Saphin Praja + tappable portfolio link, unrelated messages don't mention it;
personality pills change the voice; journal entry saves, reflection appears, entries persist.

---

# SECTION 10 â€” PHASE 4 & PHASE 5 DETAIL

## 10.1 Phase 4 â€” Proactivity (D23)

### Owner decisions

- Wanted **AI-written** notifications ("not the same notification all the time") -> remote push
  for the check-in, not a canned local message.
- Build **all three** features (check-in, reminders, goals) in one go so they share one rebuild.
- Check-in message style: one warm line, freshly generated.

### How the check-in actually works

1. cron-job.org POSTs `/internal/run-checkins` every 15 min with the `X-Cron-Secret` header.
   *This call also wakes the sleeping Render free instance* â€” that's why no paid tier is needed.
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

## 10.2 Phase 5 â€” Navigation redesign (D24)

### What the owner asked for (after showing Claude + ChatGPT as references)

- Home like Claude/ChatGPT: mostly empty, hamburger top-left, avatar top-right, a greeting, and a
  **real** chat input at the bottom ("Option B" â€” type on home, it opens the chat and auto-sends).
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

**Back button while the drawer was open exited the app** instead of closing the drawer â€” because
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

# SECTION 11 â€” MISTAKES WE HIT & FIXES (the full list)

## Early / setup

1. **Two `Ai-Companion` folders** (Users vs Desktop) â€” files split across both. Fixed with
   robocopy /MOVE into one Desktop folder; deleted the empty leftover.
2. **Python 3.14 too new** â€” `pydantic-core` had no prebuilt wheel and tried to compile Rust.
   Fixed by loosening pins (`>=` not `==`) so pip grabbed compatible versions.
3. **bash quote-escaping in PowerShell** â€” `'"'"'` got written literally into `chat.py`, causing
   SyntaxErrors. Write plain content.
4. **`del App.js` then files went to the wrong folder** â€” same root cause as #1.
5. **Downloaded files piled up in Downloads** â€” confusing. Switched fully to terminal file creation.
6. **JWT 401 `InvalidAlgorithmError`** â€” Supabase uses ES256; our code forced HS256. Fixed via JWKS.
7. **JWKS fetch 401/404** â€” (a) an `apikey` header broke it; (b) `SUPABASE_URL` had a trailing
   `/rest/v1/`. Fixed: remove `/rest/v1/` from BOTH .env files, fetch with a browser User-Agent.
8. **Anthropic 401 invalid x-api-key** â€” no billing. Switched provider.
9. **Gemini 429 limit:0** â€” free tier is zero-quota in this region, even with a new project.
10. **Groq worked** -> 200 OK. Lesson: the abstraction layer made each swap a one-file change.
11. **Git nested repo** â€” Expo created `frontend/.git`, treated as a submodule. Fixed:
    `git rm -r --cached frontend -f` + delete `frontend/.git`, re-add. Verified `.env` was never
    staged before committing.

## Phase 1

12. **`ModuleNotFoundError: psycopg2`** â€” `DATABASE_URL` started with `postgresql://`. Use
    `postgresql+asyncpg://`.
13. **`AttributeError: get_provider`** â€” the factory is `get_ai_provider()`.
14. **Every message became its own chat** â€” old rows predate session tracking. New conversations
    group correctly; old junk rows can be hidden via "Remove from list".
15. **401 on `/sessions` right after login** â€” token not ready; `authHeaders()` now refreshes the
    session if the access token is missing before the request.
16. **Type errors** â€” `ChatMessage` uses `role: 'user' | 'companion'` and requires `createdAt`;
    frontend maps server `assistant` -> `companion`.
17. **Android keyboard covering inputs** â€” early fix (`behavior="height"` + pan) superseded by #26.

## Deployment

18. **Render build OK but crash at startup** â€” `requirements.txt` missing `sqlalchemy`/`asyncpg`.
    Added `sqlalchemy[asyncio]>=2.0.0` and `asyncpg>=0.29.0`.
19. **Python 3.14 wheels missing on Render** â€” added `backend/.python-version` = `3.12.7`.
20. **`git add backend/Procfile` "did not match"** â€” ran `git add` inside `backend/`, doubling the
    path. Add relative to CWD, or from the repo root.
21. **Duplicate env-var typo** â€” `EXPO_PUBLIC_API_URL=EXPO_PUBLIC_API_URL=https://...`.
22. **Display name never saved** â€” no session at signup (email confirmation ON), so the profile
    write was lost. Fix: pass `options.data.full_name` in `signUp` (auth metadata), then copy into
    the profile on first `SIGNED_IN`.
23. **500 on PATCH /sessions/{id} (`MissingGreenlet`)** â€” DB-generated `updated_at` was stale on
    the ORM object; sync serialization attempted async IO. Fix: `await db.refresh(session)` before
    building `SessionOut`. **Always read the Render log.**
24. **Custom SMTP: 0 logs in Brevo, signup 500** â€” wrong SMTP password. Generate a fresh Brevo
    **SMTP key** (not the account password), login `...@smtp-brevo.com`, port 587 (fallback 2525).
25. **"localhost can't be reached" after email confirm** â€” Supabase Site URL pointed at localhost.

## Keyboard / UI

26. **THE KEYBOARD BUG (the big one â€” took many tries).** Symptoms: input flung to the top with a
    big gap; header disappeared; keyboard covered input. **Root cause:** `newArchEnabled: true`
    (added later by `eas build:configure`) changed Android keyboard/`KeyboardAvoidingView`
    behavior, AND we were **double-lifting** (KeyboardAvoidingView + OS resize/pan at once).
    **THE FIX â€” keep ALL of these:**
    - `app.json` -> `"newArchEnabled": false`
    - `app.json` -> `android.edgeToEdgeEnabled: false`
    - `app.json` -> `android.softwareKeyboardLayoutMode: "resize"`
    - `ChatScreen.tsx` -> **NO KeyboardAvoidingView on Android** (plain `<View>`, input anchored
      at the bottom, let the OS `resize` lift it). iOS keeps
      `KeyboardAvoidingView behavior="padding"`.
    - **Rule: never stack two keyboard lifters â€” one only.**
    - Any app.json change needs a FULL restart (SECTION 6).
27. **Gallery crop unreliable / "CROP" not "Done".** `expo-image-picker` `allowsEditing` crops fine
    from the **camera**, but Samsung's **gallery** editor sometimes skips crop or auto-saves, and
    its screen is the phone's own UI (which we CANNOT restyle or rename). A custom crop screen
    needs a native crop package + dev build (risky). Decision: accept it; the avatar auto-fits the
    circle with `resizeMode="cover"`.
28. **`git commit` said "nothing to commit"** â€” already committed earlier. Check `git status` +
    `git log --oneline -3` before panic-recommitting.
29. **New backend route 404s right after `git push`** â€” (a) Render's free redeploy takes ~3-5 min
    (plus queue), so the OLD code is briefly live; (b) the **browser caches the 404**. Diagnosis
    that works every time: open `/openapi.json` and Ctrl+F the route name. Listed -> it IS live,
    hard-refresh (Ctrl+F5 / incognito). Not listed -> the deploy hasn't finished (check Render ->
    Events) or didn't trigger (Manual Deploy). **Don't re-edit correct code while waiting.**
30. **Password-reset link "invalid/expired" with a valid token** â€” the URL wasn't on Supabase's
    **Redirect URLs** allow-list. Site URL and Redirect URLs are SEPARATE boxes with separate jobs
    (Site URL = default confirm landing; Redirect URLs = allow-list for links).
31. **Expo Go can't test native features.** Biometrics, true keyboard `resize` behavior, fonts,
    animation, and (Phase 4) notifications are **APK-only truth**. A cloud EAS build and a local
    `npx expo start` can run at the same time without interfering.
32. **AuthScreen doubling/ghosting (2x overlapped screen)** â€” same #26 double-lift bug, missed on
    Auth after ChatScreen was fixed. Same fix.
33. **"Can't scroll to reach a field/button"** â€” a statically-centered screen has nothing to
    scroll, so when the keyboard covers the bottom, fields are unreachable. Fix: wrap the body in a
    `ScrollView` (`flexGrow:1`, `justifyContent:'center'`, `keyboardShouldPersistTaps:'handled'`),
    header fixed outside it. Applied to AuthScreen; **the owner found and fixed the identical issue
    on ProfileScreen themselves â€” keep the owner's Profile version.**
    **Do NOT wrap a FlatList screen (ChatScreen) this way** â€” a FlatList is already a scroller and
    nesting them is invalid in React Native.

## Theme system

34. **`SyntaxError: biometrics.ts:53:38`** (owner-fixed) â€” the `getStoredCredentials()` return-type
    annotation. If it recurs, look there.
35. **"Can't scroll" after adding the Theme card** (owner-fixed) â€” same family as #33.
36. **`-c` prints "Bundler cache is empty, rebuilding"** â€” NOT an error; that's the point of `-c`.
    Metro rebuilds from scratch (~30-60s, no QR for a moment). Only worry after a couple minutes.
37. **Two `ThemeContext.tsx` files â€” DON'T delete the old one.** The engine moved to
    `src/theme/ThemeContext.tsx`; the old `src/context/ThemeContext.tsx` must stay as a 1-line shim
    (`export * from "../theme/ThemeContext";`) because every screen still imports the old path.
38. **Animated background only showed on Profile** â€” screens painting a solid `backgroundColor`
    cover the app-wide `Background`. Fix: set that screen's root to `backgroundColor:"transparent"`.

## Phase 3

39. **Wrong filename in an instruction** â€” `ChatListScreen` vs the real `ChatsListScreen`
    (note the **s**) made Notepad create an empty 0 KB file. Delete it and use the correct name.
40. **"Something went wrong" on first Expo launch after many edits** â€” stale Metro cache. Fix:
    `npx expo start -c` **from the `frontend` folder** (package.json lives there, not root).
    No code was actually broken.

## Phase 4 / 5 (most recent session)

41. **Guessed API names that didn't exist.** Wrote `settings.GROQ_API_KEY` (it's lowercase) and
    `Profile.user_id` (it's `Profile.id`), and imported `getBiometricSetting` /
    `setBiometricEnabled` from biometrics (they don't exist). **Cause: writing code against a
    remembered API instead of the real file.** -> This is why SECTION 3 exists. Read the file first.
42. **`Add-Content` glued `CRON_SECRET` onto the end of `DATABASE_URL`** because `.env` had no
    trailing newline â€” so the app read one giant DATABASE_URL and `CRON_SECRET` was never set
    (the endpoint returned 403 even with the right secret). Fix: rewrite the file with a proper
    line break. **Always verify a .env edit with `Get-Content .env | Select-String KEY`.**
43. **Stale env after editing `.env`** â€” `--reload` doesn't always pick up new env vars. Do a
    **full** Ctrl+C restart of uvicorn.
44. **UTF-8 / emoji corruption.** Files ended up with `Ã¢â‚¬Â¹ Back` and mangled emoji instead of `â€¹`
    and ðŸ™‚. Three rules that fix it permanently:
    - Always write files with `-Encoding utf8`.
    - **Never paste raw emoji into a PowerShell command** â€” the console mangles them and the
      command itself throws a parse error. Build them from code points instead:
      `[char]::ConvertFromUtf32(0x1F642)` for ðŸ™‚, `[char]0x2039` for `â€¹`.
    - Detect corruption with: `Select-String -Pattern "Ã¢â‚¬|Ã°Å¸|ÃƒÂ©|Ã‚ "`.
45. **Replacing curly quotes with plain `"` broke a string** â€” the replacement quote closed the
    surrounding double-quoted JS string. Use single quotes inside a double-quoted string.
46. **`uvicorn: command not recognized`** â€” the venv wasn't activated in that window. Run
    `.\venv\Scripts\Activate.ps1` first; look for `(venv)` in the prompt.
47. **curl "Could not connect"** â€” curl was run in the same window as the server (or after Ctrl+C
    stopped it). Server in window 1, curl in window 2.
48. **`expo doctor` failed the build** with: missing peer dependency `expo-font` (required by
    `@expo/vector-icons`), duplicate `expo-font` versions, and an `expo` patch mismatch.
    Fix: `npx expo install expo-font expo` -> `npm dedupe` -> `npx expo-doctor` (18/18 passed).
    **Lesson: run `npx expo-doctor` BEFORE `eas build`, not after waiting in the queue.**
49. **Expo Go shows a red `expo-notifications` error** â€” "Android Push notifications ... removed
    from Expo Go with SDK 53." **This is expected and unfixable in Expo Go.** It disappears in the
    real APK. Related: the check-in toggle **can't stay ON in Expo Go** because the token call
    crashes there â€” also expected, not a bug.
50. **Expo Go warns "New Architecture is always enabled in Expo Go, but disabled in your config â€”
    remove newArchEnabled: false."** **Ignore this. Do NOT remove it** (rule 0.4 #10).

---

# SECTION 12 â€” WHAT'S LEFT (all optional)

Nothing is blocking. Everything below is polish or a new feature area.

**Immediate:**

- Install and smoke-test the new APK (see 0.1).
- ~~Rotate the exposed Supabase DB password + `CRON_SECRET`~~ **DONE by the owner;**
  **verified live Oct 17, 2026. See SECTION 5. Do not re-raise this.**

**Optional polish:**

- Trim the wallpaper picker to img2/img3/img4 + Grand Line; resize multi-MB photos.
- Reminder **editing** (currently create/delete only) and recurrence beyond "daily".
- Quiet hours for the check-in; per-reminder timezone handling after travel.
- Add edge-swipe to open the drawer (deliberately omitted to avoid gesture conflicts).
- Rich push (images/actions).

**Optional features:**

- **Google Sign-In**, then **Apple Sign-In** (Apple is required by the App Store once another
  social login exists).
- Custom avatar crop screen (needs a native crop package + dev build â€” risky, see #27).
- **Publish to Google Play** ($25 one-time) to remove the "unknown source" sideload warning.
- Original "Phase 5 â€” Advanced": **voice conversations**, premium features, deeper personalization.
- Goal progress %/streaks â€” **deliberately NOT built** (rule 0.4 #9, non-manipulative).

---

# SECTION 13 â€” SHIPPING THE APK TO FRIENDS

**Cost reality:** Render free $0, EAS Build free tier $0, Supabase/Groq/Brevo free $0, sharing an
APK directly $0. Only paid if publishing: Google Play $25 one-time, Apple $99/year. (iOS on a real
iPhone needs the $99 Apple Developer account + TestFlight/UDID; Android is free forever.)

**Process:** build -> EAS returns a download link -> open the link on the phone (or send the .apk)
-> Android warns "unknown source" -> Install anyway -> they see the **Saphin AI** icon and name.
Friends sign up in-app (confirm password + email confirmation via Brevo), click the email link,
then log in. **Mention the ~50s cold start** on the first request after the server has been idle.

**One-time EAS setup already done:** `npm i -g eas-cli`, `eas login`, `eas build:configure`
(linked `@saphinpraja/saphin-ai`, wrote projectId into app.json), `eas.json` set to APK + env.
The keystore was auto-generated in the cloud. (Ignore any `adb ENOENT` error at the end â€” that's
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

# SECTION 14 â€” DOC MAINTENANCE RULE

Update on every major milestone: PRD, SRS, ROADMAP, ARCHITECTURE (decision records),
DATABASE, API, DEPLOYMENT, LEARNING â€” **and this handover**.

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

# SECTION 15 â€” PHASE 4 FULLY VERIFIED + FCM PUSH SETUP (added 19 July 2026)

> **This section was APPENDED after the rest of the document. Nothing above was changed.**
> Where it contradicts an earlier section, **this section wins** â€” it is newer.
>
> **Headline: Phase 4 is now 100% verified working end-to-end on the real APK.** An AI-written
> daily check-in notification was received on the phone at the exact set time, showing the
> **purple Saphin AI icon** (not Expo Go's blue one). Screenshot-confirmed 19 July 2026, 7:47 pm.

## 15.0 What this section covers

After the Phase 4/5 APK shipped, three separate bugs were found and fixed â€” stacked on top of
each other, which is why it took a long debugging chain. All three are now resolved:

1. **The check-in toggle wouldn't stay ON** â†’ Pydantic schema gap (15.1)
2. **Push never reached the real APK** â†’ missing Firebase/FCM credentials (15.2)
3. **Check-ins never fired on schedule** â†’ the cron job had auto-disabled itself (15.3)

## 15.1 BUG 1 â€” Check-in toggle silently not saving (FIXED, backend-only)

**Symptom:** toggle Daily check-in ON in Profile, leave the screen, come back â†’ it's OFF again.
Happened in the APK *and* Expo Go. No error message; the request returned 200 OK.

**Root cause:** Phase 4 added `checkin_enabled`, `checkin_hour`, `checkin_minute`,
`checkin_tz_offset_minutes`, `last_checkin_date` to the **ORM** (`db/models.py`) but NOT to the
**Pydantic schemas** in `backend/app/models/profile.py`. Pydantic **silently drops unknown
fields**, so `payload.model_dump(exclude_unset=True)` returned `{}` â†’ nothing was written â†’ and
`ProfileOut` didn't return the fields either, so the app read `undefined` â†’ `?? false` â†’ OFF.

**This is the single most important lesson of the session:** an ORM column is not enough. If a
field must travel over the API, it must ALSO exist in the Pydantic In/Out schema.

**Fix â€” `backend/app/models/profile.py` now reads:**

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
    # Phase 4 â€” daily check-in settings
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
    # Phase 4 â€” daily check-in settings
    checkin_enabled: bool | None = None
    checkin_hour: int | None = None
    checkin_minute: int | None = None
    checkin_tz_offset_minutes: int | None = None
```

Note `last_checkin_date` is deliberately **absent from `ProfileUpdate`** â€” only the server writes
it. Backend-only change; pushed to Render, no APK rebuild needed.

## 15.2 BUG 2 â€” Remote push never reached the standalone APK (FIXED via Firebase/FCM)

**Symptom:** `POST /internal/run-checkins` returned `{"sent":1}` and a notification DID arrive â€”
but with the **blue Expo Go icon**, never the app's own. `push_tokens` had only ONE row, whose
timestamp matched an Expo Go session.

**Root cause:** on Android, a **standalone app must have its own FCM (Firebase Cloud Messaging)
credentials** to receive remote push. Expo Go ships with Expo's own credentials, which is why it
worked there. The APK had none, so `getExpoPushToken()` threw inside the app,
`notifications.ts` caught it silently (by design), and no token was ever saved.

âš ï¸ **Do not confuse this with the keystore.** The "Prepare credentials" step in the EAS build log
is the *signing keystore* â€” a completely different thing. `eas credentials` showed:
`Push Notifications (FCM V1): None assigned yet`.

### The full setup that fixed it (do this once per project; future builds inherit it)

**A. Firebase project**

1. https://console.firebase.google.com â†’ **Create a project** â†’ name `Saphin AI`
   (Google Analytics can be off; if the wizard insists, picking an existing account is harmless).
2. On the project page â†’ **+ Add app** â†’ **Android**.
3. **Android package name must match `app.json` exactly: `com.saphin.ai`.** Leave SHA-1 blank.
4. **Register app** â†’ **Download `google-services.json`**.
5. Click Next/Next/Continue to console â€” **ignore every Gradle/Android-Studio instruction**,
   Expo handles that.

**B. Service account key (the secret Expo needs in order to SEND)**
6. Firebase â†’ **gear icon âš™ï¸ â†’ Project settings â†’ Service accounts** tab.
7. **Generate new private key** â†’ Generate key â†’ a JSON file downloads
   (e.g. `saphin-ai-firebase-adminsdk-fbsvc-xxxxxxx.json`).
   *(The Google Cloud "IAM â†’ Service accounts" page is NOT needed â€” it's a side page.)*

**C. Put the files in place (FRONTEND)**

```powershell
cd C:\Users\saphi\Desktop\Ai-Companion\frontend
Move-Item "$env:USERPROFILE\Downloads\google-services.json" -Destination "google-services.json" -Force
Move-Item "$env:USERPROFILE\Downloads\saphin-ai-firebase-adminsdk-*.json" -Destination "fcm-service-account.json" -Force
Add-Content -Path "..\.gitignore" -Value "`r`n# Firebase FCM service account (SECRET)`r`nfrontend/fcm-service-account.json`r`n"
```

**D. Point app.json at the config file** â€” inside the `android` block:

```json
"package": "com.saphin.ai",
"googleServicesFile": "./google-services.json"
```

**E. Verify the secret is NOT staged (ROOT) â€” never skip this**

```powershell
git status --short      # fcm-service-account.json must NOT appear
```

**F. Upload the key to Expo (FRONTEND)**

```powershell
eas credentials
```

â†’ **Android** â†’ **preview** (that's the profile the APK is built with; `production` is unused)
â†’ **Google Service Account**
â†’ **Manage your Google Service Account Key for Push Notifications (FCM V1)**
â†’ **Set up a Google Service Account Key for Push Notifications (FCM V1)**
â†’ it auto-detects `fcm-service-account.json` â†’ **yes**

Success looks like:

```
âœ” Uploaded Google Service Account Key.
âœ” Google Service Account Key assigned to com.saphin.ai for FCM V1
```

and the summary flips from `None assigned yet` to showing Project ID `saphin-ai`.

**G. Rebuild** â€” FCM only takes effect in a NEW build:

```powershell
npx tsc --noEmit ; npx expo-doctor
cd C:\Users\saphi\Desktop\Ai-Companion
git add -A ; git commit -m "Add Firebase FCM config for push notifications" ; git push origin main
cd frontend ; eas build -p android --profile preview
```

Then **download and install the new APK** â€” the old installed app never updates itself.

### File / secret rules that came out of this

- `frontend/google-services.json` â†’ **committed to git. Safe.** It only identifies the app.
- `frontend/fcm-service-account.json` â†’ **SECRET, gitignored, never commit, never paste in chat.**
- Both live in the `frontend` folder.
- Firebase project: **`saphin-ai`**, Android package **`com.saphin.ai`**, Spark (free) plan,
  service account `firebase-adminsdk-fbsvc@saphin-ai.iam.gserviceaccount.com`.

## 15.3 BUG 3 â€” The cron job had auto-disabled itself (FIXED)

**Symptom:** after everything above was correct, check-ins still never fired on time. Manual curl
worked; the schedule did nothing.

**Root cause:** the cron-job.org dashboard read **`0 enabled cronjobs / 1 disabled / 1 failed`**,
with the failure reason **"Failed (output too large)"** and *"Next Runs: No upcoming executions."*

Two things combined:

- **"Save responses in job history" was ON.** cron-job.org stores each response and enforces a
  size limit; exceeding it is counted as a **failure**.
- The **"disable the cronjob because of too many failures"** notification/safety toggle was ON,
  so after repeated "failures" cron-job.org **switched the job off entirely**.

**Fix (cron-job.org â†’ Cronjobs â†’ Saphin check-ins â†’ Edit):**

- **Enable job: ON**
- **Save responses in job history: OFF**  â† this is what caused the failures
- Schedule: **Every 1 minute** (`* * * * *`)
- **SAVE**, then confirm the Dashboard shows **1 enabled cronjob** and Next Runs lists times
  one minute apart.

âš ï¸ **Diagnostic rule for the future: if scheduled check-ins stop, check the cron-job.org DASHBOARD
FIRST.** A disabled job is invisible from the app and the database â€” everything else looks
perfectly healthy.

## 15.4 Timing change â€” check-ins are now minute-accurate

Owner asked for exact-time delivery. Two coordinated changes:

1. **cron-job.org schedule: every 15 minutes â†’ every 1 minute** (`* * * * *`).
2. **`backend/app/api/internal.py`: the fire window narrowed from 15 minutes to 2.**
   ```python
   if not (0 <= (now_min - target) % 1440 <= 2):
       continue
   ```

**Consequences to remember:**

- A check-in now lands within ~1 minute of the chosen time.
- The Render free instance is now pinged 1,440Ã—/day, so it effectively **stays awake** â€” a bonus
  side effect is no more ~50-second cold starts anywhere in the app. Render's free 750 h/month
  covers one always-on service (a month is ~730 h), so this fits â€” **but do not add a second
  always-on free service.**
- âš ï¸ **A manual curl test now only works within 2 minutes of the set time.** Outside that window
  it correctly returns `{"sent":0}`. This is not a bug â€” it confused us for a while.

## 15.5 How `last_checkin_date` behaves (owner asked â€” no manual work needed)

- It's the "already sent today" guard. After sending, the server writes today's local date so the
  user can never get two check-ins in one day.
- **It clears itself naturally** â€” tomorrow's date won't match, so the check is free again.
- **The user never needs to touch Supabase.** Clearing it by hand was ONLY a testing shortcut to
  re-fire on the same evening.
- Real-world behaviour when the time is changed: if today's check-in hasn't fired yet, the new
  time applies today; if it already fired, the new time applies **tomorrow**. That's correct,
  non-spammy behaviour â€” don't "fix" it.

## 15.6 The correct way to test a check-in end-to-end

1. cron-job.org dashboard â†’ confirm **1 enabled cronjob** with upcoming runs.
2. In the app: Profile â†’ Daily check-in **ON** â†’ **Allow** the OS permission prompt â†’
   set the time **~3 minutes in the future** â†’ go Back (it saves).
3. Supabase â†’ `profiles` â†’ confirm `checkin_enabled = TRUE`, the hour/minute match, and
   `checkin_tz_offset_minutes = -345` (Nepal). Clear `last_checkin_date` to **NULL** *(testing only)*.
4. Supabase â†’ `push_tokens` â†’ confirm a row exists whose `updated_at` matches **today** (the APK's
   token, not an old Expo Go one).
5. Put the phone down and wait â€” the 1-minute cron fires it. No curl needed.
6. **The pass/fail tell: the notification icon.** **Purple Saphin AI = the real app (SUCCESS).**
   Blue Expo Go = it only reached Expo Go.

Manual trigger (only inside the 2-minute window):

```powershell
curl.exe -X POST https://saphin-ai-backend.onrender.com/internal/run-checkins -H "X-Cron-Secret: <CRON_SECRET>"
```

`{"sent":1}` = sent Â· `{"sent":0}` = declined (disabled / already sent today / outside window).

## 15.7 Housekeeping: duplicate notifications

Both the old **Expo Go** token and the new **APK** token were registered for the same user, so a
check-in arrived **twice** (once purple, once blue). Harmless but untidy.

**Fix:** Supabase â†’ `push_tokens` â†’ delete the **older Expo Go row** (identify it by the older
`updated_at`), keep the newest one. If Expo Go is used again for testing, a new Expo Go token will
reappear and can be deleted again. There is currently no automatic cleanup of stale tokens â€”
a possible future improvement is to delete a token when Expo returns `DeviceNotRegistered`.

## 15.8 Reminders â€” NOT a bug (investigated and confirmed)

The "Repeat every day" switch resetting to OFF after adding a reminder is **correct behaviour**.
It is part of the *compose form*, not a saved setting â€” the title box clears too. The reminder
itself saves correctly (verified: rows showing "Every day - 19:27" / "23:20"), and local
notifications fire **exactly on time** (verified: "Go to work" arrived at 7:27).

A change was briefly made to remove `setDaily(false)` from `add()` so the switch would persist â€”
then **reverted at the owner's request**. `RemindersScreen.tsx` is back to original behaviour
(one `setDaily(false)` inside `add()`). Don't re-apply it without asking.

## 15.9 AMENDMENTS to earlier sections (add-only; these supersede)

**To SECTION 2 (project structure)** â€” new files in `frontend/`:

```
frontend/google-services.json        # Firebase config, COMMITTED (safe)
frontend/fcm-service-account.json    # Firebase private key, GITIGNORED (SECRET)
```

**To SECTION 3 (exact code contracts)** â€” `ProfileOut` / `ProfileUpdate` now include the Phase 4
check-in fields exactly as listed in 15.1. Any code touching check-in settings must use them.

**To SECTION 5 (secrets/config)** â€” additions:

- Firebase project `saphin-ai`, Spark plan, Android package `com.saphin.ai`.
- `frontend/fcm-service-account.json` is a **secret** (gitignored).
- EAS `preview` profile now has **FCM V1 Google Service Account Key assigned**.
- cron-job.org job is **every 1 minute**, "Save responses in job history" must stay **OFF**.

**To SECTION 6 (how to run)** â€” add to the pre-build checklist: confirm
`git status --short` does not list `fcm-service-account.json`.

**To SECTION 0.1 (status)** â€” the five smoke-test items listed there are now **DONE and passing**:
no Expo Go error in the APK, the toggle persists, permission prompt works, a real AI-written push
arrives on time with the app's own icon, and local reminders fire exactly on time.

## 15.10 NEW MISTAKES (continuing SECTION 11's numbering)

51. **ORM column added but Pydantic schema not updated** â†’ the API silently accepted and discarded
    the fields, returning 200 OK the whole time (15.1). **Whenever a field must cross the API,
    add it to BOTH `db/models.py` AND the Pydantic In/Out schema.** Silent data loss with a
    success response is the nastiest failure mode in this project so far.
52. **cron-job.org silently disabled the job** after "output too large" failures caused by
    "Save responses in job history" (15.3). Everything else looked healthy, so this cost a lot of
    time. **Check the cron dashboard FIRST when scheduled work stops.**
53. **Confusing the EAS keystore with FCM credentials.** The build log's "Prepare credentials" is
    about *signing*, not *push*. Push status is only visible via `eas credentials` â†’
    `Push Notifications (FCM V1)`.
54. **Testing push in Expo Go and believing it proves the APK works.** Expo Go has its own push
    credentials; a token registered from Expo Go tells you nothing about the standalone app.
    **The notification icon is the ground truth** â€” purple = real app, blue = Expo Go.
55. **Manual curl returning `{"sent":0}` after the window was narrowed to 2 minutes** â€” looked like
    a failure, was actually correct behaviour (15.4).
56. **PowerShell mangles inline JSON in curl** (`bad range in position 24`) when using
    `-d "{\"to\":\"...\"}"`. Don't fight it â€” test push via the app or the backend endpoint instead.
57. **Pasting secrets into chat.** The Supabase DB password and `CRON_SECRET` both ended up in
    transcripts and now need rotating. When a terminal shows key material, describe it instead of
    pasting. (The owner correctly blacked out the FCM key in a screenshot â€” do that.)

## 15.11 WHAT'S NEXT (status confirmed 19 July 2026)

**Phases 1â€“5 are all COMPLETE and verified.** No new phase has been started.

SECTION 12's list still stands and is still all optional. Updated only where today changed things:

**Done since SECTION 12 was written:** install + smoke-test the APK âœ…, and remote push now works âœ….

**Still outstanding / recommended next:**

- ðŸ”´ **Rotate the exposed secrets** â€” Supabase DB password (update `DATABASE_URL` locally AND on
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

- **Password reset â€” exact frontend call.** The "Forgot password?" link on `AuthScreen` calls
  `supabase.auth.resetPasswordForEmail(email, { redirectTo: "https://saphin-ai-backend.onrender.com/reset-password" })`.
  The same call is reused inside `ProfileScreen`'s change-password dialog as an escape hatch.
  (The flow itself is D16 / SECTION 11 #30; this is just the precise function name.)
- **Fingerprint icon.** The biometric button on the login screen uses `@expo/vector-icons` â†’
  `Ionicons name="finger-print"` (ships with Expo; this is why `@expo/vector-icons` â€” and therefore
  its `expo-font` peer dependency, SECTION 11 #48 â€” is in the project at all).
- **Abandoned design note:** an earlier `LockScreen.tsx` **auto-lock-on-app-open** draft was
  written and then abandoned in favour of the login-screen fingerprint button as the single entry
  point (rule 0.4 #7). `LockScreen.tsx` still exists and is still rendered by `App.tsx` when a
  biometric lock is active, so don't delete the file â€” but don't expand it into a full auto-lock
  model without asking.

Everything else from all previous versions (setup history, Phase 1â€“3 build logs, theme staging,
deployment steps, every numbered mistake) is already present in SECTIONS 0â€“14 above.

---

---

# SECTION 16 â€” PHASE 6: ATTACHMENTS (voice, images, documents) â€” added 25 July 2026

> **This section was APPENDED after everything above. Nothing above was changed except the
> status note in 0.1.** Where this contradicts an earlier section, **this section wins** â€” it
> is the newest.
>
> **Headline: Phase 6 BACKEND is complete, tested against real files, and committed (not pushed).
> The Phase 6 FRONTEND is written, passes `tsc` and `expo-doctor` 18/18, and an APK build was
> started â€” but NOTHING has been tested on a real device yet. Expo Go can no longer run this app.**

## 16.0 What Phase 6 adds

Three features, one rebuild, all on the **existing Groq key**. No new provider, no billing,
no Gemini-in-Nepal problem.

| Feature                   | Model / method                      | Tested?                                        |
| ------------------------- | ----------------------------------- | ---------------------------------------------- |
| Voice message â†’ text     | `whisper-large-v3-turbo` (Groq)   | âœ… backend tested                              |
| Image â†’ text description | `qwen/qwen3.6-27b` (Groq, vision) | âœ… backend tested                              |
| PDF / DOCX â†’ text        | `pypdf` + `python-docx`, NO AI  | âœ… backend tested (resume extracted perfectly) |
| Companion reply â†’ speech | `expo-speech`, on-device          | â³ not tested on device                        |

**The voice UX chosen (D29 below): the HYBRID bubble** â€” a play button + waveform, with the
transcript shown underneath in smaller, dimmer text. Not voice-only, not text-only.

## 16.1 CRITICAL â€” Groq model findings (verified 25 July 2026 by live probe, not guessed)

The Groq account has **15 models**. Only ONE accepts images:

- **`qwen/qwen3.6-27b` â€” THE ONLY VISION MODEL.** Confirmed by sending a real 64Ã—64 red PNG and
  getting "This image is a solid red square." It is the model image-reading depends on.
- `llama-3.3-70b-versatile` (the main chat model) is **TEXT-ONLY**. It rejects image messages with
  `messages[0].content must be a string`.
- Same rejection from `groq/compound`, `openai/gpt-oss-120b`, `llama-3.1-8b-instant`.
- `meta-llama/llama-4-scout-17b-16e-instruct` â†’ **404, no access.** Gone from this account.
- `whisper-large-v3` and `whisper-large-v3-turbo` are both available (we use turbo).
- `canopylabs/orpheus-v1-english` is a **text-to-speech** model â€” unused, but a future option for
  giving the companion a real generated voice instead of the phone's built-in one.

**Qwen is a REASONING model.** It emits a `<think>...</think>` block before the real answer. Two
ways to handle it, both implemented in `vision_reader.py`: (1) preferred â€” pass
`reasoning_effort="none"` to suppress the thinking (faster, cheaper); (2) fallback â€” let it think,
then strip the block with regex. Both tested and working.

**How to test whether ANY model has vision (the probe trick, learned the hard way):**
Send an image and READ THE ERROR â€” don't just check pass/fail.

- `"messages[0].content must be a string"` = **NO vision** (rejects the multimodal format).
- `"Image must have at least 2 pixels in each dimension"` = **HAS vision** (it decoded the image
  and measured it). A 1Ã—1-pixel test image triggers this â€” the first probe used one and was
  mislabelled as failure, which nearly killed the whole feature. Use a real â‰¥64Ã—64 image.

## 16.2 Architecture â€” how attachments reach the AI (NO provider change)

**`groq_provider.py` and `base.py` were NOT touched.** Same trick as Phase 4D goals: everything
is folded into `memory_context` as text, so `generate_reply`'s signature never changed.

- **Voice**: the transcript BECOMES `chat_messages.content`. It is NOT injected as context â€” it
  *is* the message. This is why memory extraction, mood detection, and chat titles (D9, first 40
  chars) all keep working with zero changes.
- **Image**: Qwen's description is injected as a text block into `memory_context`.
- **Document**: the extracted text is injected as a text block into `memory_context`.

**Flow:** `POST /attachments` (store file â†’ read it to text â†’ save row, returns an id) â†’ then
`POST /chat` with `attachment_ids: [...]` â†’ the text is injected â†’ the attachment is linked to the
saved message so history can render the bubble later.

**The file is always stored BEFORE the AI reads it.** If Whisper or Qwen fails, `extracted_text`
is null but the original recording/image/document is never lost.

**Known v1 limit (by design):** attachment text is only given to the AI on the message it arrives
with. "Summarise this PDF" works; asking about it 3 messages later does NOT (the text isn't kept
in history â€” feeding 15k chars every turn would blow Groq's rate limit). Fix later: store a short
summary alongside the full text.

## 16.3 Files (Phase 6)

### Backend â€” NEW

```
backend/app/ai/transcriber.py           # Whisper. Best-effort, returns None on failure.
backend/app/ai/vision_reader.py         # Qwen vision + <think> stripping. Best-effort.
backend/app/ai/doc_reader.py            # pypdf / python-docx. NO AI. 5 MB / 15k char caps.
backend/app/api/attachments.py          # POST /attachments, GET /attachments/{id}/url
backend/app/models/attachment.py        # AttachmentOut (Pydantic)
backend/app/repositories/attachment_repository.py
backend/app/services/storage.py         # Supabase Storage via httpx + service-role key
                                        #   (first backend code to touch Storage; avatars
                                        #    upload from the phone instead â€” D14)
```

### Backend â€” MODIFIED

```
backend/app/api/chat.py                 # attachment fetch + injection + linking (see 16.2)
backend/app/models/chat.py              # ChatRequest +attachment_ids IN; MessageOut +attachments OUT
backend/app/db/models.py                # +Attachment ORM class (appended)
backend/app/main.py                     # registered the attachments router
backend/app/auth/dependencies.py        # clock-skew + JWKS hardening fix (see 16.7 bugs #58/#59)
backend/requirements.txt                # +pypdf, +python-docx, +python-multipart
```

### Frontend â€” NEW / MODIFIED

```
frontend/src/services/attachments.ts    # NEW. uploadAttachment(), sendChatWithAttachments(),
                                        #   refreshAttachmentUrl(). Kept separate so api.ts
                                        #   stays untouched. Retries once on 401.
frontend/src/types/chat.ts              # MODIFIED. +Attachment type, +attachments? on ChatMessage.
frontend/src/components/ChatBubble.tsx  # MODIFIED. Hybrid voice bubble + image thumb + doc chip.
frontend/src/components/ChatInput.tsx   # MODIFIED. Mic button, attach (+) menu, pending chips,
                                        #   hands-free long-press.
frontend/src/screens/ChatScreen.tsx     # MODIFIED. Hands-free turn mode + expo-speech playback.
frontend/app.json                       # MODIFIED. +RECORD_AUDIO, +expo-audio plugin (mic perm),
                                        #   +expo-asset plugin.
```

### Frontend packages added (Phase 6)

`expo-audio` (recording), `expo-document-picker`, `expo-speech`, and `expo-asset`
(peer dependency of expo-audio â€” MUST be installed, or the APK can crash even though Expo Go
looked fine). Installed with `npx expo install`, then `npm dedupe`, until `npx expo-doctor` = 18/18.
`expo-image-picker` was already present from the avatar work.

## 16.4 Database + Storage (Phase 6)

**Table `attachments`** â€” run in **Supabase â†’ SQL Editor (browser, NOT a terminal)**:

```sql
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  session_id uuid,
  message_id uuid,
  kind text not null,                 -- 'voice' | 'image' | 'document'
  storage_path text not null,
  mime_type text,
  original_name text,
  size_bytes int,
  duration_ms int,
  extracted_text text,                -- transcript / description / document text
  hidden_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists attachments_user_id_idx on public.attachments (user_id);
create index if not exists attachments_message_id_idx on public.attachments (message_id);
alter table public.attachments enable row level security;
```

Follows the Phase 2+ convention: `user_id` is **text** (wrap with `str(user_id)` in backend calls),
`session_id`/`message_id` are UUID, RLS enabled with no policies, `hidden_at` for soft delete
(rule 0.4 #1 â€” attachments are chat data, never hard-deleted).

**Storage bucket `attachments`** â€” created in Supabase â†’ Storage:

- **Public: OFF** â€” this is a PRIVATE bucket, unlike the public `avatars` bucket. A voice note or
  a PDF is not a profile picture.
- No policies needed. The backend uses the service-role key (which bypasses RLS) and is the only
  thing that touches it. It serves **1-hour signed URLs** to the app.
- Path convention: `attachments/<user_id>/<attachment_id>.<ext>`.

## 16.5 ORM contract for `Attachment` (add to SECTION 3.1's table)

| Model          | Table           | user id column             | Notes                                                                                                                 |
| -------------- | --------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Attachment` | `attachments` | `user_id` **text** | `kind` voice/image/document; nullable `session_id`, `message_id`; `extracted_text`; `hidden_at` soft delete |

## 16.6 PRODUCT DECISIONS locked in Phase 6 (do not silently reverse)

- **D29 â€” Hybrid voice bubble.** Waveform + play button, with the transcript underneath in
  smaller/dimmer text. NOT voice-only, NOT text-only. Reasons: the transcript is generated anyway
  (the chat model is text-only), hiding it would be dishonest when Whisper mishears, and a
  voice-only message that STARTS a chat would give it a blank title (D9 needs text).
- **D30 â€” No "review transcript before sending".** It kills the speed that makes voice worth
  using. The audio is kept, so nothing is truly lost if Whisper mishears. Revisit only if
  transcription proves bad in practice.
- **D31 â€” Hands-free TURN mode, NOT realtime voice.** Long-press the mic â†’ the companion speaks
  its reply aloud (expo-speech) and then reopens the mic, so a whole conversation needs no taps.
  It is turn-based (you can't interrupt mid-sentence). True realtime (ChatGPT voice-mode style)
  needs raw PCM streaming = bare native modules = a dev build, PLUS a paid realtime provider
  (Groq has none; Anthropic needs billing #8, Gemini is zero-quota in Nepal #9). **Deferred to a
  future Phase 7 with its own budget.**
- **D32 â€” Attachments follow chat data: SOFT DELETE only** (rule 0.4 #1). Voice notes stay
  playable in the bubble, WhatsApp-style.
- **D33 â€” Documents NEVER touch an AI on upload.** PDF/DOCX are parsed by pure Python
  (`doc_reader.py`); only images go to a model (Qwen). Say this plainly to users. The document's
  text only reaches the AI later, when the user actually attaches it to a chat message.

## 16.7 BUGS FOUND & FIXED in Phase 6 (continuing SECTION 11 numbering)

Two were PRE-EXISTING and unrelated to attachments â€” found only because Phase 6 exercised auth
harder than before.

58. **Clock skew logged users out at random â€” WAS ALREADY IN THE LIVE APP.**
    Symptom: apparently random `401 "Invalid or expired session"` that vanished on retry.
    Real cause: `jwt.decode` in `auth/dependencies.py` had **zero leeway**, and the Windows clock
    was ~2 seconds behind Supabase, so a freshly issued token looked like it came from the future
    (`ImmatureSignatureError: The token is not yet valid (iat)`).
    **Fix:** `leeway=timedelta(seconds=30)` in `jwt.decode`. Also run Windows "Sync now".
    **Lesson: intermittent 401s â†’ suspect clock skew before anything else.**
59. **Network failure reported as "invalid session".**
    `dependencies.py` caught `httpx.HTTPError` in the SAME `except` as JWT errors, so an
    unreachable JWKS key server told the user "log in again" â€” advice that cannot help. The JWKS
    cache is a module-level global, so it is **empty after every restart** (Render cold start,
    uvicorn --reload), making a fetch failure at the wrong moment log everyone out.
    **Fix:** the JWKS fetch now retries 3Ã—; on total failure it KEEPS the stale cache instead of
    clearing it (a slightly stale signing key beats a false logout); a bad token â†’ **401**, an
    unreachable key server â†’ **503 "try again in a moment"**. Honest labels (rule 0.4 #1 spirit).
60. **`Set-Content -Encoding utf8` writes a BOM.** Python imports handle it fine (this is why
    everything works), but reading such a file in a script with `encoding='utf-8'` raises
    `SyntaxError: invalid non-printable character U+FEFF`. **Use `encoding='utf-8-sig'` when
    reading these files back in a script.** (A verification command failed on this, not the file.)
61. **`Out-File` mangles non-ASCII characters** (turned `â€¹` and `â€¦` into `?`). Rewriting a file
    from such a dump would bake corruption into the app. **Always dump code with
    `Get-Content -Encoding utf8 | ... | Set-Content -Encoding utf8`, or `Add-Content -Encoding utf8`.**
62. **`pip.exe` blocked by Windows Application Control**
    (`Program 'pip.exe' failed to run: An Application Control policy has blocked this file`).
    **Fix: always use `python -m pip install ...`, never bare `pip`.** (Does not affect Render,
    which runs its own pip on Linux.)
63. **SQL pasted into PowerShell = a wall of red parser errors, does nothing.** SQL belongs in the
    Supabase browser SQL Editor ONLY. Nothing broke, but it wasted time. See 16.9 labelling rule.

## 16.8 Phase 6 traps (things that will bite the next session)

- **Do NOT set `Content-Type` on the upload `fetch`.** `fetch` must add the multipart boundary
  itself; overriding it silently breaks the upload. (`attachments.ts` deliberately omits it.)
- `uploadAttachment` **retries once on 401** â€” uploads are slow and a token can expire mid-flight.
  Losing a voice recording to an expired session is miserable, hence the retry.
- `attachments.user_id` is **text**; `chat_sessions`/`chat_messages` are **UUID**. Wrap with
  `str(user_id)` for attachment calls (mistake #38 / #41 territory).
- **Every new field must be in the Pydantic schema AND the ORM** (mistake #51). Phase 6 added
  `attachment_ids` (In) and `attachments` (Out) to `models/chat.py` in the same session.
- `python-multipart` is REQUIRED for file uploads â€” FastAPI won't accept files without it and the
  failure message is confusing.
- `expo-audio` needs `expo-asset` as a peer dep, plus `npm dedupe`, or **the APK may crash even
  though Expo Go looked fine** (`expo-doctor` catches this â€” run it BEFORE building, #48).
- **`app.json` lives in `frontend/`, not the repo root.** A stray copy at the root does nothing and
  hides the fact that the real one was never updated. After editing it, verify with:
  `Get-Content app.json | Select-String -Pattern "RECORD_AUDIO|microphonePermission"`.

## 16.9 NEW WORKFLOW RULE (add to SECTION 0.3)

**Label EVERY command block with where it runs:**

| Label              | Where it goes                                        |
| ------------------ | ---------------------------------------------------- |
| `FRONTEND`       | PowerShell, in`frontend\`                          |
| `BACKEND`        | PowerShell, in`backend\`                           |
| `SUPABASE (SQL)` | **Browser SQL Editor ONLY. NEVER a terminal.** |

Also: keep pasted PowerShell blocks to **one command each** where possible â€” multi-command blocks
with blank lines leave the terminal stuck at `>>`. **`Ctrl+C` escapes safely** and cancels nothing
important. For long file contents, write to a file and read it, always with `-Encoding utf8`.

## 16.10 CONTINUATION PROMPT UPDATE

The 0.2 continuation prompt should now say: *"We have completed planning, Phase 1, Phase 2,
Phase 3, Phase 4, Phase 5, and the Phase 6 backend (attachments). The Phase 6 frontend is written
but not yet tested on a device."*

## 16.11 WHAT'S NEXT â€” Phase 6 (highest priority first)

1. ðŸ”´ **TEST THE APK.** Nothing on the device is verified. **Expo Go now CRASHES** ("Something
   went wrong") because `expo-audio` and `expo-document-picker` are native modules it doesn't
   contain â€” this is permanent, the same lesson as #31/#49/#54. Test on the real APK:
   record â†’ send â†’ play back the voice note; attach a photo and ask about it; attach a PDF and ask
   about it; long-press the mic for hands-free and confirm the reply is spoken aloud.
2. ðŸ”´ **Rotate the exposed Supabase DB password** (`DATABASE_URL` locally AND on Render) and
   `CRON_SECRET` (Render AND cron-job.org). *Still outstanding from SECTION 15.*
3. ðŸŸ  **Build a development build** â€” `eas build --profile development`, then
   `npx expo start --dev-client`. This restores instant hot-reload for native modules and would
   have saved hours this session. Strongly recommended before any more native work.
4. ðŸŸ  **Push the backend to Render.** Phase 6 backend is committed but NOT pushed. Pushing
   deploys automatically â€” do it once the app half is confirmed working on the APK.
5. ðŸŸ¡ Add the FCM key to the `production` EAS profile (15.11 carry-over).
6. ðŸŸ¡ Delete the stale Expo Go row from `push_tokens` (15.7 carry-over).
7. ðŸŸ¡ Clear the Phase 6 TEST uploads from the `attachments` table + bucket (a resume PDF, an API
   screenshot, and a couple of voice notes were uploaded during backend testing).
8. ðŸŸ¡ Consider a per-attachment summary so the AI can discuss a document across multiple messages
   (the v1 limit in 16.2).

**Nothing is blocking. The Phase 6 backend is solid and tested; the frontend just needs its first
real-device run.**


---

# SECTION 17 â€” Phase 6 device testing + hardening pass (July 27, 2026)

> **This section is the newest. It WINS over anything above it wherever they conflict.**
> Everything in Section 16 still applies as background; this section captures what happened
> the day after Section 16's APK was built, what broke on the real device, and what we fixed
> before the next rebuild.

## 17.1 Where we are RIGHT NOW

The Phase 6 APK from Section 16 was installed and tested on the real device. Several
real-device-only bugs surfaced (see 17.4). All of them have been diagnosed and fixed in
code. A NEW APK build has been kicked off on EAS carrying THREE new fixes:

1. Biometric auto-lock no longer interrupts image, document, or voice attachment flows.
2. Unsent draft text now survives leaving the app, the biometric lock, and OS-driven memory kills.
3. Voice recording now has a proper cancel (trash) button â€” you can bail out of a recording
   without being forced to send it.

**IMMEDIATE NEXT STEP:** install the new APK when it finishes on EAS and run the test
checklist in 17.9. If everything passes, we move on to home-screen attachments (17.10).

## 17.2 What Phase 6 actually looked like on the real device

Section 16 marked Phase 6 as "written but not tested." This session was the first real
device test. Here is what actually happened, in order, so future sessions have the real
timeline instead of the optimistic one.

**Image upload appeared to 404.** Screenshots showed `Upload failed (404)`. Root cause:
the Phase 6 backend was committed but NOT yet pushed to Render at the moment of testing.
The APK was hitting `/attachments` on a server that didn't have that route. Fix was one
`git push` â€” Render auto-deployed at 4:22 AM and `curl.exe .../openapi.json | Select-String "attachments"` confirmed the route went live. This is Section 16.11 item 4 catching up
with reality.

**Voice recording appeared to fail with "Could not start recording."** The recording
error dialog and the fingerprint prompt were visible in the SAME screenshot â€” the
fingerprint prompt was stealing focus at the moment recording tried to start. The user
noticed the workaround themselves: **turning biometrics OFF made recording work.** That
observation led straight to the real bug (see 17.4 bug #64).

**Document upload appeared to fail silently.** The AI replied "I didn't receive any
context about it" for a resume PDF. Root cause was NOT extraction â€” direct SQL against
`public.attachments` showed `length(extracted_text) = 3018` for the same PDF, with a
preview showing the resume text ("Data Analyst â€” SQL, Python, Power BI ... Hetauda,
Nepal"). The failure was transaction-visibility on the earliest sends: the first two
document rows had `message_id = NULL` (never linked to a chat message), while the row
sent AFTER the backend deploy had `message_id` filled in AND the AI correctly read it
("I notice it's a resume, specifically Saphin Praja's resume"). The document pipeline
was working the whole time; the visible failure was a side effect of the pre-deploy 404.

**Voice, image, and document all confirmed WORKING end-to-end on device** once the
backend was live and biometrics was off. Voice transcript = "Hello, I have something
to tell you." Image = medical report shown in bubble and correctly described. Document
= PDF chip shown in bubble and text correctly injected into the AI's context.

## 17.3 Debug logging that was added and then removed

To catch the document injection bug we temporarily added `traceback.print_exc()` and a
`ATTACHMENT FETCH FAILED:` print inside the `except Exception:` block around
`attach_repo.get_attachments(...)` in `backend/app/api/chat.py`. It was pushed, ran on
Render briefly, and then **removed and pushed again** before the rebuild. There is no
lingering debug output in production. The `except Exception: attachments = []` block is
back to its original silent form.

**Rule for future sessions:** if you swallow an exception with `attachments = []` or
similar, ALWAYS add logging when reproducing the bug, and ALWAYS remove it before
committing the fix. The pattern in this session (add log â†’ push â†’ reproduce â†’ remove log
â†’ push) works and should be the default.

## 17.4 New bugs (append to Section 11's numbered list)

**#64 â€” Biometric auto-lock fires during Android picker / permission dialogs.**
Symptom: image picker, document picker, and the microphone permission prompt appear to
"break" â€” after picking or granting, the fingerprint prompt takes over and the in-flight
upload/recording never completes. Root cause: `App.tsx` had an `AppState` listener that
called `setLocked(true)` on ANY background â†’ active transition when biometrics was
enabled. Android backgrounds the app for a fraction of a second while a system picker or
permission dialog is up, which triggered the lock.

Fix (in `frontend/App.tsx`):

- Added `const backgroundedAt = useRef<number>(0);` next to the existing
  `appState` ref.
- On any transition into inactive/background, stamp `backgroundedAt.current = Date.now()`.
- On the return to active, compute `awayMs = Date.now() - backgroundedAt.current` and
  return early if `awayMs < 4000`. Only trips longer than 4 seconds are treated as a
  real app-switch and trigger the lock.
- 4 seconds was chosen because pickers return in well under 1 second, while a real
  human app-switch is essentially always longer.

**#65 â€” Unsent draft text is wiped when the biometric lock reappears.**
Symptom: user types a message, switches apps, comes back, unlocks with fingerprint, text
is gone. Root cause: `ChatScreen` was fully unmounted while `LockScreen` was shown, and
`ChatInput`'s local `useState('')` for the draft was lost with it.

Chose **Option A (persist the draft to `expo-secure-store`)** over Option B (render lock
as an overlay with chat still mounted underneath). Reasoning for the record: for a
privacy-first companion app, "locked" must genuinely tear down the private view. Option B
leaks: the chat is still in the view tree, timers still running, and Android edge cases
(screen recording, accessibility services, the app-switcher preview) can expose content
behind a foreground overlay. Option A is what serious apps (Signal, WhatsApp, banking)
do â€” hard teardown of the view, drafts persisted separately in secure storage. It also
solves the bigger version of the same bug: Android can kill your app's memory at any time
in the background, and with Option A the draft survives that too, not just the lock.

Fix (in `frontend/src/components/ChatInput.tsx`):

- Added `import * as SecureStore from 'expo-secure-store';`.
- Added a `draftKey?: string` prop with default `'draft:new'`.
- `const storeKey = ` + backticks + `saphin.draft.${draftKey}` + backticks + `;` (per-session key).
- On mount, `useEffect` reads `SecureStore.getItemAsync(storeKey)` and calls `setText(saved)`.
- On `text` change, a 300ms debounced `useEffect` writes to
  `SecureStore.setItemAsync(storeKey, text)`.
- In `handleSend`, after the successful `onSend`, call
  `SecureStore.deleteItemAsync(storeKey).catch(() => {})` so a sent message doesn't
  come back as a ghost draft.

Fix (in `frontend/src/screens/ChatScreen.tsx`):

- Passes `draftKey={currentSession ?? 'new'}` into `<ChatInput>`. Each chat keeps its
  own draft. A brand new chat draft is stored under the `new` key and restored
  correctly on next mount.

**Why per-session keying matters:** if two chats shared one draft slot, typing in chat
A then switching to chat B would show A's draft. Per-session avoids that entirely.

**#66 â€” Voice recording had no cancel; only way out was to send.**
Symptom: user starts recording, changes their mind, has no button to bail â€” the only
option is the send arrow. Root cause: the recording UI in `ChatInput.tsx` rendered
only the "Recording... tap to send" bar plus a send button.

Fix (in `frontend/src/components/ChatInput.tsx`):

- Added a `cancelRecording` async function next to `stopRecording`. It clears the
  `autoStop` timer, calls `recorder.stop()` inside try/catch (any error is fine â€” we
  are discarding the audio), zeros `startedAt.current`, and calls
  `setAudioModeAsync({ allowsRecording: false })`. It does NOT upload, does NOT call
  `onSend`, and does NOT touch state that would emit a bubble.
- Recording UI now has THREE elements in a row: trash button (left, `trash-outline`
  icon, tinted `theme.danger`), the recording bar (middle, now also
  `TouchableOpacity` so tapping the bar itself sends), send button (right).
- Style change: `styles.recording.marginRight` â†’ `marginHorizontal` so both left and
  right sides have spacing now that there's a button on each side.

## 17.5 File changes in this session

Backend:

- `backend/app/api/chat.py` â€” debug logging added, exercised, and REMOVED. Net change
  from Section 16: none. Do not re-add the debug lines in a permanent commit.

Frontend:

- `frontend/App.tsx` â€” `backgroundedAt` ref + 4-second grace window on backgroundâ†’active
  transition (#64).
- `frontend/src/components/ChatInput.tsx` â€” SecureStore draft persistence (#65) +
  cancelRecording function + trash button in recording UI + marginHorizontal style
  fix (#66).
- `frontend/src/screens/ChatScreen.tsx` â€” passes `draftKey={currentSession ?? 'new'}`
  into `<ChatInput>` (#65).

No new packages installed. `expo-secure-store` was already a dependency (biometrics
uses it). `expo-doctor` 18/18 and `tsc --noEmit` clean before each commit. Line-ending
warnings (LFâ†’CRLF) still appear on Windows and are still harmless.

## 17.6 Product decisions made this session

**Home-screen attachments deferred (not cancelled).** The user asked whether voice /
image / document buttons could live on `ChatsListScreen` (the home page). Decision was
to skip for this rebuild and revisit as a separate change after the fingerprint fix
build is verified.

When we do it, the preferred implementation is **Path 2**: home shortcuts open a new
empty chat and immediately trigger the picker or start recording inside it, reusing
the existing `ChatInput` component. Do NOT duplicate the upload/record logic into
`ChatsListScreen` â€” that is the bug #41 pattern the handover warns against. The
plumbing already exists in a similar shape (`initialMessage` for text, `autoRecordSignal`
for hands-free), and the same pattern extends cleanly: a new `initialAction`
prop on `<ChatScreen>` set to `'record' | 'photo' | 'document'` that fires the
matching handler on first mount.

Reason for splitting into two builds: if the home change breaks something, the previous
build is a known-good fallback. Piling both into one 60-90 minute build hides which
change caused a regression.

**Cancel button chosen over voice-message preview.** The user's original ask was just
"there is no way to cancel." A more elaborate flow (record â†’ preview â†’ confirm to send)
was considered and rejected â€” it fights D30 ("no review transcript before sending â€”
speed > perfection"). A trash button is the minimum honest UX without slowing the send
flow.

## 17.7 The document injection false alarm â€” for the record

Between "the AI says it doesn't see my PDF" and finding the fix, we ran:

```sql
select id, kind, original_name, size_bytes,
       length(extracted_text) as text_len,
       left(extracted_text, 200) as preview
from public.attachments
where kind = 'document'
order by created_at desc
limit 5;
```

Result showed `text_len = 3018` on all three rows with a preview of real resume content.
Extraction was NEVER broken. A follow-up query with `message_id, session_id, hidden_at`
showed the newest row had both IDs populated (successful chat-time link) while the
older two had NULL (uploads that never reached a chat send). The uploads that "failed"
were the pre-deploy 404 attempts. Once the backend was live, everything worked.

**Lesson for future sessions:** when the AI claims it doesn't see an attachment, the
first debugging step should be a direct SQL check on `extracted_text` length AND on
`message_id` linkage BEFORE touching code. It rules out extraction vs injection
instantly.

## 17.8 Rebuild details

Three fixes are bundled into one EAS build to save an hour of wait:

1. #64 biometric lock during pickers (`App.tsx`).
2. #65 draft persistence (`ChatInput.tsx`, `ChatScreen.tsx`).
3. #66 voice cancel button (`ChatInput.tsx`).

Build command was `eas build -p android --profile preview` from `frontend/`, run AFTER
`npx expo-doctor` (18/18) and `npx tsc --noEmit` (clean). Commit messages were kept
narrow ("Fix biometric lock interrupting attachment pickers; remove debug logging",
"Persist unsent draft text across app background/lock (per-session)", "Add cancel
button for voice recording") so bisecting is easy if a regression appears.

## 17.9 Test checklist for the new APK

Install with biometrics ON and run through these in order. Do NOT skip any â€” each one
tests a distinct fix.

1. **Fingerprint login still works.** No regression from the App.tsx change.
2. **Draft text survives lock.** Open a chat, type "hello world", press home, wait
   5 seconds, reopen the app, unlock with fingerprint â†’ the text "hello world" is
   still in the input. Do the same in a SECOND chat with different text and confirm
   it doesn't leak into the first chat.
3. **Voice recording works with biometrics ON.** Long-press the mic (or short-press,
   as configured), record a few seconds, tap send â†’ transcribes and posts. No
   fingerprint prompt interrupts.
4. **Voice cancel works.** Start recording, tap the trash icon â†’ no chat bubble
   appears, no upload happens, no error alert. Just clean stop.
5. **Image upload works with biometrics ON.** Attach a photo â†’ uploads, shows in
   bubble, AI describes it. No fingerprint prompt in the middle.
6. **Document upload works with biometrics ON.** Attach a PDF with real text â†’ AI
   references the content in its reply.
7. **Sent messages don't come back as ghost drafts.** Type + send a message. Leave
   the app. Come back and unlock. Input should be EMPTY, not showing the just-sent
   message again.

If all 7 pass, the build is good and we move on to home-screen attachments (17.10).
If any fail, capture a screenshot and the exact steps that reproduce it.

## 17.10 What's next after this build

If 17.9 all passes, tackle home-screen attachments per Path 2 in 17.6:

1. Add an `initialAction?: 'record' | 'photo' | 'document'` prop to `<ChatScreen>`.
2. In `ChatScreen`, on first mount, if `initialAction` is set, call the matching
   function on the ChatInput (either via ref, or by threading a `triggerSignal` prop
   the same way `autoRecordSignal` already works).
3. Replace or extend the home input in `ChatsListScreen` with mic / attach buttons
   that call `onStartChatWithAction('record' | 'photo' | 'document')`.
4. Wire that up in `App.tsx` alongside the existing `onStartChatWithMessage`.

Test it, and only THEN merge Section 17 into a Section 18.

## 17.11 Still outstanding from earlier sections (unchanged)

These carry over from Section 16.11 and remain open:

- ðŸ”´ Rotate the exposed Supabase DB password AND `CRON_SECRET`. Still not done. Every
  session should nag until this is done.
- ðŸŸ  Build a development build (`eas build --profile development`) at least once. Would
  have caught #64, #65, and #66 in minutes instead of costing a full preview build.
  This is still the highest-leverage change to workflow for future sessions.
- ðŸŸ¡ Add FCM key to the `production` EAS profile (Section 16.11 item 5).
- ðŸŸ¡ Delete the stale Expo Go row from `push_tokens`.
- ðŸŸ¡ Clear test uploads from `attachments` table + storage bucket. This session added
  at least three more resume test rows (see 17.7); the cleanup query should run against
  everything before the APK ships publicly.
- ðŸŸ¡ Consider per-attachment summary for multi-message document discussion (Section
  16.11 item 8). Still v1 known limit: attachment text only reaches the AI on the
  message it arrives with, not on later follow-up questions.

## 17.12 Rules re-affirmed by this session

- **The screenshot timestamp matters.** A screenshot taken BEFORE a fix was deployed
  proves nothing. Always check the deploy time against the screenshot time before
  spending an hour debugging code that isn't the problem.
- **`expo-doctor` and `tsc --noEmit` are 10-second gates. Run them before EVERY build.**
  This session ran them three separate times. Zero false positives, zero wasted builds.
- **Direct SQL is the fastest debugger for anything involving Supabase.** For attachment,
  memory, mood, or reminder bugs, a `select ... from public.<table>` in the Supabase
  SQL Editor beats reading Render logs.
- **Debug logging is a tool, not a commit.** Add it, use it, remove it, then commit
  the real fix. Never leave `print("DEBUG: ...")` in production code.
- **Don't take the user's phone workaround as the fix.** "It works when I turn
  biometrics off" is a diagnostic clue, not a shipping plan. The real fix keeps the
  security feature on and stops it from interfering. #64 was solved this way.
- **When the user proposes a "one more thing" change during a build sequence, ask
  whether to bundle it or split it.** This session bundled the voice cancel button
  because it was tiny and self-contained. It deferred home attachments because they
  weren't. That judgment call is worth making explicit every time.


# 18. Session update â€” UTF-8 encoding fix, home-screen attachments (17.10 done), and two new picker bugs found on device

## 18.1 Starting point

Picked up right after Section 17. The 17.9 test checklist (biometric, draft
persistence, voice cancel) had already passed on-device by the start of this
session â€” confirmed verbally by the user, not re-verified in this session. That
APK was NOT yet installed when this session's changes were made; all fixes below
were bundled into ONE new build rather than shipped separately, by user's choice.

## 18.2 UTF-8 encoding corruption found and fixed (mistake #44, recurrence)

A screenshot showed the chat header rendering `Ã¢â‚¬Â¹ Chats` instead of `â€¹ Chats` â€”
the exact corruption signature documented in Section 11 mistake #44. Root cause
was unchanged from the original mistake: `â€¹`, `â€¦`, and `â€”` characters had been
written to `ChatScreen.tsx` at some earlier point without proper UTF-8 handling.

Scan of the whole frontend (`Select-String -Pattern "Ã¢â‚¬|Ã°Å¸|ÃƒÂ©|Ã‚ "`) found the
corruption confined to three lines in one file:

- `frontend/src/screens/ChatScreen.tsx` line ~189 â€” back button label
  (`Ã¢â‚¬Â¹ Chats` â†’ `â€¹ Chats`)
- same file line ~210 â€” "Thinking" indicator (`ThinkingÃ¢â‚¬Â¦` â†’ `Thinkingâ€¦`)
- same file line ~225 â€” a code comment (`wrapper Ã¢â‚¬â€ the OS` â†’ `wrapper â€” the OS`)

Fix method: rather than pasting the correct characters into PowerShell (which
risks the same corruption happening again on write), used
`.Replace([char]0x00E2 + [char]0x20AC + [char]0x00B9, [string][char]0x2039)`
style code-point-built replacements for all three. First attempt used the wrong
code point for the em dash (`0x201C` instead of `0x201D` â€” Windows-1252 byte
`0x94` is the right double quote, not the left one) and needed one follow-up
correction. Final verification: `Select-String -Pattern "Ã¢â‚¬|Ã°Å¸|ÃƒÂ©|Ã‚ "` across
the whole frontend returns only two unrelated hits inside
`node_modules/@types/node`.

**Rule reaffirmed:** when fixing this class of bug, verify the fix with a
literal search on the corrupted BYTES (`Ã¢â‚¬Â¹`, `Ã¢â‚¬Â¦`, `Ã¢â‚¬"`, `Ã¢â‚¬"`), not by eye â€”
Windows-1252 mis-decoding produces several different sequences depending on
which Unicode character was mangled, and it is easy to fix one and miss
another in the same file.

## 18.3 Home-screen attachments â€” 17.10 implemented

Per the Path 2 plan already agreed in Section 17.6, added the ability to start
a chat directly from a voice/photo/document shortcut on the home screen,
reusing `ChatInput`'s existing picker/recorder logic (no duplication â€” avoids
the bug #41 pattern).

**New prop chain**, mirroring how `initialMessage` already worked:

- `App.tsx` â€” `View3`'s `"chat"` variant gained `initialAction?: "record" |
  "photo" | "document" | null`. Added `onStartChatWithAction` prop passed into
  `ChatsListScreen`, which sets `view` to `{ name: "chat", sessionId: null,
  initialAction: action }`.
- `ChatScreen.tsx` â€” new `initialAction` prop. On first mount (guarded by a
  `firedAction` ref so it only fires once), maps the action to one of three
  new signal states: `triggerPhotoSignal`, `triggerDocSignal`, and (originally)
  `autoRecordSignal` for `"record"` â€” this last part had a bug, see 18.4.
- `ChatInput.tsx` â€” new `triggerPhotoSignal?: number` and `triggerDocSignal?:
  number` props. Two new `useEffect`s call the existing `pickImage()` /
  `pickDocument()` functions when their signal increments.
- `ChatsListScreen.tsx` â€” home input bar redesigned: `Ionicons` import added.
  Left side gained a `(+)` attach button that opens an `Alert.alert` with
  Photo / Document / Cancel, calling `onStartChatWithAction("photo" |
  "document")`. Right side: when there's typed text, shows an up-arrow send
  button same as before; when empty, shows a mic icon that calls
  `onStartChatWithAction("record")`. All emoji in this file were also switched
  to `\uXXXX` escapes as a defensive measure against #44 recurring.

`npx tsc --noEmit` and `npx expo-doctor` (18/18) both clean after this change,
verified BEFORE the picker-lock work in 18.4 was layered on top.

## 18.4 New bugs found on device (append to Section 11's numbered list)

**#67 â€” Biometric lock still interrupts the photo crop screen, even with the
#64 fix.** User reported: tapping "change photo" in Profile, picking a photo
from the gallery, then spending time on Samsung's built-in crop screen would
trigger the fingerprint prompt mid-crop. Root cause: the #64 fix (Section
17.4) uses a fixed 4-second grace window on any backgroundâ†’active transition.
Cropping routinely takes longer than 4 seconds, so the app treats it as a real
app-switch and locks.

Fix: added a new shared module `frontend/src/services/pickerLock.ts`:

```typescript
/** Shared flag: set true while a picker is open so App.tsx skips the biometric lock. */
export const pickerLock = { active: false };
```

- `App.tsx` â€” imports `pickerLock`; inside the existing `AppState` listener,
  added `if (pickerLock.active) return;` immediately after the existing
  4-second `awayMs` check. The 4-second window is UNCHANGED and still the
  first line of defense; `pickerLock` is a second, more precise guard for
  operations that can legitimately run longer.
- `ChatInput.tsx` â€” `pickImage()` and `pickDocument()` now set
  `pickerLock.active = true` immediately before calling the native picker and
  set it back to `false` right after the picker call returns (or in the catch
  block, so a thrown error never leaves the lock stuck on).
- `ProfileScreen.tsx` â€” `takePhoto()` and `pickFromGallery()` wrap the native
  camera/gallery call (which includes the crop step, since both use
  `allowsEditing: true`) in `pickerLock.active = true` / `try { ... } finally
  { pickerLock.active = false }`. The `finally` guarantees the lock always
  clears even if the picker throws or the user backs out.

User explicitly wanted to KEEP the crop step (not remove `allowsEditing`) â€”
confirmed before implementing. Nothing about the crop UI itself changed; only
the lock-timing logic around it.

**#68 â€” Home-screen mic shortcut opened the chat but never started
recording.** Symptom, confirmed by screenshots: tapping the home-screen mic
navigated into a new chat, but the mic never engaged â€” user had to tap the
in-chat mic button manually. Root cause: the `initialAction === "record"`
branch in `ChatScreen.tsx` (see 18.3) was reusing `autoRecordSignal`, the same
signal used for hands-free auto-reopen. But `ChatInput.tsx`'s effect for that
signal is gated: `if (autoRecordSignal && handsFree && !recording && ...)`.
Since the home-screen shortcut is not hands-free, `handsFree` is `false` and
the effect silently no-ops.

Fix: introduced a second, independent signal not gated by `handsFree`.

- `ChatInput.tsx` â€” new `triggerRecordSignal?: number` prop with its own
  `useEffect`: `if (triggerRecordSignal && !recording && !disabled && !busy)
  { startRecording(); }` â€” no `handsFree` check.
- `ChatScreen.tsx` â€” new `triggerRecordSignal` state, separate from the
  existing `autoRecordSignal`. The `initialAction === "record"` branch now
  calls `setTriggerRecordSignal((n) => n + 1)` instead of touching
  `autoRecordSignal`. `autoRecordSignal` and its hands-free behavior are
  completely untouched.

**Why this matters for future sessions:** `autoRecordSignal` and
`triggerRecordSignal` look similar and both ultimately call `startRecording()`,
but they answer different questions â€” "should the mic reopen automatically
after the companion finishes speaking" vs "should the mic open once right
now regardless of mode." Do not collapse them back into one signal; the
gating on `handsFree` is intentional and load-bearing for hands-free mode.

## 18.5 File changes in this session

Frontend only, no backend changes this session:

- `frontend/src/screens/ChatScreen.tsx` â€” encoding fix (18.2); `initialAction`
  prop, `triggerPhotoSignal`/`triggerDocSignal`/`triggerRecordSignal` states
  and wiring (18.3, 18.4).
- `frontend/src/components/ChatInput.tsx` â€” `triggerPhotoSignal`,
  `triggerDocSignal` props + effects (18.3); `pickerLock` import and
  set/clear around `pickImage`/`pickDocument` (18.4 #67);
  `triggerRecordSignal` prop + unconditional effect (18.4 #68).
- `frontend/src/screens/ChatsListScreen.tsx` â€” home input bar redesign with
  attach/mic buttons, `onStartChatWithAction` prop, `Ionicons` import,
  emoji switched to `\uXXXX` escapes (18.3).
- `frontend/App.tsx` â€” `initialAction` threaded through `View3` and into
  `<ChatScreen>`; `onStartChatWithAction` passed into `<ChatsListScreen>`
  (18.3); `pickerLock` import and check in the `AppState` listener (18.4 #67).
- `frontend/src/screens/ProfileScreen.tsx` â€” `pickerLock` import and
  set/clear (in `try/finally`) around `takePhoto`/`pickFromGallery` (18.4
  #67); emoji switched to `\uXXXX` escapes as a defensive measure.
- `frontend/src/services/pickerLock.ts` â€” NEW file, 2 lines, shared flag
  module (18.4 #67).

No new packages installed. `npx tsc --noEmit` and `npx expo-doctor` (18/18)
were run and confirmed clean after EVERY file change in this session, not
just once at the end â€” this caught nothing broken, but the habit from 17.12
held.

## 18.6 Commits this session

Two separate commits, both pushed to `main`:

1. `"Home-screen attach/mic buttons, fix UTF-8 encoding in ChatScreen"` â€”
   covers 18.2 and the first pass of 18.3 (before the #67/#68 bugs were
   found).
2. `"Add pickerLock to prevent chat input during media picker"` â€” covers the
   #67 fix. (Message is slightly imprecise â€” it's about the biometric lock
   during the picker/crop screen, not "chat input"; worth a clearer message
   next time.)
3. `"Fix home-screen mic shortcut: separate triggerRecordSignal from
   hands-free autoRecordSignal"` â€” covers the #68 fix.

One `git push` was rejected (`! [rejected] main -> main (fetch first)`)
because the remote had a commit not present locally. Resolved with `git pull
origin main`, which opened a merge commit message in VS Code
(`MERGE_MSG`) â€” the default merge message was accepted as-is and the merge
completed cleanly with no conflicts.

## 18.7 Workflow snag worth remembering: stale files in Downloads

When re-downloading an updated version of a file with the same name Chrome/
Windows saves it as `App (1).tsx` instead of overwriting, so a `Copy-Item`
using the plain filename silently copies the STALE original instead of the
new one. This caused `App.tsx` and `ChatInput.tsx` to appear to have "no
changes" in `git status` after a copy step, even though new versions had been
generated and presented. Symptom: `git status --short` showed fewer modified
files than files that were actually changed.

**Fix used:** delete everything in the Downloads folder, then re-download the
files fresh so there's only one copy of each, then re-run the `Copy-Item`
commands.

**Rule for future sessions:** before any `Copy-Item` from `$env:USERPROFILE\
Downloads\`, either (a) tell the user to clear Downloads of same-named files
first, or (b) use `Get-ChildItem "$env:USERPROFILE\Downloads\<name>*"` to
confirm there is exactly one match before copying. This is now the second
time a Downloads-folder mismatch has caused confusion in this project; it's
worth checking every time files are handed off this way.

## 18.8 Rebuild details

Build command `eas build -p android --profile preview` was kicked off from
`frontend/` after the final `triggerRecordSignal` fix (18.4 #68), bundling
ALL of this session's changes into one APK:

1. UTF-8 encoding fix (18.2).
2. Home-screen attach/mic buttons â€” 17.10 (18.3).
3. `pickerLock` fix for biometric-during-crop â€” #67 (18.4).
4. `triggerRecordSignal` fix for home-screen mic not starting â€” #68 (18.4).

`npx tsc --noEmit` and `npx expo-doctor` (18/18) both clean immediately before
the build was triggered. Build result (APK link / install / on-device test)
was NOT YET confirmed at the point this section was written â€” that's the
immediate next step for whoever picks this up.

## 18.9 Test checklist for the new APK

Once the build finishes and is installed, in ADDITION to re-confirming 17.9
still holds (nothing in this session should have touched those code paths,
but the pickerLock change does touch the same `AppState` listener, so a full
re-check is warranted):

1. **Header renders `â€¹ Chats` correctly**, not `Ã¢â‚¬Â¹ Chats`.
2. **Home-screen mic button** â€” tap it from the home screen (not inside a
   chat) â†’ should open a new chat AND immediately start recording, no second
   tap needed.
3. **Home-screen photo button** â€” tap `(+)` on home screen â†’ Photo â†’ gallery
   opens immediately in a new chat.
4. **Home-screen document button** â€” same, for Document.
5. **Profile photo crop, biometrics ON** â€” Profile â†’ tap avatar â†’ gallery â†’
   pick a photo â†’ spend 10+ seconds on the Samsung crop screen â†’ tap CROP â†’
   should return to Profile with the new avatar, NO fingerprint prompt
   appearing during or after the crop.
6. **Profile photo â€” take a photo (camera), same test** as #5 but via the
   camera instead of gallery.
7. **Hands-free mode still works** â€” long-press the mic inside an existing
   chat to turn on hands-free, confirm the companion still auto-reopens the
   mic after speaking (this is `autoRecordSignal`, untouched, but worth
   confirming nothing regressed).

If all 7 pass, this build is done and Section 18 can be considered closed â€”
merge into a future Section 19 for the next round of work.

## 18.10 Still outstanding from earlier sections (unchanged)

Carried over from Section 17.11, still open, still nagging every session
until resolved:

- ðŸ”´ Rotate the exposed Supabase DB password AND `CRON_SECRET`. STILL not
  done across at least two sessions now.
- ðŸŸ  Build a development build (`eas build --profile development`) at least
  once. Would have caught #67 and #68 in minutes via live reload instead of
  costing a full preview build cycle each time. This is still the
  highest-leverage unaddressed workflow change.
- ðŸŸ¡ Add FCM key to the `production` EAS profile.
- ðŸŸ¡ Delete the stale Expo Go row from `push_tokens`.
- ðŸŸ¡ Clear test uploads from `attachments` table + storage bucket.
- ðŸŸ¡ Consider per-attachment summary for multi-message document discussion.
  Still v1 known limit.

## 18.11 Rules re-affirmed by this session

- **Mistake #44 (UTF-8 corruption) can recur in files that were previously
  clean if new code is typed/pasted carelessly.** Don't assume a file fixed
  once stays fixed â€” re-scan with the byte-pattern search after any manual
  edit to a file that touches special characters.
- **Two signals that both "start recording" are not interchangeable if one
  is gated and the other isn't.** Read the actual condition inside the
  `useEffect`, not just the function it calls, before reusing an existing
  signal for a new purpose.
- **A `try/finally` around a lock flag is mandatory, not optional.** Both
  `pickerLock` implementations (ChatInput and ProfileScreen) use
  `finally`/try-catch specifically so a thrown picker error can never leave
  the app permanently unable to lock.
- **When re-downloading a file with the same name as a previous download,
  clear Downloads first or verify there's only one match.** Stale duplicate
  downloads silently defeated two `Copy-Item` commands in this session.
- **Bundling multiple small, related fixes into one build is fine when each
  fix is small and independently verified with `tsc`/`expo-doctor` before
  moving to the next one** â€” this session bundled four separate fixes into a
  single EAS build after verifying each in isolation.

---

# SECTION 19 â€” Web version (Expo Web + Vercel) & voice fix timing

> **This is the NEWEST section. Read it first. It OVERRIDES earlier sections
> where they conflict.**

## 19.1 What happened this session

Two things shipped:

1. **Bug #68 re-fix (voice shortcut timing race):** The Section 18.4 fix
   for the home-screen mic shortcut was structurally correct (separate
   `triggerRecordSignal` ungated by `handsFree`) but still didn't work
   on-device. Root cause: the signal fires on mount before the native
   `useAudioRecorder` hook finishes initializing, so `startRecording()`
   runs against a recorder that isn't ready yet and silently does nothing.
   Fix: wrapped the `startRecording()` call inside the `triggerRecordSignal`
   effect in a 500ms `setTimeout`, giving the native audio module time to
   initialize. The in-chat mic works instantly because by the time the user
   taps it manually, the recorder has already initialized. APK build was
   kicked off but **not yet tested on-device** at session end.

2. **Full web version of the app**, deployed live at **saphinai.vercel.app**.
   Same backend, same database, same Supabase auth â€” one account works on
   both APK and web. Built using Expo Web (Path A: same codebase, not a
   separate Next.js frontend). All web-specific changes are gated behind
   `Platform.OS === "web"` checks; the APK is completely unaffected.

## 19.2 Web architecture decisions

- **Path A (Expo Web) chosen over Path B (separate Next.js app).** Rationale:
  user wanted identical UI/UX across platforms, one codebase to maintain.
  Path B would have meant rebuilding every screen from scratch.
- **Responsive sidebar layout on desktop** (like Claude.ai / ChatGPT / Gemini):
  permanent left sidebar with navigation + chat history, collapsible via a
  toggle button. When collapsed, a hamburger icon appears to re-open it.
- **Mobile browser:** falls back to existing hamburger-drawer behavior from
  the APK (no sidebar changes needed).
- **Wallpapers:** portrait images (`assets/wallpapers/`) for APK, landscape
  images (`assets/wallpaper1/`) for web. Platform switch happens inside
  `makeNatureBackground()` via `Platform.OS === "web"`.
- **Login page:** wrapped in a max-width 440px centered container on web so
  it doesn't stretch across the full screen.
- **Content area:** capped at `maxWidth: 720` and centered, matching how
  Claude/ChatGPT constrain their content column.
- **Biometrics/push notifications/AppState lock:** all skipped on web via
  `IS_WEB` guards in `App.tsx`. Web doesn't need biometric lock or push
  tokens.
- **Profile section:** removed from sidebar bottom; profile avatar remains
  in the main content area (top-right on home screen, same as APK).

## 19.3 Files changed this session (full paths)

### New files

- `frontend/src/components/WebSidebar.tsx` â€” NEW. Permanent sidebar for web:
  brand header, collapse button, "New chat" button, navigation items (Chats,
  Journal, Reminders, Goals, About) with active-state highlighting, scrollable
  recent chat list, and profile link at bottom (later removed, see 19.4).
  Only rendered when `Platform.OS === "web"` in App.tsx.

### Modified files

- **`frontend/src/components/ChatInput.tsx`** â€” the `triggerRecordSignal`
  `useEffect` now wraps `startRecording()` in a 500ms `setTimeout` to let
  the native audio recorder finish initializing after mount (19.1 re-fix
  of #68). Backup at `ChatInput.tsx.bak`.

- **`frontend/App.tsx`** â€” major web changes, all gated behind
  `const IS_WEB = Platform.OS === "web"`:
  - Added imports: `TouchableOpacity`, `Ionicons`, `WebSidebar`.
  - New state: `webSidebarOpen` (default `true`), `webRefreshKey`.
  - `syncPushToken()` and `maybeOfferBiometric()` return early on web.
  - Biometric lock on session init skipped on web.
  - `Notifications` listener, `AppState` listener, `BackHandler` listener
    all wrapped in `if (IS_WEB) return;` guards.
  - `webRefreshKey` increments when `view.name` changes to `"list"` (triggers
    sidebar chat list refresh).
  - Auth screen on web: wrapped in a centered `maxWidth: 440` container.
  - Post-auth content on web: rendered in a `flexDirection: "row"` layout
    with `WebSidebar` on the left and content area on the right.
  - Content area constrained to `maxWidth: 720, alignSelf: "center"`.
  - When sidebar is collapsed, a hamburger icon button appears at
    `top: 16, left: 16` to re-open it.
  - Native path: completely unchanged `<>{bar}{content}</>`.
  - UTF-8 corruption fixed: `\u00e2\u20ac\u201c` comment replaced with `--`.
  - Backup at `App.tsx.bak`.

- **`frontend/src/screens/ChatsListScreen.tsx`** â€” two surgical changes:
  - Hamburger button wrapped in `Platform.OS !== "web"` ternary: on web,
    renders an empty `<View />` spacer so `justifyContent: "space-between"`
    still pushes the avatar to the right.
  - Drawer overlay wrapped in `Platform.OS !== "web" && drawerOpen` guard
    so the drawer never renders on web (sidebar replaces it).

- **`frontend/src/theme/themes/nature/Background.tsx`** â€” `makeNatureBackground`
  now accepts an optional 4th parameter `webWallpaper?: number`. When
  `Platform.OS === "web"` and a web wallpaper is provided, it uses the
  landscape image instead of the portrait one. Added `Platform` import.

- **`frontend/src/theme/themes/nature/index.ts`** â€” each `nature()` call now
  passes a 8th argument: the web-specific landscape wallpaper from
  `assets/wallpaper1/`. Mapping:
  - Mountain Dusk â†’ `wallpaper1/img6.jpg`
  - Forest Mist â†’ `wallpaper1/img9.jpg`
  - Snowy Peak â†’ `wallpaper1/img10.jpg`
  - Swan Lake â†’ `wallpaper1/img13.jpg`
  - Sunlit Calm â†’ `wallpaper1/img15.jpg`
  - Emojis switched from corrupted UTF-8 sequences to `\uXXXX` escapes.

### New assets

- `frontend/assets/wallpaper1/` â€” 11 landscape wallpaper images for web
  (`img6.jpg` through `img17.jpg`, excluding `img7.jpg`). Only 5 are
  currently mapped to themes; the rest are available for future themes.

### Packages installed

- `react-dom` â€” required for Expo Web rendering.
- `react-native-web` â€” React Native components for the browser.
- `@expo/metro-runtime` â€” Metro bundler runtime for web.

## 19.4 Web UI fixes applied iteratively

1. **Login page stretched full-width** â†’ wrapped in `maxWidth: 440` centered
   container on web.
2. **Profile avatar stuck on left side** â†’ hamburger replacement changed from
   `null` to empty `<View />` spacer so `space-between` still works.
3. **Profile section crowded with nav in sidebar** â†’ removed profile from
   sidebar bottom; avatar stays in main content area top-right.
4. **Content area too wide on desktop** â†’ added `maxWidth: 720` wrapper
   around all content in the web layout.
5. **Portrait wallpapers zoomed/cropped on landscape screens** â†’ added web
   wallpaper support with landscape images from `wallpaper1/`.

## 19.5 Deployment

**Live URL:** `https://saphinai.vercel.app`

**Hosting:** Vercel (free Hobby tier), deployed via CLI (not connected to
Git repo â€” manual deploys only, intentional choice so APK-only pushes
don't trigger unnecessary web deploys).

**Deploy commands (run from `frontend/`):**

```powershell
cd C:\Users\saphi\Desktop\Ai-Companion\frontend
npx expo export --platform web
vercel dist --prod
```

First command builds the web bundle into `dist/`. Second command uploads
it to Vercel. Takes ~15 seconds total. Run these two commands any time
you want to update the live website.

**Vercel project name:** `saphinai` (under team `saphin18s-projects`).

**Local dev (for testing before deploying):**

```powershell
cd C:\Users\saphi\Desktop\Ai-Companion\frontend
npx expo start --web
```

Opens at `localhost:8081`. Use this to test web changes before deploying.

## 19.6 APK build status

An APK build was kicked off bundling the voice fix timing change (19.1)
BEFORE the web work started. The web changes are frontend-only and gated
behind `Platform.OS === "web"`, so they will NOT affect the APK. However,
the next APK build should include all web-session file changes too
(App.tsx, ChatsListScreen.tsx, nature theme files) â€” they are inert on
native but should be in the codebase.

**APK test checklist (same as 18.9 items 1-7, plus one new item):**

8. **Home-screen mic shortcut with timing fix** â€” tap the home-screen mic
   button â†’ should open a new chat AND start recording within ~0.5 seconds,
   no second tap needed. This is the re-fix of #68 with the `setTimeout`
   approach.

## 19.7 Known web issues (not yet fixed)

- **Sidebar icons showing as empty squares on deployed version** â€” Ionicons
  font not loading correctly in the Vercel build. Works fine on localhost.
  Likely needs an explicit font-loading step in the web build config.
- **Profile screen layout too wide before maxWidth was added** â€” now fixed
  by the 720px content wrapper, but individual screen layouts (profile,
  journal, goals, etc.) may still benefit from web-specific spacing tweaks.
- **Voice recording on web** â€” not yet tested. `expo-audio` may need a
  Web MediaRecorder fallback. The mic button appears but recording behavior
  on web browsers is unverified.
- **expo-secure-store on web** â€” used for draft persistence in ChatInput.
  May silently fail on web (drafts won't persist across page reloads). A
  `localStorage` fallback for web has not been implemented yet.
- **expo-speech on web** â€” companion speaking replies aloud (hands-free
  mode) uses `expo-speech`. Web Speech API fallback not implemented yet.

## 19.8 Commits this session

One commit pushed before the web work began:

1. `"Fix home-screen mic shortcut: add 500ms delay for native recorder
   init"` â€” the timing re-fix for #68 in ChatInput.tsx.

Web changes were NOT committed yet at session end. Before the next APK
build, all web-session changes should be committed:

```powershell
cd C:\Users\saphi\Desktop\Ai-Companion\frontend
git add -A
git commit -m "Add Expo Web support with responsive sidebar, deploy to Vercel"
git push origin main
```

## 19.9 Still outstanding from earlier sections (unchanged)

Carried over from 18.10, still open:

- \uD83D\uDD34 Rotate the exposed Supabase DB password AND `CRON_SECRET`. STILL not
  done across at least THREE sessions now.
- \uD83D\uDFE0 Build a development build (`eas build --profile development`).
- \uD83D\uDFE1 Add FCM key to the `production` EAS profile.
- \uD83D\uDFE1 Delete the stale Expo Go row from `push_tokens`.
- \uD83D\uDFE1 Clear test uploads from `attachments` table + storage bucket.
- \uD83D\uDFE1 Consider per-attachment summary for multi-message document discussion.

## 19.10 Rules from this session

- **`Platform.OS === "web"` is the gating mechanism for ALL web-specific
  code.** Never use browser-only APIs (like `window`, `document`,
  `localStorage`) without this check â€” the same code runs on native.
- **Don't pile web changes on top of untested APK fixes.** We kicked off the
  APK build for the voice fix BEFORE starting web work, so if the voice fix
  fails, we know it's not contaminated by web changes.
- **Portrait wallpapers don't work on landscape screens.** Always provide
  separate landscape assets for web when using photo wallpapers.
- **`justifyContent: "space-between"` breaks when you remove a child.**
  When hiding an element on one platform, replace it with an empty `<View />`
  spacer, not `null`, so the layout math doesn't change.
- **Vercel deploy is two commands, not connected to Git.** This is
  intentional â€” don't connect the repo until the app stabilizes, or every
  `git push` (including APK-only fixes) triggers a web deploy.


# SECTION 20 â€” Session 20: Web hardening, landing page, auth UX (Aug 2026)

## 20.1 What was done

This session fixed critical web deployment issues, added a landing/welcome
page, and improved auth UX for both APK and web.

### Web fixes (all gated behind `Platform.OS === "web"`)

1. **Responsive mobile web layout** â€” `Platform.OS === "web"` doesn't
   distinguish phone browsers from desktop browsers. Added
   `useWindowDimensions()` + `isDesktopWeb = IS_WEB && width >= 768`.
   Desktop web gets the sidebar layout; mobile web gets the hamburger/drawer
   just like the native APK.
   - **Files changed:** `App.tsx`, `ChatsListScreen.tsx`

2. **Ionicons font loading** â€” Icons rendered as empty squares on Vercel.
   Tried three approaches: CDN URL (wrong font version), `require()` (not
   resolved in static export), and finally **copying the TTF to `public/fonts/`
   and injecting a `@font-face` CSS rule at module load time**. The last
   approach works because `public/` files are copied to `dist/` without
   hashing.
   - **Files changed:** `App.tsx` (top-level `if` block)
   - **New file:** `frontend/public/fonts/Ionicons.ttf`
   - `Font.loadAsync(Ionicons.font)` also runs as a backup in a useEffect.

3. **Alert.alert on web** â€” Multi-button `Alert.alert` (Photo/Document/Cancel)
   does nothing on web. Two-argument `Alert.alert` (title + message) sometimes
   works via `window.alert` but is unreliable. Added `showAlert()` helper in
   `AuthScreen.tsx` and `ChatInput.tsx` that uses `window.alert` on web,
   native `Alert.alert` otherwise.
   - **CRITICAL BUG FOUND AND FIXED:** The global `.Replace('Alert.alert(', 'showAlert(')`
     also replaced the `Alert.alert` INSIDE the `showAlert` function itself,
     creating infinite recursion. On native, every alert silently crashed
     (stack overflow). This broke sign up AND login on the APK. Fixed by
     restoring `Alert.alert` inside the `showAlert` else-branch.

4. **SecureStore on web** â€” `expo-secure-store` throws on web. Added
   `secureGet/secureSet/secureDelete` wrappers in `ChatInput.tsx` that use
   `localStorage` on web, `SecureStore` on native. Draft persistence now
   works on both platforms.

5. **File upload on web (422 fix)** â€” React Native's `FormData` accepts
   `{uri, name, type}` objects, but browser `FormData` needs real `File`/`Blob`.
   Added a `Platform.OS === "web"` branch in `attachments.ts` that fetches
   the blob URL and wraps it in `new File([blob], ...)`.

6. **Attach menu on web** â€” The multi-button `Alert.alert` for
   Photo/Document/Cancel does nothing on web. Replaced with `pickFileWeb()`
   that creates a hidden `<input type="file">` accepting both images and
   documents. Browser's native file picker opens directly â€” no intermediate
   dialog.

7. **Enter-to-send on web** â€” Added `onKeyPress` handler to ChatInput's
   TextInput. On web: Enter sends, Shift+Enter adds newline (like ChatGPT).
   Native keyboard behavior untouched.

### Auth UX improvements (both APK and web)

8. **Friendly "wrong credentials" message** â€” Supabase returns "Invalid login
   credentials" for both wrong password and non-existent accounts. Now shows:
   "Wrong email or password. Don't have an account yet? Tap 'Create an account'
   below." instead of a generic "Error" alert.

9. **Landing page (new screen)** â€” First-time users and signed-out users now
   see a warm welcome page instead of going straight to login. Shows:
   - App orb + "Your Companion" branding
   - Three feature cards (talk, journal, privacy) â€” no app name in descriptions
     so it's future-proof if the name changes
   - "Get started" button â†’ sign up form
   - "I already have an account" button â†’ login form
   - Back arrow on auth screens returns to landing
   - Android hardware back button also returns to landing
   - Resets to landing on sign out
   - **New file:** `frontend/src/screens/LandingScreen.tsx`
   - **Modified:** `AuthScreen.tsx` (added `initialSignUp` and `onBack` props)
   - **Modified:** `App.tsx` (added `authView` state: `landing` | `signup` | `login`)

10. **Creator portfolio URL update** â€” Changed from `saphinpraja.vercel.app`
    to `saphinpraja.com.np` in `backend/app/ai/groq_provider.py`.

### Desktop web responsive layout

11. **Landing page** â€” Full-screen gradient, centered content, side-by-side
    buttons on desktop. Vertical stack on mobile.

12. **Auth screens** â€” Full-screen gradient with form constrained to
    `maxWidth: 440` centered. Back button inside the content area (not stuck
    in the far corner).

## 20.2 Files changed this session

### New files
- `frontend/src/screens/LandingScreen.tsx` â€” Welcome page with feature cards
- `frontend/public/fonts/Ionicons.ttf` â€” Ionicons font for web deployment

### Modified frontend files
- `frontend/App.tsx` â€” `isDesktopWeb`, font loading, `authView` landing flow
- `frontend/src/screens/AuthScreen.tsx` â€” `showAlert`, `initialSignUp`, `onBack`, friendly error, `maxWidth: 440`
- `frontend/src/screens/ChatsListScreen.tsx` â€” `isDesktopWeb` for hamburger/drawer
- `frontend/src/components/ChatInput.tsx` â€” `showAlert`, `secureGet/Set/Delete`, `pickFileWeb`, `handleKeyPress`
- `frontend/src/services/attachments.ts` â€” `Platform` import, web `File` blob handling

### Modified backend files
- `backend/app/ai/groq_provider.py` â€” Creator portfolio URL update

## 20.3 Code contracts added/changed

### `LandingScreen.tsx` props
```
type Props = {
  onGetStarted: () => void;   // navigates to sign up
  onLogin: () => void;        // navigates to login
};
```

### `AuthScreen.tsx` props (NEW â€” was propless before)
```
type Props = {
  initialSignUp?: boolean;    // default false â€” pre-sets sign up or login mode
  onBack?: () => void;        // shows back arrow, returns to landing
};
```

### `App.tsx` auth flow state
```
type AuthView = "landing" | "signup" | "login";
// Resets to "landing" on sign out via onAuthStateChange
```

### `isDesktopWeb` pattern (used in App.tsx and ChatsListScreen.tsx)
```
const IS_WEB = Platform.OS === "web";              // feature gating
const isDesktopWeb = IS_WEB && windowWidth >= 768;  // layout gating
```
- `IS_WEB` â†’ gates features: biometrics, push tokens, AppState lock, SecureStore
- `isDesktopWeb` â†’ gates layout: sidebar vs drawer, auth wrapper width

## 20.4 Bugs found and fixed this session

| # | Bug | Root cause | Fix |
|---|-----|-----------|-----|
| 73 | Icons empty squares on Vercel | Ionicons TTF not served in static export | Copy to `public/fonts/`, inject `@font-face` CSS |
| 74 | Attach menu does nothing on web | `Alert.alert` with 3 buttons is no-op on web | `pickFileWeb()` with hidden `<input type="file">` |
| 75 | File upload 422 on web | Browser FormData needs `File` not `{uri}` | Fetch blob, wrap in `new File()` |
| 76 | **Sign up and login completely dead on APK** | `showAlert` called itself recursively (infinite loop â†’ stack overflow) | Restore `Alert.alert` inside `showAlert` else-branch |
| 77 | "Invalid login credentials" unhelpful | Supabase returns same error for wrong password and non-existent account | Friendly message nudging toward "Create an account" |
| 78 | SecureStore crashes on web | `expo-secure-store` not supported on web | `localStorage` fallback wrappers |
| 79 | Auth screens stretched full-width on desktop web | No maxWidth constraint when wrapper removed | `maxWidth: 440` on inner content, gradient full-screen |
| 80 | Encoding bug "Ã¢â‚¬"" instead of em dash | UTF-8 encoding issue in PowerShell Set-Content | Replaced with simple hyphen |

## 20.5 Known web issues resolved from 19.7

- âœ… Sidebar icons empty squares â†’ fixed (public/fonts + @font-face)
- âœ… expo-secure-store on web â†’ fixed (localStorage fallback)
- âš ï¸ Voice recording on web â†’ works but with ~1.5s delay on start
- âŒ expo-speech on web â†’ still not implemented (hands-free TTS)

## 20.6 Commits this session

1. `"web: responsive mobile layout, fix Ionicons, web-safe alerts/attachments/storage"`
2. `"fix: AuthScreen recursive alert bug, update creator portfolio URL"`
3. `"auth: friendly error message for wrong credentials"`
4. `"feat: landing page, responsive auth, friendly login errors, back navigation"`

## 20.7 Still outstanding (carried from 19.9 + new)

- ðŸ”´ Rotate the exposed Supabase DB password AND `CRON_SECRET`. STILL not
  done across FOUR sessions now.
- ðŸŸ  Build a development build (`eas build --profile development`).
- ðŸŸ¡ Add FCM key to the `production` EAS profile.
- ðŸŸ¡ Delete the stale Expo Go row from `push_tokens`.
- ðŸŸ¡ Clear test uploads from `attachments` table + storage bucket.
- ðŸŸ¡ Consider per-attachment summary for multi-message document discussion.
- ðŸŸ¢ **NEW:** App-wide wallpaper/theme feature â€” user picks from gallery or
  presets, applies as background to every screen. Architecture planned
  (AppBackground wrapper, ThemeContext extension, WallpaperPickerScreen).
  Build in next session.
- ðŸŸ¢ **NEW:** expo-speech Web Speech API fallback for hands-free TTS on web.

## 20.8 Rules from this session

- **Never use global `.Replace('Alert.alert(', 'showAlert(')`.** It will
  replace the `Alert.alert` inside the `showAlert` function itself, creating
  infinite recursion. Always target specific occurrences or exclude the
  helper function definition.
- **`isDesktopWeb` for layout, `IS_WEB` for features.** Don't use `IS_WEB`
  to decide sidebar vs drawer â€” mobile browsers also report `web`.
- **Three approaches to web font loading were tried.** CDN URL fails (version
  mismatch), `require()` fails (not resolved in static export), `public/`
  folder works (files copied to `dist/` without hashing).
- **Browser `FormData` needs `File` objects, not `{uri, name, type}`.** The
  React Native shorthand only works on native. On web, fetch the blob URL
  and wrap in `new File([blob], fileName, { type })`.
- **`expo-secure-store` throws on web â€” always wrap with a platform check.**
  Use `localStorage` as fallback. Same pattern should be applied anywhere
  SecureStore is used.
- **Auth screen props are now optional.** `initialSignUp` defaults to `false`,
  `onBack` defaults to `undefined` (no back arrow). Existing callers work
  without changes.

# SECTION 21 â€” Session 21: Wallpaper picker, journal delete, profile cleanup, biometric fix (Aug 15, 2026)

## 21.1 What was done

1. **Wallpaper picker screen** â€” brand-new `WallpaperPickerScreen.tsx`.  Accessible from drawer (mobile hamburger menu) and `WebSidebar` (desktop web).  Contains:
   - Light / Dark / System appearance toggle (same segmented control as Profile)
   - "Choose from gallery" â€” picks an image with `expo-image-picker`, converts to base64 data URL, stores in AsyncStorage under key `custom_wallpaper`, rendered in `ThemeProvider` at 70 % opacity behind every screen
   - Theme preset grid â€” shows all themes on APK, only "Saphin" default on web (`Platform.OS !== "web"` filter)
   - "Reset to default" link when a non-default theme or custom wallpaper is active

2. **Journal entry delete** â€” each past-entry card now has an âœ• button (top-right).  Tap shows "Are you sure?" confirmation (web: `window.confirm`, mobile: `Alert.alert`).  Optimistic UI â€” entry vanishes immediately, rolls back if the server returns an error.
   - Backend: `DELETE /journal/{entry_id}` endpoint with user-ownership guard; hard delete (not soft â€” journal is not chat data, so rule 0.4's soft-delete mandate doesn't apply).
   - Frontend: new `deleteJournalEntry(entryId)` in `api.ts`.

3. **Profile screen cleanup** â€” removed the "Theme" label and `<ThemePicker />` component.  Profile now only shows the Appearance (Dark / Light / System) segmented control.  Theme cards live exclusively in the Wallpaper screen.

4. **Biometric prompt fix** â€” `maybeOfferBiometric()` in `App.tsx` now writes `biometric_prompt_shown = "1"` to AsyncStorage on first display and skips every future launch.  Previously it fired on every sign-in, which was frustrating.

5. **Transparent backgrounds** â€” every screen's root container changed from `backgroundColor: theme.background` to `backgroundColor: "transparent"` so the custom wallpaper (rendered in `ThemeProvider`) is visible everywhere.  App.tsx desktop row layout also made transparent.

## 21.2 Files changed this session (full paths)

### FRONTEND â€” new file
| Path | Notes |
|---|---|
| `frontend/src/screens/WallpaperPickerScreen.tsx` | **NEW**.  Wallpaper picker screen. |

### FRONTEND â€” modified
| Path | What changed |
|---|---|
| `frontend/App.tsx` | +import `WallpaperPickerScreen`; View3 union +`"wallpaper"`; +route between about and chat; +`onOpenWallpaper` prop on `ChatsListScreen` and `WebSidebar`; +`"wallpaper"` in back-handler list; desktop row `backgroundColor` â†’ `"transparent"`; `maybeOfferBiometric` stores AsyncStorage flag so it only fires once |
| `frontend/src/screens/ChatsListScreen.tsx` | +`onOpenWallpaper` in Props type, destructured props, and drawer item (`ðŸŽ¨  Wallpaper`); container `backgroundColor` â†’ `"transparent"` |
| `frontend/src/components/WebSidebar.tsx` | +`onOpenWallpaper` in Props type, destructured props, and `navItem("color-palette-outline", "Wallpaper", â€¦, "wallpaper")` |
| `frontend/src/screens/JournalScreen.tsx` | +`deleteJournalEntry` import; +`Ionicons` import; +`deletingId` state; +`handleDelete` with confirm; +âœ• button on each entry; container `backgroundColor` â†’ `"transparent"` |
| `frontend/src/screens/ProfileScreen.tsx` | âˆ’`import { ThemePicker } from "../theme/components"`; âˆ’Theme label; âˆ’`<ThemePicker />`; container `backgroundColor` â†’ `"transparent"` |
| `frontend/src/screens/ChatScreen.tsx` | container `backgroundColor` â†’ `"transparent"` (two occurrences) |
| `frontend/src/screens/RemindersScreen.tsx` | container `backgroundColor` â†’ `"transparent"` |
| `frontend/src/screens/GoalsScreen.tsx` | container `backgroundColor` â†’ `"transparent"` |
| `frontend/src/screens/AboutScreen.tsx` | container `backgroundColor` â†’ `"transparent"` |
| `frontend/src/services/api.ts` | +`deleteJournalEntry(entryId: string): Promise<void>` â€” `DELETE ${API_URL}/journal/${entryId}` with `await authHeaders()` |
| `frontend/src/context/ThemeContext.tsx` | +`Image` import; +`CUSTOM_WP_KEY` const; +`customWp` state loaded from AsyncStorage; +`setCustomWallpaper` function; +context type & value updated; +`<View pointerEvents="none"><Image â€¦opacity 0.7 /></View>` render layer.  **Imports use `"../theme/types"` and `"../theme/registry"`** (correct for `src/context/` location). |
| `frontend/src/theme/ThemeContext.tsx` | Identical changes to context/ copy.  **Imports use `"./types"` and `"./registry"`** (correct for `src/theme/` location). |
| `frontend/src/theme/registry.ts` | UNCHANGED â€” still exports `[defaultTheme, onePieceTheme, ...natureThemes]` |

### BACKEND â€” modified
| Path | What changed |
|---|---|
| `backend/app/api/journal.py` | +`import HTTPException`; +`DELETE /journal/{entry_id}` endpoint (ownership-guarded, hard delete, returns `{"ok": true}` or 404) |
| `backend/app/repositories/journal_repository.py` | +`delete_entry(db, user_id, entry_id) â†’ bool` â€” selects by id+user_id, deletes, flushes |

## 21.3 Code contracts added/changed

### Add to Section 3.6 (`api.ts` exports):
```
deleteJournalEntry(entryId: string): Promise<void>
```

### Add to Section 3.9 (`ChatsListScreen.tsx` props):
```
onOpenWallpaper: () => void;
```

### Add to Section 3.10 (View3 union):
```typescript
| { name: "wallpaper" };
```

### ThemeContext â€” new exports on `useTheme()` return type:
```typescript
customWallpaper: string | null;
setCustomWallpaper: (uri: string | null) => void;
```

### AsyncStorage keys (new):
```
"custom_wallpaper"         â€” base64 data URL string, or absent
"biometric_prompt_shown"   â€” "1" after first prompt, or absent
```

### Backend endpoint (new):
```
DELETE /journal/{entry_id}  â†’  { "ok": true }   (auth required, 404 if not found or not owned)
```

## 21.4 Bugs found and fixed this session (continuing Section 11 numbering)

| # | Description | Cause | Fix |
|---|---|---|---|
| 81 | ThemeContext tsc errors (`Cannot find module './types'`) after copying to `src/context/` | File was written with `"./types"` imports but placed in `src/context/` where the path should be `"../theme/types"` | Adjusted imports per directory; both copies now have correct paths |
| 82 | `pointerEvents` prop on `<Image>` â€” tsc error | RN `Image` doesn't accept `pointerEvents`; only `View` does | Wrapped `Image` in `<View pointerEvents="none">` |
| 83 | `deleteJournalEntry` duplicated in `api.ts` â€” tsc "duplicate function" error | PowerShell `.Replace()` injected the function twice | Removed bad copy by line-number range |
| 84 | `deleteJournalEntry` used `authHeaders()` without `await` â€” type error | Didn't check existing call-site pattern (`await authHeaders()`) | Added `await` |
| 85 | Journal delete: entry reappears after deletion | Backend not deployed â€” old code has no DELETE endpoint, returns 404, frontend rolls back | Pushed backend changes, Render auto-deployed |
| 86 | Custom wallpaper not visible on any screen | Every screen had `backgroundColor: theme.background` (solid) covering the wallpaper rendered in ThemeProvider underneath | Changed all screens + App.tsx desktop layout to `backgroundColor: "transparent"` |
| 87 | Biometric "Enable quick unlock?" popup on every app launch | `maybeOfferBiometric()` had no memory of past prompts â€” ran on every `SIGNED_IN` event | Added AsyncStorage flag `biometric_prompt_shown`; function checks and skips if already set |

## 21.5 CRITICAL â€” ThemeContext lives in TWO places

```
frontend/src/theme/ThemeContext.tsx      â† imports ./types, ./registry
frontend/src/context/ThemeContext.tsx    â† imports ../theme/types, ../theme/registry
```

**Both files must stay in sync.**  They are identical except for the two import paths.  Bug #81 happened because we copied one to the other without adjusting paths.

**Rule: when editing ThemeContext, ALWAYS update BOTH copies with correct import paths for each location.**

## 21.6 Architecture decisions

### D25 â€” Custom wallpaper storage
Custom wallpaper stored as base64 data URL in AsyncStorage (key: `custom_wallpaper`).  On web, `FileReader.readAsDataURL` from blob.  On mobile, `expo-file-system.readAsStringAsync` with Base64 encoding.  Quality 0.3 via `expo-image-picker` to keep size manageable.  Rendered in `ThemeProvider` as `<Image â€¦ opacity={0.7} resizeMode="cover" />` inside a `<View pointerEvents="none">` wrapper.  All screen containers made transparent so the wallpaper shows through.

### D26 â€” Web-only theme filter
`WallpaperPickerScreen.tsx` filters `themes.filter(def => Platform.OS !== "web" || def.id === "default")`.  Registry (`src/theme/registry.ts`) unchanged â€” all themes still registered for APK.  Only the picker UI hides them on web.

### D27 â€” Journal hard delete
Journal entries are hard-deleted (not soft-deleted).  Rule 0.4's soft-delete mandate applies to chat data only.  Journal entries have no downstream references, so hard delete is safe.

## 21.7 Commits this session

```
feat: wallpaper picker, journal delete, profile cleanup
fix: transparent backgrounds for wallpaper visibility, web-only theme filter, opacity bump
fix: biometric prompt shows once only
```

## 21.8 Still outstanding (carried from 20.7 + new)

- ðŸ”´ **Rotate Supabase DB password and `CRON_SECRET`** â€” flagged since Session 17, STILL not done
- ðŸŸ  Build a dev build (`eas build --profile development`) â€” saves build-cycle time
- ðŸŸ¡ Add FCM key to `production` EAS profile; delete stale Expo Go push token row
- ðŸŸ¡ Clear test attachment uploads from Supabase Storage
- ðŸŸ¡ Consider per-attachment summaries for multi-turn document discussion
- ðŸŸ¡ **Custom wallpaper on APK** â€” needs on-device testing.  expo-image-picker + expo-file-system base64 path is coded but untested on real device.  May be slow for large images â€” consider filesystem copy instead of base64 if performance is bad.
- ðŸŸ¡ **Navigation reset on sidebar switch** â€” clicking sidebar items (Journal â†’ Wallpaper â†’ Journal) passes through home.  Each back button does `setView({ name: "list" })`.  Not broken but adds an extra step on desktop web.
- ðŸŸ¢ App-wide wallpaper/theme picker â€” DONE (this session)
- ðŸŸ¢ Web Speech API fallback for `expo-speech` on web (TTS doesn't work in-browser)

## 21.9 Rules from this session

1. **ThemeContext has two copies** â€” always update both with correct import paths (see 21.5).
2. **PowerShell `.Replace()` with template literals is dangerous** â€” `${}` gets expanded.  Use line-insertion by array index for JS template strings.
3. **Check `await` on async helpers** â€” `authHeaders()` is async; every call site uses `await authHeaders()`.
4. **Don't blind-replace across files** â€” verify every occurrence with `Select-String` first, then apply.
5. **Backend must be deployed for new endpoints** â€” frontend optimistic UI will roll back if the server returns 404.  Always `git push` backend changes before testing.

## 21.10 Amendments to earlier sections

### Section 0.1 â€” update "where we are":
Session 21 (Aug 15 2026) added wallpaper picker screen with custom gallery wallpaper, journal entry delete, removed ThemePicker from Profile, fixed biometric prompt to show once only.  APK build triggered.  Web deployed to Vercel.

### Section 2 â€” add to project structure under `frontend/src/screens/`:
```
WallpaperPickerScreen.tsx   # Wallpaper picker (themes + custom gallery + appearance toggle)
```

### Section 3.10 â€” View3 union now includes `| { name: "wallpaper" }`.

### Section 8 â€” Theme system:
Custom wallpaper support added to ThemeContext (both copies).  New AsyncStorage key `custom_wallpaper`.  All screen containers changed to `backgroundColor: "transparent"`.  Nature themes hidden on web via Platform filter in WallpaperPickerScreen (registry unchanged).

### Section 11 â€” append bugs #81â€“#87 (see 21.4).

# SECTION 22 - Session 22: Web tab-switch fix, goal delete, Groq model outage + fix, web sidebar pin/rename/remove

> **This is the NEWEST section. Read it first. It OVERRIDES earlier sections
> where they conflict.**

## 22.1 What was done

1. **Web view-reset bug fixed.** Switching browser tabs and coming back (or Supabase
   silently re-authenticating) was dumping the user back to the home screen from
   wherever they were - chat, journal, goals, etc. Root cause: onAuthStateChange
   in App.tsx called setView({ name: "list" }) on every single auth event,
   including TOKEN_REFRESHED and re-fired SIGNED_IN events on tab refocus (not
   just real logins). Fixed with a wasAuthed ref that tracks whether the user was
   already authenticated; the view only resets on a genuinely fresh login or sign-out.

2. **Goal delete added** (parity with journal delete from Session 21). Each goal now
   has an X button with a confirm dialog (web: window.confirm, mobile: Alert.alert).
   Hard delete - goals are not chat data, so rule 0.4's soft-delete mandate doesn't
   apply (same reasoning as journal, D27).
   - Bug found and fixed: the first version of delete_goal() used db.flush()
     instead of db.commit(). The delete appeared to work (optimistic UI removed the
     row) but was never actually persisted - the goal reappeared on next load. Fixed
     by switching to db.commit().

3. **Groq retired llama-3.3-70b-versatile - total chat outage, now fixed.** The
   model that powered every AI feature (groq_provider.py, checkin_writer.py,
   journal_reflector.py, memory_extractor.py, mood_detector.py) was pulled from
   Groq's platform without us doing anything. Every chat request failed with
   openai.NotFoundError: 404 model_not_found. Diagnosed via Render's Logs tab
   (NOT the Events tab - Events only shows deploy status, Logs shows runtime
   tracebacks). Fix went through two attempts:
   - First attempt - qwen/qwen3.6-27b: worked, but the model emits <think>...
     </think> reasoning blocks that leaked into the chat UI. Stripped with a regex
     in groq_provider.py, but the regex only matched closed tags - when the model
     hit the token limit mid-thought, the </think> never appeared, the whole block
     was unclosed, and the regex let it through raw. Worse, on some replies the model
     spent its entire token budget thinking and returned nothing else at all (empty
     bubble in the UI).
   - Final fix - switched to openai/gpt-oss-120b across all five files. No
     thinking-block behavior, clean direct replies, memory/personality/mood context
     all confirmed still working correctly on web. The think-tag-stripping regex was
     left in place in groq_provider.py as a defensive safety net (now also catches
     unclosed tags, not just closed ones) in case a future model swap reintroduces
     the behavior.

4. **Web sidebar now has Pin / Rename / Remove.** WebSidebar.tsx previously only
   let you open a chat - no parity with the mobile drawer's long-press menu. Added a
   three-dot button per chat row that opens a small dropdown with Pin/Unpin,
   Rename, and Remove. Reuses the existing renameSession, setSessionPinned,
   removeSession API functions (no backend changes needed - these endpoints already
   existed for mobile). Web-native window.prompt for rename and window.confirm
   for remove (no native Alert.alert equivalent on web).

## 22.2 Files changed this session (full paths)

### FRONTEND - modified
| Path | What changed |
|---|---|
| frontend/App.tsx | +wasAuthed ref; onAuthStateChange only calls setView({name:"list"}) on fresh SIGNED_IN (when !wasAuthed.current) or sign-out - not on token refresh / re-auth on tab focus; getSession() on mount sets wasAuthed.current = true if a session is found |
| frontend/src/screens/GoalsScreen.tsx | +Platform, Ionicons imports; +deletingId state; +handleDelete (web window.confirm / mobile Alert.alert, optimistic UI with rollback); +X button next to "Done" on each goal row |
| frontend/src/services/api.ts | +deleteGoal(id: string): Promise<void> - DELETE API_URL/goals/id with await authHeaders() |
| frontend/src/components/WebSidebar.tsx | +imports renameSession, setSessionPinned, removeSession; +menuFor state; +handlePin/handleRename/handleRemove functions; chat row now has a three-dot button that toggles a dropdown (Pin/Unpin, Rename, Remove); +dropdown/dropdownItem styles |

### BACKEND - modified
| Path | What changed |
|---|---|
| backend/app/repositories/goal_repository.py | +delete_goal(db, user_id, goal_id) returns bool - selects by id+user_id, db.delete(row), db.commit() (see bug below) |
| backend/app/api/goals.py | +HTTPException import; +DELETE /goals/{goal_id} endpoint (ownership-guarded, 404 if not found/not owned, returns ok true) |
| backend/app/ai/groq_provider.py | model changed from llama-3.3-70b-versatile to qwen/qwen3.6-27b to openai/gpt-oss-120b (final); +import re; +think-tag stripping regex (now catches both closed and unclosed think blocks); +system prompt line telling the model not to use think tags (kept as defense-in-depth) |
| backend/app/ai/checkin_writer.py | MODEL changed to openai/gpt-oss-120b |
| backend/app/ai/journal_reflector.py | model changed to openai/gpt-oss-120b |
| backend/app/ai/memory_extractor.py | model changed to openai/gpt-oss-120b |
| backend/app/ai/mood_detector.py | model changed to openai/gpt-oss-120b |

Note: backend/app/ai/vision_reader.py still has a comment mentioning the old
model name. It's a comment only, not a live reference - harmless, but worth a
one-line cleanup next session.

## 22.3 Code contracts added/changed

Add to Section 3.6 (api.ts exports):

    deleteGoal(id: string): Promise<void>

Backend endpoint (new):

    DELETE /goals/{goal_id}  returns { "ok": true }   (auth required, 404 if not found or not owned)

Active AI model (supersedes Section 1.2 - "Active = Groq, llama-3.3-70b-versatile"):

    Active AI model: openai/gpt-oss-120b  (via Groq's OpenAI-compatible endpoint)

This is now the single source of truth for the active model across ALL 5 files that
call Groq. If it changes again, grep for the old model string across
backend/app/ai/*.py before considering the swap done.

## 22.4 Bugs found and fixed this session (continuing Section 21 numbering)

| # | Description | Cause | Fix |
|---|---|---|---|
| 88 | Web: switching tabs/returning to the app resets the current screen to home | onAuthStateChange called setView on every event, including token-refresh and re-fired SIGNED_IN on tab refocus | wasAuthed ref - view only resets on a genuinely fresh login or sign-out |
| 89 | Goal delete appears to work, then the goal comes back after navigating away and back | delete_goal() used db.flush() instead of db.commit() - never persisted | Changed to db.commit() |
| 90 | Total chat outage - every AI feature down | Groq retired llama-3.3-70b-versatile server-side with no warning; all 5 files referencing it got 404 model_not_found | Swapped to openai/gpt-oss-120b across all 5 files after a failed interim attempt with qwen/qwen3.6-27b |
| 91 | AI replies showed raw think-tag reasoning blocks in the chat UI (on qwen/qwen3.6-27b) | Reasoning-model behavior; initial regex only matched closed tags | Switched models away from the thinking model; also hardened the regex to catch unclosed think blocks as a safety net |
| 92 | AI replies came back completely empty (blank bubble) | Same root cause as 91 - model spent its full token budget inside an unclosed think block, leaving nothing after stripping | Resolved by the model swap in 90/91 |

## 22.5 Rules learned this session

1. A third-party model string can be retired without warning. When chat breaks
   with no code change on our side, check Render Logs FIRST (not Events), before
   touching any code.
2. The active AI model name lives in 5 separate files, not one constant. Worth
   refactoring into app/core/config.py someday so a swap is a one-line change.
3. Not all Groq models are safe drop-in replacements. A reasoning model can
   silently change the response shape by injecting think blocks or return empty
   replies. Test manually before adopting a new model for the chat-reply path.
4. db.flush() is not db.commit(). Flush sends pending changes within the
   current transaction; commit makes them durable. Worth an audit of other
   repositories for the same mistake.
5. window.prompt / window.confirm are the correct web equivalents for
   Alert.alert-style prompts when no custom modal exists yet.
6. PowerShell here-strings pasted interactively can silently eat content: a
   line consisting only of triple backticks (markdown code fence) ends in a
   backtick, which is PowerShell's line-continuation character, and the console
   swallows what follows. Avoid triple-backtick fences in anything pasted
   directly into an interactive PowerShell prompt - use 4-space indented code
   blocks instead, or write the content to a .ps1 file and dot-source it.

## 22.6 Still outstanding (carried from 21.8 + new)

- RED: Rotate Supabase DB password and CRON_SECRET - flagged since Session 17,
  STILL not done. Explicitly deferred by the owner's own choice this session.
- ORANGE: Build a dev build (eas build --profile development) - still not done.
- YELLOW: Add FCM key to production EAS profile; delete stale Expo Go push token row.
- YELLOW: Clear test attachment uploads from Supabase Storage.
- YELLOW: Consider per-attachment summaries for multi-turn document discussion.
- YELLOW: Custom wallpaper on APK - still needs on-device testing.
- YELLOW: Navigation reset on sidebar switch (desktop web) - still open, cosmetic.
- YELLOW NEW: Clean up the stale model-name comment in vision_reader.py.
- YELLOW NEW: Consider refactoring the AI model name into one shared constant.
- GREEN: Web tab-switch view reset - FIXED (this session).
- GREEN: Goal delete - FIXED (this session), parity with journal delete.
- GREEN: Web sidebar pin/rename/remove - DONE (this session), parity with mobile drawer.

## 22.7 Commits this session

    fix: preserve web view state on tab switch (no more reset to home)
    feat: goal delete (backend endpoint + frontend UI with confirmation)
    fix: goal delete uses commit instead of flush
    fix: switch AI model from retired llama-3.3-70b to qwen3.6-27b
    fix: strip Qwen think tags from chat responses
    fix: switch to openai/gpt-oss-120b (no thinking tags)
    feat: pin/rename/remove menu on web sidebar chat list

## 22.8 Amendments to earlier sections

### Section 0.1 - update "where we are":
Session 22 fixed a web navigation bug (tab-switch reset to home), added goal delete
(parity with journal), survived and fixed a total chat outage caused by Groq retiring
llama-3.3-70b-versatile (now on openai/gpt-oss-120b), and added pin/rename/remove
to the web sidebar (parity with mobile drawer).

### Section 1.2 - AI model:
Active = Groq, model openai/gpt-oss-120b (supersedes llama-3.3-70b-versatile,
which Groq retired - see 22.1 #3). Claude + Gemini providers still exist but inactive.

### Section 1.2 / Section 2 - project root path correction:
Root is actually C:\Users\saphi\OneDrive - xuno.co\Desktop\Ai-Companion, not
C:\Users\saphi\Desktop\Ai-Companion as documented in Section 2. The OneDrive
prefix was missing from the original handover. Use the correct path in all future
terminal commands.

### Section 3.6 (api.ts exports) - add:

    deleteGoal(id: string): Promise<void>

### Section 11 - append bugs #88-#92 (see 22.4).

# SECTION 23 - Session 23: Lamplight warm redesign, typography, launch animation, friend-register AI, retired vision model (Oct 11, 2026)

> **This is the NEWEST section. Read it first. It OVERRIDES earlier sections
> where they conflict.**

## 23.1 What was done

Two separate pieces of work, plus a full read-through audit of the files no
earlier session had opened.

**A. Visual redesign (FRONTEND).** The owner asked whether the app's UI/UX was
good enough for an international presentation. Honest answer given: no, not yet,
and the reasons were specific rather than vague. The palette was cool throughout
(`#0f1419` blue-black, `#7c6cf0` indigo, `#8b8ba7` lavender-grey), there was no
typeface at all, almost no motion, and the home screen was ~60% empty on desktop.
Three warm directions were built as standalone animated HTML samples and the
owner chose "Lamplight".

**B. AI personality (BACKEND).** The owner noticed replies were "too long... more
likely AI rather than friends" and sent a screenshot of the companion answering
"today is so boring day" with a numbered three-step framework and raw `**bold**`
markdown. Root cause was prompt, not UI.

**C. Audit.** The owner asked "did you analyse every file of this project?" The
honest answer was no (~20 of ~70). A proper read-through followed and found the
items in 23.5.

## 23.2 The Lamplight palette (D28)

Warmth is a hue-temperature property. It cannot be reached by adjusting opacity
or radius - every hue in the old palette was blue-biased, so every hue was
rotated warm. Both variants were contrast-checked to WCAG AA (4.5:1 body text).

**Dark:** `background #15110e`, `surface #221b16`, `textPrimary #f6efe8` (16.7:1),
`textSecondary #a89585` (6.6:1), `accent #e8956b` apricot (8.1:1),
`accentText #241710` (7.5:1), `bubbleUser #a05939`, `bubbleUserText #fff6f0`
(4.9:1), `bubbleCompanion #2a211b`, `danger #ef6b5e`.

**Light:** `background #faf6f1`, `surface #ffffff`, `surfaceAlt #f1e9e0`,
`textPrimary #2e2520` (14:1), `textSecondary #7a6b60` (4.8:1),
`accent #ad5330` burnt sienna (4.8:1), `accentText #fff8f3` (4.9:1).

**The two pairs with the least headroom are `bubbleUser` and `textSecondary`.
Do not lighten either without re-checking contrast.** Both are commented inline.

**Interaction with the custom wallpaper (D25) - verified, not assumed.**
`ThemeContext` paints `theme.background`, then renders the user's gallery photo
on top at `opacity: 0.7`. So 30% of `background` bleeds through every custom
wallpaper. A warm ground now tints the user's own photo warm. The feature did
not need reworking; it improved.

## 23.3 Typography system (D29) - `frontend/src/theme/typography.ts` (NEW)

Before this session every word in the app was Android's Roboto. `expo-font` was
present only as `@expo/vector-icons`' peer dependency (mistake #48) and loaded
nothing.

- **Fraunces SemiBold** for display, **Figtree** Regular/SemiBold/Bold for
  everything else. Four static per-weight TTFs, ~193 KB total.
- **Zero new dependencies.** The TTFs were extracted from the
  `@expo-google-fonts` packages with `npm install --no-save`, copied out, and
  the packages removed. `package.json` gained no font entries.
- **Files live in TWO places and must stay in sync:**
  `frontend/assets/fonts/` (native, loaded by `expo-font`) and
  `frontend/public/fonts/` (web, served unhashed by the static export).
  Web gets an injected `@font-face` block in `App.tsx` - the same approach that
  was the only one to survive bug #73. **Miss the `public/` copy and the font
  silently falls back to system on the Vercel build only.**
- **NEVER combine these families with `fontWeight`.** On Android a custom font
  plus `fontWeight` either does nothing or renders a broken synthesised bold.
  Weight comes from choosing the family. Every `fontWeight` was removed from
  the styles converted so far.
- Scale (1.25 ratio off 15px): `display 32 / h1 25 / h2 19 / title 16 /
  body 15 / bodyStrong 15 / label 13 / caption 12 / button 16 / overline 11`.
  This replaces six ad-hoc sizes that existed across Landing and Auth alone.

**Converted so far:** `LandingScreen`, `ChatsListScreen` (greeting, drawer,
recents), `WebSidebar`, `IntroScreen`.
**Still on the system font:** `ChatScreen`, `ChatBubble`, `ChatInput`,
`ProfileScreen`, `AuthScreen`, `Journal`, `Goals`, `Reminders`, `About`,
`Wallpaper`, `Lock`. Chat bubbles looking unchanged is expected, not a bug.

## 23.4 Launch animation (D30) - `frontend/src/components/IntroScreen.tsx` (NEW)

"Orb bloom": the orb springs up from 0.3 scale while a ring of warm light
expands past the screen edge and dissolves; the wordmark rises underneath.

- Plays in the gap that **already existed** at launch (`!ready || !fontsReady`,
  where a bare `ActivityIndicator` used to sit). It adds no waiting.
- Built on RN's built-in `Animated`, `useNativeDriver: true`, **transform and
  opacity only**. No new packages. `react-native-reanimated` was deliberately
  NOT installed - no dev build exists, so each attempt would cost a 40-90 min
  preview build, and it can lag cheap phones.
- Three safeguards, all load-bearing:
  1. `introDone` lives in `Root`'s state, so it plays **once per process** and
     never replays on a biometric unlock or a web tab refocus.
  2. Initialises to `IS_WEB`, so a browser reload never plays it.
  3. `onDone()` fires **unconditionally** in the animation callback. A
     half-faded intro that never clears would be the worst possible failure.
- `INTRO_BG` (`#15110e`) **must match `app.json` -> `splash.backgroundColor`**
  or the native splash flashes a different colour before the intro. Both were
  changed from `#2a2350`, along with `adaptiveIcon.backgroundColor`.
- **Never tested on a device.** It is web-skipped by design and there is no dev
  build, so the APK from this session is its first real run.

## 23.5 The AI now talks like a friend (BACKEND)

The entire brevity instruction used to be one line - *"Keep replies
conversational and not overly long."* `openai/gpt-oss-120b` ignores that.

**`app/ai/groq_provider.py`:**
- Concrete rules replace the vague one: 1-3 sentences by default, match their
  length, **no markdown of any kind**, no advice unless asked (stated outright:
  *"a friend does not answer 'today was boring' with a three-step plan"*), at
  most one question, no pep-talk sign-offs, at most one emoji.
- **Humour** is now explicit and expected in ordinary and good moments, and
  dropped entirely the moment someone sounds genuinely upset.
- **Quotes when low:** roughly one message in three, short, simple, widely
  known. **Only quotes it is confident are real; if unsure of the author, say
  the line with no name. Never invent an attribution.** A quote stands
  *instead of* advice, never on top of it.
- `FORMAT_REMINDER` is a module constant appended **last**, after the
  personality and tone blocks, because instructions nearest the end carry the
  most weight and those blocks pull back toward assistant mode.
- `_clean()` now strips markdown as well as `<think>` tags - unwrapping
  `**bold**` and `__underline__` and heading hashes while keeping the words.
  Single asterisks and hyphens are deliberately left alone ("5-10 min",
  "3 * 4" appear in ordinary prose). Unit-tested against the exact string from
  the owner's screenshot.

**`app/api/chat.py`:** `tone_context` now branches on `mood_detector`'s own
vocabulary and intensity, so the register swing is explicit rather than guessed:
- low moods (`sad anxious stressed lonely angry tired`) at intensity >= 3 -> no
  jokes, stay with it, a simple line may fit at the end
- same moods below 3 -> warm and easy, very light humour allowed
- `happy excited grateful` -> be playful, tease, join in
- otherwise -> relaxed and curious

`MOTIVATOR` no longer says *"nudge them toward positive action with concrete,
doable next steps"* - that was list bait. It now suggests ONE small thing in a
sentence.

**Verified live against the real prompt before shipping:**
- *"today is so boring day"* -> "Boring, huh? Did you try convincing your coffee
  to do a dance?"
- *"I lost my grandmother last month..."* -> "I'm really sorry you're going
  through this, it sounds like the grief is hitting you extra hard today.
  'Those we love never truly leave us.'"
- *"I finally finished my portfolio site..."* -> "Congrats, you're basically the
  internet's newest design guru now."

## 23.6 CRITICAL - gpt-oss-120b is a REASONING model

Section 22 chose it because it has "no thinking tags". That is true of the
**visible reply** - the reasoning comes back in a separate `reasoning` field, so
nothing leaks into the bubble. But **the reasoning is billed against
`max_tokens` before any visible text is produced.** Measured:

| `max_tokens` | finish_reason | content |
|---|---|---|
| 20 | `length` | **EMPTY** - reasoning consumed the whole budget |
| 100 | `length` | cut off mid-word |
| 500 (no system prompt) | `length` | still truncated |

**This session briefly lowered `max_tokens` to 500 and that was a mistake - it
nearly reintroduced bug #92.** It is back at **1024**. Brevity comes from the
prompt, never from this number. There is a comment on that line saying so.

`reasoning_effort="low"` was added: reasoning drops from ~379 chars to ~23 and
total completion tokens roughly 4x (126 -> 31) with no quality loss across sad,
happy and neutral messages. On Groq's free tier that is directly fewer
rate-limit problems and faster replies. **`"none"` is rejected by this model -
only `low`/`medium`/`high`.** (`vision_reader` uses `"none"` on Qwen, which is
a different model and does accept it.)

## 23.7 CRITICAL - Groq retired the vision model, silently

The owner asked about free models. Listing the account revealed **11 models,
not the 15 Section 16.1 documents**, and `qwen/qwen3.6-27b` was gone.

**Image reading had been silently broken in production.** `vision_reader`
catches all exceptions and returns `None`, so an attached photo produced no
error - the companion simply behaved as if no image had been sent.

Fixed to **`qwen/qwen3.8-27b`**, verified with the Section 16.1 probe trick:
sending a 1x1 PNG returned *"Image must have at least 32 pixels in each
dimension"*, which only a model that decoded the image can say.
**Note: the threshold is 32px now, not the 2px recorded in 16.1.**

**Current account inventory (verified live, Oct 11 2026):**

| Purpose | Model | Backup available |
|---|---|---|
| chat | `openai/gpt-oss-120b` | `openai/gpt-oss-20b` |
| images | `qwen/qwen3.8-27b` | **NONE - only vision model on the account** |
| voice | `whisper-large-v3-turbo` | `whisper-large-v3` |

Also present: `allam-2-7b`, two `llama-prompt-guard-2` safety filters,
`openai/gpt-oss-safeguard-20b`, two `canopylabs/orpheus` TTS models.

**Listing the account does not require a working API call - but a listed model
can still be wrong for the job. Probe it.** A `403 Forbidden` on the models
endpoint is fixed by sending a browser User-Agent, exactly as with the Supabase
JWKS fetch (mistake #7).

**RECOMMENDED RECURRING CHECK:** ask a future session to re-check the Groq
account against what the code uses. It takes one command and catches this class
of silent breakage before a user does. This is now the second time Groq has
retired a model out from under this project.

## 23.8 Model names are now ONE setting (supersedes 22.5 rule 2)

The model name used to be written out in five files. It is now in
`app/core/config.py` as pydantic settings with defaults:

```python
groq_model: str = "openai/gpt-oss-120b"
groq_vision_model: str = "qwen/qwen3.8-27b"
groq_transcribe_model: str = "whisper-large-v3-turbo"
```

**Because they are settings, not constants, the next retirement is an env var
in Render -> Environment plus a restart. No code change, no git push, no deploy
wait while chat is down.** Env var names are the uppercase forms: `GROQ_MODEL`,
`GROQ_VISION_MODEL`, `GROQ_TRANSCRIBE_MODEL`.

**Choose a replacement carefully:** a reasoning model that emits `<think>`
blocks breaks the chat reply path (bugs #91/#92). Probe before adopting.

## 23.9 The fallback providers were never usable

`api/chat.py` calls `generate_reply(message, history=, memory_context=,
personality_context=, tone_context=)`. Both `claude_provider` and
`gemini_provider` accepted **one argument**, and `base.py`'s ABC declared the
one-argument signature too. Swapping `provider_factory` would have thrown
`TypeError` on the first message. **D5's promise that swapping providers is a
one-file change was false** - and Section 22's outage is exactly when it would
have mattered.

Fixed: the ABC now declares the real signature, both providers accept all four
kwargs and use them, and both import `COMPANION_SYSTEM_PROMPT` and
`FORMAT_REMINDER` from `groq_provider` so a swap keeps the same personality.
Gemini's history is translated (`assistant` -> `model`).

**Important context the owner supplied: Groq is used because it is FREE.**
Claude costs money and Gemini's free tier was zero-quota in Nepal (mistakes #8,
#9). So **neither fallback is usable today.** The real failover for this project
is a different free Groq model (23.7/23.8), not a different provider. The
provider fix is worth having, but it is not the insurance policy - it was
over-weighted when first presented, and that was corrected.

`claude-sonnet-4-6` was verified as still a current, valid model ID and left
unchanged - picking a different model is a cost decision for the owner.

## 23.10 Files changed this session

### BACKEND - modified
| Path | What changed |
|---|---|
| `app/ai/groq_provider.py` | new companion prompt (brevity, humour, quotes); `FORMAT_REMINDER` constant; `_clean()` strips markdown + think tags; `max_tokens` 1024; `reasoning_effort="low"`; model from settings |
| `app/api/chat.py` | `tone_context` branches on mood + intensity; MOTIVATOR no longer asks for step lists |
| `app/core/config.py` | +`groq_model`, +`groq_vision_model`, +`groq_transcribe_model` |
| `app/ai/base.py` | ABC signature corrected to match reality; mistake #3's literal `'"'"'` corruption removed |
| `app/ai/claude_provider.py` | accepts all four kwargs, shares the Groq prompt |
| `app/ai/gemini_provider.py` | same, plus `assistant`->`model` history translation |
| `app/ai/checkin_writer.py` `journal_reflector.py` `memory_extractor.py` `mood_detector.py` `transcriber.py` `vision_reader.py` | model name now from settings; vision_reader's stale `llama-3.3-70b` comment fixed |

### FRONTEND - new
| Path | Notes |
|---|---|
| `src/theme/typography.ts` | font families, `fontAssets`, the type scale |
| `src/components/IntroScreen.tsx` | orb bloom launch animation |
| `assets/fonts/*.ttf` (4) | native font files |
| `public/fonts/*.ttf` (4) | web copies - must stay in sync with assets/ |

### FRONTEND - modified
| Path | What changed |
|---|---|
| `src/theme/themes/default/index.ts` | Lamplight palette, both variants |
| `App.tsx` | `fontAssets` loaded; web `@font-face` block extended to 5 families; `introDone` state + intro gate before the spinner |
| `app.json` | `splash.backgroundColor` and `adaptiveIcon.backgroundColor` `#2a2350` -> `#15110e` |
| `src/screens/LandingScreen.tsx` | warm recolour + type scale |
| `src/screens/AuthScreen.tsx` | warm recolour |
| `src/screens/ChatsListScreen.tsx` | type scale on greeting, drawer, recents |
| `src/components/WebSidebar.tsx` | type scale |
| `package.json` / `package-lock.json` | `expo` and `expo-local-authentication` patch bump for 18/18 |

## 23.11 Code contracts added/changed - ADD TO SECTION 3

### Section 3.3 CORRECTION - `get_current_user_id` returns `str`, NOT `uuid.UUID`

`auth/dependencies.py` is annotated `-> str` and returns `payload.get("sub")`.
**FastAPI does not coerce `Depends()` results**, so despite every endpoint
writing `user_id: uuid.UUID = Depends(get_current_user_id)`, the value is a
`str` at runtime. It works because SQLAlchemy accepts strings for UUID columns
and `str(user_id)` is a harmless no-op. **But Section 3.3 said `uuid.UUID`, and
anyone trusting that and calling `user_id.hex` gets an `AttributeError`.** This
is bug #41's class living inside the document written to prevent bug #41.

### Section 3.8 - `ChatScreen.tsx` props (was 3, is 4)
```ts
sessionId: string | null;
onBack: () => void;
initialMessage?: string | null;
initialAction?: "record" | "photo" | "document" | null;
```

### Section 3.9 - `ChatsListScreen.tsx` props (was 7, is 9)
```ts
onOpenChat, onStartChatWithMessage, onStartChatWithAction,
onOpenProfile, onOpenJournal, onOpenReminders, onOpenGoals,
onOpenAbout, onOpenWallpaper
```
`onStartChatWithAction` had never been in Section 3 at all - only in 18.3 prose.

### Section 3.10 - `View3` union (8 variants)
```ts
| { name: "list" }
| { name: "chat"; sessionId: string | null;
    initialMessage?: string | null;
    initialAction?: "record" | "photo" | "document" | null }
| { name: "profile" } | { name: "journal" } | { name: "reminders" }
| { name: "goals" }   | { name: "about" }   | { name: "wallpaper" }
```

### Section 3.11 (NEW) - `WebSidebar.tsx` props - had no entry at all
```ts
onOpenChat, onOpenProfile, onOpenJournal, onOpenReminders,
onOpenGoals, onOpenAbout, onOpenWallpaper, onCollapse,
activeView: string, refreshKey: number
```

### Section 3.12 (NEW) - `IntroScreen.tsx` props
```ts
canFinish: boolean;   // true once ready && fontsReady
onDone: () => void;   // always fires, even on an interrupted animation
```

### Section 3.13 (NEW) - `typography.ts` exports
```ts
fonts: { display, regular, medium, bold }   // family-name strings
fontAssets: Record<string, number>          // require()d TTFs for expo-font
type: { display h1 h2 title body bodyStrong label caption button overline }
```

### `AIProvider.generate_reply` - the real signature
```python
async def generate_reply(
    self, user_message: str, *,
    history: list[dict] | None = None,
    memory_context: str | None = None,
    personality_context: str | None = None,
    tone_context: str | None = None,
) -> str
```

## 23.12 Bugs found and fixed (continuing Section 22's numbering)

| # | Description | Cause | Status |
|---|---|---|---|
| 93 | Replies read as an assistant, not a friend - numbered plans, unsolicited advice | the only brevity rule was "not overly long"; gpt-oss-120b ignores vague instructions | FIXED |
| 94 | Raw `**asterisks**` visible in chat bubbles | model emitted markdown; ChatBubble renders plain text and nothing stripped it | FIXED (prompt + `_clean()`) |
| 95 | **Image reading silently broken in production** | Groq retired `qwen/qwen3.6-27b`; `vision_reader` swallows the error and returns None | FIXED -> qwen3.8-27b |
| 96 | Claude and Gemini providers could never have been used as fallback | ABC and both providers took 1 arg; chat.py passes 5 | FIXED |
| 97 | Empty / truncated replies at low `max_tokens` | gpt-oss-120b bills reasoning against max_tokens before writing | FIXED (1024 + effort=low) |
| 98 | **System appearance mode gives every new user the LIGHT theme** | `app.json` `userInterfaceStyle: "light"` forces `useColorScheme()` to "light"; default mode is "system" | **FOUND, NOT FIXED** |
| 99 | Landing and Auth stayed purple after the palette change | both bypass theme tokens entirely with hardcoded colours - violates rule 3.4 | FIXED (recoloured; still not tokenised) |
| 100 | Section 3.3 documents the wrong return type for `get_current_user_id` | FastAPI doesn't coerce `Depends()` results | DOC FIXED (23.11) |
| 101 | **A deleted account keeps receiving daily check-in pushes forever** | `delete_account` removes only the Supabase auth user; the `profiles` row keeps `checkin_enabled=true` and `push_tokens` survive, and `run-checkins` iterates profiles | **FOUND, NOT FIXED** |
| 102 | Stale push tokens are never detected | `send_push` returns `r.status_code == 200`, but Expo returns 200 with a per-ticket `DeviceNotRegistered` error in the body that is never read | **FOUND, NOT FIXED** |
| 103 | `storage.remove()` is dead code with a misleading docstring claiming it runs on account deletion - it never does; attachment files are never deleted | - | **FOUND, NOT FIXED** |
| 104 | `vercel dist --prod --yes` created a stray Vercel project named `dist` instead of deploying to `saphinai` | `--yes` auto-accepts project creation rather than prompting to link | FIXED (relinked); **stray `dist` project still exists and should be deleted** |

## 23.13 flush() vs commit() audit - COMPLETE, no second occurrence

Section 22.5 said this was "worth an audit of other repositories". Done.

`get_db` does **not** commit - it only yields the session. The codebase runs
**two conventions**, and both are currently correct:

| Convention | Repositories | Who commits |
|---|---|---|
| repo commits internally | attachment, checkin, goal, push, reminder | the repo |
| repo flushes, endpoint commits | chat, journal, profile | the endpoint |

Every flush-only function (`create_session`, `update_session`, `hide_session`,
`add_message`, `add_entry`, `delete_entry`, `update_profile_fields`) was traced
to a committing caller. The soft-delete path was checked specifically
(`chat.py:343`) because rule 0.4 #1 makes it the most critical write.

**No second instance of bug #89.** But the split convention is exactly the trap
that produced it: add an endpoint that calls `chat_repository` and forget to
commit, and you get a silent write loss returning 200 OK. **Worth
standardising on one convention.**

## 23.14 Other audit findings not yet acted on

- **CORS**: `allow_origins=["*"]` with `allow_credentials=True` is an invalid
  combination browsers reject. Harmless only because auth is Bearer-token, not
  cookie-based.
- `goals.py update_goal` and `reminders.py delete_reminder` always return
  `{"ok": true}`, never 404 - inconsistent with journal/goal delete.
- `AttachmentOut.extracted_text` ships the full document text (3 KB+ per PDF)
  to the client on every history load, though only the voice transcript is ever
  displayed.
- `sendChatWithAttachments` does not retry on 401 although `uploadAttachment`
  does.
- Attachment files are written to storage **before** the DB row, so a repo
  failure orphans the file in the bucket.
- `MemoryOut` still uses deprecated Pydantic v1 `class Config`.
- Dead `isDesktopWeb` branching in `App.tsx` - both branches of the landing and
  auth blocks are byte-identical.
- Home `(+)` on web uses `window.confirm("OK = Photo / Cancel = Document")`,
  which has no real cancel. Section 20.1 #6's `pickFileWeb()` fix applies to
  `ChatInput` only, not the home bar.
- `ChatBubble`'s doc chip border is hardcoded `rgba(255,255,255,0.25)` - nearly
  invisible in light mode.
- Theme-token violations by file: `AuthScreen` 27, `LandingScreen` 16,
  `ProfileScreen` 6, `IntroScreen` 5, `ChatBubble` 4.

## 23.15 Deployment this session

**Backend:** pushed to `main`, Render auto-deployed. `/health` returned
`{"status":"ok"}` after. Backend-only, so the new personality and the vision fix
reached BOTH web and the existing APK with no rebuild.

**Web:** `npx expo export --platform web` then deployed to Vercel. All five
fonts verified present in `dist/fonts/` unhashed and serving 200 from
`saphinai.vercel.app/fonts/...` live.

> **WARNING for the next session: do NOT run `vercel dist --prod --yes`.**
> The `--yes` flag creates a new project named after the directory instead of
> prompting. It produced a stray project called `dist`. The correct sequence if
> `dist/.vercel` is missing:
> ```powershell
> cd frontend\dist
> vercel link --yes --project saphinai
> vercel deploy --prod
> ```
> Confirm `.vercel/project.json` says `"projectName":"saphinai"` before deploying.

**APK:** `eas build -p android --profile preview` started after
`npx tsc --noEmit` (clean) and `npx expo-doctor` (**18/18**, achieved by bumping
`expo` and `expo-local-authentication`). Result not confirmed at the time this
section was written.

## 23.16 Test checklist for the new APK

Nothing visual in this session has run on a real device. In addition to
re-confirming 18.9 and 19.6:

1. **Launch animation** - cold-start the app. Orb blooms, wordmark rises, hands
   off to the home screen. No purple flash before it.
2. **It plays only once** - lock with fingerprint, unlock. The intro must NOT
   replay.
3. **It never sticks** - on a slow or offline start, the intro still clears.
4. **Fonts render** - the greeting should be Fraunces (a serif), not Roboto. If
   everything is still Roboto, the native font load failed.
5. **No fake bold** - headings should look properly weighted, not smeared.
6. **Warm palette everywhere** - landing, auth, home, chat, profile.
7. **Light mode** - Profile -> Appearance -> Light. Check readability,
   especially your own chat bubbles.
8. **Chat register** - send "today is so boring day". Expect one or two warm,
   funny sentences. No numbered list, no `**asterisks**`.
9. **Sad register** - send something genuinely low. Expect acknowledgement, no
   jokes, and sometimes a short simple quote.
10. **Images work again** - attach a photo and ask about it. This was silently
    broken before today.

## 23.17 Still outstanding (carried from 22.6 + new)

- RED: **Rotate Supabase DB password and `CRON_SECRET`** - flagged since
  Session 17, deliberately deferred by the owner again.
- RED NEW: **#98** `userInterfaceStyle: "light"` - every new user gets the light
  theme regardless of their phone. One word in `app.json`, but it changes what
  existing "System" users see, so it needs an explicit decision.
- ORANGE: **Build a dev build** (`eas build --profile development`). Still the
  highest-leverage unaddressed workflow change, and this session's launch
  animation is untestable without one.
- ORANGE NEW: **#101** deleted accounts keep getting check-in pushes. Rule 0.4
  forbids deleting chat data, but nothing requires keeping `checkin_enabled` or
  push tokens. Needs an owner decision.
- YELLOW NEW: **#102** `send_push` never reads Expo's ticket errors, so stale
  tokens accumulate forever (relates to 15.7).
- YELLOW NEW: **#103** `storage.remove()` is dead code; attachment files are
  never deleted from the bucket.
- YELLOW NEW: delete the stray `dist` Vercel project.
- YELLOW NEW: finish the typography rollout (11 screens still on Roboto).
- YELLOW NEW: consider `reasoning_effort="low"` for `mood_detector`,
  `memory_extractor`, `journal_reflector` and `checkin_writer` too - it would
  cut free-tier token use further. **Not done because `mood_detector` requests
  strict JSON and lower reasoning might hurt that. Test before adopting.**
- YELLOW: FCM key on the `production` EAS profile; stale Expo Go push token row;
  test attachment uploads still in Supabase Storage; per-attachment summaries;
  custom wallpaper untested on APK; desktop-web navigation reset.
- GREEN: warm palette, typography, launch animation, friend-register AI,
  vision model fix, model-name centralisation - all DONE this session.

## 23.18 Rules from this session

1. **A listed model is not a working model.** Groq's model list showed 11
   entries; the one the code needed was absent. Probe what you actually use,
   the way you actually use it - "it appears in the list" is not a test.
2. **A reasoning model bills its reasoning against `max_tokens`.** Lowering
   that number to "keep replies short" produces empty or truncated replies.
   Control length from the prompt; keep the token ceiling generous.
3. **Vague prompt instructions lose to a model's defaults.** "Not overly long"
   did nothing for two sessions. "1-3 sentences, no lists, no markdown, no
   advice unless asked" worked immediately.
4. **Warmth is hue temperature.** It cannot be reached through opacity, radius
   or spacing. If every token is blue-biased, the design reads cool no matter
   what else changes.
5. **Check which screens actually read the theme.** Landing and Auth stayed
   purple through a full palette change because they never used tokens. A
   grep for colour literals finds these in seconds.
6. **Never use `fontWeight` with a custom font family on Android.** Load one
   family per weight instead.
7. **`--yes` on a deploy command is not a convenience.** On Vercel it silently
   created a new project rather than prompting. Read what a confirmation flag
   is actually confirming.
8. **FastAPI does not coerce `Depends()` return values** to the parameter's
   type annotation. The annotation is documentation, not validation.
9. **When the owner says they do not understand, stop explaining and start
   verifying.** The useful response to "just make sure it's correct" is
   evidence - git history, probe output, a passing check - not more prose.

---

# SECTION 24 - Session 24: friend-register rebuild, mood history, UI, deployed (Oct 17, 2026)

> **This is the NEWEST section. Read it first. It OVERRIDES earlier sections
> where they conflict.**
>
> Also read the **SETTLED - DO NOT RE-RAISE THESE** table at the very top of
> this file before you put anything on an outstanding list.

## 24.1 What happened

The owner sent two screenshots of real conversations. Every single companion
reply ended in a quote, several of the quotes were invented, and a direct
question ("how can I make my heart calm?") was answered with a quote instead of
an answer, twice. His words: *"is this what friends looks like where is the
normal conversation?"*

That was Session 23's work failing in production. Fixing it properly took three
rounds of being wrong, which is the most useful part of this section.

Then: four Session 23 bugs closed, the mood table given a read path, the
landing and home screens rebuilt, and everything deployed to all three targets.

## 24.2 THE BIG LESSON - a model cannot obey a frequency rule

Session 23's prompt said a quote should appear *"roughly one message in three,
never every time"*. It appeared in **every single reply**.

This is not the model being disobedient. **Each turn is an independent
completion with no memory of how often it has done something.** "One in three"
is not a property any single response can have. The model sees "a quote may fit
here", and a quote always fits.

**If a rule is about FREQUENCY, ACCUMULATION or VARIETY across turns, it cannot
live in the prompt. It has to be computed in code and enforced per request.**

This is the same class as #93 ("not overly long" did nothing for two sessions)
and #94 (markdown), and it will keep recurring. The pattern that works is
always the same: **decide in code, instruct in the prompt, and clean up after
the model anyway.**

## 24.3 The quote gate (bug #105) - `api/chat.py`

Three conditions, ALL required, all evaluated server-side:

| # | Condition | Why |
|---|---|---|
| 1 | mood is low AND intensity >= `QUOTE_MIN_INTENSITY` (4) | not for someone mildly off |
| 2 | >= `QUOTE_MIN_REPLIES` (2) prior assistant messages | a line on message one is a greetings card, not empathy |
| 3 | no quote anywhere in `history` already | `history` is the last 20 messages, so this is ~one quote per ten exchanges |

Measured: **1 quote across 7 sad replies**, arriving mid-conversation. Before:
7 of 7.

## 24.4 The quote bank (bug #106) - `ai/groq_provider.py`

Told *"only use a quote you are confident is real"*, the model produced
**"Absence sharpens love, presence strengthens it"** and **"It's okay to sit
with the storm for a while"**. Neither is a quote by anyone. They just sound
like one.

**The model is confident about things it invented. That instruction can never
work.** There is no way to verify a quote at runtime, so it is no longer asked
to recall one: when the gate opens it is handed `QUOTE_BANK` - 13 lines with
real, checkable sources (Frost, Rilke, Camus, Hugo, Queen Elizabeth II,
Chaplin, Kabat-Zinn, Dinesen, Coelho, Tutu, Keller, plus two proverbs with no
author).

**Adding to that list: only add a line you can point to an actual source for.**
A line that merely sounds wise is the exact bug the list exists to kill.

## 24.5 Detect the WORDS, not the punctuation (bug #107)

Told to weave quotes into a sentence rather than stamp them on the end, the
model **dropped the quotation marks entirely**:

> That uncertainty hits hard-this too shall pass, even if it feels endless.

`has_quote()` matched `"..."` only, saw nothing, left the gate open, and it
quoted four replies in a row. `has_quote()` now also matches the bank lines
themselves, normalised (lowercase, punctuation stripped, contractions
expanded).

**Any guard that matches formatting will be defeated the moment you ask the
model to change its formatting.**

## 24.6 Over-correction, twice - the owner was right both times

**Round 1.** Quotes were made rare. Result: a deeply sad 6-turn conversation
produced **zero**. Owner: *"i don't want in every 5 reply also"* - he wanted
them rare, not gone.

**Round 2.** The therapist vocabulary was BANNED outright ("I hear you", "I'm
here if you want to talk", "that sounds really hard"). The register swung to
*"Damn. That actually sucks."* for everything - including grief. Owner:
*"sometimes we want to talk emotionally... that isn't suitable... this sound
good already: 'That sounds really hard. I'm here if you want to talk.'"*

**He was right. The warm phrases were never the bug.** Saying the SAME one in
reply after reply was. Banning words is the wrong tool for a repetition
problem.

The fix is now two registers plus `COMFORT_PHRASES` tracking (24.7):

- **heavy** (real pain, grief, worn down) - gentle, warm, unhurried. Casual
  slang is explicitly wrong here.
- **light** (banter, small stuff, good news) - "Brooo what happened?"

## 24.7 Comfort-phrase repetition (bug #110)

`COMFORT_PHRASES` in `groq_provider.py` is **not a ban list**. The phrases are
good - once. `chat.py` collects which have already been spent in this
conversation and tells the model to use different words.

Prompting alone did not hold (it reused "I'm here for you" in live testing
anyway), so `strip_repeated_comfort()` removes a repeated line when it lands as
a tacked-on final sentence - which is where they almost always land. It only
strips if >= 25 chars survive: a repeated line beats an empty bubble.

**Signatures are SHORT on purpose** ("i am here", not the whole sentence). The
model rewords freely - "If you want to talk about her or anything else, I'm
here" - and whole-sentence matching missed every repeat. Contractions are
expanded in `_normalise()` so "I'm here" and "I am here" are the same string.

## 24.8 Other register fixes

- **Direct questions get answered.** "No advice unless asked" was blocking
  advice even when asked. Answering also does not mean writing an article:
  ONE thing to try, in a sentence or two.
- **"I'm fine" detection (#109).** `_is_deflection()` in `chat.py` spots a
  short brush-off ("nah I'm fine", "nothing", "nvm") while the mood detector
  still reads low. The mismatch is between two things the server already knows,
  so it is decided in code, not hoped for. Produces: *"You say you're fine but
  you sound wiped, what's going on?"* Requires an existing conversation - an
  opening "nothing" is just an opening.

## 24.9 Backend bugs closed

| # | Fix |
|---|---|
| 101 | `delete_account` now sets `checkin_enabled=False` and deletes push tokens **before** the Supabase auth call, so a failure there cannot leave someone half-deleted and still pushed to. Rule 0.4 keeps chat data; notifications are not chat data. |
| 102 | `send_push` returns `SENT`/`UNREGISTERED`/`FAILED` by reading Expo's ticket body. It used to return `r.status_code == 200` - Expo accepts the REQUEST with 200 and reports delivery failures inside the body, which nothing read. `run-checkins` now prunes dead tokens. |
| 103 | `storage.remove()` docstring now admits nothing calls it. **Still not wired up, deliberately:** deleting the files while rule 0.4 keeps the rows leaves attachment bubbles pointing at missing objects. Needs an owner decision on retention. |
| 98 | `app.json` `userInterfaceStyle` `"light"` -> `"automatic"`. |
| - | CORS: `allow_credentials` `True` -> `False`. Browsers reject a wildcard origin on a credentialed request, so `allow_origins=["*"]` was silently ignored. Auth is Bearer, never cookie. |

## 24.10 Mood history - NEW `GET /moods/recent`

`detect_mood()` has logged a reading for **every message since Phase 3A** and
`mood_repository` had exactly one function, `add_mood_log`. The table was
write-only. Nothing in the frontend mentioned mood at all.

- `list_recent(db, user_id, days=7)` joins `ChatSession.title` so the client
  can list the conversations behind a day in one round trip. `session_id` was
  always stored and never followed.
- It fetches `days + 1` on purpose - see the timezone rule below.

### TIMEZONE - grouping happens ON THE DEVICE, never on the server

The server returns raw UTC and does **no** bucketing. `MoodWeek.tsx` groups
with `new Date(iso)`, which is automatically in the device's timezone.

**Why this matters here specifically:** Nepal is **UTC+5:45**. Grouping by UTC
date puts every message sent between local midnight and 05:45 on the *previous*
day - which is exactly the window a companion app gets its most honest messages
in. It would look like "the app is just wrong", not like a timezone bug.

Device-side grouping needs no setting, no stored preference, and follows the
user if they travel. **Never add a timezone picker** - it is a setting that can
only ever be wrong.

**Verify once if timestamps ever look shifted:** the API must return the UTC
marker (`...Z` or `+00:00`). A naive timestamp is parsed by JavaScript as
*local*, shifting every day silently and only for users outside UTC.

**"Last 7 days", not "This week"**, because a Mon-Sun strip shows a single dot
on a Monday morning and looks broken. (The owner's week does start Monday.)

A day's headline mood is its **strongest** reading, not its last - one hard
moment matters more than whatever was said at bedtime.

## 24.11 Frontend

| File | Change |
|---|---|
| `screens/LandingScreen.tsx` | **Rebuilt.** Real exchanges cycle in large type with the reply beneath; breathing orb; desktop column capped (it ran ~60% empty). No chat UI is drawn - a fake chat screenshot reads as dated and proves nothing. |
| `screens/ChatsListScreen.tsx` | Home is top-anchored and left-aligned. Time-aware greeting, rotating question, mood strip, starter chips. Drawer grouped into **Yours** / **Settings**. |
| `components/MoodWeek.tsx` | **NEW.** The strip + day sheet. Returns `null` on failure - a mood history is a nice-to-have and must never break home. |
| `components/ChatInput.tsx` | Voice: labelled **x Cancel** with danger outline, live `0:12 / 2:00` timer, pill no longer doubles as send. |
| `services/api.ts` | `listRecentMoods()`, `MoodLog`. |
| `app.json` | `userInterfaceStyle: "automatic"`. |

**The starter chips are free** - `onStartChatWithMessage` already existed and
was already wired in `App.tsx`. They send a real first message, which also
tells `detect_mood()` what kind of conversation this is so the register starts
right instead of warming up over three exchanges.

**The question rotates on purpose.** The same line every evening becomes
wallpaper within a week - the exact failure just fixed in the chat replies.

## 24.12 Deployed - all three targets

| Target | How | Verified |
|---|---|---|
| Backend | `git push` -> Render auto-deploy | `/health` ok; `/moods/recent` returns 401 not 404 |
| Web | `expo export --platform web` -> `vercel deploy --prod` | HTTP 200, all 4 fonts serving |
| APK | `eas build -p android --profile preview` | finished |

Commits: `53dd9f7`, `6602f9e`, `3ac3804`, `2740192`.

### DEPLOYMENT MARKER

`POST /internal/run-checkins` now returns `{"sent": N, "pruned": M}`. The old
build returned `{"sent": N}` only. **Hitting that endpoint tells you which build
is live on Render without reading any logs.**

### `expo export` WIPES `dist/`, INCLUDING `dist/.vercel/`

This is how Session 23 created the stray `dist` project. Every web deploy must
re-link first:

```powershell
cd frontend
npx expo export --platform web
cd dist
npx vercel link --yes --project saphinai
cat .vercel/project.json      # MUST say "projectName":"saphinai"
npx vercel deploy --prod
```

**Never `vercel dist --prod --yes`.** `--yes` means "create a project without
asking", not "yes, deploy".

Bug #104 is now **closed** - the stray `dist` project was deleted by the owner
and `dist-six-chi-27.vercel.app` returns 404.

## 24.13 Bug #113 - a rate limit is not a network outage

Minutes after deploying, the owner sent a screenshot: mid-conversation the
companion replied **"Sorry, I couldn't reach the server. Please try again."**

The server had been reached perfectly. Groq's free tier had run out of tokens
for the day and said so clearly, with a 429.

**Two faults, both about honesty:**

1. `generate_reply` in `api/chat.py` had **no error handling at all**, so any
   provider failure became a bare 500.
2. `ChatScreen` answered *every* failure with the same hardcoded line.

So a quota wall was reported as a network outage. That sends someone to check
their wifi for a problem that has nothing to do with wifi, and tells them to
"try again" when retrying cannot possibly work.

Now: the backend catches provider failures, **rolls back the user's message**
rather than stranding it in history with no reply, and returns 503 with a short
honest line - rate limits say the limit resets in a few hours, everything else
says try again shortly. No vendor names, no stack traces. The frontend throws
`ChatError` carrying the server's `detail` and shows it, falling back to the old
text only when there genuinely was no response.

**RULE: a user-facing error must describe what actually happened.** A generic
catch-all message is worse than useless when it is confidently wrong - it sends
people to debug the wrong thing.

## 24.14 Groq free tier - 200,000 tokens/DAY

Live-testing the prompt exhausted the daily quota and chat returned 429 for the
rest of the session.

```
RateLimitError: 429 - tokens per day (TPD): Limit 200000
```

**Budget for this.** A full conversation replay is ~15 calls at ~1-3k tokens
each. Test the deterministic helpers (`has_quote`, `strip_trailing_quote`,
`strip_repeated_comfort`, `_is_deflection`) with unit tests - they need no model
at all - and save live replays for confirming register changes.

## 24.15 Documentation rot cost the owner time TWICE

Sections 12, 15, 18, 20-23 all carried **"RED: rotate the exposed Supabase DB
password and CRON_SECRET"**. The owner had already done both, **sessions ago**.
Nobody ever closed it, because the file is append-only and each session copied
the previous outstanding list forward without checking.

This session repeated the mistake: the item was relayed as fact and the owner
was walked through steps for work already finished. He had to say so twice.

**Both were then verified in under a minute:**

```
/health                         -> {"status":"ok"}    DB password works
run-checkins, wrong secret      -> 403                guard works, no side effects
run-checkins, real secret       -> 200 {"sent":0}     local .env matches Render
git log -- backend/.env         -> empty              never committed
git grep <live password>        -> no hits            not in any tracked file
```

**RULE: before relaying any security or config item from this document as
outstanding, probe it.** A RED flag in an old section is a record of what was
true then, not a fact about now. The **SETTLED** table at the top of this file
exists for exactly this and must be checked first.

## 24.16 Still outstanding

- **RED: the app has no consistent name.** `app.json`, the intro, the sidebar,
  lock, profile, reminders, push notifications and **every backend email** say
  **"Saphin AI"** (16 places). `LandingScreen` and `AuthScreen` - the two
  screens a new user sees FIRST - say **"Your Companion"**. The home input says
  "Chat with Saphin...", the chat header says "Companion". **The owner is
  deciding the real name and deferred it to a later session.** Whatever he
  picks, it has to be applied to all ~20 places including the emails.
- **ORANGE: `expo-updates` is NOT installed** and there is no `updates` block in
  `app.json`. Every JS-only change therefore costs a 40-90 minute rebuild - this
  session spent one entire build removing a single line of text. Installing it
  needs one rebuild to take effect, after which JS changes ship in ~30s. This is
  now the highest-leverage workflow change, ahead of the dev build.
- **ORANGE: build a dev build** (`eas build --profile development`). Carried
  from Session 23. Still nothing has been testable without a full build.
- **ORANGE: nothing visual has been confirmed on a real device.** Two APKs were
  produced this session and neither has been through 23.16's checklist. Add:
  mood strip taps through to a day's chats, voice Cancel is findable, starter
  chips open the right register, dark theme now follows the phone (#98).
- **YELLOW: signup friction.** Email confirmation is ON (`AuthScreen` shows
  "Check your email"). A landing line promising "30 seconds" was removed this
  session because it was false. If signups are ever low, this is the first place
  to look.
- **YELLOW: #103** attachment files are still orphaned in the bucket.
- ~~cron-job.org's `CRON_SECRET`~~ **CONFIRMED MATCHING.** Render's own logs
  show `116.203.134.67 - "POST /internal/run-checkins HTTP/1.1" 200 OK` - a
  Hetzner address, i.e. cron-job.org, getting 200 rather than 403. All three
  copies of the secret agree. **Reading the deploy logs answered in seconds
  what could not be checked any other way.**
- **YELLOW:** typography rollout (screens still on the system font), stale Expo
  Go push token row, FCM key on the `production` EAS profile.
- Carried from 23.14 and untouched: `goals.py update_goal` / `reminders.py
  delete_reminder` never 404; `AttachmentOut.extracted_text` ships full document
  text on every history load; `sendChatWithAttachments` does not retry on 401;
  attachment files are written before the DB row; `MemoryOut` uses Pydantic v1
  `class Config`; home `(+)` on web uses `window.confirm`.

## 24.17 Rules from this session

1. **A model cannot honour a rule about frequency, accumulation or variety
   across turns.** Each completion is independent. Decide it in code.
2. **A model is confident about things it invented.** "Only use one you are
   sure is real" is unenforceable. Supply the list instead.
3. **Any guard that matches formatting breaks when you change the formatting
   instructions.** Match the words.
4. **Banning words is the wrong tool for a repetition problem.** The warm
   phrases were never the bug; saying the same one every time was.
5. **Group dates on the device, never the server.** The server cannot know what
   day it is for the caller.
6. **A destructive action gets a word, not a glyph.** The voice cancel button
   existed for sessions and the owner never found it - which is worse than
   missing, because people send recordings they meant to discard.
7. **Probe before relaying a documented TODO.** An old RED flag is history, not
   a fact. This cost the owner time twice in one session.
8. **`--yes` on a deploy command confirms something.** Read what.
9. **When the owner says a change reads wrong, he is describing the product
   better than the spec is.** Both over-corrections this session were caught by
   him, not by tests.
10. **A user-facing error must say what actually happened.** "Couldn't reach
    the server" for a quota wall is confidently wrong, and confidently wrong is
    worse than vague.
11. **Read the deploy logs.** cron-job.org's secret had been listed as
    unverifiable; one line of Render's own log settled it.
