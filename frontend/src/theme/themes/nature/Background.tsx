import React from "react";
import { StyleSheet, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

type Pos = "top" | "center" | "bottom";

// Full-screen photo background (photo + gentle overall dim + darker top/bottom so
// headers and the input bar stay readable over ANY photo). ThemeContext renders
// this behind EVERY screen. pointerEvents="none" => it never blocks taps.
export function makeNatureBackground(wallpaper: number, position: Pos, overlay: string) {
  return function NatureBackground(_props: { isDark: boolean }) {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <ExpoImage
          source={wallpaper}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={position}
          transition={250}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: overlay }]} />
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.55)",
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0.55)",
          ]}
          locations={[0, 0.18, 0.82, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  };
}