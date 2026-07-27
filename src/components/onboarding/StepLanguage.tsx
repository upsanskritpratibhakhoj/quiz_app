import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING } from "../../constants/theme";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface LanguageOption {
  code: string;
  name: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "jp", name: "Japanese" },
  { code: "it", name: "Italian" },
  { code: "kr", name: "Korean" },
];

// Helper component to draw flag graphics using pure CSS views to avoid emojis
function FlagGraphic({ code }: { code: string }) {
  switch (code) {
    case "es":
      return (
        <View style={styles.flagBase}>
          <View style={{ flex: 1, backgroundColor: "#c60b1e" }} />
          <View style={{ flex: 2, backgroundColor: "#ffc400" }} />
          <View style={{ flex: 1, backgroundColor: "#c60b1e" }} />
        </View>
      );
    case "fr":
      return (
        <View style={[styles.flagBase, { flexDirection: "row" }]}>
          <View style={{ flex: 1, backgroundColor: "#002395" }} />
          <View style={{ flex: 1, backgroundColor: "#ffffff" }} />
          <View style={{ flex: 1, backgroundColor: "#ed2939" }} />
        </View>
      );
    case "de":
      return (
        <View style={styles.flagBase}>
          <View style={{ flex: 1, backgroundColor: "#000000" }} />
          <View style={{ flex: 1, backgroundColor: "#dd0000" }} />
          <View style={{ flex: 1, backgroundColor: "#ffce00" }} />
        </View>
      );
    case "jp":
      return (
        <View style={[styles.flagBase, { backgroundColor: "#ffffff", justifyContent: "center", alignItems: "center" }]}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#bc002d" }} />
        </View>
      );
    case "it":
      return (
        <View style={[styles.flagBase, { flexDirection: "row" }]}>
          <View style={{ flex: 1, backgroundColor: "#009246" }} />
          <View style={{ flex: 1, backgroundColor: "#ffffff" }} />
          <View style={{ flex: 1, backgroundColor: "#ce2b37" }} />
        </View>
      );
    case "kr":
      return (
        <View style={[styles.flagBase, { backgroundColor: "#ffffff", justifyContent: "center", alignItems: "center", position: "relative" }]}>
          {/* Trigrams placeholder */}
          <View style={{ position: "absolute", top: 4, left: 4, width: 6, height: 4, backgroundColor: "#000000", transform: [{ rotate: "45deg" }] }} />
          <View style={{ position: "absolute", top: 4, right: 4, width: 6, height: 4, backgroundColor: "#000000", transform: [{ rotate: "-45deg" }] }} />
          <View style={{ position: "absolute", bottom: 4, left: 4, width: 6, height: 4, backgroundColor: "#000000", transform: [{ rotate: "-45deg" }] }} />
          <View style={{ position: "absolute", bottom: 4, right: 4, width: 6, height: 4, backgroundColor: "#000000", transform: [{ rotate: "45deg" }] }} />
          {/* Taegeuk */}
          <View style={{ width: 18, height: 18, borderRadius: 9, overflow: "hidden", flexDirection: "row", transform: [{ rotate: "-30deg" }] }}>
            <View style={{ flex: 1, backgroundColor: "#c60b1e" }} />
            <View style={{ flex: 1, backgroundColor: "#002395" }} />
          </View>
        </View>
      );
    default:
      return <View style={styles.flagBase} />;
  }
}

interface StepLanguageProps {
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  onNext: () => void;
}

export default function StepLanguage({
  selectedLanguage,
  onSelectLanguage,
  onNext,
}: StepLanguageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What would you like to learn?</Text>
      
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <View key={lang.code} style={styles.gridItem}>
              <Card
                selected={isSelected}
                onPress={() => onSelectLanguage(lang.code)}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  <FlagGraphic code={lang.code} />
                  <Text style={styles.cardText}>{lang.name}</Text>
                </View>
              </Card>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          variant="primary"
          onPress={onNext}
          disabled={!selectedLanguage}
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  gridItem: {
    width: "47%",
    marginBottom: 20,
  },
  card: {
    height: 110,
    width: "100%",
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingTop: 8,
  },
  flagBase: {
    width: 44,
    height: 30,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#afafaf",
    overflow: "hidden",
    marginBottom: 10,
  },
  cardText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    paddingBottom: SPACING.md,
    paddingTop: 10,
  },
});
