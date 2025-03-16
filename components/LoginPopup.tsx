import React, { useState } from "react";
import {
  View,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import * as Haptics from "expo-haptics";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectPath?: string;
}

/**
 * A reusable login popup component that can be used anywhere in the app
 * Provides email/password authentication with loading and error states
 */
export default function LoginPopup({
  isOpen,
  onClose,
  onSuccess,
  redirectPath = "/(tabs)",
}: LoginPopupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Provide haptic feedback on login attempt
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // This is where you'd typically make an API call to authenticate
      // For now, we'll simulate a successful login with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store auth token
      await AsyncStorage.setItem("userToken", "sample-token");

      // Call success callback if provided
      onSuccess?.();

      // Close modal
      onClose();

      // Navigate to the specified path
      router.replace(redirectPath);
    } catch (error) {
      setError("Authentication failed. Please try again.");
      console.error("Login error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ThemedView style={styles.modalContent}>
          <ThemedText style={styles.title}>Login</ThemedText>

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}

          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />

          <Button
            label={isLoading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={isLoading || !email || !password}
            variant="primary"
            style={styles.button}
          />

          <Button
            label="Cancel"
            onPress={handleCancel}
            variant="secondary"
            style={styles.button}
          />
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  error: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
});
