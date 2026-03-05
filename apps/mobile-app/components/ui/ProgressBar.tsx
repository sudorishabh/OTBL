import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/lib/constants";

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

/**
 * Simple progress bar for uploads, wizard steps, etc.
 */
export default function ProgressBar({
  progress,
  color = Colors.primary[600],
  trackColor = Colors.gray[200],
  height = 6,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View
      style={[styles.track, { height, backgroundColor: trackColor }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 100,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    borderRadius: 100,
  },
});
