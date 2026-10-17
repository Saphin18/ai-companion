// The "companion is replying" indicator (Session 24).
//
// Replaces a plain italic "Thinking..." that sat BELOW the message list, above
// the input - not where the reply actually appears, and with no sense that
// anything was happening. Groq can take a couple of seconds, and in that gap a
// static word reads as a frozen app, which is how people end up re-sending.
//
// Three dots that bounce in sequence inside an empty companion bubble, so the
// reply lands exactly where the indicator was.
//
// transform + opacity only, useNativeDriver: true - the same constraint as the
// launch animation, so this needs no reanimated and no dev build.
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const DOTS = 3;
const DURATION = 450;   // one dot's up-and-down
const STAGGER = 150;    // delay between dots

function Dot({ delay, color }: { delay: number; color: string }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounce, {
          toValue: 1,
          duration: DURATION / 2,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: DURATION / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        // Hold while the other dots take their turn, so the sequence reads as
        // a wave rather than three dots twitching independently.
        Animated.delay(STAGGER * (DOTS - 1) - delay),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          opacity: bounce.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 1],
          }),
          transform: [
            {
              translateY: bounce.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -5],
              }),
            },
          ],
        },
      ]}
    />
  );
}

export default function TypingBubble() {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <View
        style={[styles.bubble, { backgroundColor: theme.bubbleCompanion }]}
        accessibilityRole="progressbar"
        accessibilityLabel="Companion is replying"
      >
        {Array.from({ length: DOTS }).map((_, i) => (
          <Dot key={i} delay={i * STAGGER} color={theme.bubbleCompanionText} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 16, marginTop: 2 },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 19,
    // Matches ChatBubble's companion tail so it reads as the same bubble the
    // reply will arrive in.
    borderBottomLeftRadius: 7,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
