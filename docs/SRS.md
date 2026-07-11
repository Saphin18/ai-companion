# Software Requirements Specification (SRS)

**Project:** AI Companion
**Scope:** Phase 1 — Foundation ONLY
**Version:** 1.0
**Status:** Approved

> An SRS turns the PRD's vision into **precise, testable requirements**.
> Each requirement is a "the system shall…" statement. If it can't be tested,
> it doesn't belong here. Later features (memory, moods, notifications, voice)
> are intentionally excluded and will get their own SRS sections per phase.

---

## 2.1 Accounts & Authentication

- The system **shall** let a user register with email + password (min 8 characters).
- The system **shall** reject registration if the email is already in use.
- The system **shall** let a user log in with email/password, Google, or Apple.
  *(Facebook optional, later.)*
- The system **shall** allow users to securely **reset their password via email
  verification**.
- The system **shall** keep a user logged in across app restarts (secure token
  storage).
- The system **shall** automatically **expire invalid or revoked authentication
  sessions** and require the user to log in again.
- The system **shall** let a user log out.

## 2.2 User Profile

- The system **shall** store a display name and (optionally) a profile photo.
- The system **shall** let a user view and edit their profile.
- The system **shall** let a user delete their account and all associated data.
  *(Enforces Privacy Principle #2.)*

## 2.3 AI Chat

- The system **shall** present a chat screen where the user sends a message and
  receives an AI reply.
- The AI **shall** respond in a warm, supportive tone and **shall never** claim
  to be human or to have real feelings.
- The system **shall** show a visible "thinking"/loading state while waiting for
  a reply.
- The system **shall** handle AI/network errors gracefully with a friendly
  message (never a crash or a raw error).

## 2.4 Chat History

- The system **shall** save every message (user and AI) to that user's account.
- The system **shall** load a user's past conversation when they reopen the app.
- Chat history **shall** be private to its owner.

## 2.5 Non-Functional Requirements

*(The "how well," not the "what.")*

- **Security:** passwords stored **hashed** (never plain text); all traffic over
  **HTTPS**; secrets in **environment variables**, never in code.
- **Provider independence:** the app talks to an internal "AI provider"
  interface, so Claude / OpenAI / etc. can be swapped without touching chat logic.
- **Performance:** a chat reply should begin arriving within a few seconds under
  normal conditions.
- **Usability:** the UI should feel calm, modern, and friendly, with clear
  feedback for every action.

---

## Out of Scope (Phase 1)

Long-term memory, emotional tone detection, journaling, mood summaries, push
notifications, proactive check-ins, voice conversations, premium features.
