import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface NavigationBarProps {
  // Can add more props later if needed, like active tab, etc.
  currentRoute?: string;
}

export function NavigationBar({ currentRoute = "" }: NavigationBarProps) {
  // Determine if we're on the home or explore page
  const isHome =
    currentRoute === "/" ||
    currentRoute === "/(tabs)" ||
    currentRoute === "/(tabs)/index";
  const isExplore = currentRoute === "/(tabs)/explore";

  // Use the same color as in the native tab bar
  const activeColor = "#2f95dc";
  const inactiveColor = "#8E8E93";

  const navigateToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)");
  };

  const navigateToExplore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/explore");
  };

  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={navigateToHome}
        activeOpacity={0.7}
      >
        <FontAwesome
          name="home"
          size={28}
          color={isHome ? activeColor : inactiveColor}
        />
        <Text
          style={[
            styles.navButtonText,
            { color: isHome ? activeColor : inactiveColor },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={navigateToExplore}
        activeOpacity={0.7}
      >
        <FontAwesome
          name="paper-plane"
          size={28}
          color={isExplore ? activeColor : inactiveColor}
        />
        <Text
          style={[
            styles.navButtonText,
            { color: isExplore ? activeColor : inactiveColor },
          ]}
        >
          Explore
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 83, // Match the height of the native tab bar (includes space for home indicator on newer iPhones)
    // Add shadows for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    // Add elevation for Android
    elevation: 5,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    flex: 1,
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
});
