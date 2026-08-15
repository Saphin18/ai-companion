import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../context/ThemeContext";
import { ThemeMode } from "../theme/types";
import { pickerLock } from "../services/pickerLock";

type Props = {
  onBack: () => void;
};

export default function WallpaperPickerScreen({ onBack }: Props) {
  const {
    theme,
    themeId,
    setThemeId,
    mode,
    setMode,
    themes,
    customWallpaper,
    setCustomWallpaper,
  } = useTheme();
  const [picking, setPicking] = useState(false);

  const modeOptions: { label: string; value: ThemeMode }[] = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ];

  const pickFromGallery = async () => {
    if (Platform.OS !== "web") {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission needed",
          "Enable photo access to choose a wallpaper."
        );
        return;
      }
    }
    setPicking(true);
    pickerLock.active = true;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.3,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const uri = result.assets[0].uri;

      // Convert to base64 data URL for persistent storage
      if (Platform.OS === "web" && typeof fetch !== "undefined") {
        try {
          const resp = await fetch(uri);
          const blob = await resp.blob();
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          setCustomWallpaper(dataUrl);
        } catch {
          setCustomWallpaper(uri);
        }
      } else {
        // Mobile: use expo-file-system to read as base64
        try {
          const FileSystem = require("expo-file-system");
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const ext = uri.split(".").pop()?.toLowerCase() || "jpeg";
          const mime =
            ext === "png" ? "image/png" : "image/jpeg";
          setCustomWallpaper(`data:${mime};base64,${base64}`);
        } catch {
          // Fallback: store the URI directly
          setCustomWallpaper(uri);
        }
      }
    } catch (e) {
      console.warn(e);
      Alert.alert("Couldn't load image", "Please try again.");
    } finally {
      setPicking(false);
      pickerLock.active = false;
    }
  };

  const removeCustomWallpaper = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const yes = window.confirm("Remove custom wallpaper?");
      if (yes) setCustomWallpaper(null);
    } else {
      Alert.alert(
        "Remove wallpaper",
        "Remove your custom wallpaper?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes",
            style: "destructive",
            onPress: () => setCustomWallpaper(null),
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Wallpaper
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== Appearance mode toggle ===== */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Appearance
        </Text>
        <View
          style={[
            styles.modeRow,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {modeOptions.map((opt) => {
            const active = mode === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setMode(opt.value)}
                style={[
                  styles.modeBtn,
                  active && { backgroundColor: theme.accent },
                ]}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    {
                      color: active
                        ? theme.accentText
                        : theme.textSecondary,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ===== Custom wallpaper section ===== */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Custom
        </Text>

        {customWallpaper ? (
          <View style={styles.customPreviewRow}>
            <View
              style={[
                styles.customPreviewCard,
                { borderColor: theme.accent, borderWidth: 2 },
              ]}
            >
              <Image
                source={{ uri: customWallpaper }}
                style={styles.customPreviewImg}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.checkBadge,
                  { backgroundColor: theme.accent },
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={theme.accentText}
                />
              </View>
            </View>
            <View style={styles.customActions}>
              <TouchableOpacity
                onPress={pickFromGallery}
                disabled={picking}
                style={[
                  styles.customActionBtn,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Ionicons
                  name="image-outline"
                  size={18}
                  color={theme.accent}
                />
                <Text
                  style={[styles.customActionText, { color: theme.accent }]}
                >
                  Change
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={removeCustomWallpaper}
                style={[
                  styles.customActionBtn,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={theme.danger}
                />
                <Text
                  style={[styles.customActionText, { color: theme.danger }]}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.galleryBtn,
              { borderColor: theme.border },
            ]}
            onPress={pickFromGallery}
            disabled={picking}
          >
            {picking ? (
              <ActivityIndicator color={theme.accent} />
            ) : (
              <>
                <View
                  style={[
                    styles.galleryIcon,
                    { backgroundColor: theme.surfaceAlt },
                  ]}
                >
                  <Ionicons
                    name="image-outline"
                    size={24}
                    color={theme.accent}
                  />
                </View>
                <Text
                  style={[styles.galleryText, { color: theme.accent }]}
                >
                  Choose from gallery
                </Text>
                <Text
                  style={[styles.galleryHint, { color: theme.textSecondary }]}
                >
                  JPG or PNG, any size
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* ===== Theme grid ===== */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          Themes
        </Text>
        <View style={styles.grid}>
          {themes.map((def) => {
            const isActive = def.id === themeId && !customWallpaper;
            const variant = theme.isDark ? def.dark : def.light;
            const hasWallpaper = !!variant.wallpaper;

            return (
              <TouchableOpacity
                key={def.id}
                style={[
                  styles.card,
                  {
                    borderColor: isActive ? theme.accent : theme.border,
                    borderWidth: isActive ? 2.5 : 1,
                  },
                ]}
                onPress={() => {
                  setThemeId(def.id);
                  setCustomWallpaper(null);
                }}
                activeOpacity={0.7}
              >
                {/* Preview area */}
                <View style={styles.preview}>
                  {hasWallpaper ? (
                    <Image
                      source={variant.wallpaper}
                      style={styles.previewImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.previewSolid,
                        { backgroundColor: variant.background },
                      ]}
                    >
                      {/* Mini chat bubble preview */}
                      <View
                        style={[
                          styles.miniBubbleRight,
                          { backgroundColor: variant.bubbleUser },
                        ]}
                      >
                        <View
                          style={[
                            styles.miniLine,
                            {
                              backgroundColor: variant.bubbleUserText,
                              opacity: 0.5,
                              width: 32,
                            },
                          ]}
                        />
                      </View>
                      <View
                        style={[
                          styles.miniBubbleLeft,
                          { backgroundColor: variant.bubbleCompanion },
                        ]}
                      >
                        <View
                          style={[
                            styles.miniLine,
                            {
                              backgroundColor: variant.bubbleCompanionText,
                              opacity: 0.5,
                              width: 40,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.miniLine,
                            {
                              backgroundColor: variant.bubbleCompanionText,
                              opacity: 0.3,
                              width: 24,
                              marginTop: 3,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  )}

                  {/* Active check badge */}
                  {isActive && (
                    <View
                      style={[
                        styles.checkBadge,
                        { backgroundColor: theme.accent },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={theme.accentText}
                      />
                    </View>
                  )}
                </View>

                {/* Label below preview */}
                <View
                  style={[
                    styles.labelWrap,
                    { backgroundColor: theme.surface },
                  ]}
                >
                  {def.emoji ? (
                    <Text style={styles.emoji}>{def.emoji}</Text>
                  ) : null}
                  <Text
                    style={[styles.cardName, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {def.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reset to default */}
        {(themeId !== "default" || customWallpaper) && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setThemeId("default");
              setCustomWallpaper(null);
            }}
          >
            <Text style={[styles.resetText, { color: theme.textSecondary }]}>
              Reset to default
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700" },
  scrollContent: { paddingHorizontal: 16 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
    textTransform: "uppercase",
  },

  modeRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modeBtnText: { fontSize: 14, fontWeight: "600" },

  /* --- Custom wallpaper --- */
  galleryBtn: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: "center",
  },
  galleryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  galleryText: { fontSize: 15, fontWeight: "600" },
  galleryHint: { fontSize: 12, marginTop: 4 },

  customPreviewRow: {
    flexDirection: "row",
    gap: 12,
  },
  customPreviewCard: {
    width: 100,
    height: 130,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  customPreviewImg: {
    width: "100%",
    height: "100%",
  },
  customActions: {
    flex: 1,
    justifyContent: "center",
    gap: 10,
  },
  customActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  customActionText: { fontSize: 14, fontWeight: "600" },

  /* --- Theme grid --- */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  preview: {
    aspectRatio: 3 / 4,
    position: "relative",
  },
  previewImg: {
    width: "100%",
    height: "100%",
  },
  previewSolid: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  miniBubbleRight: {
    alignSelf: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderBottomRightRadius: 3,
    marginBottom: 6,
  },
  miniBubbleLeft: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderBottomLeftRadius: 3,
  },
  miniLine: {
    height: 3,
    borderRadius: 1.5,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  labelWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  emoji: { fontSize: 14, marginRight: 6 },
  cardName: { fontSize: 13, fontWeight: "600", flex: 1 },

  resetBtn: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  resetText: { fontSize: 14 },
});
