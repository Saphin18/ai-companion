import { ThemeDefinition } from "../../types";
import OnePieceBackground from "./Background";

// "Ocean adventure" vibe — original colors only, no copyrighted art.
// Straw-hat red accent, gold highlights, deep ocean-navy base + animated waves.
export const onePieceTheme: ThemeDefinition = {
  id: "onePiece",
  name: "Grand Line",
  description: "Ocean-adventure reds & golds.",
  emoji: "🏴‍☠️",
  Background: OnePieceBackground, // <-- the animation slot, now filled
  dark: {
    background: "#0a1a2f",
    surface: "#122942",
    surfaceAlt: "rgba(255,255,255,0.08)",
    textPrimary: "#f7f3e8",
    textSecondary: "#9fb3c8",
    accent: "#e23b3b",
    accentText: "#ffffff",
    border: "rgba(247,201,72,0.22)",
    danger: "#ff5252",
    bubbleUser: "#e23b3b",
    bubbleUserText: "#ffffff",
    bubbleCompanion: "#12324f",
    bubbleCompanionText: "#eaf2fb",
    overlay: "rgba(3,10,20,0.62)",
    isDark: true,
    shape: { buttonRadius: 16, cardRadius: 18, bubbleRadius: 20, inputRadius: 14 },
  },
  light: {
    background: "#f3f7fb",
    surface: "#ffffff",
    surfaceAlt: "#e6eef7",
    textPrimary: "#0a1a2f",
    textSecondary: "#5a708a",
    accent: "#d62828",
    accentText: "#ffffff",
    border: "rgba(214,40,40,0.18)",
    danger: "#c81e1e",
    bubbleUser: "#d62828",
    bubbleUserText: "#ffffff",
    bubbleCompanion: "#eaf1f8",
    bubbleCompanionText: "#0a1a2f",
    overlay: "rgba(10,26,47,0.35)",
    isDark: false,
    shape: { buttonRadius: 16, cardRadius: 18, bubbleRadius: 20, inputRadius: 14 },
  },
};