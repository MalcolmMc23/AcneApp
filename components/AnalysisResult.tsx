import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme, Colors } from "@/constants/Colors";

interface AnalysisResultProps {
  result: string;
}

/**
 * Component for displaying formatted skin analysis results
 */
export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  // Parse the analysis into sections
  const sections = parseAnalysisIntoSections(result);

  return (
    <ScrollView style={styles.container}>
      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          {section.title && (
            <View style={styles.sectionHeader}>
              {getIconForSection(section.title)}
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          <Text style={styles.sectionContent}>{section.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

/**
 * Parse the analysis text into structured sections
 */
function parseAnalysisIntoSections(
  analysisText: string
): { title: string; content: string }[] {
  // First split by the divider if it exists
  const parts = analysisText.split("---");
  const mainAnalysis = parts[0].trim();
  const enhancedParts = parts.length > 1 ? parts[1].trim() : "";

  // Find sections in the main analysis
  const sectionRegex =
    /(\d\.\s+[A-Z\s]+:)|(🔬\s+DETAILED TREATMENT INFORMATION:)|(💧\s+PERSONALIZED SKINCARE ROUTINE:)/g;
  const sectionMatches = mainAnalysis.split(sectionRegex).filter(Boolean);

  const sections: { title: string; content: string }[] = [];

  // Process the main analysis sections
  for (let i = 0; i < sectionMatches.length; i += 2) {
    if (i + 1 < sectionMatches.length) {
      const title = sectionMatches[i]
        .trim()
        .replace(/\d\.\s+/, "")
        .replace(":", "");
      const content = sectionMatches[i + 1].trim();
      sections.push({ title, content });
    }
  }

  // Add the enhanced sections if they exist
  if (enhancedParts) {
    // Find enhanced sections
    const enhancedSectionRegex =
      /(🔬\s+DETAILED TREATMENT INFORMATION:)|(💧\s+PERSONALIZED SKINCARE ROUTINE:)/g;
    const enhancedMatches = enhancedParts
      .split(enhancedSectionRegex)
      .filter(Boolean);

    for (let i = 0; i < enhancedMatches.length; i += 2) {
      if (i + 1 < enhancedMatches.length) {
        const title = enhancedMatches[i].trim().replace(":", "");
        const content = enhancedMatches[i + 1].trim();
        sections.push({ title, content });
      }
    }
  }

  // If parsing fails, at least return the whole text
  if (sections.length === 0) {
    return [{ title: "Analysis", content: analysisText }];
  }

  return sections;
}

/**
 * Get an appropriate icon for each section type
 */
function getIconForSection(title: string) {
  const iconSize = 22;
  const iconColor = Colors.light.tint;

  // Map section titles to icons
  const iconMap: Record<string, React.ReactNode> = {
    "SPECIFIC DIAGNOSIS": (
      <Ionicons name="medical" size={iconSize} color={iconColor} />
    ),
    "SEVERITY ASSESSMENT": (
      <Ionicons name="stats-chart" size={iconSize} color={iconColor} />
    ),
    "ROOT CAUSES": <Ionicons name="search" size={iconSize} color={iconColor} />,
    "PERSONALIZED TREATMENT PLAN": (
      <Ionicons name="flask" size={iconSize} color={iconColor} />
    ),
    "LIFESTYLE RECOMMENDATIONS": (
      <Ionicons name="leaf" size={iconSize} color={iconColor} />
    ),
    "PROFESSIONAL TREATMENT OPTIONS": (
      <Ionicons name="medkit" size={iconSize} color={iconColor} />
    ),
    "DETAILED TREATMENT INFORMATION": (
      <Ionicons name="information-circle" size={iconSize} color={iconColor} />
    ),
    "PERSONALIZED SKINCARE ROUTINE": (
      <Ionicons name="water" size={iconSize} color={iconColor} />
    ),
    Analysis: (
      <Ionicons name="document-text" size={iconSize} color={iconColor} />
    ),
  };

  // Check for partial matches
  for (const key in iconMap) {
    if (title.includes(key) || key.includes(title)) {
      return iconMap[key];
    }
  }

  // Default icon
  return <Ionicons name="document-text" size={iconSize} color={iconColor} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: "600",
    color: Colors.light.text,
    marginLeft: Theme.spacing.sm,
  },
  sectionContent: {
    fontSize: Theme.typography.fontSizes.md,
    lineHeight: 24,
    color: Colors.light.textSecondary,
    paddingLeft: Theme.spacing.xl,
  },
});

export default AnalysisResult;
