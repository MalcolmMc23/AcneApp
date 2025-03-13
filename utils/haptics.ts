import * as Haptics from 'expo-haptics';

/**
 * Utility functions for haptic feedback throughout the app
 * Provides consistent haptic feedback patterns for different interactions
 */

// Button press feedback
export const buttonPress = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
  Haptics.impactAsync(style);
};

// Success feedback
export const success = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Error feedback
export const error = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

// Warning feedback
export const warning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

// Light tap feedback
export const lightTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// Medium tap feedback
export const mediumTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

// Heavy tap feedback
export const heavyTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

// Selection change feedback
export const selectionChange = () => {
  Haptics.selectionAsync();
};

// Default export with all functions
export default {
  buttonPress,
  success,
  error,
  warning,
  lightTap,
  mediumTap,
  heavyTap,
  selectionChange,
}; 