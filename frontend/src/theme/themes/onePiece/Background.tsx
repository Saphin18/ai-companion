import React, { useEffect, useRef } from "react";
import { Animated, View, Dimensions, StyleSheet, Easing } from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

type WaveProps = {
  color: string;
  bottom: number;
  bandHeight: number;
  circleR: number;
  ampX: number;
  ampY: number;
  duration: number;
  opacity: number;
};

// One drifting, bobbing scalloped wave band.
function WaveLayer({
  color,
  bottom,
  bandHeight,
  circleR,
  ampX,
  ampY,
  duration,
  opacity,
}: WaveProps) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopX = Animated.loop(
      Animated.sequence([
        Animated.timing(x, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(x, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const loopY = Animated.loop(
      Animated.sequence([
        Animated.timing(y, {
          toValue: 1,
          duration: duration * 1.3,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: duration * 1.3,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loopX.start();
    loopY.start();
    return () => {
      loopX.stop();
      loopY.stop();
    };
  }, []);

  const translateX = x.interpolate({
    inputRange: [0, 1],
    outputRange: [-ampX, ampX],
  });
  const translateY = y.interpolate({
    inputRange: [0, 1],
    outputRange: [ampY, -ampY],
  });

  const overhang = ampX + circleR + 20;
  const stripW = SCREEN_W + overhang * 2;
  const count = Math.ceil(stripW / (circleR * 2)) + 1;

  const circles = [];
  for (let i = 0; i < count; i++) {
    circles.push(
      <View
        key={i}
        style={{
          position: "absolute",
          bottom: bandHeight - circleR,
          left: i * circleR * 2,
          width: circleR * 2,
          height: circleR * 2,
          borderRadius: circleR,
          backgroundColor: color,
        }}
      />
    );
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom,
        left: -overhang,
        width: stripW,
        height: bandHeight + circleR,
        opacity,
        transform: [{ translateX }, { translateY }],
      }}
    >
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: bandHeight,
          backgroundColor: color,
        }}
      />
      {circles}
    </Animated.View>
  );
}

// The full animated background for the One Piece theme (ocean at the base).
export default function OnePieceBackground({ isDark }: { isDark: boolean }) {
  const layers = isDark
    ? [
        { color: "#0f2b45", bottom: 0, bandHeight: 120, circleR: 34, ampX: 18, ampY: 6, duration: 4200, opacity: 1 },
        { color: "#173b5c", bottom: 30, bandHeight: 90, circleR: 26, ampX: 26, ampY: 8, duration: 3400, opacity: 0.9 },
        { color: "#1f4e78", bottom: 60, bandHeight: 70, circleR: 20, ampX: 34, ampY: 10, duration: 2800, opacity: 0.75 },
        { color: "#f7c948", bottom: 98, bandHeight: 4, circleR: 12, ampX: 40, ampY: 6, duration: 2400, opacity: 0.22 },
      ]
    : [
        { color: "#bcd7ef", bottom: 0, bandHeight: 120, circleR: 34, ampX: 18, ampY: 6, duration: 4200, opacity: 1 },
        { color: "#9cc4e6", bottom: 30, bandHeight: 90, circleR: 26, ampX: 26, ampY: 8, duration: 3400, opacity: 0.9 },
        { color: "#7db0da", bottom: 60, bandHeight: 70, circleR: 20, ampX: 34, ampY: 10, duration: 2800, opacity: 0.7 },
        { color: "#e2a92e", bottom: 98, bandHeight: 4, circleR: 12, ampX: 40, ampY: 6, duration: 2400, opacity: 0.2 },
      ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {layers.map((l, i) => (
        <WaveLayer key={i} {...l} />
      ))}
    </View>
  );
}