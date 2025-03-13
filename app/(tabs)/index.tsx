import { StyleSheet, Text, SafeAreaView, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Theme, Colors } from "@/constants/Colors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomeScreen() {
  const router = useRouter();

  const handleVibration = () => {
    // Provide strong haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const navigateToCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/camera");
  };

  const navigateToRoutine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/routine");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Acne App!</Text>
        <Text style={styles.subtitle}>Your personal skin care assistant</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Getting Started</Text>
          <Text style={styles.cardText}>
            Track your skin's progress, get personalized recommendations, and
            learn about effective treatments.
          </Text>
        </Card>

        <Card style={styles.actionCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <Button
            label="AI Image Analysis"
            variant="primary"
            leftIcon={<Ionicons name="camera-outline" size={20} color="#fff" />}
            onPress={navigateToCamera}
            fullWidth
            style={styles.actionButton}
          />

          <Button
            label="Test Haptic Feedback"
            variant="secondary"
            leftIcon={<Ionicons name="pulse-outline" size={20} color="#fff" />}
            onPress={handleVibration}
            fullWidth
            style={styles.actionButton}
            hapticStyle={Haptics.ImpactFeedbackStyle.Heavy}
          />

          <Button
            label="View My Routine"
            variant="primary"
            leftIcon={
              <Ionicons name="calendar-outline" size={20} color="#fff" />
            }
            onPress={navigateToRoutine}
            fullWidth
            style={styles.actionButton}
          />
        </Card>

        <Card variant="filled" style={styles.tipsCard}>
          <Text style={styles.cardTitle}>Skin Care Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons
              name="water-outline"
              size={24}
              color={Colors.light.tint}
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Stay hydrated by drinking plenty of water daily
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons
              name="sunny-outline"
              size={24}
              color={Colors.light.tint}
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Always wear sunscreen, even on cloudy days
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons
              name="bed-outline"
              size={24}
              color={Colors.light.tint}
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Get 7-8 hours of sleep for skin regeneration
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <Button
          label="Go to My Routine"
          variant="primary"
          size="lg"
          leftIcon={<Ionicons name="list-outline" size={22} color="#fff" />}
          onPress={navigateToRoutine}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: Theme.typography.fontSizes.xxl,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  infoCard: {
    backgroundColor: Colors.light.tint,
    marginBottom: Theme.spacing.lg,
  },
  actionCard: {
    marginBottom: Theme.spacing.lg,
  },
  tipsCard: {
    marginBottom: Theme.spacing.lg,
  },
  cardTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: "600",
    marginBottom: Theme.spacing.md,
    color: Colors.light.text,
  },
  cardText: {
    fontSize: Theme.typography.fontSizes.md,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  actionButton: {
    marginBottom: Theme.spacing.md,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  tipIcon: {
    marginRight: Theme.spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: Theme.typography.fontSizes.md,
    color: Colors.light.text,
  },
  bottomButtonContainer: {
    padding: Theme.spacing.lg,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
