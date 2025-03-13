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

import { Theme, Colors } from "@/constants/Colors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
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

// Daily routine tasks with emojis related to acne care
const routineTasks: TaskItem[] = [
  { id: "task1", text: "Use gentle cleanser 🧴", completed: true },
  { id: "task2", text: "Apply benzoyl peroxide 2.5% 💧", completed: false },
  { id: "task3", text: "Drink 8 glasses of water 💦", completed: false },
  { id: "task4", text: "Take zinc supplement 💊", completed: false },
  { id: "task5", text: "Apply oil-free moisturizer 🌱", completed: false },
];

export default function RoutineScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0); // Index of the selected date
  const [weekDates, setWeekDates] = useState<DateItem[]>(generateWeekDates());
  const [streakCount, setStreakCount] = useState(7);
  const [tasks, setTasks] = useState<TaskItem[]>(routineTasks);
  const [progress, setProgress] = useState({
    completed: 1,
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

  const toggleTask = (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
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

    // In a real app, this would fetch tasks for the selected date
    // For now, we'll just reset the tasks to simulate a different day
    if (index === 0) {
      setTasks(routineTasks);
    } else {
      // Simulate different tasks for different days
      setTasks(
        routineTasks.map((task) => ({
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

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
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
            <FontAwesome name="fire" size={20} color="#FF9500" />
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

          {/* Task List */}
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
    backgroundColor: Colors.light.accent,
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
    backgroundColor: Colors.light.accent,
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
});
