import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Pressable,
  TextInputProps,
  ViewStyle,
  StyleProp,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme, Colors } from "@/constants/Colors";
import haptics from "@/utils/haptics";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...props
}: InputProps) {
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);

  const toggleSecureEntry = () => {
    haptics.lightTap();
    setSecureTextEntry(!secureTextEntry);
  };

  const handleFocus = () => {
    haptics.selectionChange();
    setIsFocused(true);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={Colors.light.textSecondary}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword ? (
          <Pressable onPress={toggleSecureEntry} style={styles.iconContainer}>
            <Ionicons
              name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={Colors.light.icon}
            />
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.iconContainer}>{rightIcon}</View>
        ) : null}
      </View>

      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
    width: "100%",
  },
  label: {
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: "500",
    marginBottom: Theme.spacing.xs,
    color: Colors.light.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.light.card,
    height: 56,
    paddingHorizontal: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  inputContainerFocused: {
    borderColor: Colors.light.tint,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: Colors.light.error,
  },
  input: {
    flex: 1,
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.text,
    height: "100%",
    paddingVertical: Theme.spacing.sm,
  },
  iconContainer: {
    paddingHorizontal: Theme.spacing.xs,
  },
  errorText: {
    fontSize: Theme.typography.fontSizes.xs,
    color: Colors.light.error,
    marginTop: Theme.spacing.xs,
  },
});
