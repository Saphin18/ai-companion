import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "../ThemeContext";

// Fallback corner radii if a theme doesn't override shape.*
const R = { button: 14, card: 16, bubble: 18, input: 12 };

/* ---------- ThemedBackground (with animation slot) ---------- */
export function ThemedBackground({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: any;
}) {
  const { theme, definition } = useTheme();
  const Bg = definition.Background; // optional animated background per theme
  return (
    <View style={[{ flex: 1, backgroundColor: theme.background }, style]}>
      {Bg ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Bg isDark={theme.isDark} />
        </View>
      ) : null}
      {children}
    </View>
  );
}

/* ---------- ThemedLoader (with animation slot) ---------- */
export function ThemedLoader({ size = "large" as "small" | "large" }) {
  const { theme, definition } = useTheme();
  const Custom = definition.Loader; // optional custom loader per theme
  if (Custom) return <Custom />;
  return <ActivityIndicator size={size} color={theme.accent} />;
}

/* ---------- ThemedButton ---------- */
export function ThemedButton({
  title,
  onPress,
  variant = "primary" as "primary" | "outline",
  disabled = false,
  loading = false,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}) {
  const { theme } = useTheme();
  const radius = theme.shape?.buttonRadius ?? R.button;
  const isOutline = variant === "outline";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        {
          borderRadius: radius,
          paddingVertical: 15,
          paddingHorizontal: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isOutline ? "transparent" : theme.accent,
          borderWidth: isOutline ? 1 : 0,
          borderColor: theme.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? theme.accent : theme.accentText} />
      ) : (
        <Text
          style={{
            color: isOutline ? theme.textPrimary : theme.accentText,
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/* ---------- ThemedCard ---------- */
export function ThemedCard({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: any;
}) {
  const { theme } = useTheme();
  const radius = theme.shape?.cardRadius ?? R.card;
  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ---------- ThemedInput ---------- */
export function ThemedInput(props: any) {
  const { theme } = useTheme();
  const radius = theme.shape?.inputRadius ?? R.input;
  const { style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...rest}
      style={[
        {
          backgroundColor: theme.surfaceAlt,
          color: theme.textPrimary,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: theme.border,
          paddingVertical: 12,
          paddingHorizontal: 14,
          fontSize: 15,
        },
        style,
      ]}
    />
  );
}

/* ---------- ThemePicker (drop into Profile) ---------- */
export function ThemePicker() {
  const { theme, themes, themeId, setThemeId } = useTheme();

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4, gap: 12 }}
      >
        {themes.map((t) => {
          // Preview using the variant matching the current light/dark mode.
          const v = theme.isDark ? t.dark : t.light;
          const selected = t.id === themeId;
          return (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.85}
              onPress={() => setThemeId(t.id)}
              style={{
                width: 130,
                borderRadius: theme.shape?.cardRadius ?? R.card,
                borderWidth: 2,
                borderColor: selected ? theme.accent : theme.border,
                backgroundColor: v.background,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>{t.emoji ?? "🎨"}</Text>
              <Text
                numberOfLines={1}
                style={{
                  color: v.textPrimary,
                  fontSize: 15,
                  fontWeight: "700",
                  marginTop: 6,
                }}
              >
                {t.name}
              </Text>
              {/* mini color swatches */}
              <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
                <Swatch color={v.accent} />
                <Swatch color={v.bubbleUser} />
                <Swatch color={v.surface} />
              </View>
              {selected ? (
                <Text
                  style={{
                    color: theme.accent,
                    fontSize: 12,
                    fontWeight: "700",
                    marginTop: 10,
                  }}
                >
                  ✓ Active
                </Text>
              ) : (
                <Text
                  style={{
                    color: v.textSecondary,
                    fontSize: 12,
                    marginTop: 10,
                  }}
                >
                  Tap to use
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: color,
        borderWidth: 1,
        borderColor: "rgba(128,128,128,0.35)",
      }}
    />
  );
}