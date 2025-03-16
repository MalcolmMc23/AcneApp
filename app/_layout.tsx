import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen after a delay
    const hideSplash = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await SplashScreen.hideAsync();
    };

    hideSplash();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" redirect={true} />
          <Stack.Screen name="login" />
          <Stack.Screen name="camera" />
          <Stack.Screen name="routine" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>

        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative", // Ensure proper positioning context for absolute elements
  },
});
