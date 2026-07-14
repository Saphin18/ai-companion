import React from "react";

export type ThemeMode = "dark" | "light" | "system";

export type ThemeVariant = {
  // ALL existing flat keys stay (nothing breaks):
  background: string; surface: string; surfaceAlt: string;
  textPrimary: string; textSecondary: string;
  accent: string; accentText: string; border: string; danger: string;
  bubbleUser: string; bubbleUserText: string;
  bubbleCompanion: string; bubbleCompanionText: string;
  overlay: string; isDark: boolean;
  // NEW optional flavor:
  fonts?: { regular?: string; medium?: string; bold?: string; display?: string };
  shape?: { buttonRadius?: number; cardRadius?: number; bubbleRadius?: number; inputRadius?: number };
};

export type ThemeDefinition = {
  id: string; name: string; description: string; emoji?: string;
  light: ThemeVariant; dark: ThemeVariant;
  Background?: React.ComponentType<{ isDark: boolean }>; // optional animated bg
  Loader?: React.ComponentType;                          // optional loading animation
};