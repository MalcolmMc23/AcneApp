import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { StyleSheet } from "react-native";
import { Theme } from "@/constants/Colors";
import haptics from "@/utils/haptics";

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // Add a medium haptic feedback when pressing down on the tabs
        haptics.mediumTap();
        props.onPressIn?.(ev);
      }}
    />
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Theme.spacing.sm,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
