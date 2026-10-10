import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { type } from "../theme/typography";

// "Orb bloom" launch animation (Session 23).
//
// This plays in the gap that already existed at launch - the session check plus
// the Ionicons font load - where a bare ActivityIndicator used to sit. It adds
// no waiting of its own: it fades out as soon as BOTH the minimum hold has
// passed AND the app reports it is ready.
//
// INTRO_BG must match app.json -> splash.backgroundColor, or the native splash
// visibly flashes a different colour before this screen appears. Change one,
// change both.
//
// Everything animated here is scale / opacity / translateY only, so every
// animation runs on the native driver. Do not animate layout properties
// (width, height, margin) - they cannot use the native driver and will drop
// frames on a cheap Android device.
const INTRO_BG = "#15110e";
const ORB = 76;

// How long the animation is allowed to play before we even consider leaving.
// Stops the intro flashing past on a warm start where `ready` is instant.
const MIN_HOLD_MS = 2050;

type Props = {
  /** True once the app has everything it needs to render the real UI. */
  canFinish: boolean;
  /** Called after the fade-out completes. Always fires. */
  onDone: () => void;
};

export default function IntroScreen({ canFinish, onDone }: Props) {
  const bloom = useRef(new Animated.Value(0)).current;
  const mark = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(0)).current;

  const [heldLongEnough, setHeldLongEnough] = useState(false);
  const finishing = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bloom, {
        toValue: 1,
        duration: 1600,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(mark, {
        toValue: 1,
        duration: 700,
        delay: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => setHeldLongEnough(true), MIN_HOLD_MS);
    return () => clearTimeout(timer);
  }, [bloom, mark]);

  useEffect(() => {
    if (!heldLongEnough || !canFinish || finishing.current) return;
    finishing.current = true;
    Animated.timing(out, {
      toValue: 1,
      duration: 550,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      // Called unconditionally, even on an interrupted animation - being stuck
      // on a half-faded intro forever is the worst possible failure here.
      onDone();
    });
  }, [heldLongEnough, canFinish, onDone, out]);

  const orbScale = bloom.interpolate({
    inputRange: [0, 0.66, 1],
    outputRange: [0.3, 1, 1],
  });
  const orbOpacity = bloom.interpolate({
    inputRange: [0, 0.22, 1],
    outputRange: [0, 1, 1],
  });
  // The ring of light travels outward past the orb and dissolves. This is the
  // part that reads as warmth rather than just movement.
  const glowScale = bloom.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 2.7],
  });
  const glowOpacity = bloom.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.55, 0],
  });
  const markY = mark.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });
  const introOpacity = out.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <Animated.View style={[styles.root, { opacity: introOpacity }]}>
      <View style={styles.center}>
        <View style={styles.orbWrap}>
          <Animated.View
            style={[
              styles.glow,
              { opacity: glowOpacity, transform: [{ scale: glowScale }] },
            ]}
          />
          <Animated.View
            style={[
              styles.orb,
              { opacity: orbOpacity, transform: [{ scale: orbScale }] },
            ]}
          >
            <LinearGradient
              colors={["#ffd0ad", "#e8956b", "#a0502a"]}
              start={{ x: 0.22, y: 0.08 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.orbFill}
            />
          </Animated.View>
        </View>

        <Animated.View
          style={{ opacity: mark, transform: [{ translateY: markY }] }}
        >
          <Text style={styles.brand}>Saphin AI</Text>
          <Text style={styles.sub}>your companion</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: INTRO_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    gap: 18,
  },
  orbWrap: {
    width: ORB,
    height: ORB,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    backgroundColor: "#e8956b",
  },
  orb: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    overflow: "hidden",
  },
  orbFill: {
    flex: 1,
  },
  brand: {
    ...type.h1,
    fontSize: 21,
    lineHeight: 27,
    color: "#f6efe8",
    textAlign: "center",
  },
  sub: {
    ...type.caption,
    fontSize: 11,
    lineHeight: 15,
    color: "#a89585",
    textAlign: "center",
    marginTop: 3,
  },
});
