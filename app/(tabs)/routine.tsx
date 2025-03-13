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
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";

import { Theme, Colors } from "@/constants/Colors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import taskStorage, { TaskItem } from "@/utils/taskStorage";

// For dark mode styling
const neutralLight = {
  50: "#FAFAFA",
  100: "#F5F5F5",
  200: "#E5E5E5",
  300: "#D4D4D4",
  400: "#A3A3A3",
  500: "#737373",
  600: "#525252",
  700: "#404040",
  800: "#262626",
  900: "#171717",
};

// Get the current date for the date picker
const today = new Date();
const currentDate = today.getDate();
const currentMonth = today.toLocaleString("default", { month: "short" });

interface DateItem {
  day: number;
  month: string;
  selected: boolean;
}

// Generate a week of dates (3 days before, current day, and 3 days after)
const generateWeekDates = (): DateItem[] => {
  const dates = [];
  for (let i = -3; i <= 3; i++) {
    const date = new Date();
    date.setDate(currentDate + i);
    dates.push({
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
      selected: i === 0, // Current day is selected by default
    });
  }
  return dates;
};

// Default routine tasks in case AI analysis fails or is not available
const defaultRoutineTasks: TaskItem[] = [
  { id: "task1", text: "Use gentle cleanser 🧴", completed: false },
  { id: "task2", text: "Apply benzoyl peroxide 2.5% 💧", completed: false },
  { id: "task3", text: "Drink 8 glasses of water 💦", completed: false },
  { id: "task4", text: "Take zinc supplement 💊", completed: false },
  { id: "task5", text: "Apply oil-free moisturizer 🌱", completed: false },
];

export default function RoutineScreen() {
  const params = useLocalSearchParams();

  // DEBUGGING: Add console logs to check incoming params
  console.log("---------- ROUTINE SCREEN DEBUG ----------");
  console.log("Received params:", Object.keys(params).length ? "Yes" : "No");
  console.log("Params keys:", Object.keys(params));
  console.log("photoId param:", params.photoId || "Not found");
  console.log(
    "personalizedTasks param exists:",
    params.personalizedTasks ? "Yes" : "No"
  );
  console.log("useLatestTasks param:", params.useLatestTasks || "Not found");

  // Check for tasks in global storage (from new navigation method)
  console.log("Global tasks available:", global.latestTasks ? "Yes" : "No");
  if (global.latestTasks) {
    console.log("Global tasks count:", global.latestTasks.length);
    console.log("First global task:", global.latestTasks[0]);
  }

  if (params.personalizedTasks) {
    console.log(
      "personalizedTasks length:",
      String(params.personalizedTasks).length
    );
    console.log(
      "First 100 chars:",
      String(params.personalizedTasks).substring(0, 100)
    );
  }

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0); // Index of the selected date
  const [weekDates, setWeekDates] = useState<DateItem[]>(generateWeekDates());
  const [streakCount, setStreakCount] = useState(7);

  // Get photo ID from params or global state
  const initialPhotoId =
    (params.photoId as string) || (global.latestPhotoId as string) || null;
  const [photoId, setPhotoId] = useState<string | null>(initialPhotoId);

  // DEBUGGING: Add direct task state initialization from global
  const [directlyLoadedTasks, setDirectlyLoadedTasks] =
    useState<boolean>(false);

  // DEBUGGING: Add loading state for AsyncStorage operations
  const [loadingStorage, setLoadingStorage] = useState(false);

  // Initialize tasks from personalized tasks - update this function to use taskStorage
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    // Default to the default tasks, will be updated after checking all sources
    return defaultRoutineTasks;
  });

  // Load tasks from all possible sources on component mount
  useEffect(() => {
    const loadTasksFromAllSources = async () => {
      setLoadingStorage(true);
      console.log("Loading tasks from all sources...");

      try {
        // 1. First check for URL parameters - fastest, but most likely to fail
        if (params.personalizedTasks) {
          try {
            const parsedTasks = JSON.parse(params.personalizedTasks as string);
            console.log("Found tasks in URL parameters:", parsedTasks.length);
            setTasks(parsedTasks);
            setLoadingStorage(false);
            return;
          } catch (error) {
            console.error("Failed to parse tasks from URL:", error);
            // Continue to next method
          }
        }

        // 2. Check global variables - reliable within the same session
        if (global.latestTasks) {
          console.log(
            "Found tasks in global variables:",
            global.latestTasks.length
          );
          setTasks(global.latestTasks);
          setLoadingStorage(false);
          return;
        }

        // 3. Check AsyncStorage via taskStorage - most reliable, but slowest
        const storedTasks = await taskStorage.getLatestTasks();
        if (storedTasks) {
          console.log("Found tasks in AsyncStorage:", storedTasks.length);
          setTasks(storedTasks);

          // Also update global variables for future use
          global.latestTasks = storedTasks;

          // Get the corresponding photo ID
          const photoId = await taskStorage.getLatestPhotoId();
          if (photoId) {
            setPhotoId(photoId);
            global.latestPhotoId = photoId;
          }

          setLoadingStorage(false);
          return;
        }

        // 4. If all else fails, stick with default tasks
        console.log("No tasks found in any source, using default tasks");
        setTasks(defaultRoutineTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        // Fallback to default tasks
        setTasks(defaultRoutineTasks);
      } finally {
        setLoadingStorage(false);
      }
    };

    loadTasksFromAllSources();
  }, []);

  // Keep track of personalized task sets for different photos
  const [tasksByPhotoId, setTasksByPhotoId] = useState<
    Record<string, TaskItem[]>
  >(() => {
    // Initialize with global tasks if available
    if (global.latestPhotoId && global.latestTasks) {
      return { [global.latestPhotoId]: global.latestTasks };
    }

    // Otherwise try from params
    if (params.photoId && params.personalizedTasks) {
      try {
        const parsedTasks = JSON.parse(params.personalizedTasks as string);
        return { [params.photoId as string]: parsedTasks };
      } catch (error) {
        return {};
      }
    }
    return {};
  });

  // Effect to update tasks when new params come in (user takes a new photo)
  useEffect(() => {
    // Check for the simplified navigation flag
    if (
      params.useLatestTasks === "true" &&
      !directlyLoadedTasks &&
      global.latestTasks
    ) {
      console.log("useEffect: Loading tasks from global state");
      setTasks(global.latestTasks);
      setDirectlyLoadedTasks(true);

      if (global.latestPhotoId) {
        setPhotoId(global.latestPhotoId);
        setTasksByPhotoId((prev) => ({
          ...prev,
          [global.latestPhotoId as string]: global.latestTasks as TaskItem[],
        }));
      }

      // Reset to current day
      selectDate(0);

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    // Original param handling
    if (
      params.photoId &&
      params.personalizedTasks &&
      params.photoId !== photoId
    ) {
      console.log("DEBUGGING: New params detected in useEffect");
      console.log("New photoId:", params.photoId);
      console.log(
        "personalizedTasks exists:",
        params.personalizedTasks ? "Yes" : "No"
      );

      try {
        const parsedTasks = JSON.parse(params.personalizedTasks as string);
        console.log(
          "New personalized tasks received:",
          parsedTasks.length,
          "for photo ID:",
          params.photoId
        );

        // Store these tasks by photo ID
        setTasksByPhotoId((prev) => ({
          ...prev,
          [params.photoId as string]: parsedTasks,
        }));

        // Update current tasks
        setTasks(parsedTasks);

        // Update current photo ID
        setPhotoId(params.photoId as string);

        // Reset to current day when receiving new tasks
        selectDate(0);

        // Provide haptic feedback to indicate new routine
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error handling new personalized tasks:", error);
        // DEBUGGING: Show the actual data that failed to parse
        console.error(
          "Failed to parse:",
          typeof params.personalizedTasks,
          String(params.personalizedTasks).substring(0, 200)
        );
      }
    }
  }, [params.photoId, params.personalizedTasks, params.useLatestTasks]);

  const [progress, setProgress] = useState({
    completed: 0,
    total: tasks.length,
  });

  useEffect(() => {
    // Update progress whenever tasks change
    const completedCount = tasks.filter((task) => task.completed).length;
    setProgress({
      completed: completedCount,
      total: tasks.length,
    });
  }, [tasks]);

  // Add a function to reset to default tasks if needed
  const resetToDefaultTasks = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTasks(defaultRoutineTasks);
  };

  // Add a function to reset to sample tasks for debugging
  const resetToTestTasks = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const testTasks = [
      {
        id: "test_morning_1",
        text: "DEBUG - Morning cleansing 🌞",
        completed: false,
      },
      {
        id: "test_evening_1",
        text: "DEBUG - Evening moisturizer 🌙",
        completed: false,
      },
      { id: "test_weekly_1", text: "DEBUG - Weekly mask 📅", completed: false },
    ];

    // Update the state
    setTasks(testTasks);
    console.log("Set tasks directly to test tasks:", testTasks);
  };

  // Add a function to save current tasks to storage when tasks are toggled
  useEffect(() => {
    // Only save tasks if they've been loaded and we have a photoId
    if (!loadingStorage && photoId && tasks !== defaultRoutineTasks) {
      taskStorage
        .storeLatestTasks(tasks, photoId)
        .then((success) => {
          if (success) {
            console.log("Saved task changes to storage");
          }
        })
        .catch((error) => {
          console.error("Failed to save task changes:", error);
        });
    }
  }, [tasks, photoId, loadingStorage]);

  const toggleTask = (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              lastUpdated: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const selectDate = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedDates = weekDates.map((date, i) => ({
      ...date,
      selected: i === index,
    }));
    setWeekDates(updatedDates);
    setSelectedDate(index);

    // For the current day (index 0), use the personalized tasks for the current photo
    if (index === 0 && photoId && tasksByPhotoId[photoId]) {
      setTasks(tasksByPhotoId[photoId]);
    } else {
      // For other days, generate simulated tasks based on default tasks
      // but with randomized completion status to simulate history
      setTasks(
        defaultRoutineTasks.map((task) => ({
          ...task,
          completed: Math.random() > 0.5,
        }))
      );
    }
  };

  const openSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Would navigate to settings in a real app
    alert("Settings would open here");
  };

  const navigateToHabits = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would navigate to a habits screen
    alert("Would navigate to habits screen");
  };

  const navigateToCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/camera");
  };

  // Function to organize tasks by time of day
  const organizeTasksByTime = (allTasks: TaskItem[]) => {
    const organized = {
      morning: allTasks.filter(
        (task) => task.id.startsWith("morning_") || task.text.includes("🌞")
      ),
      evening: allTasks.filter(
        (task) => task.id.startsWith("evening_") || task.text.includes("🌙")
      ),
      weekly: allTasks.filter(
        (task) => task.id.startsWith("weekly_") || task.text.includes("📅")
      ),
      other: allTasks.filter(
        (task) =>
          !task.id.startsWith("morning_") &&
          !task.id.startsWith("evening_") &&
          !task.id.startsWith("weekly_") &&
          !task.text.includes("🌞") &&
          !task.text.includes("🌙") &&
          !task.text.includes("📅")
      ),
    };

    // Check if we have any categorized tasks
    const hasCategorizedTasks =
      organized.morning.length > 0 ||
      organized.evening.length > 0 ||
      organized.weekly.length > 0;

    // If we don't have categorized tasks, just return all tasks as "other"
    if (!hasCategorizedTasks) {
      return {
        morning: [],
        evening: [],
        weekly: [],
        other: allTasks,
      };
    }

    return organized;
  };

  const renderTaskSection = (
    title: string,
    sectionTasks: TaskItem[],
    iconName: any
  ) => {
    if (sectionTasks.length === 0) return null;

    return (
      <View style={styles.taskSection}>
        <View style={styles.taskSectionHeader}>
          <Ionicons name={iconName} size={18} color={Colors.light.tint} />
          <Text style={styles.taskSectionTitle}>{title}</Text>
        </View>
        {sectionTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskItem}
            onPress={() => toggleTask(task.id)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContainer}>
              {task.completed ? (
                <Ionicons name="checkbox" size={24} color={Colors.light.tint} />
              ) : (
                <Ionicons
                  name="square-outline"
                  size={24}
                  color={Colors.light.textSecondary}
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
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading your routine...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.title}>Daily routine</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
          <Ionicons
            name="settings-outline"
            size={24}
            color={Colors.light.text}
          />
        </TouchableOpacity>
      </View>

      {loadingStorage ? (
        // Show loading indicator when fetching from AsyncStorage
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading your routine...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Personalized banner - only show if we have personalized tasks */}
          {params.personalizedTasks && selectedDate === 0 && (
            <View style={styles.personalizedContainer}>
              <View style={styles.personalizedBanner}>
                <Ionicons name="sparkles" size={16} color={Colors.light.tint} />
                <Text style={styles.personalizedText}>
                  Personalized routine based on your skin analysis
                </Text>
              </View>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={navigateToCamera}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={16} color="#fff" />
                <Text style={styles.updateButtonText}>Update Analysis</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* DEBUG BUTTON - only display during development */}
          {__DEV__ && (
            <TouchableOpacity
              style={{
                marginBottom: 16,
                padding: 10,
                backgroundColor: "#ff6b00",
                borderRadius: 8,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
              onPress={resetToTestTasks}
            >
              <Ionicons name="bug-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "600" }}>
                Load Test Tasks (Debug)
              </Text>
            </TouchableOpacity>
          )}

          {/* Date Selector */}
          <View style={styles.dateSelector}>
            {weekDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateItem,
                  date.selected && styles.selectedDateItem,
                ]}
                onPress={() => selectDate(index)}
              >
                <Text
                  style={[
                    styles.dateDay,
                    date.selected && styles.selectedDateText,
                  ]}
                >
                  {date.day}
                </Text>
                <Text
                  style={[
                    styles.dateMonth,
                    date.selected && styles.selectedDateText,
                  ]}
                >
                  {date.month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Streaks Section */}
          <View style={styles.streaksContainer}>
            <View style={styles.streaksLabel}>
              <Text style={styles.streaksText}>Streaks</Text>
              <FontAwesome name="fire" size={20} color={Colors.light.tint} />
            </View>
            <View style={styles.streaksValue}>
              <Text style={styles.streaksCount}>{streakCount}</Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>In progress</Text>
              <Text style={styles.progressCount}>
                {progress.completed}/{progress.total}
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(progress.completed / progress.total) * 100}%` },
                ]}
              />
            </View>

            {/* Organized Task List */}
            {(() => {
              const organizedTasks = organizeTasksByTime(tasks);

              // If we only have "other" tasks, render them directly without sections
              if (
                organizedTasks.morning.length === 0 &&
                organizedTasks.evening.length === 0 &&
                organizedTasks.weekly.length === 0
              ) {
                return (
                  <View style={styles.taskList}>
                    {tasks.map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        style={styles.taskItem}
                        onPress={() => toggleTask(task.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.checkboxContainer}>
                          {task.completed ? (
                            <Ionicons
                              name="checkbox"
                              size={24}
                              color={Colors.light.tint}
                            />
                          ) : (
                            <Ionicons
                              name="square-outline"
                              size={24}
                              color={Colors.light.textSecondary}
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
                );
              }

              // Otherwise render organized sections
              return (
                <View style={styles.taskList}>
                  {renderTaskSection(
                    "Morning Routine",
                    organizedTasks.morning,
                    "sunny-outline"
                  )}
                  {renderTaskSection(
                    "Evening Routine",
                    organizedTasks.evening,
                    "moon-outline"
                  )}
                  {renderTaskSection(
                    "Weekly Treatments",
                    organizedTasks.weekly,
                    "calendar-outline"
                  )}
                  {renderTaskSection(
                    "Additional Tasks",
                    organizedTasks.other,
                    "list-outline"
                  )}
                </View>
              );
            })()}
          </View>
        </ScrollView>
      )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.fontSizes.xxxl,
    fontWeight: "700",
    color: Colors.light.text,
  },
  settingsButton: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.circle,
    backgroundColor: Colors.light.card,
    ...Theme.shadows.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl * 2, // Extra padding to account for bottom tab bar
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.xl,
  },
  dateItem: {
    width: 45,
    height: 70,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.light.card,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Theme.spacing.sm,
  },
  selectedDateItem: {
    backgroundColor: Colors.light.tint,
  },
  dateDay: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
  dateMonth: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Colors.light.textSecondary,
  },
  selectedDateText: {
    color: "#FFFFFF",
  },
  streaksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    backgroundColor: Colors.light.card,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  streaksLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  streaksText: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: "600",
    color: Colors.light.text,
    marginRight: Theme.spacing.xs,
  },
  streaksValue: {
    backgroundColor: Colors.light.tint,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
    minWidth: 80,
    alignItems: "center",
  },
  streaksCount: {
    fontSize: Theme.typography.fontSizes.xxl,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  progressSection: {
    marginBottom: Theme.spacing.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  progressTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: "600",
    color: Colors.light.text,
  },
  progressCount: {
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: neutralLight[200],
    borderRadius: Theme.borderRadius.circle,
    marginBottom: Theme.spacing.lg,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: Theme.borderRadius.circle,
  },
  taskList: {
    marginTop: Theme.spacing.md,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  checkboxContainer: {
    marginRight: Theme.spacing.md,
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
  personalizedContainer: {
    marginBottom: Theme.spacing.xl,
  },
  personalizedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 144, 226, 0.1)", // Light blue with 10% opacity (based on tint color)
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  personalizedText: {
    fontSize: 14,
    color: Colors.light.tint,
    marginLeft: 6,
    fontWeight: "500",
    flex: 1,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  taskSection: {
    marginBottom: Theme.spacing.lg,
  },
  taskSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
  },
  taskSectionTitle: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: "600",
    color: Colors.light.tint,
    marginLeft: Theme.spacing.xs,
  },
});
