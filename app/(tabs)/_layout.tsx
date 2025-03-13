import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2f95dc",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="paper-plane" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
