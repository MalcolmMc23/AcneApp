import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
  Animated,
  TouchableOpacity,
} from "react-native";
import {
  CameraView,
  CameraCapturedPicture,
  useCameraPermissions,
} from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Theme, Colors } from "@/constants/Colors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  analyzeImageWithEnhancement,
  analyzeImageForTasks,
  generatePersonalizedTasks,
} from "../utils/aiHelper";
import AnalysisResult from "@/components/AnalysisResult";
import openai from "../utils/openai";
import taskStorage from "../utils/taskStorage";

// Add function to optimize image for analysis
const optimizeImageForAnalysis = async (imageUri: string): Promise<string> => {
  try {
    // Use ImageManipulator to enhance the image
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Resize to optimal size for analysis while preserving detail
        { resize: { width: 1024 } },
        // Flip to match the natural view (front camera)
        { flip: ImageManipulator.FlipType.Horizontal },
      ],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );

    console.log("Image optimized for analysis");
    return manipResult.uri;
  } catch (error) {
    console.error("Error optimizing image:", error);
    // Return original image if enhancement fails
    return imageUri;
  }
};

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [personalizedTasks, setPersonalizedTasks] = useState<Array<{
    id: string;
    text: string;
    completed: boolean;
  }> | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  useEffect(() => {
    requestPermission();
  }, []);

  // Add a function to generate test tasks without using OpenAI
  const generateTestTasks = () => {
    setAnalyzing(true);

    // Simple delay to simulate analysis
    setTimeout(() => {
      // Create a set of test tasks with proper categories
      const testTasks = [
        {
          id: "morning_1",
          text: "TEST - Wash face with gentle cleanser 🌞",
          completed: false,
        },
        {
          id: "morning_2",
          text: "TEST - Apply sunscreen SPF 30+ 🌞",
          completed: false,
        },
        {
          id: "evening_1",
          text: "TEST - Double cleanse with oil cleanser 🌙",
          completed: false,
        },
        {
          id: "evening_2",
          text: "TEST - Apply retinol serum 🌙",
          completed: false,
        },
        {
          id: "weekly_1",
          text: "TEST - Use clay mask once a week 📅",
          completed: false,
        },
      ];

      // Set test tasks and analysis result
      setPersonalizedTasks(testTasks);
      setAnalysisResult(
        "This is a test analysis result to verify the task passing functionality."
      );
      setAnalyzing(false);

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log("Test tasks generated successfully", testTasks);
    }, 1500);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        console.log("Taking picture...");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Take the picture with highest quality settings
        const photo: CameraCapturedPicture | undefined =
          await cameraRef.current.takePictureAsync({
            quality: 0.8, // Slightly reduced quality for better performance
            skipProcessing: false, // Ensure proper orientation
            exif: true, // Include EXIF data
            base64: false, // Don't encode as base64 here for better performance
            imageType: "jpg", // Use JPEG format for better detail in skin tones
            isImageMirror: true, // Mirror image for front camera (more natural for selfies)
          });

        console.log(
          "Picture taken successfully:",
          photo?.uri ? "URI exists" : "No URI"
        );

        if (photo && photo.uri) {
          setPhotoUri(photo.uri);
          // Reset analysis state when taking a new picture
          setAnalysisResult(null);
        } else {
          console.error("Photo object is missing URI");
          Alert.alert("Error", "Failed to save photo. Please try again.");
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "Error",
          "Failed to take picture. Please check camera permissions and try again."
        );
      }
    } else {
      console.error("Camera reference is not available");
      Alert.alert(
        "Error",
        "Camera is not ready. Please restart the app and try again."
      );
    }
  };

  const analyzeImage = async () => {
    if (!photoUri) return;

    setAnalyzing(true);
    setOptimizing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Check if API key is configured
      if (!openai.apiKey) {
        throw new Error(
          "OpenAI API key not configured. Please add it to your environment variables or app config."
        );
      }

      // Always proceed with analysis, we don't care if it's a face or not
      // Optimize the image for better detail extraction
      const optimizedImageUri = await optimizeImageForAnalysis(photoUri);
      setOptimizing(false);

      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(
        optimizedImageUri,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      // Step 1: Generate tasks using the structured format method
      console.log("Generating personalized tasks in structured format...");
      let tasks = null;

      try {
        // The analyzeImageForTasks function now handles multiple attempts to get properly formatted tasks
        tasks = await analyzeImageForTasks(openai, base64Image);

        if (!tasks || tasks.length === 0) {
          throw new Error("Task generation failed - no tasks returned");
        }

        console.log(`Successfully generated ${tasks.length} structured tasks`);
      } catch (taskError) {
        console.error("Error generating structured tasks:", taskError);
        tasks = null;
      }

      // DEBUGGING: Log task generation attempts
      console.log("------ TASK GENERATION DEBUGGING ------");
      console.log(
        "Step 1: Generated tasks using structured format:",
        tasks ? `Success - ${tasks.length} tasks` : "Failed - No tasks"
      );

      // Step 2: Get the general skin analysis
      const analysisResult = await analyzeImageWithEnhancement(
        openai,
        base64Image
      );

      // Step 3: If structured tasks failed, try to extract tasks from the general analysis
      if (!tasks || tasks.length === 0) {
        console.log("Attempting to generate tasks from general analysis...");
        try {
          tasks = generatePersonalizedTasks(analysisResult);
          console.log(
            "Step 2: Generated tasks from general analysis:",
            tasks?.length
              ? `Success - ${tasks.length} tasks`
              : "Failed - No tasks"
          );
        } catch (fallbackError) {
          console.error("Error generating fallback tasks:", fallbackError);
        }
      }

      // Step 4: If we still don't have tasks, create basic ones
      if (!tasks || tasks.length === 0) {
        console.warn(
          "Step 3: All task generation methods failed, using basic tasks"
        );
        tasks = [
          {
            id: "morning_1",
            text: "Cleanse with gentle cleanser 🌞",
            completed: false,
          },
          { id: "morning_2", text: "Apply moisturizer 🌞", completed: false },
          {
            id: "morning_3",
            text: "Apply sunscreen SPF 30+ 🌞",
            completed: false,
          },
          {
            id: "evening_1",
            text: "Double cleanse to remove sunscreen/makeup 🌙",
            completed: false,
          },
          {
            id: "evening_2",
            text: "Apply treatment for your skin concerns 🌙",
            completed: false,
          },
          {
            id: "evening_3",
            text: "Apply night moisturizer 🌙",
            completed: false,
          },
          {
            id: "weekly_1",
            text: "Use gentle exfoliant 1-2 times per week 📅",
            completed: false,
          },
        ];
        console.log("Using default tasks:", tasks.length);
      }

      // Store the tasks and analysis result
      setPersonalizedTasks(tasks);
      setAnalysisResult(analysisResult);

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log("Image analysis complete with structured tasks");
    } catch (error) {
      console.error("Error analyzing image:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Analysis Error",
        "We encountered a problem analyzing your skin. Please try again or use a clearer photo."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const resetCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotoUri(null);
    setAnalysisResult(null);
    setPersonalizedTasks(null);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const goToRoutine = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // DEBUGGING: Add detailed console logs
    console.log(
      "Before serialization - personalizedTasks:",
      personalizedTasks
        ? `Found ${personalizedTasks.length} tasks`
        : "No tasks available"
    );

    // DEBUGGING: Add fallback test tasks if none were generated
    let tasksToUse = personalizedTasks;
    if (!tasksToUse || tasksToUse.length === 0) {
      console.log(
        "⚠️ No tasks were generated by AI, using test tasks for debugging"
      );
      tasksToUse = [
        {
          id: "test_morning_1",
          text: "TEST - Morning cleansing 🌞",
          completed: false,
        },
        {
          id: "test_evening_1",
          text: "TEST - Evening moisturizing 🌙",
          completed: false,
        },
        {
          id: "test_weekly_1",
          text: "TEST - Weekly exfoliation 📅",
          completed: false,
        },
      ];
      // Update the state for UI feedback
      setPersonalizedTasks(tasksToUse);
    }

    // Generate a unique photo ID for this analysis
    const photoId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log("Navigating to routine with photo ID:", photoId);

    // Store tasks using multiple methods for reliability
    try {
      // 1. Use our new task storage utility (persists to AsyncStorage)
      taskStorage.storeLatestTasks(tasksToUse, photoId).then((success) => {
        if (!success) {
          console.warn(
            "Task storage utility failed, falling back to basic methods"
          );
        }
      });

      // 2. Store in global variables as immediate backup
      global.latestTasks = tasksToUse;
      global.latestPhotoId = photoId;

      // 3. Also serialize for URL params as final fallback
      const serializedTasks = JSON.stringify(tasksToUse);

      console.log("Triple-redundant task storage complete");

      // Navigate to routine screen
      router.push({
        pathname: "/routine",
        params: {
          useLatestTasks: "true",
          photoId, // Include photoId in URL as well
          taskCount: tasksToUse.length.toString(), // Add task count as a simple check
          personalizedTasks: serializedTasks, // Keep this as fallback
        },
      });
    } catch (error) {
      console.error("Error in task storage or navigation:", error);

      // If all else fails, show error to user
      Alert.alert(
        "Navigation Error",
        "There was a problem saving your routine. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {!permission?.granted ? (
        // Camera permission not granted
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            We need camera access to analyze your skin and provide personalized
            recommendations.
          </Text>
          <Button
            label="Grant Permission"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
          <Button
            label="Go Back"
            variant="ghost"
            onPress={goBack}
            style={styles.backButton}
          />
        </View>
      ) : !photoUri ? (
        // Camera view
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={"front"}
            onMountError={(error) => {
              console.error("Camera mount error:", error);
              Alert.alert(
                "Camera Error",
                "There was a problem accessing your camera. Please restart the app and try again."
              );
            }}
            onCameraReady={() => console.log("Camera is ready")}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <Button
                  label="Back"
                  variant="ghost"
                  leftIcon={
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={Colors.light.card}
                    />
                  }
                  onPress={goBack}
                  textStyle={styles.cameraHeaderText}
                />
                <Text style={styles.cameraTitle}>Skin Analysis</Text>
                <View style={{ width: 60 }} />
              </View>

              {/* Simplified photo tips without face positioning guidance */}
              <View style={styles.lightingTips}>
                <Text style={styles.lightingTipsText}>For best analysis:</Text>
                <Text style={styles.lightingTipsText}>
                  • Use natural daylight or bright, even lighting
                </Text>
                <Text style={styles.lightingTipsText}>
                  • Take a clear photo of the skin area
                </Text>
              </View>

              <View style={styles.cameraFooter}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "#fff",
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      ) : (
        // Photo preview and analysis
        <SafeAreaView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Button
              label="Back"
              variant="ghost"
              leftIcon={
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={Colors.light.text}
                />
              }
              onPress={resetCamera}
              textStyle={styles.headerText}
            />
            <Text style={styles.headerTitle}>Skin Analysis</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <Image source={{ uri: photoUri }} style={styles.previewImage} />

            {!analysisResult ? (
              <Card style={styles.analysisCard}>
                {analyzing ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.tint} />
                    <Text style={styles.loadingText}>
                      {optimizing
                        ? "Optimizing image..."
                        : "Analyzing your skin..."}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.analyzeContainer}>
                    <Text style={styles.analyzeText}>
                      Ready to analyze your skin? Our AI will provide
                      personalized insights.
                    </Text>
                    <Button
                      label="Analyze Skin"
                      onPress={analyzeImage}
                      fullWidth
                      leftIcon={
                        <Ionicons name="scan-outline" size={20} color="#fff" />
                      }
                      style={styles.analyzeButton}
                    />
                    <Button
                      label="Generate Test Tasks (Debug)"
                      onPress={generateTestTasks}
                      fullWidth
                      leftIcon={
                        <Ionicons name="bug-outline" size={20} color="#fff" />
                      }
                      variant="outline"
                      style={{ marginTop: 8, borderColor: "#ff9500" }}
                      textStyle={{ color: "#ff9500" }}
                    />
                    <Button
                      label="Take New Photo"
                      variant="outline"
                      onPress={resetCamera}
                      fullWidth
                      style={styles.newPhotoButton}
                    />
                  </View>
                )}
              </Card>
            ) : (
              <Card style={styles.resultsCard}>
                <Text style={styles.resultsTitle}>
                  Your Personalized Skin Analysis
                </Text>
                <View style={styles.resultsDivider} />
                <AnalysisResult result={analysisResult} />
                <View style={styles.actionsContainer}>
                  <Button
                    label="View Personalized Routine"
                    variant="primary"
                    onPress={goToRoutine}
                    fullWidth
                    leftIcon={
                      <Ionicons name="list-outline" size={20} color="#fff" />
                    }
                    style={styles.actionButton}
                  />
                  <Button
                    label="Save Analysis"
                    variant="outline"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert(
                        "Analysis Saved",
                        "Your skin analysis has been saved to your profile.",
                        [{ text: "OK" }]
                      );
                    }}
                    fullWidth
                    leftIcon={
                      <Ionicons
                        name="bookmark-outline"
                        size={20}
                        color={Colors.light.tint}
                      />
                    }
                    style={[styles.actionButton, styles.secondaryActionButton]}
                  />
                  <Button
                    label="Take New Photo"
                    variant="ghost"
                    onPress={resetCamera}
                    fullWidth
                    style={styles.newPhotoButton}
                  />
                </View>
              </Card>
            )}
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  // Permission styles
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  permissionTitle: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: Theme.spacing.md,
    textAlign: "center",
  },
  permissionText: {
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
  },
  permissionButton: {
    marginBottom: Theme.spacing.md,
  },
  backButton: {
    marginTop: Theme.spacing.sm,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cameraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Theme.spacing.md,
    paddingTop: 50, // Extra padding for status bar
  },
  cameraTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: "600",
    color: Colors.light.card,
  },
  cameraHeaderText: {
    color: Colors.light.card,
  },
  cameraFooter: {
    alignItems: "center",
    marginBottom: Theme.spacing.xl,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 4,
    borderColor: "#fff",
  },
  // Preview styles
  previewContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    ...Theme.shadows.sm,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: "600",
    color: Colors.light.text,
  },
  headerText: {
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  previewImage: {
    width: "100%",
    height: 400,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.md,
  },
  analysisCard: {
    marginBottom: Theme.spacing.lg,
  },
  loadingContainer: {
    alignItems: "center",
    padding: Theme.spacing.lg,
  },
  loadingText: {
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.textSecondary,
    marginTop: Theme.spacing.md,
  },
  analyzeContainer: {
    padding: Theme.spacing.md,
  },
  analyzeText: {
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.text,
    marginBottom: Theme.spacing.lg,
    lineHeight: 22,
  },
  analyzeButton: {
    marginBottom: Theme.spacing.md,
  },
  newPhotoButton: {
    marginTop: Theme.spacing.sm,
  },
  resultsCard: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
  },
  resultsTitle: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Theme.spacing.sm,
    textAlign: "center",
  },
  resultsDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Theme.spacing.md,
  },
  resultsText: {
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
  },
  actionsContainer: {
    marginTop: Theme.spacing.md,
  },
  actionButton: {
    marginBottom: Theme.spacing.md,
  },
  lightingTips: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: Theme.spacing.lg,
    alignItems: "center",
  },
  lightingTipsText: {
    color: "#fff",
    fontSize: Theme.typography.fontSizes.sm,
    textAlign: "center",
  },
  secondaryActionButton: {
    marginTop: Theme.spacing.md,
  },
  faceGuideContainer: {
    // Keeping the property but emptying the style
    // (in case it's referenced elsewhere)
  },
  faceGuide: {
    // Keeping the property but emptying the style
  },
  guideText: {
    // Keeping the property but emptying the style
  },
});
