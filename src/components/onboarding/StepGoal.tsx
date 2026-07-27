import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING } from "../../constants/theme";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Mascot from "../ui/Mascot";

interface GoalOption {
  id: number;
  label: string;
  duration: string;
}

const GOALS: GoalOption[] = [
  { id: 5, label: "Casual", duration: "5 min / day" },
  { id: 10, label: "Regular", duration: "10 min / day" },
  { id: 15, label: "Serious", duration: "15 min / day" },
  { id: 20, label: "Intense", duration: "20 min / day" },
];

interface StepGoalProps {
  selectedGoal: number;
  onSelectGoal: (minutes: number) => void;
  onNext: () => void;
}

export default function StepGoal({
  selectedGoal,
  onSelectGoal,
  onNext,
}: StepGoalProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a daily goal</Text>

      {/* Mascot & Speech Bubble section */}
      <View style={styles.mascotContainer}>
        <Mascot expression="guiding" size={100} style={styles.mascot} />
        <View style={styles.speechBubble}>
          {/* Triangle pointing to Mascot */}
          <View style={styles.speechPointer} />
          <Text style={styles.speechText}>
            Keep it small! Start with a few minutes a day, you can always change it later.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {GOALS.map((goal) => {
          const isSelected = selectedGoal === goal.id;
          return (
            <Card
              key={goal.id}
              selected={isSelected}
              onPress={() => onSelectGoal(goal.id)}
              style={styles.card}
            >
              <View style={styles.cardContent}>
                <Text style={styles.goalLabel}>{goal.label}</Text>
                <Text style={styles.goalDuration}>{goal.duration}</Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          variant="primary"
          onPress={onNext}
          disabled={!selectedGoal}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  title: {
    ...TYPOGRAPHY.heading,
    fontSize: 22,
    color: COLORS.text,
    textAlign: "center",
    marginVertical: 20,
  },
  mascotContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  mascot: {
    marginRight: 15,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 12,
    position: "relative",
    // 3D bottom border shadow for the speech bubble
    borderBottomWidth: 4,
    borderBottomColor: COLORS.borderDark,
  },
  speechPointer: {
    position: "absolute",
    left: -10,
    top: "35%",
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 8,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftWidth: 0,
    borderTopColor: "transparent",
    borderRightColor: COLORS.border,
    borderBottomColor: "transparent",
  },
  speechText: {
    ...TYPOGRAPHY.bodyRegular,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 18,
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  card: {
    height: 64,
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 15,
  },
  goalLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.text,
  },
  goalDuration: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  footer: {
    paddingBottom: SPACING.md,
    paddingTop: 10,
  },
});
