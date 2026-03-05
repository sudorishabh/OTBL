import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/lib/constants";

interface SeparatorProps {
  style?: ViewStyle;
  color?: string;
}

export default function Separator({
  style,
  color = Colors.gray[200],
}: SeparatorProps) {
  return <View style={[styles.separator, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    marginVertical: 12,
  },
});
