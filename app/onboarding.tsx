import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Animated,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Theme, Colors } from "@/constants/Colors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// Onboarding content
const slides = [
  {
    id: "welcome",
    title: "Welcome to AcneApp",
    description: "Your personal guide to clearer skin and confidence",
    icon: "face-smile",
  },
  {
    id: "track",
    title: "Track Your Progress",
    description:
      "Monitor your skin's journey with our AI-powered tracking and scoring system",
    icon: "chart-line",
  },
  {
    id: "routine",
    title: "Personalized Routines",
    description:
      "Get custom skincare regimens tailored to your unique skin needs",
    icon: "list-check",
  },
  {
    id: "community",
    title: "Join Our Community",
    description:
      "Connect with others on similar skincare journeys for support and advice",
    icon: "users",
  },
];

export default function OnboardingScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<ScrollView>(null);

  // Handle scroll events to update current index
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const slideIndex = Math.round(
          event.nativeEvent.contentOffset.x / windowWidth
        );
        if (slideIndex !== currentIndex) {
          setCurrentIndex(slideIndex);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    }
  );

  // Handle next slide
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollTo({
        x: windowWidth * (currentIndex + 1),
        animated: true,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      handleGetStarted();
    }
  };

  // Handle skip to the end
  const handleSkip = () => {
    slidesRef.current?.scrollTo({
      x: windowWidth * (slides.length - 1),
      animated: true,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle get started button press
  const handleGetStarted = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />

      <View style={styles.skipContainer}>
        {currentIndex < slides.length - 1 ? (
          <Button
            label="Skip"
            variant="ghost"
            onPress={handleSkip}
            style={styles.skipButton}
          />
        ) : null}
      </View>

      <ScrollView
        ref={slidesRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollContainer}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={[styles.slide, { width: windowWidth }]}>
            <View style={styles.imageContainer}>
              <Card style={styles.imageCard}>
                <View style={styles.imagePlaceholder}>
                  <FontAwesome
                    name={slide.icon as any}
                    size={60}
                    color={Colors.light.tint}
                  />
                </View>
              </Card>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * windowWidth,
            index * windowWidth,
            (index + 1) * windowWidth,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.indicator,
                {
                  opacity,
                  transform: [{ scale }],
                  backgroundColor:
                    currentIndex === index
                      ? Colors.light.tint
                      : Colors.light.border,
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.bottomContainer}>
        <Button
          label={currentIndex < slides.length - 1 ? "Next" : "Get Started"}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleNext}
          rightIcon={
            currentIndex < slides.length - 1 ? (
              <Ionicons name="arrow-forward" size={22} color="white" />
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  skipContainer: {
    position: "absolute",
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    zIndex: 10,
  },
  skipButton: {
    alignSelf: "flex-end",
  },
  scrollContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  imageContainer: {
    width: "100%",
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCard: {
    width: "90%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    ...Theme.shadows.lg,
    borderRadius: Theme.borderRadius.lg,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: Colors.light.pressable,
    borderRadius: Theme.borderRadius.circle,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    marginTop: Theme.spacing.xxl,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: Theme.typography.fontSizes.xxxl,
    fontWeight: "700",
    color: Colors.light.tint,
    textAlign: "center",
    marginBottom: Theme.spacing.md,
  },
  description: {
    fontSize: Theme.typography.fontSizes.lg,
    color: Colors.light.textSecondary,
    textAlign: "center",
    paddingHorizontal: Theme.spacing.md,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Theme.spacing.xl,
  },
  indicator: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  bottomContainer: {
    marginBottom: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.xl,
  },
});
