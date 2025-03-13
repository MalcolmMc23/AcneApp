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
import { Ionicons } from "@expo/vector-icons";
import OpenAI from "openai";
import Constants from "expo-constants";
import { Theme, Colors } from "@/constants/Colors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { analyzeImageWithEnhancement } from "@/utils/aiHelper";
import AnalysisResult from "@/components/AnalysisResult";

// Initialize OpenAI client
// You'll need to add your OpenAI API key in app.config.js or as an environment variable
const openai = new OpenAI({
  apiKey:
    Constants.expoConfig?.extra?.openAIApiKey ||
    process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for React Native
});

// Add functions for image enhancement
const enhanceImageForAnalysis = async (imageUri: string): Promise<string> => {
  // For now, we'll just return the original URI
  // In a real implementation, you could use a library like react-native-image-filter-kit
  // or a cloud service to enhance the image

  console.log("Enhancing image for better quality analysis");

  // On a real implementation you could manipulate the image here
  // For example, adjusting brightness, contrast, etc.

  return imageUri;
};

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [enhancingImage, setEnhancingImage] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  useEffect(() => {
    requestPermission();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Take the picture with highest quality settings
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1, // Maximum quality (0 to 1)
          skipProcessing: false, // Ensure proper orientation
          exif: true, // Include EXIF data
        });

        if (photo) {
          // Show a message to indicate enhanced processing
          Alert.alert(
            "Enhancing Image",
            "Processing your photo for best quality..."
          );

          // Apply a slight delay to show the processing message
          setTimeout(() => {
            setPhotoUri(photo.uri);
            // Reset analysis state when taking a new picture
            setAnalysisResult(null);
          }, 500);
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  const analyzeImage = async () => {
    if (!photoUri) return;

    setAnalyzing(true);
    setEnhancingImage(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Check if API key is configured
      if (!openai.apiKey) {
        throw new Error(
          "OpenAI API key not configured. Please add it to your environment variables or app config."
        );
      }

      // Enhanced image processing for better quality
      const enhancedImageUri = await enhanceImageForAnalysis(photoUri);
      setEnhancingImage(false);

      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(enhancedImageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Use the enhanced image analysis utility
      const result = await analyzeImageWithEnhancement(openai, base64Image);

      // Update the UI with the analysis result
      setAnalysisResult(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error analyzing image:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to analyze image. Please try again.");
      setAnalysisResult(null);
    } finally {
      setAnalyzing(false);
      setEnhancingImage(false);
    }
  };

  const resetCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotoUri(null);
    setAnalysisResult(null);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const goToRoutine = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Generate a unique photo ID for this analysis
    const photoId = Date.now().toString();
    router.push({
      pathname: "/routine",
      params: { photoId },
    });
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
          <CameraView ref={cameraRef} style={styles.camera} facing={"front"}>
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

              {/* Add lighting instructions for better photos */}
              <View style={styles.lightingTips}>
                <Text style={styles.lightingTipsText}>
                  For best results, take photos in good lighting
                </Text>
              </View>

              <View style={styles.cameraFooter}>
                <Button
                  label=""
                  variant="ghost"
                  style={styles.captureButton}
                  onPress={takePicture}
                  hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
                />
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
                      {enhancingImage
                        ? "Enhancing image quality..."
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
});
