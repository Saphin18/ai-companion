import { ThemeDefinition } from "./types";
import { defaultTheme } from "./themes/default";
import { onePieceTheme } from "./themes/onePiece";
import { natureThemes } from "./themes/nature";

// THE one file you edit to add a theme: import it, add it to this array.
// natureThemes is an array of 5 photo wallpapers, spread in here.
export const THEMES: ThemeDefinition[] = [
  defaultTheme,
  onePieceTheme,
  ...natureThemes,
];

export const DEFAULT_THEME_ID = "default";

export function getTheme(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? defaultTheme;
}