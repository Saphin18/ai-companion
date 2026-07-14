import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useColorScheme, View, Animated, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateThemePreference, updateThemeId } from "../services/api";
import { ThemeDefinition, ThemeMode, ThemeVariant } from "./types";
import { THEMES, DEFAULT_THEME_ID, getTheme } from "./registry";

// Backward-compat aliases so existing screens keep working unchanged.
export type Theme = ThemeVariant;
export type { ThemeMode };

const MODE_KEY = "theme_pref"; // unchanged key -> existing users keep their mode
const THEME_ID_KEY = "theme_id";

type Ctx = {
  mode: ThemeMode;
  themeId: string;
  theme: ThemeVariant; // resolved flat tokens (what screens read)
  definition: ThemeDefinition; // full theme (for animated bg/loader)
  themes: ThemeDefinition[];
  setMode: (m: ThemeMode) => void;
  setThemeId: (id: string) => void;
  hydrateFromServer: (mode?: ThemeMode | null, themeId?: string | null) => void;
};

const ThemeContext = createContext<Ctx | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [hadModeCache, setHadModeCache] = useState(false);
  const [hadThemeCache, setHadThemeCache] = useState(false);

  // Apply saved choices immediately on launch (no network needed).
  useEffect(() => {
    (async () => {
      try {
        const savedMode = (await AsyncStorage.getItem(MODE_KEY)) as
          | ThemeMode
          | null;
        if (
          savedMode === "dark" ||
          savedMode === "light" ||
          savedMode === "system"
        ) {
          setModeState(savedMode);
          setHadModeCache(true);
        }
        const savedId = await AsyncStorage.getItem(THEME_ID_KEY);
        if (savedId) {
          setThemeIdState(savedId);
          setHadThemeCache(true);
        }
      } catch {}
      setCacheLoaded(true);
    })();
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    setHadModeCache(true);
    AsyncStorage.setItem(MODE_KEY, m).catch(() => {});
    updateThemePreference(m).catch(() => {}); // best-effort server sync
  };

  const setThemeId = (id: string) => {
    setThemeIdState(id);
    setHadThemeCache(true);
    AsyncStorage.setItem(THEME_ID_KEY, id).catch(() => {});
    updateThemeId(id).catch(() => {}); // best-effort server sync
  };

  // On login we learn the server values; adopt each only if this device has no
  // local choice yet (so we never override a fresh in-app change).
  const hydrateFromServer = (m?: ThemeMode | null, id?: string | null) => {
    if (!cacheLoaded) return;
    if (!hadModeCache && (m === "dark" || m === "light" || m === "system")) {
      setModeState(m);
      setHadModeCache(true);
      AsyncStorage.setItem(MODE_KEY, m).catch(() => {});
    }
    if (!hadThemeCache && id) {
      setThemeIdState(id);
      setHadThemeCache(true);
      AsyncStorage.setItem(THEME_ID_KEY, id).catch(() => {});
    }
  };

  const definition = useMemo(() => getTheme(themeId), [themeId]);

  const theme = useMemo(() => {
    const effective =
      mode === "system" ? (system === "light" ? "light" : "dark") : mode;
    return effective === "light" ? definition.light : definition.dark;
  }, [mode, system, definition]);

  // --- Smooth cross-fade whenever the look changes ---
  const fade = useRef(new Animated.Value(0)).current;
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return; // no fade on initial launch
    }
    fade.setValue(1); // cover with the new background...
    Animated.timing(fade, {
      toValue: 0, // ...then reveal the new theme
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [theme.background, theme.bubbleUser, themeId]);

  const value = useMemo(
    () => ({
      mode,
      themeId,
      theme,
      definition,
      themes: THEMES,
      setMode,
      setThemeId,
      hydrateFromServer,
    }),
    [mode, themeId, theme, definition, cacheLoaded, hadModeCache, hadThemeCache]
  );

  // The current theme's optional animated background (waves for One Piece).
  const Bg = definition.Background;

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {/* base fill so transparent screens still show the theme color */}
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.background }]}
        />
        {/* animated background layer (only if the theme provides one) */}
        {Bg ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Bg isDark={theme.isDark} />
          </View>
        ) : null}
        {children}
        {/* cross-fade overlay on theme change */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.background, opacity: fade },
          ]}
        />
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}