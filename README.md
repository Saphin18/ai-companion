# Saphin AI

A warm, privacy-first AI companion app for Android — voice, images, and documents, all in one chat. Built by a solo developer as a genuine, non-manipulative companion (no streaks, no guilt-tripping, no "you haven't opened me in 3 days" notifications).

> Never claims to be human. Never sells the user's data. Never nags.

---

## What it does

- **Chat** with a warm AI companion that remembers what matters to you.
- **Voice messages** — record, auto-transcribed, and the companion can talk back.
- **Images** — attach a photo and the companion actually sees and describes it.
- **Documents** — attach a PDF or Word doc and the companion reads the content.
- **Journal** — private entries with gentle AI reflections.
- **Mood detection** — the companion quietly adapts its tone to how you're feeling.
- **Reminders and goals** — local reminders you own, plus goals gently woven into chat.
- **Daily check-ins** — optional, off by default, warm one-liners at a time you choose.
- **Themes** — Default, One Piece (Grand Line with animated waves), Nature (photo wallpapers).
- **Biometric unlock** — fingerprint or face unlock, off by default.

## Tech stack

**Frontend**

- Expo + React Native (TypeScript), SDK 54
- EAS Build for Android APKs
- `expo-audio`, `expo-image-picker`, `expo-document-picker`, `expo-secure-store`, `expo-notifications`, `expo-speech`

**Backend**

- FastAPI (Python 3.12)
- SQLAlchemy async + asyncpg
- Deployed on Render (auto-deploy from `main`)

**Database & storage**

- PostgreSQL via Supabase
- Supabase Auth (email/password + email confirmation via Brevo SMTP)
- Supabase Storage (private `attachments` bucket, public `avatars` bucket)

**AI**

- Groq — `llama-3.3-70b-versatile` (chat), `whisper-large-v3-turbo` (voice), `qwen/qwen3.6-27b` (vision)
- Pluggable provider abstraction — swap Groq for another vendor by editing a single file

**Notifications & scheduling**

- Expo Push API + Firebase FCM
- cron-job.org every 1 minute for check-in windows

## Architecture

```
                        ┌─────────────────────┐
                        │   Android APK       │
                        │  (Expo React Native)│
                        └──────────┬──────────┘
                                   │  HTTPS + JWT
                                   ▼
                        ┌─────────────────────┐
                        │   FastAPI Backend   │
                        │      (Render)       │
                        └──────────┬──────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                ▼                  ▼                  ▼
         ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
         │   Supabase  │   │    Groq     │   │  Expo Push  │
         │  (Postgres, │   │  (LLM +     │   │  + FCM      │
         │  Auth,      │   │  Whisper +  │   │             │
         │  Storage)   │   │  Qwen)      │   │             │
         └─────────────┘   └─────────────┘   └─────────────┘
```

**Key design choices**

- **Two-tier memory** — the last 20 messages of the current chat (short-term) plus a `user_memories` table (long-term) extracted best-effort in the background.
- **Provider abstraction** — swapping the LLM provider is a one-file change.
- **JWT via JWKS (ES256)** — no shared secrets between backend and Supabase.
- **Soft delete only** — chat data is NEVER hard-deleted; "Remove from list" sets `hidden_at`. Account deletion removes the Supabase auth user only, so a fresh signup starts clean while historical data stays owned by the app.
- **Documents never touch an AI on upload** — pure Python (`pypdf`, `python-docx`) extracts text. AI only sees the extracted content when the user actually sends it in a chat message.

## Project structure

```
Ai-Companion/
├── backend/
│   └── app/
│       ├── api/              # FastAPI routers (chat, sessions, profile, journal, ...)
│       ├── ai/               # LLM / Whisper / vision / doc-reader / memory-extractor
│       ├── auth/             # Supabase JWT validation (JWKS, ES256)
│       ├── db/               # SQLAlchemy async models + session
│       ├── models/           # Pydantic schemas
│       ├── repositories/     # Data access layer (one file per table)
│       └── services/         # Storage helper, other integrations
├── frontend/
│   ├── src/
│   │   ├── screens/          # Auth, Lock, ChatsList, Chat, Profile, Journal, ...
│   │   ├── components/       # ChatBubble, ChatInput, drawer, etc.
│   │   ├── services/         # API client, Supabase, notifications, biometrics
│   │   ├── context/          # ThemeContext, theme engine
│   │   └── types/            # Shared TypeScript types
│   ├── App.tsx
│   └── app.json              # Expo config
└── docs/
    └── HANDOVER.md           # Full project history + architecture decisions
```

## Development phases

- **Phase 1** — Auth, chat, sessions, message history
- **Phase 2** — Two-tier memory (recent history + long-term facts)
- **Phase 3** — Mood detection + tone adaptation + personality modes (motivator / humor / calm / balanced)
- **Phase 4** — Proactivity (check-ins, reminders, goals) — non-manipulative by design
- **Phase 5** — Navigation redesign (home screen with drawer)
- **Phase 6** — Attachments: voice messages (Whisper transcription), image vision, document reading, hands-free turn mode

## Local development

### Prerequisites

- Node.js 20+ and npm
- Python 3.12
- A Supabase project (URL + anon key + service role key)
- A Groq API key
- (Optional, for push) Firebase project with FCM enabled

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows
# or: source venv/bin/activate    # macOS / Linux

pip install -r requirements.txt

# Copy .env.example to .env and fill in:
#   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
#   DATABASE_URL  (must start postgresql+asyncpg://,  '@' in password = %40)
#   GROQ_API_KEY, CRON_SECRET

uvicorn app.main:app --reload
```

Runs on `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install

# Copy .env.example to .env and fill in:
#   EXPO_PUBLIC_API_URL
#   EXPO_PUBLIC_SUPABASE_URL
#   EXPO_PUBLIC_SUPABASE_ANON_KEY

npx expo start
```

### Before every APK build

```bash
cd frontend
npx expo-doctor       # must be 18/18 passed
npx tsc --noEmit      # must be silent
eas build -p android --profile preview
```

## Environment variables

| Name                              | Where    | Purpose                                                                 |
| --------------------------------- | -------- | ----------------------------------------------------------------------- |
| `SUPABASE_URL`                  | backend  | Supabase project URL                                                    |
| `SUPABASE_ANON_KEY`             | backend  | Public anon key                                                         |
| `SUPABASE_SERVICE_ROLE_KEY`     | backend  | Admin key (bypasses RLS — server-only, never shipped to the app)       |
| `DATABASE_URL`                  | backend  | `postgresql+asyncpg://...` — encode `@` in the password as `%40` |
| `GROQ_API_KEY`                  | backend  | Groq API access                                                         |
| `CRON_SECRET`                   | backend  | Guards`/internal/run-checkins`                                        |
| `EXPO_PUBLIC_API_URL`           | frontend | Backend base URL                                                        |
| `EXPO_PUBLIC_SUPABASE_URL`      | frontend | Same Supabase URL, exposed to the app                                   |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | frontend | Same anon key, exposed to the app                                       |

`.env` files are gitignored. `google-services.json` is committed (safe); `fcm-service-account.json` is a secret and gitignored.

## Product principles

These aren't marketing lines — they're baked into the code and enforced in reviews:

- **Chat data is never hard-deleted.** "Remove from list" is a soft delete (`hidden_at`). Log out ends the session, deletes nothing. Account deletion removes only the Supabase auth user; chat data becomes intentional orphans.
- **Proactivity is not manipulative.** Check-ins are OFF by default. No streaks. No guilt. No "you haven't opened me in 3 days" notifications. If we can't build a feature without it feeling like a slot machine, we don't build it.
- **Never claim to be human.** The companion is upfront about being an AI.
- **Never share data with third parties beyond what's needed.** Documents are parsed with pure Python — no OCR-as-a-service round trip. Voice files sit in a private Supabase bucket. Only the extracted text ever reaches the LLM.
- **Biometrics are optional and user-controlled.** Off by default, opt-in from Profile.

## Roadmap

- Realtime voice conversation (Phase 7)
- Home-screen quick actions for voice / photo / document
- Per-attachment summaries for multi-message document discussion
- iOS build

## License

Personal / non-commercial project. Not open for redistribution or commercial use without permission. If you found something in this repo useful, feel free to reach out.

## Credits

Built by **Saphin Praja**.
[Portfolio](https://saphinpraja.vercel.app/)

---

_Not affiliated with any AI provider mentioned. All trademarks belong to their respective owners._
