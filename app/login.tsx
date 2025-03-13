import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Theme, Colors } from "@/constants/Colors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import * as Haptics from "expo-haptics";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageError, setImageError] = useState(false);

  const handleSignIn = () => {
    // Provide haptic feedback on sign in
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // In a real app, you would validate credentials here
    // For now, we'll just navigate to the main app
    router.replace("/(tabs)");
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Handle forgot password logic
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar style="auto" />

        <View style={styles.headerContainer}>
          {!imageError ? (
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <View
              style={[
                styles.logo,
                {
                  backgroundColor: Colors.light.tint,
                  borderRadius: Theme.borderRadius.circle,
                },
              ]}
            />
          )}
          <Text style={styles.title}>AcneApp</Text>
          <Text style={styles.subtitle}>
            Track and manage your skin care journey
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={
              <Ionicons
                name="mail-outline"
                size={22}
                color={Colors.light.icon}
              />
            }
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={Colors.light.icon}
              />
            }
          />

          <Button
            label="Sign In"
            onPress={handleSignIn}
            fullWidth
            size="lg"
            style={styles.loginButton}
          />

          <Button
            label="Forgot Password?"
            variant="ghost"
            onPress={handleForgotPassword}
            style={styles.forgotPasswordButton}
            hapticStyle={Haptics.ImpactFeedbackStyle.Light}
          />
        </Card>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Button
            label="Sign Up"
            variant="ghost"
            onPress={handleSignUp}
            textStyle={styles.signUpText}
            hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xl,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: Theme.spacing.xxl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.fontSizes.xxxl,
    fontWeight: "700",
    color: Colors.light.tint,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  formCard: {
    marginBottom: Theme.spacing.xl,
  },
  loginButton: {
    marginTop: Theme.spacing.md,
  },
  forgotPasswordButton: {
    alignSelf: "center",
    marginTop: Theme.spacing.md,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Theme.spacing.lg,
  },
  footerText: {
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.textSecondary,
  },
  signUpText: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
});
