import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, TYPOGRAPHY, SPACING } from "../../constants/theme";
import Mascot from "../ui/Mascot";
import Button from "../ui/Button";

interface StepWelcomeProps {
  onNext: () => void;
}

export default function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <Mascot expression="happy" size={150} />
          
          <Text style={styles.title}>वाक्यशिल्पी </Text>
          
          <Text style={styles.subtitle}>
            Learn a language for free.{"\n"}Forever.
          </Text>
        </View>

        <View style={styles.footerSection}>
          <Button
            title="Get Started"
            variant="primary"
            onPress={onNext}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  title: {
    ...TYPOGRAPHY.display,
    fontSize: 36,
    color: "#58cc02", // custom bright duolingo green for the main logo
    marginTop: 25,
    marginBottom: 10,
    textTransform: "lowercase",
  },
  subtitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 20,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 28,
  },
  footerSection: {
    paddingBottom: SPACING.md,
    gap: 12,
  },
  button: {
    width: "100%",
  },
});
