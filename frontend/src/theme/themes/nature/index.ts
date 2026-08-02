import { ThemeDefinition, ThemeVariant } from "../../types";
import { makeNatureBackground } from "./Background";
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
  wallpaper: number, position: Pos, overlay: string, webWallpaper?: number
): ThemeDefinition {
  const variant: ThemeVariant = { ...base };
  return {
    id, name, description, emoji,
    light: variant, dark: variant,
    Background: makeNatureBackground(wallpaper, position, overlay, webWallpaper),
  };
}
export const natureThemes: ThemeDefinition[] = [
  nature("natureMountainDusk", "Mountain Dusk", "\uD83C\uDFD4\uFE0F", "Layered peaks at dusk",
    require("../../../../assets/wallpapers/img2.jpg"), "center", "rgba(8,12,16,0.15)",
    require("../../../../assets/wallpaper1/img6.jpg")),
  nature("natureForestMist", "Forest Mist", "\uD83C\uDF32", "Misty evergreen forest",
    require("../../../../assets/wallpapers/img3.jpg"), "center", "rgba(8,12,16,0.18)",
    require("../../../../assets/wallpaper1/img9.jpg")),
  nature("natureStillLake", "Snowy Peak", "\uD83D\uDDFB", "Snowy peak at dusk",
    require("../../../../assets/wallpapers/img4.jpg"), "center", "rgba(8,12,16,0.15)",
    require("../../../../assets/wallpaper1/img10.jpg")),
  nature("natureGoldenSky", "Swan Lake", "\uD83E\uDDA2", "Swans on a misty lake",
    require("../../../../assets/wallpapers/img5.jpg"), "bottom", "rgba(8,10,16,0.20)",
    require("../../../../assets/wallpaper1/img13.jpg")),
  nature("natureSunlitCalm", "Sunlit Calm", "\u2600\uFE0F", "Soft light on stone",
    require("../../../../assets/wallpapers/img1.jpg"), "bottom", "rgba(8,10,14,0.30)",
    require("../../../../assets/wallpaper1/img15.jpg")),
];
