import React from "react";
import {
  StyleSheet,
  View,
  ViewProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Theme, Colors } from "@/constants/Colors";

interface CardProps extends ViewProps {
  variant?: "elevated" | "outlined" | "filled";
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Card({
  variant = "elevated",
  style,
  contentStyle,
  children,
  ...props
}: CardProps) {
  return (
    <View style={[styles.card, styles[`${variant}Card`], style]} {...props}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.borderRadius.lg,
    overflow: "hidden",
    marginVertical: Theme.spacing.sm,
  },
  elevatedCard: {
    backgroundColor: Colors.light.card,
    ...Theme.shadows.md,
  },
  outlinedCard: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filledCard: {
    backgroundColor: Colors.light.pressable,
  },
  content: {
    padding: Theme.spacing.lg,
  },
});
