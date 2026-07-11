# Product Requirements Document (PRD)

**Project:** AI Companion (working title)
**Version:** 1.0
**Status:** Approved
**Last updated:** Step 1 (Planning)

> A PRD is a plain-English "north star" that answers *what* we are building and
> *for whom*, before any code is written. It is cheap to change a sentence here;
> it is expensive to rewrite code later. This document is our shared contract.

---

## 1. Vision

A mobile app that gives each person a warm, supportive AI companion that feels
like a trusted friend — it remembers what matters to them, checks in, and helps
them feel encouraged and understood.

---

## 2. Who It's For

People who want a friendly, always-available companion for encouragement,
reflection, and casual conversation. We assume our users are:

- Non-technical
- Privacy-conscious
- Looking for warmth and consistency, not a productivity tool

---

## 3. What It Must Always Be

The companion is **warm, supportive, funny when appropriate, encouraging, and
consistent.** It communicates naturally and empathetically.

**Non-negotiable behavioral rules:**

- It **never claims to be human** or to have real feelings.
- It communicates empathetically without pretending its empathy is human emotion.
- It **gently encourages real-world connection** and does not foster unhealthy
  dependence on the app.

---

## 4. Roadmap

We build **top-down**: each phase stands on a working foundation from the phase
before it.

### Phase 1 — Foundation
- Project setup
- Beautiful mobile UI
- Email/password authentication
- Google login
- Apple Sign-In *(required by App Store when other social logins are offered)*
- Facebook login *(optional)*
- User profile
- Secure backend
- AI chat
- Chat history

### Phase 2 — Memory
- Long-term memory
- Structured memory system
- Memory extraction
- Context injection

### Phase 3 — Personality & Reflection
- Emotional tone detection
- Motivation mode
- Humor mode
- Journaling
- Mood summaries

### Phase 4 — Proactivity
- Push notifications
- Proactive check-ins
- Daily reminders
- Goal tracking

### Phase 5 — Advanced
- Voice conversations
- Premium features
- Advanced personalization

---

## 5. Privacy & Safety Principles

These are non-negotiable and baked in from day one:

- Personal data is stored securely and **never sold or shared**.
- The user can **view and delete** their own data at any time.
- The companion supports wellbeing **without replacing real relationships or
  professional help**, and points to real resources if a user appears to be in
  genuine distress.

---

## 6. Definition of "Done"

By the end of the project we will have:

- A fully working AI Companion mobile app
- A clean, complete GitHub repository
- Clear documentation
- A deployment guide
- Production-ready code
- **The user (you) understanding how every part of the project works**

---

## 7. Future Vision

These goals guide our **architecture decisions now**, even though most are built
in later phases. They exist so we design a project that *grows* cleanly instead
of one we have to tear down and rebuild.

- The AI builds a **long-term relationship** with each user, not just
  message-by-message replies.
- It remembers important **milestones** and brings them up later, naturally and
  when relevant.
- It checks in proactively **without being manipulative or guilt-inducing** about
  the user being away.
- It **adapts to each user's communication style** over time (more humorous,
  motivational, direct, or reflective).
- The app eventually supports **multiple selectable AI companion personalities**.
- The architecture keeps **AI providers swappable** (Claude, OpenAI, Gemini,
  local models) without major rewrites.
- The system is designed to **scale cleanly** toward large user counts —
  *without over-engineering for scale we don't yet have.*

---

## 8. Explicitly NOT in the MVP (Phase 1)

To keep our first working version focused, these are intentionally deferred to
later phases (all are planned — just not first): long-term memory, emotional
tone detection, journaling, mood summaries, push notifications, proactive
check-ins, voice conversations, and premium features.
