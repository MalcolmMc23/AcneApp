import React, { useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Animated,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HomeButton = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const scaleAnim = new Animated.Value(0);

  // Don't show the home button on the home tab itself
  const isHomePage = pathname === "/(tabs)" || pathname === "/(tabs)/index";

  // Determine if we're on a tab screen to adjust position accordingly
  const isTabScreen = pathname.includes("(tabs)");

  // Calculate bottom position based on screen type
  let bottomPosition = isTabScreen ? 90 : Math.min(insets.bottom + 30, 30);

  // Animate the button when it appears
  useEffect(() => {
    if (!isHomePage) {
      // Reset animation when pathname changes
      scaleAnim.setValue(0);

      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [pathname]);

  const navigateToHome = () => {
    // Provide medium haptic feedback when button is pressed for better tactile response
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate the button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate after animation completes
      router.push("/(tabs)");
    });
  };

  // If we're on the home page, don't render anything
  if (isHomePage) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          bottom: bottomPosition,
          right: Math.max(insets.right + 20, 20),
        },
      ]}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        }}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={navigateToHome}
          activeOpacity={0.9}
        >
          <FontAwesome name="home" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 9999, // Significantly higher zIndex to ensure visibility
    elevation: Platform.OS === "android" ? 10 : 0, // Higher elevation for Android
  },
  button: {
    backgroundColor: Colors.light.tint,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
