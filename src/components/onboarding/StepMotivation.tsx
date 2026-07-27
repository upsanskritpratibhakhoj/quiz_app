import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING } from "../../constants/theme";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface MotivationOption {
  id: string;
  name: string;
}

const MOTIVATIONS: MotivationOption[] = [
  { id: "brain", name: "Brain Training" },
  { id: "career", name: "Career & Work" },
  { id: "travel", name: "Travel Plans" },
  { id: "school", name: "School & Education" },
  { id: "family", name: "Family & Friends" },
];

function MotivationIcon({ id }: { id: string }) {
  switch (id) {
    case "brain":
      // Draw a stylized brain/puzzle piece
      return (
        <View style={styles.iconContainer}>
          <View style={[styles.circlePart, { width: 14, height: 14, top: 4, left: 4 }]} />
          <View style={[styles.circlePart, { width: 14, height: 14, top: 4, right: 4 }]} />
          <View style={[styles.circlePart, { width: 18, height: 18, bottom: 4, left: 7 }]} />
        </View>
      );
    case "career":
      // Draw a briefcase
      return (
        <View style={styles.iconContainer}>
          <View style={styles.briefcaseHandle} />
          <View style={styles.briefcaseBody} />
          <View style={styles.briefcaseLatch} />
        </View>
      );
    case "travel":
      // Draw a paper plane / flight path
      return (
        <View style={styles.iconContainer}>
          <View style={styles.planeBody} />
          <View style={styles.planeWingLeft} />
          <View style={styles.planeWingRight} />
        </View>
      );
    case "school":
      // Draw a graduate cap
      return (
        <View style={styles.iconContainer}>
          <View style={styles.capDiamond} />
          <View style={styles.capBase} />
          <View style={styles.capTassel} />
        </View>
      );
    case "family":
      // Draw family silhouettes
      return (
        <View style={[styles.iconContainer, { flexDirection: "row", justifyContent: "center", alignItems: "flex-end" }]}>
          <View style={styles.personContainer}>
            <View style={styles.personHead} />
            <View style={styles.personBody} />
          </View>
          <View style={[styles.personContainer, { marginLeft: 4 }]}>
            <View style={[styles.personHead, { width: 10, height: 10, borderRadius: 5 }]} />
            <View style={[styles.personBody, { width: 16, height: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5 }]} />
          </View>
        </View>
      );
    default:
      return <View style={styles.iconContainer} />;
  }
}

interface StepMotivationProps {
  selectedLanguageName: string;
  selectedMotivation: string;
  onSelectMotivation: (id: string) => void;
  onNext: () => void;
}

export default function StepMotivation({
  selectedLanguageName,
  selectedMotivation,
  onSelectMotivation,
  onNext,
}: StepMotivationProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Why are you learning {selectedLanguageName}?
      </Text>
      
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MOTIVATIONS.map((motivation) => {
          const isSelected = selectedMotivation === motivation.id;
          return (
            <Card
              key={motivation.id}
              selected={isSelected}
              onPress={() => onSelectMotivation(motivation.id)}
              style={styles.card}
            >
              <View style={styles.cardContent}>
                <MotivationIcon id={motivation.id} />
                <Text style={styles.cardText}>{motivation.name}</Text>
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
          disabled={!selectedMotivation}
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
    marginVertical: 25,
  },
  list: {
    paddingBottom: 20,
    gap: 15,
  },
  card: {
    height: 74,
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 10,
  },
  cardText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 15,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  circlePart: {
    position: "absolute",
    backgroundColor: COLORS.accent,
    borderRadius: 10,
  },
  briefcaseBody: {
    width: 22,
    height: 14,
    backgroundColor: COLORS.accent,
    borderRadius: 3,
    marginTop: 2,
  },
  briefcaseHandle: {
    width: 10,
    height: 6,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderBottomWidth: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  briefcaseLatch: {
    position: "absolute",
    bottom: 8,
    width: 4,
    height: 4,
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  planeBody: {
    width: 18,
    height: 4,
    backgroundColor: COLORS.accent,
    transform: [{ rotate: "-45deg" }],
  },
  planeWingLeft: {
    position: "absolute",
    top: 10,
    left: 8,
    width: 10,
    height: 10,
    backgroundColor: COLORS.accentDark,
    transform: [{ rotate: "15deg" }],
  },
  planeWingRight: {
    position: "absolute",
    top: 15,
    left: 12,
    width: 12,
    height: 5,
    backgroundColor: COLORS.accent,
    transform: [{ rotate: "-15deg" }],
  },
  capDiamond: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.accent,
    transform: [{ rotate: "45deg" }, { scaleY: 0.5 }],
  },
  capBase: {
    width: 12,
    height: 6,
    backgroundColor: COLORS.accentDark,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginTop: -4,
  },
  capTassel: {
    position: "absolute",
    right: 8,
    top: 16,
    width: 4,
    height: 8,
    backgroundColor: COLORS.warning,
  },
  personContainer: {
    alignItems: "center",
  },
  personHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
  },
  personBody: {
    width: 20,
    height: 12,
    backgroundColor: COLORS.accentDark,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginTop: 1,
  },
  footer: {
    paddingBottom: SPACING.md,
    paddingTop: 10,
  },
});
