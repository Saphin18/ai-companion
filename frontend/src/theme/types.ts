import React from "react";

export type ThemeMode = "dark" | "light" | "system";

export type ThemeVariant = {
  background: string; surface: string; surfaceAlt: string;
  textPrimary: string; textSecondary: string;
  accent: string; accentText: string; border: string; danger: string;
  bubbleUser: string; bubbleUserText: string;
  bubbleCompanion: string; bubbleCompanionText: string;
  overlay: string; isDark: boolean;
  fonts?: { regular?: string; medium?: string; bold?: string; display?: string };
  shape?: { buttonRadius?: number; cardRadius?: number; bubbleRadius?: number; inputRadius?: number };

  // NEW — nature photo wallpapers (shown behind ChatScreen only):
  wallpaper?: number;          // a bundled require("...jpg") image
  wallpaperOverlay?: string;   // dark overlay color for text legibility
};

export type ThemeDefinition = {
  id: string; name: string; description: string; emoji?: string;
  light: ThemeVariant; dark: ThemeVariant;
  Background?: React.ComponentType<{ isDark: boolean }>;
  Loader?: React.ComponentType;
};