import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateThemePreference } from "../services/api";

export type ThemeMode = "dark" | "light" | "system";

export type Theme = {
  background: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  border: string;
  danger: string;
  bubbleUser: string;
  bubbleUserText: string;
  bubbleCompanion: string;
  bubbleCompanionText: string;
  overlay: string;
  isDark: boolean;
};

const dark: Theme = {
  background: "#0f1419",
  surface: "#1a2230",
  surfaceAlt: "rgba(255,255,255,0.10)",
  textPrimary: "#ffffff",
  textSecondary: "#8b8ba7",
  accent: "#7c6cf0",
  accentText: "#ffffff",
  border: "rgba(255,255,255,0.10)",
  danger: "#ef4444",
  bubbleUser: "#6366f1",
  bubbleUserText: "#ffffff",
  bubbleCompanion: "#1e293b",
  bubbleCompanionText: "#e2e8f0",
  overlay: "rgba(0,0,0,0.55)",
  isDark: true,
};

const light: Theme = {
  background: "#f4f5fb",
  surface: "#ffffff",
  surfaceAlt: "#eceef6",
  textPrimary: "#1b1c2e",
  textSecondary: "#6b7280",
  accent: "#7c6cf0",
  accentText: "#ffffff",
  border: "rgba(0,0,0,0.08)",
  danger: "#dc2626",
  bubbleUser: "#7c6cf0",
  bubbleUserText: "#ffffff",
  bubbleCompanion: "#eceef6",
  bubbleCompanionText: "#1b1c2e",
  overlay: "rgba(0,0,0,0.35)",
  isDark: false,
};

const STORAGE_KEY = "theme_pref";

type Ctx = {
  mode: ThemeMode;
  theme: Theme;
  setMode: (m: ThemeMode) => void;
  hydrateFromServer: (m?: ThemeMode | null) => void;
};

const ThemeContext = createContext<Ctx | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [hadCache, setHadCache] = useState(false);

  // Apply the saved choice immediately on launch (no network needed).
  useEffect(() => {
    (async () => {
      try {
        const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as
          | ThemeMode
          | null;
        if (saved === "dark" || saved === "light" || saved === "system") {
          setModeState(saved);
          setHadCache(true);
        }
      } catch {}
      setCacheLoaded(true);
    })();
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    setHadCache(true);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
    updateThemePreference(m).catch(() => {}); // best-effort server sync
  };

  // On login we learn the server value; adopt it only if this device has no
  // local choice yet (so we never override a fresh in-app toggle).
  const hydrateFromServer = (m?: ThemeMode | null) => {
    if (!cacheLoaded || hadCache) return;
    if (m === "dark" || m === "light" || m === "system") {
      setModeState(m);
      setHadCache(true);
      AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
    }
  };

  const theme = useMemo(() => {
    const effective =
      mode === "system" ? (system === "light" ? "light" : "dark") : mode;
    return effective === "light" ? light : dark;
  }, [mode, system]);

  const value = useMemo(
    () => ({ mode, theme, setMode, hydrateFromServer }),
    [mode, theme, cacheLoaded, hadCache]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}