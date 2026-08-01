import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING } from "../../constants/theme";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface StepPathProps {
  selectedPath: "beginner" | "placement" | "";
  onSelectPath: (path: "beginner" | "placement") => void;
  onNext: () => void;
}

function PathIcon({ type }: { type: "beginner" | "placement" }) {
  if (type === "beginner") {
    // Draw a sprout (seedling) growing
    return (
      <View style={styles.iconContainer}>
        {/* Soil base */}
        <View style={styles.soil} />
        {/* Sprout stem */}
        <View style={styles.sproutStem} />
        {/* Leaves */}
        <View style={styles.leafLeft} />
        <View style={styles.leafRight} />
      </View>
    );
  } else {
    // Draw a test sheet with score
    return (
      <View style={styles.iconContainer}>
        {/* Test paper base */}
        <View style={styles.paperBase}>
          {/* Text lines */}
          <View style={styles.paperLine} />
          <View style={[styles.paperLine, { width: "70%" }]} />
          <View style={[styles.paperLine, { width: "50%" }]} />
        </View>
        {/* Checkmark mark */}
        <View style={styles.badgeCheck}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
      </View>
    );
  }
}

export default function StepPath({
  selectedPath,
  onSelectPath,
  onNext,
}: StepPathProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where would you like to start?</Text>

      <View style={styles.list}>
        {/* Beginner Path */}
        <Card
          selected={selectedPath === "beginner"}
          onPress={() => onSelectPath("beginner")}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <PathIcon type="beginner" />
            <View style={styles.cardTextContainer}>
              <Text style={styles.pathTitle}>बाल वर्ग</Text>
              <Text style={styles.pathSubtitle}>
                First time learning Sanskrit? Start with the absolute basics!
              </Text>
            </View>
          </View>
        </Card>

        {/* Placement Path */}
        <Card
          selected={selectedPath === "placement"}
          onPress={() => onSelectPath("placement")}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <PathIcon type="placement" />
            <View style={styles.cardTextContainer}>
              <Text style={styles.pathTitle}>युवा वर्ग</Text>
              <Text style={styles.pathSubtitle}>
                Already know some Sanskrit?
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          title="Start Learning"
          variant="primary"
          onPress={onNext}
          disabled={!selectedPath}
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
    gap: 20,
    flex: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  card: {
    height: 120,
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 15,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  pathTitle: {
    ...TYPOGRAPHY.body,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 4,
  },
  pathSubtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  soil: {
    position: "absolute",
    bottom: 8,
    width: 28,
    height: 6,
    backgroundColor: "#b88a5c",
    borderRadius: 3,
  },
  sproutStem: {
    position: "absolute",
    bottom: 12,
    width: 4,
    height: 20,
    backgroundColor: "#58cc02",
    borderRadius: 2,
  },
  leafLeft: {
    position: "absolute",
    top: 18,
    left: 12,
    width: 12,
    height: 6,
    backgroundColor: "#58cc02",
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    transform: [{ rotate: "-25deg" }],
  },
  leafRight: {
    position: "absolute",
    top: 16,
    right: 12,
    width: 12,
    height: 6,
    backgroundColor: "#78ca28",
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    transform: [{ rotate: "25deg" }],
  },
  paperBase: {
    width: 24,
    height: 32,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: 3,
    padding: 3,
    gap: 3,
  },
  paperLine: {
    height: 2,
    backgroundColor: COLORS.backgroundDark,
    width: "100%",
    borderRadius: 1,
  },
  badgeCheck: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.onPrimary,
  },
  footer: {
    paddingBottom: SPACING.md,
    paddingTop: 10,
  },
});
