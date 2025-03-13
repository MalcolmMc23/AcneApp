import React from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  PressableProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Theme, Colors } from "@/constants/Colors";
import haptics from "@/utils/haptics";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "error";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
}

export function Button({
  variant = "primary",
  size = "md",
  label,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  hapticStyle = Haptics.ImpactFeedbackStyle.Medium,
  ...props
}: ButtonProps) {
  const triggerHaptic = () => {
    haptics.buttonPress(hapticStyle);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[`${variant}Button`],
        styles[`${size}Button`],
        fullWidth && styles.fullWidth,
        pressed && styles[`${variant}Pressed`],
        style,
      ]}
      onPressIn={triggerHaptic}
      {...props}
    >
      {leftIcon && <>{leftIcon}</>}
      <Text
        style={[
          styles.text,
          styles[`${variant}Text`],
          styles[`${size}Text`],
          textStyle,
        ]}
      >
        {label}
      </Text>
      {rightIcon && <>{rightIcon}</>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  fullWidth: {
    width: "100%",
  },
  // Variant styles
  primaryButton: {
    backgroundColor: Colors.light.tint,
    ...Theme.shadows.md,
  },
  secondaryButton: {
    backgroundColor: Colors.light.accent,
    ...Theme.shadows.md,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  successButton: {
    backgroundColor: Colors.light.success,
    ...Theme.shadows.md,
  },
  errorButton: {
    backgroundColor: Colors.light.error,
    ...Theme.shadows.md,
  },
  // Pressed states
  primaryPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  secondaryPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  outlinePressed: {
    backgroundColor: Colors.light.pressable,
  },
  ghostPressed: {
    backgroundColor: Colors.light.pressable,
  },
  successPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  errorPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  // Size styles
  smButton: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    height: 36,
  },
  mdButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    height: 48,
  },
  lgButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    height: 56,
  },
  // Text styles
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#FFFFFF",
  },
  outlineText: {
    color: Colors.light.tint,
  },
  ghostText: {
    color: Colors.light.tint,
  },
  successText: {
    color: "#FFFFFF",
  },
  errorText: {
    color: "#FFFFFF",
  },
  // Text sizes
  smText: {
    fontSize: Theme.typography.fontSizes.sm,
  },
  mdText: {
    fontSize: Theme.typography.fontSizes.md,
  },
  lgText: {
    fontSize: Theme.typography.fontSizes.lg,
  },
});
