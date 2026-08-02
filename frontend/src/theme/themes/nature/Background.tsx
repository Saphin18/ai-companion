import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
type Pos = "top" | "center" | "bottom";
export function makeNatureBackground(wallpaper: number, position: Pos, overlay: string, webWallpaper?: number) {
  return function NatureBackground(_props: { isDark: boolean }) {
    const source = Platform.OS === "web" && webWallpaper ? webWallpaper : wallpaper;
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <ExpoImage
          source={source}
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
