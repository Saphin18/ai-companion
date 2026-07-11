# What I Learned

> This is my personal learning journal for building my first app.
> Every time we hit a new concept, I add a short plain-English note here.
> One day this will be proof of how far I've come.

---

## Day 1 — Planning (thinking like an engineer)

**What is a PRD (Product Requirements Document)?**
A short, plain-English document that describes *what* we're building and *for
whom*, before writing any code. It's our "north star" so we don't accidentally
build the wrong thing.

**Why do professionals plan before coding?**
Because changing a sentence in a plan is cheap, but rewriting finished code is
expensive. Planning first prevents building the wrong thing and having to start
over.

**What is an MVP (Minimum Viable Product)?**
The *thinnest slice* of the app that proves the core idea works. For us, the core
idea is: "does talking to this companion actually feel warm and good?" We build
that first, then grow.

**What does "production-ready architecture" mean?**
Structuring the project the professional way from the start — clean folders,
separated responsibilities, environment variables, real security — so we don't
have to tear it down and rebuild later. The trick: we set up the *right shape*
but only add each piece when we actually need it.

**Why keep AI providers swappable?**
So the rest of the app talks to "a companion" rather than to one specific AI
company. That way, if we ever want to switch or add providers (Claude, OpenAI,
Gemini, a local model), we change one small part instead of rewriting everything.

**Key mentor lesson of the day:**
> Don't build for a million users before you have ten. Build *clean enough* that
> scaling later is a series of upgrades, not a rewrite.

---

## Day 2 — Choosing the tech stack

**What is a "tech stack"?**
The set of tools that work together to make an app: the mobile app, the backend,
the database, the auth system, and the AI. Each does one job.

**Why put the AI behind an "abstraction layer"?**
So our app talks to *our own* middle-man (`AIProvider`) instead of to Claude
directly. Swapping to another AI later means changing one file, not the whole app.
Like a universal power adapter.

**Why not build authentication ourselves?**
Secure login is extremely easy to get dangerously wrong (leaking passwords). We
use a certified, pre-built system (Supabase Auth) instead — like buying a
certified vault door instead of forging one.

**Why PostgreSQL and not MongoDB?**
Our data is *relational* — users connect to messages, sessions, memories.
Postgres is built for connected data; MongoDB is better for free-form data.

**What is an ADR (Architecture Decision Record)?**
A short note recording a big decision, why we made it, and what we rejected — so
future-me always understands why the project is shaped this way.

---
*Next entries (coming during setup): What is React Native? What is Expo? What is
FastAPI? What is a REST API? What is Git? What is npm?*

---

## Day 3 — Building & connecting the app (Phase 1 core)

**What is React Native / Expo?**
React Native lets us write one app in JavaScript/TypeScript that runs on both
iOS and Android. Expo is a toolkit on top that makes it easy to run and test
(scan a QR code, see it on your phone instantly via the Expo Go app).

**What is FastAPI / a REST API?**
FastAPI is our Python backend. A REST API is a set of "doors" (endpoints) the
app calls over the internet — e.g. the app POSTs a message to `/chat` and gets
a reply back. The app never talks to the AI or database directly, only to our
API.

**What is a JWT and why did it cause so much trouble?**
A JWT (JSON Web Token) is a signed proof of "who you are," issued at login. Our
backend must verify it before trusting a request. Supabase had moved to a newer
signing method (ES256 public/private keys via a JWKS endpoint) instead of the
old shared secret, so our first verification code rejected valid logins. Fix:
fetch Supabase's public keys and verify with those.

**The AI provider abstraction paid off today.**
We tried Anthropic (needed billing), then Gemini (free tier blocked in our
region), then Groq (free, worked). Each swap changed just ONE file
(`provider_factory.py`) plus a new provider file — the rest of the app never
changed. That is exactly why we built the abstraction layer.

**Debugging lesson:**
When something fails, add a temporary `print(...)` of the real error, read it,
fix the true cause, then remove the print. We went 401 -> (wrong URL) -> 401
(wrong JWT alg) -> 404/401 (JWKS fetch) -> 502 (bad AI key) -> 429 (no quota)
-> 200 OK. Each error told us the next thing to fix.

---
