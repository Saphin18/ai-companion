import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onGetStarted: () => void;
  onLogin: () => void;
};

export default function LandingScreen({ onGetStarted, onLogin }: Props) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 768;
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  const featureCard = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    description: string
  ) => (
    <View style={styles.featureCard}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={20} color="#a99cf5" />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={["#2a2350", "#3b2f63", "#1a1730"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.inner, { opacity: fade, transform: [{ translateY: slide }] }]}
        >
          <View style={styles.brand}>
            <View style={styles.orb} />
            <Text style={styles.appName}>Your Companion</Text>
            <Text style={styles.tagline}>
              A warm space to talk, whenever you need it.
            </Text>
          </View>

          <View style={[styles.features, isWide && { maxWidth: 520 , alignSelf: "center" }]}>
            {featureCard(
              "chatbubble-ellipses-outline",
              "Talk about anything",
              "Voice or text - always here to listen, remember, and understand you."
            )}
            {featureCard(
              "book-outline",
              "Journal and reflect",
              "Track your thoughts, set goals, and build healthy habits."
            )}
            {featureCard(
              "shield-checkmark-outline",
              "Private and secure",
              "Your conversations stay yours. Fingerprint lock and encrypted."
            )}
          </View>

          <View style={[styles.buttons, isWide && { flexDirection: "row", justifyContent: "center" }]}>
            <TouchableOpacity style={styles.primaryBtn} onPress={onGetStarted}>
              <Text style={styles.primaryBtnText}>Get started</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onLogin}>
              <Text style={styles.secondaryBtnText}>
                I already have an account
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 28, alignItems: "center" },
  inner: { width: "100%" },
  brand: { alignItems: "center", marginBottom: 36 },
  orb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#a99cf5",
    marginBottom: 18,
    shadowColor: "#a99cf5",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  appName: { color: "#fff", fontSize: 28, fontWeight: "700" },
  tagline: {
    color: "#c9c6e0",
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  features: { marginBottom: 32 },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(169,156,245,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: { flex: 1 },
  featureTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDesc: {
    color: "#9b97b8",
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: { gap: 12 },
  primaryBtn: {
    backgroundColor: "#7c6cf0",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  secondaryBtnText: { color: "#c9c6e0", fontSize: 16, fontWeight: "600" },
});








