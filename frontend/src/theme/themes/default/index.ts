import { ThemeDefinition } from "../../types";

// "Lamplight" - the warm Saphin palette (Session 23).
// Replaces the original cool blue-black + indigo palette. Every hue is now
// temperature-biased warm: brown-black grounds, apricot accent, warm greys.
//
// Every foreground/background pair below was contrast-checked against WCAG AA
// (4.5:1 for body text). Do not lighten bubbleUser or textSecondary without
// re-checking - they are the two pairs with the least headroom.
//
// NOTE: the custom gallery wallpaper renders at 0.7 opacity OVER `background`
// (see ThemeContext.tsx), so `background` tints the user's own photo. Keeping
// it warm is deliberate.
export const defaultTheme: ThemeDefinition = {
  id: "default",
  name: "Saphin",
  description: "Warm lamplight.",
  emoji: "🕯️",
  dark: {
    background: "#15110e",        // warm near-black (was #0f1419 blue-black)
    surface: "#221b16",
    surfaceAlt: "rgba(255,240,230,0.09)",
    textPrimary: "#f6efe8",       // 16.7:1 on background
    textSecondary: "#a89585",     // 6.6:1 on background
    accent: "#e8956b",            // apricot - 8.1:1 on background
    accentText: "#241710",        // 7.5:1 on accent
    border: "rgba(246,239,232,0.11)",
    danger: "#ef6b5e",            // 6.2:1 on background
    bubbleUser: "#a05939",        // darkened for contrast - see note above
    bubbleUserText: "#fff6f0",    // 4.9:1 on bubbleUser
    bubbleCompanion: "#2a211b",
    bubbleCompanionText: "#efe4da", // 12.7:1 on bubbleCompanion
    overlay: "rgba(10,6,4,0.60)",
    isDark: true,
  },
  light: {
    background: "#faf6f1",        // warm paper (was #f4f5fb cool off-white)
    surface: "#ffffff",
    surfaceAlt: "#f1e9e0",
    textPrimary: "#2e2520",       // 14:1 on background
    textSecondary: "#7a6b60",     // 4.8:1 on background
    accent: "#ad5330",            // burnt sienna - 4.8:1 on background
    accentText: "#fff8f3",        // 4.9:1 on accent
    border: "rgba(46,37,32,0.10)",
    danger: "#b4342a",
    bubbleUser: "#ad5330",
    bubbleUserText: "#fff8f3",    // 4.9:1 on bubbleUser
    bubbleCompanion: "#f1e9e0",
    bubbleCompanionText: "#2e2520",
    overlay: "rgba(46,37,32,0.38)",
    isDark: false,
  },
};
