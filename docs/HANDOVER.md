# AI Companion — Master Handover Document

> Paste this entire file (or its key sections) into a new chat to continue
> building without losing context. It captures everything: what we're building,
> what's done, what broke and how we fixed it, and what's next.

---

## 🔖 WHERE WE LEFT OFF (read this first)

**Most recent session (Auth landing page + Password reset + Change password + Biometric login + Scroll fixes) — what we achieved:**
- **Everything below is CODED, COMMITTED, BUILT into a new APK, and TESTED WORKING on the real
  installed APK.** This session's APK is the current shippable build. The AI still has **NO
  memory yet** (Phase 2 is the next real feature area).
- **Friendly `/confirmed` landing page (§10 old task 1 — DONE).** New backend route
  `GET /confirmed` (`backend/app/api/confirmed.py`) serves a styled dark-purple
  "✅ Email confirmed — open Saphin AI and log in" HTML page, wired into `main.py`. Replaced the
  bare `{"detail":"Not Found"}` that friends saw after confirming. Supabase **Site URL** set to
  `https://saphin-ai-backend.onrender.com/confirmed`.
- **Password reset (§10 old task 2 — DONE).** New backend route `GET /reset-password`
  (`backend/app/api/reset_password.py`) serves a dark-purple HTML page with a "new password"
  form that talks to Supabase's `/auth/v1/user` endpoint directly using the recovery token from
  the URL hash (`SUPABASE_URL` / `SUPABASE_ANON_KEY` injected from Render env at request time —
  anon key is public by design). Frontend: **"Forgot password?"** link on `AuthScreen` calls
  `supabase.auth.resetPasswordForEmail(email, { redirectTo: .../reset-password })`. Supabase
  **Redirect URLs** allow-list now contains BOTH `/reset-password` AND `/confirmed`. Tested end
  to end (email link → set new password → log in).
- **Change password in Profile (DONE).** New "Change password" dialog in `ProfileScreen`
  (Current password → New password → Confirm new password). Verifies the current password by
  re-running `signInWithPassword`, then `supabase.auth.updateUser({ password })`. Includes a
  **"Forgot password?"** link bottom-right (for users who don't remember their current password),
  which sends the reset email. Matches the app's dark-purple dialog style.
- **Biometric login — banking-app style (DONE, Option B = store password).** New
  `frontend/src/services/biometrics.ts` using `expo-local-authentication` +
  `expo-secure-store`. **Profile has a "Fingerprint login" toggle** (only shown on devices with
  biometric hardware): turning ON asks for the password + a fingerprint scan, then stores
  email+password in the device's **encrypted keystore**; turning OFF wipes them. **Login screen
  shows a fingerprint button beside "Log in"** (only when enabled + creds stored): tap → scan →
  logged in with no typing. Password changes auto-refresh the stored password; account deletion
  wipes it. Owner explicitly chose Option B (store password, always works like a bank app) over
  Option A (store session token) — see §0.5 #8. Native modules → only works in a real APK build,
  NOT Expo Go.
- **Scroll safety-net fixes (DONE).** `AuthScreen` wrapped in a `ScrollView` (login fields could
  sit under the keyboard with nothing to scroll). **Owner personally found + fixed the same bug
  on `ProfileScreen`** (bottom / Danger Zone was cut off on smaller screens) by wrapping its body
  in a `ScrollView` with the header kept fixed — USE THE OWNER'S PROFILE VERSION. `ChatScreen`
  was deliberately left unchanged (its FlatList already scrolls; wrapping a FlatList in a
  ScrollView is invalid).
- **AuthScreen keyboard doubling fixed.** AuthScreen was still stacking `KeyboardAvoidingView`
  + OS `resize` on Android (the §9 #26 mistake), causing the screen to render doubled/ghosted
  (2× overlap). Fix applied here too: `KeyboardAvoidingView` on iOS only, plain `View` on
  Android. (Chat had already been fixed last session; Auth was missed.)
- **Packages added this session:** `expo-local-authentication`, `expo-secure-store` (installed
  via `npx expo install`; `expo-secure-store` auto-added its config plugin). Fingerprint icon
  uses `@expo/vector-icons` (`Ionicons name="finger-print"`, ships with Expo).
- **Files touched:** NEW `backend/app/api/confirmed.py`, NEW `backend/app/api/reset_password.py`,
  MODIFIED `backend/app/main.py` (registers both routers), MODIFIED
  `frontend/src/screens/AuthScreen.tsx` (forgot-password + fingerprint button + ScrollView +
  keyboard fix), MODIFIED `frontend/src/screens/ProfileScreen.tsx` (change-password dialog +
  biometric toggle + owner's ScrollView), MODIFIED `frontend/App.tsx` (imports biometrics
  helpers; note the final App.tsx does NOT auto-lock — login-screen fingerprint button is the
  entry point), NEW `frontend/src/services/biometrics.ts`. (An earlier draft `LockScreen.tsx`
  was created then abandoned when we switched to the login-button approach — it is unused/harmless
  if present.)
- **Render deploy quirk we re-learned:** after each backend push, the new route 404s for a few
  minutes until Render redeploys, and the browser also caches the old 404 — always check
  `/openapi.json` (Ctrl+F the route name) to see what's actually live, then hard-refresh
  (Ctrl+F5). See §9 #29.

**Most recent session (Theme + Avatar + Delete dialog + Keyboard fix) — what we achieved:**
- **APK was already built and installed** earlier via EAS (preview profile). Then this
  session added 3 new features + several fixes. Everything is coded and **tested in
  Expo Go**; the final APK rebuild is the immediate next step.
- **Theme system (Light / Dark / System).** New `frontend/src/context/ThemeContext.tsx`
  with design tokens + dark & light palettes. Segmented **Appearance** toggle in Profile.
  Saved to Supabase (`profiles.theme_preference`) AND cached in AsyncStorage so it applies
  instantly on launch with no flicker. Every screen refactored to theme tokens.
- **Avatar / profile picture.** `expo-image-picker` installed; public Supabase Storage
  bucket **`avatars`** + RLS policies created. Tap avatar → custom dark-purple dialog
  (Take a photo / Choose from gallery) → upload to `avatars/<user_id>/avatar.jpg` → URL
  saved to `profiles.avatar_url`. Shown in Profile (big) + Chats-list header (replaced ☰),
  with initial-letter fallback, upload spinner, and error alert.
- **Delete-account button restyled.** Label kept as **"Delete my account"**; behavior
  unchanged (deletes Supabase login, keeps chat data). Replaced the white Android alert
  with a custom **two-step dark-purple dialog** (red confirm, outline cancel, honest copy).
- **Keyboard bug finally fixed for real** (see §9 #26). Root cause was `newArchEnabled:true`
  + double-lifting. Fix: `newArchEnabled:false`, `softwareKeyboardLayoutMode:"resize"`,
  and NO KeyboardAvoidingView on Android in ChatScreen.
- **Chat auto-scroll** to newest message (on new message + when keyboard opens), and
  **Android back gesture** now goes Chat/Profile → Chats list instead of exiting the app.
- **Backend:** added `theme_preference` + `avatar_url` columns and partial-update
  `PUT /profile`. Pushed to Render. Ran the Supabase column + storage-policy SQL.
- **Frontend committed** at the end of the session; APK rebuild pending (§10 task 0).

**Deployment + polish session — what we achieved:**
- **Deployed the FastAPI backend live** on **Render (free tier)**. Public at
  **`https://saphin-ai-backend.onrender.com`** and `/health` returns `{"status":"ok"}`.
- **Pointed the app at the public backend** (`frontend/.env` →
  `EXPO_PUBLIC_API_URL=https://saphin-ai-backend.onrender.com`). Tested end-to-end
  in Expo Go against the live backend — login + chat work over the internet.
- **Set up real transactional email (custom SMTP via Brevo).** Supabase's built-in
  email sender (~3–4/hour) was too limited for friends; now confirmation emails send
  reliably through Brevo. Verified sender = `prajasaphin18@gmail.com`. DONE + permanent.
- **Auth screen upgrades:** **Confirm password** field at signup (match + 6-char-min),
  **Show/Hide password** toggle, and detection of **"Email already registered"**.
- **Chats list — per-chat actions:** long-press → **Pin / Rename / Remove from list**
  (custom Android-friendly modals). Pinned chats sort to the top with a 📌.
- **Fixed display name not saving** (name stashed in auth metadata at signup, copied to
  profile on first login — see §9 #22).
- **Added permanent "Delete account"** (§0.5 #5): deletes the Supabase **auth account**
  but **leaves all chat data in the DB**. Re-signup with same email = fresh start.
- **Fixed the email-confirmation redirect** (Supabase Site URL → backend).
- **EAS APK build (Step D) completed** this-plus-latest session (project linked as
  `@saphinpraja/saphin-ai`, `eas.json` preview profile = APK, env baked in). See §12.

**Previous session (Phase 1 push) — what we achieved:**
- Chat history persists to Postgres (sessions + messages tables, RLS).
- Built the **Chats list** screen, the **Profile** screen, and redesigned the
  **login/signup** screen (gradient, glowing orb, animated switch, full-name field).
- Fixed session grouping, Android keyboard issues, and added an auth token-refresh guard.
- Renamed app to **"Saphin AI"** with a custom icon; added `start.bat` for local dev.

**State right now (updated this session):** Phase 1 is **100% done and LIVE**, plus profile
polish (theme, avatar, delete dialog) AND this session's auth/security work (friendly confirm
page, password reset, change password, biometric fingerprint login, scroll fixes). **A fresh
APK containing ALL of the above is built and tested working on the real device.** The app is
fully usable end-to-end against a **public backend**: sign up → confirm email (friendly page) →
log in (password OR fingerprint) → chats (pin/rename/remove) → edit name → change theme → set
avatar → change password → reset forgotten password → enable/disable fingerprint login →
delete account. The AI still has **NO memory yet** (Phase 2).

**➡️ WHAT WE'RE DOING NEXT: Phase 2 (memory)** is the next major feature — the AI currently
forgets everything between messages beyond the current session's transcript. Optional smaller
tasks still open: Google/Apple Sign-In, custom avatar crop screen, publish to Play Store.

**➡️ IMMEDIATE NEXT STEP when resuming:** decide between (a) starting **Phase 2 memory**
(schema + extraction + context injection — an architecture task) or (b) knocking out an optional
task (Google Sign-In). No APK rebuild is pending — the current build already ships everything.
Reminder for any future native-module or app.json change: keep `"newArchEnabled": false`,
commit the frontend, then `eas build -p android --profile preview`, and RE-TEST on the real APK
(Expo Go can't show native modules or true keyboard behavior).

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

## 0.4 HOW TO GIVE ME ANSWERS (my personal working rules — DO NOT FORGET)

I'm a beginner on **Windows** using **Notepad + PowerShell**. On EVERY answer:

1. **For every file, put at the TOP of that file's block:**
   - **FRONTEND or BACKEND** (which side / which terminal)
   - The exact **`notepad` command** with the full path to open it
   - **NEW file** (create it) or **REPLACE** (Ctrl+A → delete → paste)
   - Needs a **git push** (backend → redeploys Render) or just **hot-reloads** (frontend)
2. **Give complete, full files** to paste — not "change line 12" snippets. I get lost finding lines.
3. Multiple files in one message is fine, but **label each** with the header above.
4. Prefer **step-by-step** (Step 1, Step 2…) with the command AND the code together.
5. Always name the **terminal**: ROOT = `C:\Users\saphi\Desktop\Ai-Companion`,
   FRONTEND = `frontend/`, BACKEND = `backend/`.
6. Only stop to ask me if a decision really changes the project. Otherwise keep building.
7. Don't assume a fix works in the real APK just because it worked in Expo Go —
   remind me to re-test in the built APK.

---

## ⚠️ 0.5 CRITICAL PRODUCT RULES — NEVER VIOLATE OR FORGET THESE

These are decisions I (the owner) made explicitly. Do not "improve" or reverse them.

1. **CHAT DATA IS NEVER DELETED FROM THE DATABASE BY THE USER.**
   - The user can clear/remove chats from the APP VIEW only. The underlying chat rows
     in Postgres ALWAYS stay. Users do NOT get to hard-delete chat data.
   - "Remove from list" (chats) → **soft delete** via a `hidden_at` timestamp.
     The row and its messages STAY in the database, just hidden from the list.
   - There is **NO hard-delete of chat rows** anywhere. Do not add one.
   - LABELING RULE for chats: because chat data is retained, never label a chat action
     "Delete my data" or imply permanent erasure. Use honest labels like
     "Remove from list".

2. **Log out means log out.** It only ends the session. It deletes nothing.

3. **Full name is collected AT SIGN UP** (not only editable later). It is also
   editable afterward in the Profile screen. (Implementation detail: because email
   confirmation is ON, the name is stored in auth metadata at signup and written to
   the profile on first login — see §9 #22.)

4. **Always tell me FRONTEND or BACKEND** for every terminal command.

5. **ACCOUNT DELETION (owner decision) — the ONE permanent delete.**
   - There IS a **"Delete my account"** button in Profile. It permanently deletes the
     **Supabase auth user** (login credential) via a backend admin call.
   - It **does NOT delete chat data.** `chat_sessions` / `chat_messages` use a plain
     `user_id` column with **no FK to auth.users**, so those rows remain in the DB.
   - Effect: the email becomes reusable; a re-signup with the same email is a
     **brand-new account with a fresh, empty chat list**. Old chats stay in the DB
     but are orphaned (invisible to the new account). This is intentional.
   - Consistent with rule #1 (chat DATA is never deleted); it only removes the login.
   - UI requires **double confirmation** so it can't happen by accident.
   - **Label rule (this session):** kept as **"Delete my account"** everywhere,
     dialog is the custom dark-purple two-step one (red confirm, outline cancel).

6. **PASSWORD RESET & CHANGE PASSWORD (owner decision) — backend-hosted pages.**
   - The reset page and the confirm page are both **served by the FastAPI backend**
     (`/reset-password`, `/confirmed`), NOT deep links into the app. This keeps it simple
     and works from any device's browser. Do not "improve" this into an in-app deep link
     without asking.
   - **Change password requires the current password** (verified via `signInWithPassword`).
     A **"Forgot password?"** link sits bottom-right under the confirm field for users who
     don't remember it — that link sends the reset email. This layout was explicitly
     requested by the owner; keep it.

7. **BIOMETRIC LOGIN LIVES IN TWO PLACES (owner decision).**
   - **Profile** has the enable/disable toggle ("Fingerprint login").
   - **Login screen** has the fingerprint button beside the "Log in" button (shown only when
     enabled). This mirrors the owner's bank app (Siddhartha Bank) and was explicitly
     requested. Do not move it to an auto-lock-on-open model.

8. **BIOMETRIC STORAGE = OPTION B (store password), owner's explicit choice.**
   - On enable, the app stores **email + password** in the device's encrypted keystore
     (`expo-secure-store`) and logs in fresh each time via `signInWithPassword`. This is the
     "always works, like banking apps" option. The owner was told the tradeoff (anyone who
     passes the phone's biometric can log in; the password sits encrypted on-device) and chose
     it over Option A (store the Supabase session token). Do not silently switch to Option A.
   - Safety behaviors that MUST stay: changing the password refreshes the stored password;
     deleting the account wipes stored creds; a stale/invalid stored password falls back to the
     password screen and hides the fingerprint button.

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
chats from their view; the owner retains chat data server-side.)

**Developer profile:** beginner, first app. Wants production-quality but
beginner-friendly. Works on **Windows**, project on Desktop, uses Notepad + PowerShell.

---

## 2. TECH STACK (locked)

- **Frontend:** Expo + React Native (TypeScript), tested via Expo Go on a
  physical Android phone (QR code). Standalone APK built via EAS (done; rebuild pending).
  **`newArchEnabled` MUST stay `false`** (New Arch breaks Android keyboard layout — §9 #26).
- **Backend:** FastAPI (Python), run with uvicorn. **Local dev uses Python 3.14**, but
  **Render is pinned to Python 3.12.7** via `backend/.python-version` (§9 #19).
- **Backend hosting:** **Render free tier** — LIVE at
  `https://saphin-ai-backend.onrender.com`. Auto-deploys from GitHub `main`, root dir
  `backend`. Free instance sleeps on idle (~50s cold start on first request).
- **Database:** PostgreSQL (via Supabase) — chat history + profiles
  (SQLAlchemy async + asyncpg, Session pooler).
- **Auth:** Supabase Authentication (email/password with confirm-password + email
  confirmation; Google/Apple planned).
- **Storage:** Supabase Storage — public bucket **`avatars`** for profile photos (NEW).
- **Email (transactional):** **Custom SMTP via Brevo** (free tier, 300/day), wired into
  Supabase Auth. Verified sender `prajasaphin18@gmail.com`.
- **AI:** Provider abstraction layer. **Active provider = Groq** (free tier,
  `llama-3.3-70b-versatile`). Claude + Gemini providers exist but are inactive.
- **Build:** EAS Build. Expo account `saphinpraja`, project `@saphinpraja/saphin-ai`
  (projectId `e8d6e6eb-b1bf-4e21-af8b-885612a4b999`).

---

## 3. ROADMAP (5 phases)

**Phase 1 — Foundation (COMPLETE + DEPLOYED, 100%):** project setup ✅, mobile UI ✅,
email/password auth ✅, secure backend ✅, AI chat ✅, chat history persistence ✅,
chats list ✅, profile screen ✅, redesigned auth screen ✅, confirm password + show/hide
+ email-exists detection ✅, per-chat Pin/Rename/Remove ✅, display-name save fixed ✅,
permanent account deletion ✅, backend deployed public (Render) ✅, custom SMTP (Brevo) ✅,
**APK built ✅**, **theme toggle ✅**, **avatar photo ✅**, **delete-account dialog restyle ✅**,
**keyboard fix ✅**, **friendly confirm page ✅**, **password reset ✅**, **change password ✅**,
**biometric fingerprint login ✅**, **auth+profile scroll fixes ✅**. Still open (optional):
Google login ⬜, Apple Sign-In ⬜.

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

**Phase 1 is 100% complete and LIVE on a public backend, plus profile polish.** Full
authenticated AI chat loop works over the internet, messages persist to Postgres, a
chats list lets the user pick/pin/rename/remove past conversations, there's a profile
screen with name/logout/delete-account/theme/avatar, a polished login with
confirm-password, and real confirmation emails send via Brevo.

**Working end-to-end right now:**
mobile app → email/password login (Supabase) → JWT attached to request →
**public FastAPI on Render** verifies JWT via Supabase JWKS → saves user+assistant
messages to Postgres → calls Groq → returns reply → shows on phone. On reopen, the user
sees a **"Your Chats"** list (pinned first), taps one, and its messages load from the DB.
Theme + avatar persist across restarts (AsyncStorage + Supabase).

**Shipping status: the current APK is built and tested working with everything through this
session (confirm page, password reset, change password, biometric login, scroll/keyboard fixes).
The next real feature is Phase 2 (memory) — the AI still has no long-term memory.**

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
│   ├── ARCHITECTURE.md            # decision records D1–D15 (see §6)
│   ├── DATABASE.md                # chat_sessions/chat_messages/profiles schema
│   ├── HANDOVER.md                # THIS FILE
│   └── learning.md
├── backend/
│   ├── .env                       # REAL SECRETS (gitignored) — see §7
│   ├── .env.example
│   ├── Procfile                   # web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
│   ├── .python-version            # pins Render to 3.12.7
│   ├── requirements.txt           # incl. sqlalchemy[asyncio]>=2.0, asyncpg>=0.29
│   └── app/
│       ├── main.py                # FastAPI app, CORS, routers (health, chat, profile)
│       ├── core/config.py         # Settings from .env
│       ├── models/
│       │   ├── chat.py            # ChatRequest/Response, MessageOut, SessionOut(+pinned), SessionUpdate
│       │   └── profile.py         # ProfileOut/ProfileUpdate (+ theme_preference, avatar_url — NEW)
│       ├── db/
│       │   ├── base.py
│       │   ├── session.py         # async engine + get_db() (asyncpg, SSL relaxed)
│       │   └── models.py          # ChatSession(+pinned,+hidden_at), ChatMessage, Profile(+theme_preference,+avatar_url — NEW)
│       ├── ai/                    # base + claude(inactive) + gemini(inactive) + groq(ACTIVE) + provider_factory
│       ├── auth/dependencies.py   # get_current_user_id via Supabase JWKS
│       ├── api/
│       │   ├── health.py          # GET /health
│       │   ├── chat.py            # POST /chat, GET /sessions, GET /sessions/{id}/messages,
│       │   │                      #   PATCH /sessions/{id}, DELETE /sessions/{id} (soft-hide)
│       │   ├── profile.py         # GET /profile, PUT /profile (partial update — NEW), DELETE /account
│       │   ├── confirmed.py       # NEW — GET /confirmed: styled "Email confirmed" HTML page
│       │   └── reset_password.py  # NEW — GET /reset-password: HTML new-password form (Supabase token from URL hash)
│       └── repositories/
│           ├── chat_repository.py    # sessions/messages + hide + update_session + pinned-first order
│           └── profile_repository.py # get_profile + upsert_profile + update_profile_fields (NEW)
└── frontend/
    ├── .env                       # EXPO_PUBLIC_ vars (gitignored) — API_URL = public Render URL
    ├── .env.example
    ├── app.json                   # android: edgeToEdgeEnabled=false, softwareKeyboardLayoutMode="resize",
    │                              #   newArchEnabled=false; name "Saphin AI"; extra.eas.projectId set
    ├── eas.json                   # preview + production profiles = APK, env vars baked in (API/Supabase)
    ├── App.tsx                    # ThemeProvider wrap, back-button handler, theme hydrate on login, themed StatusBar
    ├── index.js, package.json, tsconfig.json
    ├── assets/                    # custom Saphin AI icon set
    └── src/
        ├── types/chat.ts          # ChatMessage { id, role:'user'|'companion', text, createdAt }
        ├── context/
        │   └── ThemeContext.tsx   # NEW — design tokens, dark+light palettes, AsyncStorage + Supabase sync
        ├── components/
        │   ├── ChatBubble.tsx     # theme tokens
        │   └── ChatInput.tsx      # theme tokens + spacing
        ├── screens/
        │   ├── AuthScreen.tsx     # confirm pw, show/hide, email-exists, full_name metadata; + Forgot-password link,
        │   │                      #   fingerprint login button, ScrollView, iOS-only KAV keyboard fix (NEW this session)
        │   ├── ChatsListScreen.tsx# Pin/Rename/Remove modals, pinned-first, avatar in header (NEW), theme
        │   ├── ChatScreen.tsx     # loads session messages, keyboard fix (no KAV on Android), auto-scroll, theme
        │   │                      #   (deliberately NOT wrapped in ScrollView — FlatList already scrolls)
        │   ├── ProfileScreen.tsx  # name, email, Appearance toggle, avatar picker, delete dialog; + Change-password
        │   │                      #   dialog, Fingerprint-login toggle, ScrollView (owner-fixed) (NEW this session)
        │   └── LockScreen.tsx     # abandoned draft (auto-lock approach dropped) — UNUSED/harmless if present
        └── services/
            ├── supabase.ts        # Supabase client (AsyncStorage session)
            ├── api.ts             # chat/profile/sessions + updateThemePreference/updateAvatarUrl/uploadAvatar
            └── biometrics.ts      # NEW — expo-local-authentication + expo-secure-store; enable/disable, store/verify creds
```

Dependencies (frontend): `expo-linear-gradient`, `@react-native-async-storage/async-storage`,
**`expo-image-picker` (NEW this session)**.
**Do NOT install** `react-native-keyboard-controller` (peer-dep conflict). Be cautious
with any native module in managed Expo (e.g. `react-native-image-crop-picker` needs a dev build).

---

## 6. ARCHITECTURE DECISIONS (D1–D18)

- **D1** Mobile: Expo/React Native.
- **D2** Backend: FastAPI.
- **D3** DB: PostgreSQL (Supabase).
- **D4** Auth: Supabase.
- **D5** AI behind abstraction layer (`AIProvider`; swap = 1 file).
- **D6** Active AI = **Groq** (`llama-3.3-70b-versatile`). Swap via `provider_factory.py`
  → `get_ai_provider()`.
- **D7** JWT verification via Supabase **JWKS/ES256**, httpx + browser User-Agent, cache 1h.
- **D8** DB access = **SQLAlchemy async + asyncpg**, through Supabase's **Session pooler**.
  Backend always filters by `user_id` from the verified JWT; RLS is a second defense
  layer. Repository pattern keeps SQL out of endpoints.
- **D9** **Sessions + messages** data model. One conversation = one `chat_session`
  (title = first ~40 chars of the opening message); each turn is a `chat_message`
  (role `user`/`assistant`). Frontend maps `assistant`→`companion`.
- **D10** **Soft delete for chats** (rule 0.5 #1). "Remove from list" sets `hidden_at`
  and filters out of the list query; chat rows are never physically deleted.
- **D11** **Custom SMTP via Brevo** for Supabase Auth emails. Brevo's free tier
  (300/day) replaces Supabase's built-in sender. SMTP creds in Supabase Auth → Emails → SMTP
  (host `smtp-relay.brevo.com`, port 587).
- **D12** **Permanent account deletion that preserves chat data** (rule 0.5 #5).
  `DELETE /account` calls Supabase's admin delete-user API with the service role key.
  Chat tables have no FK to `auth.users`, so chat rows survive; the login is freed for
  a fresh re-signup. The ONLY permanent delete; never touches chat rows.
- **D13 (NEW)** **Theme system with token palettes + dual persistence.** `ThemeContext`
  exposes tokens (background, surface, surfaceAlt, textPrimary, textSecondary, accent,
  accentText, border, danger, bubble*, overlay, isDark) with dark & light palettes and a
  `system` mode that follows `useColorScheme()`. Choice persists to **AsyncStorage** (instant
  on launch) AND **Supabase `profiles.theme_preference`** (cross-device). Local cache wins
  over server on conflict so an in-app toggle is never overridden.
- **D14 (NEW)** **Avatars in Supabase Storage.** Public bucket `avatars`, one file per user
  at `avatars/<user_id>/avatar.jpg` (upsert overwrites old). Public URL saved to
  `profiles.avatar_url` with a `?v=timestamp` cache-buster. RLS: public read, authenticated
  insert/update scoped to the user's own folder. Image picked via `expo-image-picker`
  (camera path crops reliably; Samsung gallery crop is inconsistent — accepted, image is
  auto-fit to a circle with `resizeMode="cover"`).
- **D15 (NEW)** **Partial profile updates.** `PUT /profile` uses
  `payload.model_dump(exclude_unset=True)` so the client can update just name, just theme,
  or just avatar without wiping the others. Repo helper `update_profile_fields()`.
- **D16 (NEW)** **Auth flows use backend-hosted HTML pages, not app deep links.** Both the
  email-confirmation page (`GET /confirmed`) and the password-reset page (`GET /reset-password`)
  are plain HTML served by FastAPI. The reset page runs a tiny bit of JS that reads the Supabase
  recovery token from the URL hash and calls Supabase's `PUT /auth/v1/user` directly with the
  anon key (public by design) + `Authorization: Bearer <token>`. `SUPABASE_URL` /
  `SUPABASE_ANON_KEY` are injected into the HTML from Render env **at request time** (string
  replace), so nothing secret is hardcoded. Rationale: zero app-side deep-link plumbing, works
  from any browser, trivial to host on the existing backend. Supabase **Site URL** →
  `/confirmed`; **Redirect URLs** allow-list must include both `/confirmed` and `/reset-password`.
- **D17 (NEW)** **Change password = verify-then-update.** Verify the current password by calling
  `signInWithPassword` (fails → wrong password), then `updateUser({ password })`. A "Forgot
  password?" link in the dialog sends the reset email as an escape hatch. If biometrics are on,
  the newly-set password is re-stored so fingerprint login keeps working.
- **D18 (NEW)** **Biometric login = local credential lock (Option B).**
  `expo-local-authentication` gates access; `expo-secure-store` (hardware-backed encrypted
  keystore) holds `email` + `password`. Enable is guarded by password check + a fingerprint scan
  before storing. The **login screen** shows a fingerprint button (visible only when enabled +
  device-capable + creds present) that scans → `signInWithPassword` with stored creds. The
  **Profile** toggle enables/disables and wipes creds on disable. Chosen over storing the session
  token (Option A) because the owner wants bank-app behavior that always works even after token
  expiry (see §0.5 #8). Native modules ⇒ **APK-only**, never testable in Expo Go. Fingerprint icon
  = `@expo/vector-icons` Ionicons `finger-print`. NOTE: the final design does NOT auto-lock the app
  on foreground (an earlier `LockScreen.tsx` auto-lock draft was abandoned); the login-screen
  button is the single entry point.

---

## 7. SECRETS / CONFIG (values live only in local .env files + host dashboards, NEVER committed)

**backend/.env** keys (same keys are also set in **Render → Environment**):
```
SUPABASE_URL=https://mlqbnmloighdifavttwx.supabase.co   # base URL, NO /rest/v1/
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # REQUIRED on Render for DELETE /account to work
SUPABASE_JWT_SECRET=...
DATABASE_URL=postgresql+asyncpg://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres
GROQ_API_KEY=gsk_...            # ACTIVE
ENVIRONMENT=production          # production on Render (local stays development)
# ANTHROPIC_API_KEY / GEMINI_API_KEY intentionally NOT set on Render (unused)
```
DATABASE_URL notes: scheme MUST be `postgresql+asyncpg://` (plain `postgresql://`
makes SQLAlchemy try psycopg2 and crash). Any `@` INSIDE the password must be
URL-encoded as `%40`; the `@` before the host stays literal. Use the **Session
pooler** URI from Supabase → Connect.

**frontend/.env** keys:
```
EXPO_PUBLIC_SUPABASE_URL=https://mlqbnmloighdifavttwx.supabase.co   # NO /rest/v1/
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_API_URL=https://saphin-ai-backend.onrender.com          # PUBLIC Render URL, no trailing slash
```
NOTE: `EXPO_PUBLIC_*` are baked in at BUILD time. Because `.env` is gitignored and EAS
builds from git, these are **also duplicated in `frontend/eas.json`** under each profile's
`env` block so they reach the build (anon key is public by design — safe to commit in eas.json).
If the backend URL ever changes, the APK must be rebuilt.

**frontend/eas.json** (preview + production profiles, both APK):
```
"buildType": "apk", "distribution": "internal",
env: { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY }
"cli": { "appVersionSource": "local" }
```

**Supabase Auth config:**
- Email confirmation is **ON** (no session immediately after signup, so the full name
  is saved on first login — see §9 #22).
- **Site URL** = `https://saphin-ai-backend.onrender.com/confirmed` (updated this session — the
  friendly confirm page is now built and live; this is where confirmation emails land).
- **Redirect URLs** allow-list (Auth → URL Configuration → Redirect URLs) MUST contain BOTH:
  `https://saphin-ai-backend.onrender.com/reset-password` AND
  `https://saphin-ai-backend.onrender.com/confirmed`. The reset link silently fails
  ("invalid/expired") if `/reset-password` isn't on this list, even with a valid token.
- **Custom SMTP** under Auth → Emails → SMTP (Brevo — D11).
- Asymmetric JWT signing (ES256); JWKS at `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`.

**Supabase Storage (NEW):** public bucket **`avatars`**. Policies (run in SQL editor):
```
create policy "avatars public read" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "avatars user upload" on storage.objects for insert to authenticated
  with check ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );
create policy "avatars user update" on storage.objects for update to authenticated
  using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );
```
Profile columns added (NEW):
```
alter table public.profiles
  add column if not exists theme_preference text not null default 'system',
  add column if not exists avatar_url text;
```

**Brevo (email):** account `prajasaphin18@gmail.com`; host `smtp-relay.brevo.com`, port 587,
login `b1bea5001@smtp-brevo.com`, SMTP key generated in Brevo. If sending breaks,
regenerate the SMTP key and update it in Supabase.

**Render:** service `saphin-ai-backend`, region Oregon, root dir `backend`, build
`pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`,
Free instance, auto-deploy from `main`.

**Expo/EAS:** account `saphinpraja`, project `@saphinpraja/saphin-ai`,
projectId `e8d6e6eb-b1bf-4e21-af8b-885612a4b999`.

GitHub: repo `https://github.com/Saphin18/ai-companion` (private).

---

## 8. HOW TO RUN (terminals)

There are effectively THREE terminals. Always know which one you're in.
- **ROOT** = `C:\Users\saphi\Desktop\Ai-Companion` (git commands)
- **FRONTEND** = `C:\Users\saphi\Desktop\Ai-Companion\frontend` (expo, eas)
- **BACKEND** = `C:\Users\saphi\Desktop\Ai-Companion\backend` (uvicorn)

**Local backend** (PowerShell, in `backend/`):
```
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0
```
Health (local): `http://127.0.0.1:8000/health` → `{"status":"ok"}`.
Health (public): `https://saphin-ai-backend.onrender.com/health`.
(You usually DON'T need the local backend — the app points at the public Render one.)

**Frontend / Expo Go** (PowerShell, in `frontend/`):
```
npx expo start -c
```
Scan QR with Expo Go. The phone no longer needs to be on the same WiFi as the PC
(app talks to the public backend).

**Native config changes (app.json) require a FULL restart:** `npx expo start -c` +
**fully close Expo Go** (swipe from recents) + **re-scan QR**. A shake-reload does NOT
apply app.json changes.

**Build the APK** (FRONTEND, in `frontend/`):
```
eas build -p android --profile preview
```
Returns a download link to the `.apk`. (One-time earlier setup already done: `npm i -g eas-cli`,
`eas login`, `eas build:configure`, `eas.json` set to APK + env.)

**Git workflow (ROOT `C:\Users\saphi\Desktop\Ai-Companion`):**
`git add .` → `git commit -m "..."` → `git push`. Pushing `backend/` auto-redeploys
Render (~3–5 min); `frontend/` changes do NOT trigger a deploy. Frontend changes
hot-reload live in Expo, so no push is needed just to test; commit + rebuild APK to ship
them to installed phones.

**Windows note:** create/replace files via Notepad (`notepad <path>`, Ctrl+A, paste, save).
Write plain content; avoid bash-style quote escaping — it corrupts files.

---

## 9. MISTAKES WE HIT & FIXES

(Earlier ones 1–11 from prior sessions still apply: two folders, quote-escaping,
downloaded-file confusion, JWT/JWKS, provider swaps, nested git repo.)

**Phase 1 session:**
12. **`ModuleNotFoundError: psycopg2`** — `DATABASE_URL` started with `postgresql://`,
    so SQLAlchemy chose the sync driver. Fix: use `postgresql+asyncpg://`.
13. **`AttributeError: get_provider`** — factory is `get_ai_provider()`. Fixed the call.
14. **Every message became its own chat** — old rows predate session tracking. New
    conversations now group into one session; old junk rows can be hidden via
    "Remove from list".
15. **401 on `/sessions` right after login** — token not ready; `api.ts` `authHeaders()`
    now refreshes the session if the access token is missing before the request.
16. **Type errors** — `ChatMessage` uses `role: 'user' | 'companion'` and requires
    `createdAt`. Frontend maps server `assistant`→`companion`.
17. **Android keyboard covering inputs (Phase 1 attempt)** — was solved with
    `behavior="height"` + app.json `edgeToEdgeEnabled:false` + `softwareKeyboardLayoutMode:"pan"`.
    NOTE: superseded this session — see #26 (New Arch broke it; final fix differs).
    Do NOT use `react-native-keyboard-controller` (peer-dep conflict).

**Deployment + polish session:**
18. **Render build succeeded but app crashed at startup** — `requirements.txt` missing
    `sqlalchemy` and `asyncpg`. Added `sqlalchemy[asyncio]>=2.0.0` and `asyncpg>=0.29.0`.
19. **Python 3.14 wheels missing on Render** — added `backend/.python-version` = `3.12.7`.
20. **`git add backend/Procfile` "did not match"** — ran `git add` inside `backend/`, so
    paths doubled. Fix: add with paths relative to CWD, or add from the repo root.
21. **Duplicate env-var typo** — `EXPO_PUBLIC_API_URL=EXPO_PUBLIC_API_URL=https://...`.
    Fixed to a single key.
22. **Display name never saved** — no session at signup (email confirmation ON), so the
    profile write was lost. Fix: pass `options.data.full_name` in `signUp` (auth metadata),
    then copy into profile on first `SIGNED_IN`.
23. **500 on PATCH /sessions/{id} (`MissingGreenlet` on `updated_at`)** — DB-generated
    `updated_at` was stale on the ORM object; sync serialization attempted async IO. Fix:
    `await db.refresh(session)` before building `SessionOut`. Always read the Render log.
24. **Custom SMTP: 0 logs in Brevo, signup 500** — wrong SMTP password. Fix: generate a
    fresh Brevo **SMTP key** (not the account password), login `...@smtp-brevo.com`, port 587
    (fallback 2525).
25. **"localhost can't be reached" after email confirm** — Supabase Site URL pointed at
    localhost. Fix: set Site URL to the public backend URL.

**Theme + Avatar + Keyboard session (latest):**
26. **🔑 KEYBOARD BUG (the big one — took many tries).** Symptoms across attempts: input
    flung to the top with a big empty gap; header disappeared; keyboard covered input.
    **Root cause:** `newArchEnabled: true` in `app.json` (added later, e.g. by
    `eas build:configure`) changed Android keyboard/`KeyboardAvoidingView` behavior, AND we
    were **double-lifting** (KeyboardAvoidingView + OS resize/pan at once).
    **THE FIX THAT WORKED (keep ALL of these):**
    - `app.json` → `"newArchEnabled": false`
    - `app.json` → `android.edgeToEdgeEnabled: false`
    - `app.json` → `android.softwareKeyboardLayoutMode: "resize"`
    - `ChatScreen.tsx` → **NO KeyboardAvoidingView on Android** (plain `<View>`, input
      anchored at bottom, let the OS `resize` lift it). iOS keeps `KeyboardAvoidingView
      behavior="padding"`.
    - **Rule:** never stack two keyboard lifters — one only.
    - Any app.json change needs a FULL restart (see §8).
    - ⚠️ Only verified in Expo Go — MUST re-check in the real APK (New Arch/resize can
      differ in a build).
27. **Gallery crop unreliable / "CROP" not "Done".** `expo-image-picker` `allowsEditing`
    crops fine from the **camera**, but Samsung's **gallery** editor sometimes skips crop or
    auto-saves, and its screen is the phone's own UI (grey bar, "CROP" top-right = confirm)
    which we CANNOT restyle or rename. A custom crop screen with a real Done button needs a
    native crop package + dev build (risky). Decision: accept it; avatar auto-fits the circle
    with `resizeMode="cover"`. Revisit later if wanted.
28. **`git commit` said "nothing to commit" after `git add`** — files were already committed
    in a prior step. Use `git status` + `git log --oneline -3` to verify true state before
    re-committing (don't panic-recommit).

**Auth pages + Password reset + Biometric session (latest):**
29. **New backend route returns 404 right after `git push`** — twice this session `/confirmed`
    then `/reset-password` showed `{"detail":"Not Found"}` even though the code was correct and
    pushed. Two overlapping causes: (a) Render's free-tier redeploy takes ~3–5 min (plus queue),
    so the OLD code is briefly still live; (b) the **browser caches the 404**. Diagnosis that
    works every time: open `https://saphin-ai-backend.onrender.com/openapi.json` and Ctrl+F the
    route name — if it's listed, the route IS live and it's just browser cache → hard-refresh
    with **Ctrl+F5** / incognito. If not listed, the deploy hasn't finished (check Render →
    Events for the commit hash / "Live") or didn't trigger (Manual Deploy → Deploy latest commit;
    "Clear build cache & deploy" forces a clean rebuild). Don't re-edit correct code while waiting.
30. **Password-reset link lands on "invalid/expired" with a valid token** — the reset URL wasn't
    on Supabase's **Redirect URLs** allow-list. Add `.../reset-password` (and `.../confirmed`)
    under Auth → URL Configuration → Redirect URLs. Site URL and Redirect URLs are SEPARATE boxes
    with separate jobs (Site URL = default confirm landing; Redirect URLs = allow-list for links).
31. **Expo Go can't test this session's core features.** (a) Biometrics use native modules
    (`expo-local-authentication`, `expo-secure-store`) that **do not exist in Expo Go** — the
    fingerprint prompt just fails there; that's expected, test only in the APK. (b) The Android
    keyboard `resize` behavior (`app.json` `softwareKeyboardLayoutMode`) is a **native setting
    Expo Go ignores** — the "keyboard covers the input / can't scroll to it" seen in Expo Go is
    NOT the real app's behavior. Lesson (re-confirming §9 #26): keyboard + native modules are
    truth-tested ONLY in a real build. A cloud EAS build and a local `npx expo start` can run at
    the same time without interfering.
32. **AuthScreen was doubling/ghosting (2× overlapped screen)** — AuthScreen still had the
    §9 #26 double-lift bug (`KeyboardAvoidingView` + OS `resize` both active on Android) even
    after ChatScreen was fixed last session. Fix: `KeyboardAvoidingView` on iOS only, plain
    `View` on Android. Rule stands: never stack two keyboard lifters.
33. **"Can't scroll to reach a field/button"** — a statically-centered screen has nothing to
    scroll, so when the keyboard (or a small screen) covers the bottom, fields are unreachable.
    Fix = wrap the screen body in a `ScrollView` (`flexGrow:1`, `justifyContent:'center'`,
    `keyboardShouldPersistTaps:'handled'`), header kept fixed outside it. Applied to AuthScreen;
    the **owner found and fixed the identical issue on ProfileScreen themselves** — keep the
    owner's Profile version. Do NOT wrap a FlatList screen (ChatScreen) this way — a FlatList is
    already a scroller and nesting them is invalid in React Native.

---

## 10. REMAINING TASKS (recommended order)

0. **✅ DONE — rebuilt + tested the APK.** The APK with theme/avatar/delete/keyboard AND this
   session's auth/security work was built and **tested working on the real device**. (Original
   task text kept as history: confirm `newArchEnabled:false` → commit frontend →
   `eas build -p android --profile preview` → test keyboard/theme/avatar/delete on the real build.)

1. **✅ DONE — Friendly `/confirmed` landing page.** `GET /confirmed` route built + Supabase Site
   URL pointed at it. (See this-session notes at top + §9 #29.)

2. **✅ DONE — Password reset flow.** `GET /reset-password` page + `resetPasswordForEmail` +
   Redirect URLs allow-list. Tested end to end. (See §9 #30.)

3. **Google Sign-In**, then **Apple Sign-In** (Apple required by App Store when other social
   logins exist). — still open (optional).

4. **(Optional) Custom crop screen** with a real Done button (native crop package + dev
   build — risky, decide later). See §9 #27. — still open (optional).

5. **✅ DONE — Change password.** Change-password dialog in Profile (verify current → update),
   with a Forgot-password escape hatch. (See D17.)

5b. **✅ DONE (bonus this session) — Biometric fingerprint login.** Profile toggle + login-screen
   fingerprint button, storing creds in the encrypted keystore (Option B). (See D18, §0.5 #7/#8.)

6. **NEXT — Phase 2 (memory)** — Opus-high architecture task: schema, extraction, and injecting
   past messages/facts into the prompt (the AI currently has no memory). This is now the main
   remaining feature.

7. **(Optional) Publish to Google Play** ($25 one-time) to remove the "unknown source"
   install warning friends see when sideloading the APK. — still open (optional).

**Immediate next step when resuming:** **task 6 — Phase 2 memory** (design the schema +
extraction + context injection). No APK rebuild is pending; the current build ships everything.
If instead doing an optional task (e.g. Google Sign-In), that's fine — feature work and the APK
are independent.

---

## 11. DOC MAINTENANCE RULE

Update docs on every major milestone: PRD, SRS, ROADMAP, ARCHITECTURE, DATABASE,
API, DEPLOYMENT, LEARNING, and this handover. A DEPLOYMENT.md capturing the Render +
Brevo + EAS setup is worth creating; populated README comes near launch.

---

## 12. FREE DEPLOYMENT PLAN — send a real "Saphin AI" APK to friends

**Goal:** produce a standalone `Saphin AI.apk` (own name + icon) that friends install
directly on Android — no Play Store, no fees. Cost = **$0**.

### Cost reality (kept honest)
- Backend hosting (Render free): $0. EAS Build (free tier, limited builds/month): $0.
- Supabase + Groq + Brevo: free tiers, $0.
- Sharing an `.apk` directly with friends: free.
- ONLY paid if later publishing to stores: Google Play $25 one-time, Apple $99/year.
- iOS note: you can add an iOS profile in eas.json for free, but installing on a real
  iPhone needs an Apple Developer account ($99/yr) + TestFlight/UDID. Android is free forever.

### STEP-BY-STEP status

**A. Prep the backend for hosting — ✅ DONE**
- `backend/Procfile`, `backend/.python-version` = `3.12.7`, completed `requirements.txt`.

**B. Deploy the backend on Render — ✅ DONE**
- Web Service `saphin-ai-backend`, root `backend`, Free, env vars set, auto-deploy from
  `main`. Live; `/health` → `{"status":"ok"}`. Free instance sleeps (~50s cold start).

**B2. Custom SMTP (Brevo) — ✅ DONE.** Confirmation emails send reliably. Site URL → backend.

**C. Point the app at the public backend — ✅ DONE**
- `frontend/.env` → `EXPO_PUBLIC_API_URL=https://saphin-ai-backend.onrender.com`. Verified.

**D. Build the APK with EAS — ✅ DONE (multiple builds, latest ships everything)**
- `npm install -g eas-cli`, `eas login` (account `saphinpraja`).
- `eas build:configure` → linked project `@saphinpraja/saphin-ai`, wrote projectId into app.json.
- `eas.json`: preview + production profiles, `"android": { "buildType": "apk" }`,
  `distribution: "internal"`, env vars baked in (API URL + Supabase URL + anon key).
- First build succeeded: keystore auto-generated in the cloud, `.apk` download link returned.
  (Ignore the `adb ENOENT` error at the end — that's just the optional "run on emulator" step;
  the APK is already built.)
- Rebuilt to ship theme + avatar + delete dialog + keyboard fix — ✅ tested working.
- Rebuilt AGAIN this session to ship confirm page + password reset + change password + biometric
  fingerprint login + scroll/keyboard fixes — ✅ **tested working on the real device**. This is
  the current shippable APK.
- **Native-module note:** `expo-local-authentication` + `expo-secure-store` were added this
  session. They require a fresh EAS build to work (Expo Go can't run them). `expo-secure-store`
  auto-registers a config plugin — nothing extra to configure. Build with the same command:
  `eas build -p android --profile preview`.
- **Free-tier build time:** expect ~20–40 min total (queue wait + native compile). Status at
  `expo.dev` → project → Builds ("In queue" / "In progress" / "Finished"). The build runs on
  Expo's servers — you can close the terminal; the link stays valid. A local `npx expo start` can
  run at the same time without interfering.

**E. Share with friends — ✅ working**
- Send the `.apk` (or open the EAS build link on the phone). On Android: tap → allow
  "install from unknown sources" → install. They see the **Saphin AI** icon + name.
- Android shows a "harmful/unknown app" warning for any sideloaded APK — normal, tap
  "Install anyway". Only removed by publishing to Play Store.
- They sign up in-app (confirm password + email confirmation via Brevo), click the email
  link, then log in. Mention the ~50s cold-start on the first request after idle.

### Watch-outs / likely gotchas
- `SUPABASE_SERVICE_ROLE_KEY` MUST be present in Render's env (for `DELETE /account`).
- `DATABASE_URL` on the host must keep `postgresql+asyncpg://` and `%40` for any `@`.
- Free host sleeps on idle (first request slow) — expected, not a bug.
- If the backend URL changes, rebuild the APK (URL baked at build time).
- If email stops sending, regenerate the Brevo SMTP key and update it in Supabase.
- **`newArchEnabled` must stay `false`** or the keyboard bug comes back in the build.
- The custom icon + "Saphin AI" name only appear in the real build, never in Expo Go.
- **Biometrics + true keyboard behavior are APK-only** — never trust Expo Go for them (§9 #31).
- After any backend push, a new route 404s for a few minutes and the browser caches it — check
  `/openapi.json` for the route + hard-refresh (§9 #29). Not a code bug.
- **Supabase Redirect URLs** must list both `/reset-password` and `/confirmed`, and Site URL must
  be `.../confirmed`, or the email links misbehave (§9 #30).

**When resuming: NO APK rebuild is pending — the current build ships everything and is tested.**
Next real work is **Phase 2 (memory)**. Feature work and the APK are independent; only rebuild
after a native-module or app.json change (then keep `newArchEnabled:false`, commit, build, and
re-test on the real APK).
