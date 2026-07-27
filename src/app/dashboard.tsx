import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { COLORS, TYPOGRAPHY, RADII, SPACING } from "../constants/theme";
import Mascot from "../components/ui/Mascot";
import Button from "../components/ui/Button";

const LANGUAGE_NAMES: Record<string, string> = {
  es: "Spanish",
  fr: "French",
  de: "German",
  jp: "Japanese",
  it: "Italian",
  kr: "Korean",
};

const MOTIVATION_LABELS: Record<string, string> = {
  brain: "Brain Training",
  career: "Career & Work",
  travel: "Travel Plans",
  school: "School & Education",
  family: "Family & Friends",
};

export default function Dashboard() {
  const params = useLocalSearchParams();
  const languageCode = (params.language as string) || "es";
  const motivationId = (params.motivation as string) || "brain";
  const dailyGoal = parseInt((params.dailyGoal as string) || "10", 10);
  const pathSelection = (params.pathSelection as string) || "beginner";

  const motivationLabel = MOTIVATION_LABELS[motivationId] || "Brain Training";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Learning Plan</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Mascot expression="excited" size={150} style={styles.mascot} />
          
          <Text style={styles.congratsText}>
            You're all set!
          </Text>
          <Text style={styles.subtext}>
            We've customized a learning path just for you. Here is your plan summary:
          </Text>

          {/* Plan Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Language:</Text>
              <Text style={styles.value}>Sanskrit</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Focus Area:</Text>
              <Text style={styles.value}>{motivationLabel}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Daily Goal:</Text>
              <Text style={styles.value}>{dailyGoal} min / day</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Starting Level:</Text>
              <Text style={styles.value}>
                {pathSelection === "beginner" ? "Complete Beginner" : "Experienced (Placement)"}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Action */}
        <View style={styles.footer}>
          <Button
            title="Start First Lesson"
            variant="primary"
            onPress={() => {
              // Reset and restart onboarding for demo purposes
              router.replace("/");
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background, // pale sky-blue background
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  header: {
    paddingVertical: 20,
    alignItems: "center",
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 22,
    color: COLORS.accent, // cyan accent text
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mascot: {
    marginBottom: 20,
  },
  congratsText: {
    ...TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },
  subtext: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 25,
    paddingHorizontal: 15,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
    // Duolingo 3D card bottom border
    borderBottomWidth: 5,
    borderBottomColor: COLORS.borderDark,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.border,
  },
  label: {
    ...TYPOGRAPHY.bodyRegular,
    color: COLORS.textMuted,
    fontSize: 15,
  },
  value: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontSize: 15,
  },
  footer: {
    paddingBottom: SPACING.md,
  },
});
