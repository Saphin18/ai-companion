import { ThemeDefinition } from "./types";
import { defaultTheme } from "./themes/default";

// THE one file you edit to add a theme: import it, add it to this array.
export const THEMES: ThemeDefinition[] = [defaultTheme];

export const DEFAULT_THEME_ID = "default";

export function getTheme(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? defaultTheme;
}