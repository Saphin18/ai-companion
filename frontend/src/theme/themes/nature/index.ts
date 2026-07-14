import { ThemeDefinition, ThemeVariant } from "../../types";
import { makeNatureBackground } from "./Background";

// Shared palette for all photo themes: light text + translucent surfaces so the
// photo shows through, and background = "transparent" so the wallpaper appears on
// EVERY screen (chats list, chat, profile) — not just chat.
const base: ThemeVariant = {
  background: "transparent",
  surface: "rgba(20,26,32,0.66)",
  surfaceAlt: "rgba(30,38,46,0.66)",
  textPrimary: "#f4f7f5",
  textSecondary: "#c8d0cb",
  accent: "#7bc47f",
  accentText: "#0b0f0c",
  border: "rgba(255,255,255,0.14)",
  danger: "#e2685f",
  bubbleUser: "rgba(123,196,127,0.92)",
  bubbleUserText: "#0b1a0e",
  bubbleCompanion: "rgba(24,30,36,0.82)",
  bubbleCompanionText: "#f1f5f2",
  overlay: "rgba(0,0,0,0.55)",
  isDark: true,
};

type Pos = "top" | "center" | "bottom";

function nature(
  id: string, name: string, emoji: string, description: string,
  wallpaper: number, position: Pos, overlay: string
): ThemeDefinition {
  const variant: ThemeVariant = { ...base };
  return {
    id, name, description, emoji,
    light: variant, dark: variant,
    Background: makeNatureBackground(wallpaper, position, overlay),
  };
}

// Per photo: which part to show (top/center/bottom) + overall dim amount.
// Headers/input already get extra darkening from the gradient, so keep these light.
export const natureThemes: ThemeDefinition[] = [
  nature("natureMountainDusk", "Mountain Dusk", "🏔️", "Layered peaks at dusk",
    require("../../../../assets/wallpapers/img2.jpg"), "center", "rgba(8,12,16,0.15)"),
  nature("natureForestMist", "Forest Mist", "🌲", "Misty evergreen forest",
    require("../../../../assets/wallpapers/img3.jpg"), "center", "rgba(8,12,16,0.18)"),
  nature("natureStillLake", "Snowy Peak", "🗻", "Snowy peak at dusk",
    require("../../../../assets/wallpapers/img4.jpg"), "center", "rgba(8,12,16,0.15)"),
  nature("natureGoldenSky", "Swan Lake", "🦢", "Swans on a misty lake",
    require("../../../../assets/wallpapers/img5.jpg"), "bottom", "rgba(8,10,16,0.20)"),
  nature("natureSunlitCalm", "Sunlit Calm", "☀️", "Soft light on stone",
    require("../../../../assets/wallpapers/img1.jpg"), "bottom", "rgba(8,10,14,0.30)"),
];