// Landing page (rebuilt Session 24).
//
// It used to be an orb, a tagline and three feature cards that DESCRIBED the
// app. The problem with that is the product's whole advantage - that it talks
// like a friend instead of an assistant - is invisible in a description, and a
// static screenshot of a chat (the obvious alternative) both reads as dated and
// proves nothing, since anyone can fake one.
//
// So the words do the work. Real messages cycle through in large type with the
// companion's reply underneath. No chat UI is drawn at all, which keeps it
// working identically on a phone and a wide monitor.
//
// All motion is transform + opacity with useNativeDriver, same constraint as
// the launch animation - no reanimated, no dev build needed.
import { useEffect, useRef, useState } from "react";
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
import { fonts, type } from "../theme/typography";

type Props = {
  onGetStarted: () => void;
  onLogin: () => void;
};

/** Real exchanges. These are verbatim from the shipped prompt, not invented. */
const LINES: { said: string; back: string }[] = [
  { said: "today was rough", back: "That sucks. What went down?" },
  {
    said: "nah I'm fine",
    back: "You say you're fine but you don't sound it — what's up?",
  },
  {
    said: "I still miss her",
    back: "Missing her is brutal. Six months isn't that long, you know.",
  },
];

const HOLD_MS = 3400;   // how long a line stays up
const FADE_MS = 420;    // cross-fade between lines

export default function LandingScreen({ onGetStarted, onLogin }: Props) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 768;

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  // The cycling quote block has its own fade so it can swap without the page
  // re-animating around it.
  const lineFade = useRef(new Animated.Value(1)).current;
  const lineRise = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  // Slow breathing orb. One transform, runs forever, costs nothing.
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      // Fade the current line out, swap the text, fade the next one in.
      Animated.parallel([
        Animated.timing(lineFade, {
          toValue: 0,
          duration: FADE_MS,
          useNativeDriver: true,
        }),
        Animated.timing(lineRise, {
          toValue: -10,
          duration: FADE_MS,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIndex((i) => (i + 1) % LINES.length);
        lineRise.setValue(10);
        Animated.parallel([
          Animated.timing(lineFade, {
            toValue: 1,
            duration: FADE_MS,
            useNativeDriver: true,
          }),
          Animated.timing(lineRise, {
            toValue: 0,
            duration: FADE_MS,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, HOLD_MS);
    return () => clearInterval(timer);
  }, []);

  const orbScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.07],
  });

  const current = LINES[index];

  return (
    <LinearGradient
      colors={["#26190f", "#3a2417", "#15110e"]}
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
          style={[
            styles.inner,
            isWide && styles.innerWide,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <View style={styles.brand}>
            <Animated.View
              style={[styles.orb, { transform: [{ scale: orbScale }] }]}
            />
            <Text style={styles.appName}>Your Companion</Text>
          </View>

          <Text style={styles.lead}>PEOPLE TELL IT</Text>

          {/* Fixed height so the buttons below never jump as lines change. */}
          <View style={styles.cycler}>
            <Animated.View
              style={{
                opacity: lineFade,
                transform: [{ translateY: lineRise }],
              }}
            >
              <Text style={styles.said}>{"“"}{current.said}{"”"}</Text>
              <Text style={styles.arrow}>{"↓"}</Text>
              <Text style={styles.back}>{current.back}</Text>
            </Animated.View>
          </View>

          <View
            style={[
              styles.buttons,
              isWide && { flexDirection: "row", justifyContent: "center" },
            ]}
          >
            <TouchableOpacity
              style={[styles.primaryBtn, isWide && styles.btnWide]}
              onPress={onGetStarted}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Get started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, isWide && styles.btnWide]}
              onPress={onLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>I already have an account</Text>
            </TouchableOpacity>
          </View>

          {/* Answers the three questions everyone has before tapping. */}
          <Text style={styles.fineprint}>Free. No card. 30 seconds.</Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 28,
    alignItems: "center",
  },
  inner: { width: "100%" },
  // Desktop used to run ~60% empty. Capping the column keeps the lines a
  // readable length instead of stretching them across a monitor.
  innerWide: { maxWidth: 560, alignSelf: "center" },
  brand: { alignItems: "center", marginBottom: 40 },
  orb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e8956b",
    marginBottom: 16,
    shadowColor: "#e8956b",
    shadowOpacity: 0.6,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  // fontWeight is deliberately absent everywhere below - weight comes from the
  // font family. See the warning in src/theme/typography.ts.
  appName: { ...type.h2, color: "#f6efe8" },
  lead: { ...type.overline, color: "#a89585", marginBottom: 14 },
  cycler: { minHeight: 188, justifyContent: "flex-start" },
  said: { ...type.h1, color: "#f6efe8" },
  arrow: { ...type.title, color: "#e8956b", marginTop: 14, marginBottom: 12 },
  back: { ...type.body, fontSize: 16, lineHeight: 24, color: "#cbb8a8" },
  buttons: { gap: 12, marginTop: 34 },
  primaryBtn: {
    backgroundColor: "#e8956b",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  btnWide: { flex: 1 },
  // Dark text on the apricot fill - white would be 2.2:1 and unreadable.
  primaryBtnText: { ...type.button, color: "#241710" },
  secondaryBtn: {
    backgroundColor: "rgba(255,232,214,0.07)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,232,214,0.14)",
  },
  secondaryBtnText: {
    ...type.button,
    fontFamily: fonts.medium,
    color: "#cbb8a8",
  },
  fineprint: {
    ...type.caption,
    color: "#a89585",
    textAlign: "center",
    marginTop: 16,
  },
});
