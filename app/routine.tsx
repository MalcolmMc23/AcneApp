import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Theme, Colors } from "@/constants/Colors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// Mock data representing tasks that would be generated based on AI analysis
// In a real implementation, this would come from AI after photo analysis
const MOCK_ANALYSIS = {
  clarityScore: 72,
  skinConcerns: [
    { id: "concern1", name: "Mild inflammatory acne", severity: "moderate" },
    { id: "concern2", name: "Oiliness in T-zone", severity: "high" },
    { id: "concern3", name: "Dryness on cheeks", severity: "low" },
  ],
};

// Categories of tasks
const TASK_CATEGORIES = [
  { id: "morning", title: "Morning Routine", icon: "sun" },
  { id: "evening", title: "Evening Routine", icon: "moon" },
  { id: "diet", title: "Dietary Recommendations", icon: "utensils" },
  { id: "lifestyle", title: "Lifestyle Habits", icon: "heart" },
];

export default function RoutineScreen() {
  const params = useLocalSearchParams();
  const photoId = params.photoId as string;

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<{
    [key: string]: { id: string; text: string; completed: boolean }[];
  }>({});

  // This would normally fetch data from an API based on the photo analysis
  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      generateTasks();
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [photoId]);

  // This function would be replaced with actual AI-generated tasks based on the photo
  const generateTasks = () => {
    // In a real app, this would call an API to get AI-generated tasks
    const generatedTasks = {
      morning: [
        {
          id: "m1",
          text: "Use a gentle salicylic acid cleanser",
          completed: false,
        },
        {
          id: "m2",
          text: "Apply non-comedogenic moisturizer",
          completed: false,
        },
        { id: "m3", text: "Use SPF 30+ sunscreen", completed: false },
      ],
      evening: [
        {
          id: "e1",
          text: "Double cleanse with oil cleanser then gentle foam",
          completed: false,
        },
        {
          id: "e2",
          text: "Apply prescribed benzoyl peroxide (thin layer)",
          completed: false,
        },
        {
          id: "e3",
          text: "Use fragrance-free hydrating moisturizer",
          completed: false,
        },
      ],
      diet: [
        { id: "d1", text: "Reduce dairy intake", completed: false },
        {
          id: "d2",
          text: "Increase omega-3 rich foods (salmon, walnuts)",
          completed: false,
        },
        {
          id: "d3",
          text: "Drink at least 8 glasses of water",
          completed: false,
        },
      ],
      lifestyle: [
        {
          id: "l1",
          text: "Change pillowcase every 2-3 days",
          completed: false,
        },
        {
          id: "l2",
          text: "Avoid touching face throughout day",
          completed: false,
        },
        {
          id: "l3",
          text: "Manage stress through 10 minutes of meditation",
          completed: false,
        },
      ],
    };

    setTasks(generatedTasks);
  };

  const toggleTask = (categoryId: string, taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTasks((prev) => {
      const updatedTasks = { ...prev };
      const category = [...updatedTasks[categoryId]];
      const taskIndex = category.findIndex((t) => t.id === taskId);

      if (taskIndex !== -1) {
        category[taskIndex] = {
          ...category[taskIndex],
          completed: !category[taskIndex].completed,
        };
      }

      updatedTasks[categoryId] = category;
      return updatedTasks;
    });
  };

  const getCompletionRate = (categoryId: string) => {
    if (!tasks[categoryId] || tasks[categoryId].length === 0) return 0;

    const completedCount = tasks[categoryId].filter((t) => t.completed).length;
    return (completedCount / tasks[categoryId].length) * 100;
  };

  const handleTakeNewPhoto = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push("/camera");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="auto" />
        <Stack.Screen options={{ title: "Your Routine" }} />
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>
          Analyzing your skin and generating personalized tasks...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />

      <Stack.Screen
        options={{
          title: "Your Daily Routine",
          headerRight: () => (
            <Button
              label="New Photo"
              variant="ghost"
              leftIcon={
                <Ionicons name="camera" size={18} color={Colors.light.tint} />
              }
              onPress={handleTakeNewPhoto}
            />
          ),
        }}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <Card style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>Skin Analysis Summary</Text>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>
                {MOCK_ANALYSIS.clarityScore}
              </Text>
              <Text style={styles.scoreLabel}>Clarity Score</Text>
            </View>

            <View style={styles.concernsContainer}>
              <Text style={styles.concernsTitle}>Key Concerns:</Text>
              {MOCK_ANALYSIS.skinConcerns.map((concern) => (
                <View key={concern.id} style={styles.concernItem}>
                  <View
                    style={[
                      styles.severityDot,
                      {
                        backgroundColor:
                          concern.severity === "high"
                            ? Colors.light.error
                            : concern.severity === "moderate"
                            ? "#F7B801"
                            : Colors.light.success,
                      },
                    ]}
                  />
                  <Text style={styles.concernText}>{concern.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.analysisNote}>
            Tasks below are personalized based on your latest skin analysis.
          </Text>
        </Card>

        {TASK_CATEGORIES.map((category) => (
          <Card key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryTitleContainer}>
                <FontAwesome5
                  name={category.icon}
                  size={18}
                  color={Colors.light.tint}
                  style={styles.categoryIcon}
                />
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${getCompletionRate(category.id)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(getCompletionRate(category.id))}%
                </Text>
              </View>
            </View>

            <View style={styles.taskList}>
              {tasks[category.id]?.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskItem}
                  onPress={() => toggleTask(category.id, task.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskCheckbox}>
                    {task.completed ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={Colors.light.tint}
                      />
                    ) : (
                      <Ionicons
                        name="ellipse-outline"
                        size={24}
                        color={Colors.light.icon}
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.taskText,
                      task.completed && styles.taskTextCompleted,
                    ]}
                  >
                    {task.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        ))}

        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackHint}>
            Tasks are updated with each new photo analysis.
          </Text>
          <Button
            label="Take a New Photo"
            leftIcon={<Ionicons name="camera" size={20} color="white" />}
            onPress={handleTakeNewPhoto}
            style={styles.feedbackButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    padding: Theme.spacing.xl,
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: Theme.spacing.lg,
  },
  analysisCard: {
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.lg,
  },
  analysisTitle: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Theme.spacing.md,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.lg,
  },
  scoreValue: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scoreLabel: {
    fontSize: Theme.typography.fontSizes.xs,
    color: "#FFFFFF",
  },
  concernsContainer: {
    flex: 1,
  },
  concernsTitle: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: Theme.spacing.xs,
  },
  concernItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.xs,
  },
  concernText: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Colors.light.textSecondary,
  },
  analysisNote: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
    marginTop: Theme.spacing.sm,
  },
  categoryCard: {
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  categoryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    marginRight: Theme.spacing.sm,
  },
  categoryTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: "600",
    color: Colors.light.text,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    width: 80,
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    marginRight: Theme.spacing.xs,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  progressText: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Colors.light.textSecondary,
    minWidth: 30,
  },
  taskList: {
    marginTop: Theme.spacing.sm,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  taskCheckbox: {
    marginRight: Theme.spacing.sm,
  },
  taskText: {
    flex: 1,
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.text,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: Colors.light.textSecondary,
  },
  feedbackContainer: {
    alignItems: "center",
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  feedbackHint: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Theme.spacing.md,
  },
  feedbackButton: {
    marginTop: Theme.spacing.sm,
  },
});
