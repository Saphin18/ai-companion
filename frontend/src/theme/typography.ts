import { TextStyle } from "react-native";

// Typography system (Session 23).
//
// Two families: Fraunces (a soft, slightly wonky serif) for display text, and
// Figtree (a warm humanist sans) for everything else. Both are bundled as
// STATIC per-weight files - see the warning below.
//
// ============================================================================
// CRITICAL: never combine these with `fontWeight`.
// ============================================================================
// On Android a custom font plus `fontWeight` either does nothing or produces a
// synthesised fake-bold that looks broken. Weight is selected by choosing the
// right FAMILY below, not by setting a weight. If you need bold body text, use
// `fonts.bold`, never `fontWeight: "700"`.
//
// Adding a new weight means three steps: copy the static .ttf into BOTH
// assets/fonts/ and public/fonts/, add it to `fontAssets` here, and add a
// matching @font-face rule in App.tsx's web block. Miss the public/ copy and it
// silently falls back to the system font on the Vercel build only (bug #73).

export const fonts = {
  /** Fraunces SemiBold - greetings, screen titles, the wordmark. */
  display: "Fraunces-SemiBold",
  /** Figtree Regular - body copy, descriptions, chat messages. */
  regular: "Figtree-Regular",
  /** Figtree SemiBold - labels, row titles, emphasis. */
  medium: "Figtree-SemiBold",
  /** Figtree Bold - buttons only. */
  bold: "Figtree-Bold",
} as const;

// Files are loaded from assets/ on native and from public/fonts/ on web.
// Both paths must stay in sync.
export const fontAssets = {
  "Fraunces-SemiBold": require("../../assets/fonts/Fraunces-SemiBold.ttf"),
  "Figtree-Regular": require("../../assets/fonts/Figtree-Regular.ttf"),
  "Figtree-SemiBold": require("../../assets/fonts/Figtree-SemiBold.ttf"),
  "Figtree-Bold": require("../../assets/fonts/Figtree-Bold.ttf"),
};

// A 1.25 modular scale off a 15px body size. Before inventing a new size,
// check whether one of these already fits - six ad-hoc sizes across two screens
// is what this replaces.
export const type = {
  /** 32 - the landing wordmark. One per screen at most. */
  display: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
  } as TextStyle,
  /** 25 - home greeting, screen titles. */
  h1: {
    fontFamily: fonts.display,
    fontSize: 25,
    lineHeight: 31,
    letterSpacing: -0.3,
  } as TextStyle,
  /** 19 - card titles, section headings. */
  h2: {
    fontFamily: fonts.medium,
    fontSize: 19,
    lineHeight: 25,
  } as TextStyle,
  /** 16 - list row titles, nav items. */
  title: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  } as TextStyle,
  /** 15 - the default. Chat messages, descriptions, inputs. */
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  /** 15, emphasised. */
  bodyStrong: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  /** 13 - field labels, metadata. */
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
  /** 12 - timestamps, hints. */
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,
  /** 16 - button labels. The only place `fonts.bold` is used. */
  button: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 20,
  } as TextStyle,
  /** 11, uppercase - section dividers like "RECENT CHATS". */
  overline: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
  } as TextStyle,
} as const;
